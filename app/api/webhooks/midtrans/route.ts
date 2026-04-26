import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
    const { data: tx, error: txError } = await supabase
      .from("Transaction")
      .update({ status: finalStatus })
      .eq("orderId", order_id)
      .select("id")
      .single();

    if (txError) {
      console.error("Database update error:", txError);
      return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
    }

    // 4. On settlement: decrement stock and increment sold count
    if (finalStatus === "settlement") {
      const { data: txItems } = await supabase
        .from("TransactionItem")
        .select("productId, variantId, quantity")
        .eq("transactionId", tx.id);

      if (txItems) {
        for (const item of txItems) {
          if (item.productId) {
            const { data: product } = await supabase
              .from("Product")
              .select("soldCount")
              .eq("id", item.productId)
              .single();

            if (product) {
              await supabase
                .from("Product")
                .update({ soldCount: (product.soldCount || 0) + item.quantity })
                .eq("id", item.productId);
            }
          }

          // Decrement variant stock
          if (item.variantId) {
            const { data: variant } = await supabase
              .from("ProductVariant")
              .select("stock")
              .eq("id", item.variantId)
              .single();

            if (variant) {
              await supabase
                .from("ProductVariant")
                .update({ stock: Math.max(0, variant.stock - item.quantity) })
                .eq("id", item.variantId);
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
