"use server";

import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function createProduct(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseInt(formData.get("price") as string, 10);
  const isActive = formData.get("isActive") === "on";
  const mainImage = formData.get("image") as File | null;
  
  // Parse variants from hidden input (stringified JSON)
  const variantsJson = formData.get("variants") as string;
  const variants = variantsJson ? JSON.parse(variantsJson) : [];

  let imageUrl: string | null = null;

  // Handle main image upload
  if (mainImage && mainImage.size > 0) {
    const fileExt = mainImage.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(filePath, mainImage);

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from("products")
        .getPublicUrl(filePath);
      imageUrl = publicUrl;
    }
  }

  // Handle gallery image uploads
  const galleryFiles = formData.getAll("gallery") as File[];
  const galleryUrls: string[] = [];

  for (const file of galleryFiles) {
    if (file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, file);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from("products")
          .getPublicUrl(filePath);
        galleryUrls.push(publicUrl);
      }
    }
  }

  // Create product
  const productId = uuidv4();
  const { data: product, error: productError } = await supabase
    .from("Product")
    .insert({
      id: productId,
      name,
      description,
      price,
      isActive,
      imageUrl,
    })
    .select()
    .single();

  if (productError) throw new Error(productError.message);

  // Insert variants
  if (variants.length > 0) {
    const { error: variantError } = await supabase
      .from("ProductVariant")
      .insert(
        variants.map((v: any) => ({
          id: uuidv4(),
          productId,
          size: v.size,
          color: v.color,
          stock: parseInt(v.stock, 10) || 0,
        }))
      );
    if (variantError) console.error("Variant insert error:", variantError);
  }

  // Insert gallery images
  if (galleryUrls.length > 0) {
    const { error: imageError } = await supabase
      .from("ProductImage")
      .insert(
        galleryUrls.map((url, i) => ({
          id: uuidv4(),
          productId,
          url,
          order: i,
        }))
      );
    if (imageError) console.error("Image insert error:", imageError);
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  return product;
}

export async function updateProduct(id: string, formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseInt(formData.get("price") as string, 10);
  const isActive = formData.get("isActive") === "on";
  const mainImage = formData.get("image") as File | null;
  
  const variantsJson = formData.get("variants") as string;
  const variants = variantsJson ? JSON.parse(variantsJson) : [];

  let imageUrl = formData.get("existingImageUrl") as string | null;

  if (mainImage && mainImage.size > 0) {
    const fileExt = mainImage.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(filePath, mainImage);

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from("products")
        .getPublicUrl(filePath);
      imageUrl = publicUrl;
    }
  }

  // Handle gallery uploads
  const galleryFiles = formData.getAll("gallery") as File[];
  const newGalleryUrls: string[] = [];

  for (const file of galleryFiles) {
    if (file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, file);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from("products")
          .getPublicUrl(filePath);
        newGalleryUrls.push(publicUrl);
      }
    }
  }

  // Update product
  await supabase
    .from("Product")
    .update({ name, description, price, isActive, imageUrl })
    .eq("id", id);

  // Delete old variants, insert new ones
  await supabase.from("ProductVariant").delete().eq("productId", id);

  if (variants.length > 0) {
    await supabase
      .from("ProductVariant")
      .insert(
        variants.map((v: any) => ({
          id: uuidv4(),
          productId: id,
          size: v.size,
          color: v.color,
          stock: parseInt(v.stock, 10) || 0,
        }))
      );
  }

  // Append new gallery images
  if (newGalleryUrls.length > 0) {
    await supabase
      .from("ProductImage")
      .insert(
        newGalleryUrls.map((url, i) => ({
          id: uuidv4(),
          productId: id,
          url,
          order: i,
        }))
      );
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function incrementProductView(id: string) {
  const { data } = await supabase
    .from("Product")
    .select("viewCount")
    .eq("id", id)
    .single();
  
  if (data) {
    await supabase
      .from("Product")
      .update({ viewCount: (data.viewCount || 0) + 1 })
      .eq("id", id);
  }
}
