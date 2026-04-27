"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

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

export async function updateSiteSettings(data: {
  brandName?: string;
  logoUrl?: string;
  faviconUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  whatsappNumber?: string;
  whatsappMessage?: string;
  primaryColor?: string;
}) {
  try {
    await checkAdmin();

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
