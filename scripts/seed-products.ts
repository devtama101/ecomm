import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase env vars.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const clothingItems = [
  { name: "Linen Blend Overshirt", price: 850000 },
  { name: "Heavyweight Cotton Tee", price: 350000 },
  { name: "Tailored Wide-Leg Trousers", price: 1200000 },
  { name: "Textured Knit Sweater", price: 950000 },
  { name: "Washed Denim Jacket", price: 1450000 },
  { name: "Pleated Midi Skirt", price: 750000 },
  { name: "Silk Blend Camisole", price: 450000 },
  { name: "Merino Wool Cardigan", price: 1100000 },
  { name: "Relaxed Fit Chinos", price: 650000 },
  { name: "Double Breasted Blazer", price: 1850000 },
  { name: "Cashmere Scarf", price: 550000 },
  { name: "Organic Cotton Henley", price: 400000 },
];

const descriptions = [
  "A wardrobe staple made from premium, breathable fabric. Perfect for layering or wearing on its own.",
  "Expertly tailored for a relaxed yet refined silhouette. Features subtle textural details.",
  "Designed for comfort without compromising on style. This piece transitions effortlessly from day to night.",
  "Crafted with meticulous attention to detail, offering a perfect balance of structure and drape."
];

async function main() {
  console.log("Seeding products...");
  
  for (const item of clothingItems) {
    const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
    const randomViewCount = Math.floor(Math.random() * 1000); // 0 to 999 views
    
    const { error } = await supabase.from("Product").insert({
        name: item.name,
        price: item.price,
        description: randomDescription,
        isActive: true,
        viewCount: randomViewCount,
    });
    
    if (error) {
        console.error("Error inserting:", error);
    }
  }
  
  console.log("Seeding complete!");
}

main();
