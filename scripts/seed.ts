import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY; // or service role key if needed

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Note: Ensure RLS allows inserts, or temporarily disable RLS, or use service_role key.
// Since we haven't enabled RLS on Product yet, anon key is fine.
// Wait, we used Prisma, which doesn't enable RLS by default. So inserts should work.

const products = [
  {
    name: "Premium Subscription",
    description: "1 Year of Premium Access to all features and content.",
    price: 2499000,
    isActive: true,
  },
  {
    name: "Standard Subscription",
    description: "6 Months of Standard Access.",
    price: 1500000,
    isActive: true,
  },
  {
    name: "Basic Subscription",
    description: "1 Month Trial Access.",
    price: 300000,
    isActive: true,
  },
];

async function seed() {
  console.log("Seeding products...");
  
  // Clear existing products (optional)
  await supabase.from("Product").delete().neq("id", "0");

  const { data, error } = await supabase.from("Product").insert(products).select();

  if (error) {
    console.error("Error seeding products:", error);
  } else {
    console.log("Successfully seeded products:", data);
  }
}

seed();
