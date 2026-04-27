"use server";

import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true }
  });

  if (!user || user.role !== "admin") {
    throw new Error("Only admins can perform this action");
  }
  return userId;
}

export async function createProduct(formData: FormData) {
  try {
    await checkAdmin();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseInt(formData.get("price") as string, 10);
    const isActive = formData.get("isActive") === "on";
    const mainImage = formData.get("image") as File | null;
    
    const variantsJson = formData.get("variants") as string;
    const variants = variantsJson ? JSON.parse(variantsJson) : [];

    let imageUrl: string | null = null;

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

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        isActive,
        imageUrl,
        variants: {
          create: await Promise.all(variants.map(async (v: any, i: number) => {
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

            return {
              size: v.size,
              color: v.color,
              stock: parseInt(v.stock, 10) || 0,
              imageUrl: variantImageUrl,
            };
          }))
        }
      }
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true, data: product };
  } catch (err: any) {
    console.error("Create product error:", err);
    return { success: false, message: err.message || "Failed to create product" };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    await checkAdmin();

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

    // Use a transaction to update product and replace variants
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: { name, description, price, isActive, imageUrl }
      });

      // Delete old variants
      await tx.productVariant.deleteMany({
        where: { productId: id }
      });

      // Insert new variants
      if (variants.length > 0) {
        const variantData = await Promise.all(variants.map(async (v: any, i: number) => {
          let variantImageUrl = v.imageUrl || null;
          const variantImageFile = formData.get(`variantImage_${i}`) as File | null;

          if (variantImageFile && variantImageFile.size > 0) {
            const fileExt = variantImageFile.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExt}`;
            const filePath = `products/variants/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from("products")
              .upload(filePath, variantImageFile);

            if (!uploadError) {
              const { data: { publicUrl } } = supabase.storage
                .from("products")
                .getPublicUrl(filePath);
              variantImageUrl = publicUrl;
            }
          }

          return {
            productId: id,
            size: v.size,
            color: v.color,
            stock: parseInt(v.stock, 10) || 0,
            imageUrl: variantImageUrl,
          };
        }));

        await tx.productVariant.createMany({
          data: variantData
        });
      }
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("Update product error:", err);
    return { success: false, message: err.message || "Failed to update product" };
  }
}

export async function incrementProductView(id: string) {
  try {
    await prisma.product.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });
  } catch (err) {
    console.error("Increment view error:", err);
  }
}

export async function deleteProduct(id: string) {
  try {
    await checkAdmin();

    // 1. Get product to find image URLs to delete from storage
    const product = await prisma.product.findUnique({
      where: { id },
      include: { variants: true }
    });

    if (product) {
      const imagesToDelete = [];
      if (product.imageUrl) imagesToDelete.push(product.imageUrl);
      product.variants.forEach((v) => {
        if (v.imageUrl) imagesToDelete.push(v.imageUrl);
      });

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

    // 2. Delete the product (cascade will handle variants if configured, but Prisma delete handles its relations if using delete)
    // In our schema, we should check if cascade is set. If not, delete variants manually first.
    await prisma.productVariant.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("Delete product error:", err);
    return { success: false, message: err.message || "Failed to delete product" };
  }
}

export async function deleteProducts(ids: string[]) {
  try {
    await checkAdmin();

    // 1. Get all products to find image URLs to delete from storage
    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      include: { variants: true }
    });

    if (products && products.length > 0) {
      const imagesToDelete: string[] = [];
      products.forEach(product => {
        if (product.imageUrl) imagesToDelete.push(product.imageUrl);
        product.variants.forEach((v) => {
          if (v.imageUrl) imagesToDelete.push(v.imageUrl);
        });
      });

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

    // 2. Delete the products
    await prisma.productVariant.deleteMany({ where: { productId: { in: ids } } });
    await prisma.product.deleteMany({ where: { id: { in: ids } } });

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("Delete products error:", err);
    return { success: false, message: err.message || "Failed to delete products" };
  }
}
