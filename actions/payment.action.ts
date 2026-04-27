"use server";

import { currentUser } from "@clerk/nextjs/server";
import midtransClient from "midtrans-client";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prisma";

// Initialize Midtrans Snap client
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

export async function createSnapTransaction(productId: string) {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized: Please sign in to continue.");
    }

    const clerkId = user.id;
    const email = user.emailAddresses[0]?.emailAddress || "";

    // 0. Fetch Product to determine the secure price
    const product = await prisma.product.findUnique({
      where: { 
        id: productId,
        isActive: true
      }
    });

    if (!product) {
      throw new Error("Product not found or inactive.");
    }

    const amount = product.price;

    // 1. Sync User to our Database
    let dbUser = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: { clerkId, email }
      });
    }

    // 2. Generate unique order_id
    const orderId = `ORDER-${Date.now()}-${uuidv4().substring(0, 8)}`;

    // 3. Prepare Midtrans Transaction parameters
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      item_details: [{
        id: product.id,
        price: amount,
        quantity: 1,
        name: product.name.substring(0, 50),
      }],
      customer_details: {
        email: email,
        first_name: user.firstName || "",
        last_name: user.lastName || "",
      },
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`
      },
      usage_limit: 1, // Only allow this token to be used once
    };

    // 4. Create Midtrans Transaction
    const midtransTx = await snap.createTransaction(parameter);
    const snapToken = midtransTx.token;

    // 5. Save Transaction to our Database
    const tx = await prisma.transaction.create({
      data: {
        orderId,
        userId: dbUser.id,
        amount,
        status: "pending",
        snapToken,
      }
    });

    // 6. Save TransactionItem
    await prisma.transactionItem.create({
      data: {
        transactionId: tx.id,
        productId: product.id,
        variantId: null, // Single product checkout logic
        quantity: 1,
        price: amount,
      }
    });

    return {
      success: true,
      snapToken,
      orderId,
    };
  } catch (error: any) {
    console.error("Midtrans Error:", error);
    return {
      success: false,
      message: error.message || "Failed to create payment transaction",
    };
  }
}

// ─── Multi-Item Cart Checkout ──────────────────────────────────

interface CartCheckoutItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export async function createMultiItemTransaction(items: CartCheckoutItem[]) {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized: Please sign in to continue.");
    }

    if (!items.length) {
      throw new Error("Cart is empty.");
    }

    const clerkId = user.id;
    const email = user.emailAddresses[0]?.emailAddress || "";

    // 1. Sync User to our Database
    let dbUser = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: { clerkId, email }
      });
    }

    // 2. Fetch all products from DB and validate prices
    const productIds = [...new Set(items.map((i) => i.productId))];
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true
      }
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Build Midtrans item_details and calculate total (server-side prices)
    const itemDetails: any[] = [];
    const orderItems: any[] = [];
    let grossAmount = 0;

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found or inactive.`);
      }

      const lineTotal = product.price * item.quantity;
      grossAmount += lineTotal;

      itemDetails.push({
        id: item.variantId || product.id,
        price: product.price,
        quantity: item.quantity,
        name: product.name.substring(0, 50),
      });

      orderItems.push({
        productId: product.id,
        variantId: item.variantId || null,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // 3. Generate unique order_id
    const orderId = `ORDER-${Date.now()}-${uuidv4().substring(0, 8)}`;

    // 4. Create Midtrans Transaction
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      item_details: itemDetails,
      customer_details: {
        email: email,
        first_name: user.firstName || "",
        last_name: user.lastName || "",
      },
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`,
      },
      usage_limit: 1,
    };

    const midtransTx = await snap.createTransaction(parameter);
    const snapToken = midtransTx.token;

    // 5. Save Transaction to our Database
    const tx = await prisma.transaction.create({
      data: {
        orderId,
        userId: dbUser.id,
        amount: grossAmount,
        status: "pending",
        snapToken,
      }
    });

    // 6. Save TransactionItems
    const transactionItemsToInsert = orderItems.map((oi) => ({
      ...oi,
      transactionId: tx.id,
    }));

    await prisma.transactionItem.createMany({
      data: transactionItemsToInsert
    });

    return {
      success: true,
      snapToken,
      orderId,
    };
  } catch (error: any) {
    console.error("Multi-item Checkout Error:", error);
    return {
      success: false,
      message: error.message || "Failed to create payment transaction",
    };
  }
}
