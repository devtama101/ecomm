import { createClient } from "@supabase/supabase-js";
import ProductListManager from "@/components/admin/ProductListManager";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function AdminProductsPage() {
  const { data: products } = await supabase
    .from("Product")
    .select("*")
    .order("createdAt", { ascending: false });

  return <ProductListManager products={products || []} />;
}
