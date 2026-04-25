"use server";

import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import midtransClient from "midtrans-client";
import { v4 as uuidv4 } from "uuid";

// Initialize Midtrans Snap client
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function createSnapTransaction(productId: string) {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized: Please sign in to continue.");
    }

    const clerkId = user.id;
    const email = user.emailAddresses[0]?.emailAddress || "";

    // 0. Fetch Product to determine the secure price
    const { data: product, error: productError } = await supabase
      .from("Product")
      .select("*")
      .eq("id", productId)
      .eq("isActive", true)
      .single();

    if (productError || !product) {
      throw new Error("Product not found or inactive.");
    }

    const amount = product.price;

    // 1. Sync User to our Database
    let { data: dbUser, error: userError } = await supabase
      .from("User")
      .select("*")
      .eq("clerkId", clerkId)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error("Error finding user:", userError);
      throw new Error("Database error finding user");
    }

    if (!dbUser) {
      const { data: newUser, error: createError } = await supabase
        .from("User")
        .insert([{ clerkId, email }])
        .select()
        .single();
        
      if (createError) {
         console.error("Error creating user:", createError);
         throw new Error("Database error creating user");
      }
      dbUser = newUser;
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
        finish: "http://localhost:3000/dashboard"
      },
      usage_limit: 1, // Only allow this token to be used once
    };

    // 4. Create Midtrans Transaction
    const midtransTx = await snap.createTransaction(parameter);
    const snapToken = midtransTx.token;

    // 5. Save Transaction to our Database
    const { error: txError } = await supabase
      .from("Transaction")
      .insert([{
        orderId,
        userId: dbUser.id,
        productId: product.id,
        amount,
        status: "pending",
        snapToken,
      }]);

    if (txError) {
      console.error("Error creating transaction:", txError);
      throw new Error("Database error saving transaction");
    }

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
