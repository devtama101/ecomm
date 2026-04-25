import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY; // Actually we might need service role key to bypass RLS, but publishable is fine if RLS allows or if we are using postgres directly

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase env vars.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function makeAdmin() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx ts-node scripts/make-admin.ts <email>");
    process.exit(1);
  }

  console.log(`Promoting ${email} to admin...`);
  
  const { data, error } = await supabase
    .from("User")
    .update({ role: "admin" })
    .eq("email", email)
    .select();

  if (error) {
    console.error("Error updating user:", error);
  } else if (data && data.length > 0) {
    console.log("Successfully promoted user to admin:", data[0].email);
  } else {
    console.log("User not found or already an admin (if no changes made).");
  }
}

makeAdmin();
