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

export async function deleteProduct(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Verify admin status
  const { data: user } = await supabase
    .from("User")
    .select("role")
    .eq("clerkId", userId)
    .single();

  if (!user || user.role !== "admin") {
    throw new Error("Only admins can delete products");
  }

  // 1. Get product to find image URLs to delete from storage
  const { data: product } = await supabase
    .from("Product")
    .select("imageUrl, variants:ProductVariant(imageUrl)")
    .eq("id", id)
    .single();

  if (product) {
    const imagesToDelete = [];
    if (product.imageUrl) imagesToDelete.push(product.imageUrl);
    
    // @ts-ignore
    product.variants?.forEach((v: any) => {
      if (v.imageUrl) imagesToDelete.push(v.imageUrl);
    });

    // Extract file paths from public URLs for Supabase storage deletion
    // Example: https://.../storage/v1/object/public/products/filename.jpg -> products/filename.jpg
    const pathsToDelete = imagesToDelete
      .map(url => {
        const parts = url.split('/products/');
        return parts.length > 1 ? `products/${parts[1]}` : null;
      })
      .filter(Boolean) as string[];

    if (pathsToDelete.length > 0) {
      await supabase.storage.from("products").remove(pathsToDelete);
    }
  }

  // 2. Delete the product (cascades should handle ProductImage and ProductVariant if set in DB, 
  // but if Prisma didn't push correctly we do manual or rely on foreign keys)
  const { error } = await supabase
    .from("Product")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true };
}
