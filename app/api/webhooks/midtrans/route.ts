import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body;

    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";

    // 1. Verify Signature
    const hash = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest("hex");

    if (hash !== signature_key) {
      console.error("Invalid signature key");
      return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
    }

    // 2. Determine final status
    let finalStatus = "pending";

    if (transaction_status === "capture") {
      if (fraud_status === "challenge") {
        finalStatus = "challenge"; // Requires manual intervention
      } else if (fraud_status === "accept") {
        finalStatus = "settlement";
      }
    } else if (transaction_status === "settlement") {
      finalStatus = "settlement";
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire"
    ) {
      finalStatus = "failed";
    } else if (transaction_status === "pending") {
      finalStatus = "pending";
    }

    // 3. Update Transaction status
    const tx = await prisma.transaction.update({
      where: { orderId: order_id },
      data: { status: finalStatus }
    }).catch(txError => {
      console.error("Database update error:", txError);
      return null;
    });

    if (!tx) {
      return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
    }

    // 4. On settlement: decrement stock and increment sold count
    if (finalStatus === "settlement") {
      const txItems = await prisma.transactionItem.findMany({
        where: { transactionId: tx.id }
      });

      if (txItems) {
        for (const item of txItems) {
          if (item.productId) {
            await prisma.product.update({
              where: { id: item.productId },
              data: { soldCount: { increment: item.quantity } }
            }).catch(e => console.error("Error updating product sold count:", e));
          }

          // Decrement variant stock
          if (item.variantId) {
            const variant = await prisma.productVariant.findUnique({
              where: { id: item.variantId },
              select: { stock: true }
            });

            if (variant) {
              await prisma.productVariant.update({
                where: { id: item.variantId },
                data: { stock: Math.max(0, variant.stock - item.quantity) }
              }).catch(e => console.error("Error updating variant stock:", e));
            }
          }
        }
      }
    }

    console.log(`Transaction ${order_id} updated to ${finalStatus}`);

    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
