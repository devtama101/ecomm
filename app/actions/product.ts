"use server";

import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function createProduct(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseInt(formData.get("price") as string, 10);
  const isActive = formData.get("isActive") === "on";
  const image = formData.get("image") as File | null;

  let imageUrl: string | null = null;

  if (image && image.size > 0) {
    const fileExt = image.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(filePath, image);

    if (uploadError) {
      console.error("Upload error", uploadError);
      throw new Error("Failed to upload image");
    }

    const { data: { publicUrl } } = supabase.storage
      .from("products")
      .getPublicUrl(filePath);

    imageUrl = publicUrl;
  }

  // Insert to DB using REST API directly since we updated via raw SQL and Prisma local client
  // might not have the imageUrl field if generated locally but remote is not updated.
  // Actually we generated the prisma client, so we could use Prisma if we had it imported,
  // but using Supabase js is safer here to ensure it uses the remote schema natively.
  
  const { error } = await supabase.from("Product").insert({
    name,
    description,
    price,
    isActive,
    imageUrl,
  });

  if (error) {
    console.error("Database error", error);
    throw new Error("Failed to create product");
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function updateProduct(id: string, formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseInt(formData.get("price") as string, 10);
  const isActive = formData.get("isActive") === "on";
  const image = formData.get("image") as File | null;

  let imageUrl = formData.get("existingImageUrl") as string | null;

  if (image && image.size > 0) {
    const fileExt = image.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(filePath, image);

    if (uploadError) {
      console.error("Upload error", uploadError);
      throw new Error("Failed to upload image");
    }

    const { data: { publicUrl } } = supabase.storage
      .from("products")
      .getPublicUrl(filePath);

    imageUrl = publicUrl;
  }

  const { error } = await supabase
    .from("Product")
    .update({
      name,
      description,
      price,
      isActive,
      imageUrl,
    })
    .eq("id", id);

  if (error) {
    console.error("Database error", error);
    throw new Error("Failed to update product");
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
}
