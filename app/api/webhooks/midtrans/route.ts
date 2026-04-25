import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
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

    // 3. Update Database using Supabase REST API
    const { error } = await supabase
      .from("Transaction")
      .update({ status: finalStatus })
      .eq("orderId", order_id);

    if (error) {
      console.error("Database update error:", error);
      return NextResponse.json({ message: "Database error" }, { status: 500 });
    }

    console.log(`Transaction ${order_id} updated to ${finalStatus}`);
    
    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
