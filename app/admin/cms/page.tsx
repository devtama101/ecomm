import { prisma } from "@/lib/prisma";
import CMSForm from "./CMSForm";

export default async function CMSPage() {
  const content = await prisma.pageContent.findMany({
    where: { page: "home" }
  });

  // Convert array to a more useful object
  const contentMap = content.reduce((acc: any, item) => {
    if (!acc[item.section]) acc[item.section] = {};
    acc[item.section][item.key] = item.value;
    return acc;
  }, {});

  const defaultContent = {
    hero: {
      title: contentMap.hero?.title || "Artisan Clothing Collection.",
      subtitle: contentMap.hero?.subtitle || "Discover our curated selection of premium garments. Crafted with care, designed for life.",
      cta: contentMap.hero?.cta || "Shop the Collection"
    },
    story: {
      title: contentMap.story?.title || "The Craft Behind the Art",
      description: contentMap.story?.description || "Every piece in our collection is born from a commitment to traditional techniques and modern silhouettes. We work with local artisans to ensure every stitch tells a story of quality and heritage.",
      imageUrl: contentMap.story?.imageUrl || ""
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">Landing Page CMS</h1>
        <p className="text-stone-500 mt-1">Edit the content of your homepage sections.</p>
      </div>

      <CMSForm content={defaultContent} />
    </div>
  );
}
