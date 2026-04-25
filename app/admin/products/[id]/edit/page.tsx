import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import EditProductForm from "./EditProductForm";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const { data: product } = await supabase
    .from("Product")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) {
    notFound();
  }

  return <EditProductForm product={product} />;
}
