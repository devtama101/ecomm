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
    const variantData = [];
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      let variantImageUrl = null;
      const variantImage = formData.get(`variantImage_${i}`) as File | null;

      if (variantImage && variantImage.size > 0) {
        const fileExt = variantImage.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `products/variants/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(filePath, variantImage);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from("products")
            .getPublicUrl(filePath);
          variantImageUrl = publicUrl;
        }
      }

      variantData.push({
        id: uuidv4(),
        productId,
        size: v.size,
        color: v.color,
        stock: parseInt(v.stock, 10) || 0,
        imageUrl: variantImageUrl,
      });
    }

    const { error: variantError } = await supabase
      .from("ProductVariant")
      .insert(variantData);
    if (variantError) console.error("Variant insert error:", variantError);
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

  // Update product
  await supabase
    .from("Product")
    .update({ name, description, price, isActive, imageUrl })
    .eq("id", id);

  // Delete old variants, insert new ones
  await supabase.from("ProductVariant").delete().eq("productId", id);

  if (variants.length > 0) {
    const variantData = [];
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      let variantImageUrl = v.imageUrl || null; // Keep existing if no new one provided
      const variantImage = formData.get(`variantImage_${i}`) as File | null;

      if (variantImage && variantImage.size > 0) {
        const fileExt = variantImage.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `products/variants/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(filePath, variantImage);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from("products")
            .getPublicUrl(filePath);
          variantImageUrl = publicUrl;
        }
      }

      variantData.push({
        id: uuidv4(),
        productId: id,
        size: v.size,
        color: v.color,
        stock: parseInt(v.stock, 10) || 0,
        imageUrl: variantImageUrl,
      });
    }

    await supabase
      .from("ProductVariant")
      .insert(variantData);
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
