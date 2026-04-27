"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { createClient } from "@supabase/supabase-js";

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

  if (!user || user.role !== "admin") throw new Error("Access Denied");
  return userId;
}

export async function updateSiteSettings(formData: FormData) {
  try {
    await checkAdmin();

    const brandName = formData.get("brandName") as string;
    const metaTitle = formData.get("metaTitle") as string;
    const metaDescription = formData.get("metaDescription") as string;
    const whatsappNumber = formData.get("whatsappNumber") as string;
    const whatsappMessage = formData.get("whatsappMessage") as string;
    const faviconFile = formData.get("favicon") as File | null;

    let faviconUrl = formData.get("existingFaviconUrl") as string | null;

    if (faviconFile && faviconFile.size > 0) {
      const fileExt = faviconFile.name.split('.').pop();
      const fileName = `favicon-${Date.now()}.${fileExt}`;
      const filePath = `settings/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("products") // Reusing products bucket or settings if exists, assuming products for now
        .upload(filePath, faviconFile);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from("products")
          .getPublicUrl(filePath);
        faviconUrl = publicUrl;
      } else {
        console.error("Favicon upload error:", uploadError);
      }
    }

    const data = {
      brandName,
      metaTitle,
      metaDescription,
      whatsappNumber,
      whatsappMessage,
      faviconUrl,
    };

    await prisma.siteSettings.upsert({
      where: { id: "global" },
      update: data,
      create: { id: "global", ...data },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: any) {
    console.error("[Settings] Error:", err);
    return { success: false, message: err.message };
  }
}

export async function updatePageContent(items: { section: string; key: string; value: string; page?: string }[]) {
  try {
    await checkAdmin();

    for (const item of items) {
      await prisma.pageContent.upsert({
        where: {
          page_section_key: {
            page: item.page || "home",
            section: item.section,
            key: item.key,
          },
        },
        update: { value: item.value },
        create: {
          page: item.page || "home",
          section: item.section,
          key: item.key,
          value: item.value,
        },
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("[CMS] Error:", err);
    return { success: false, message: err.message };
  }
}
