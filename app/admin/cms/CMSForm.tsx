"use client";

import { useState } from "react";
import { updatePageContent } from "@/app/actions/settings";
import { useRouter } from "next/navigation";

export default function CMSForm({ content }: { content: any }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const updates = [
      { section: "hero", key: "title", value: formData.get("hero_title") as string },
      { section: "hero", key: "subtitle", value: formData.get("hero_subtitle") as string },
      { section: "hero", key: "cta", value: formData.get("hero_cta") as string },
      { section: "story", key: "title", value: formData.get("story_title") as string },
      { section: "story", key: "description", value: formData.get("story_description") as string },
      { section: "story", key: "imageUrl", value: formData.get("story_imageUrl") as string },
    ];

    const res = await updatePageContent(updates);
    setLoading(false);

    if (res.success) {
      setMessage({ type: "success", text: "CMS Content updated successfully!" });
      router.refresh();
    } else {
      setMessage({ type: "error", text: res.message || "Failed to update content" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-20">
      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium ${
          message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
        }`}>
          {message.text}
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">✨</span>
          Hero Section
        </h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-700">Main Title</label>
            <input
              name="hero_title"
              defaultValue={content.hero.title}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-700">Subtitle / Description</label>
            <textarea
              name="hero_subtitle"
              defaultValue={content.hero.subtitle}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none min-h-[80px]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-700">Button Text (CTA)</label>
            <input
              name="hero_cta"
              defaultValue={content.hero.cta}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">📖</span>
          Brand Story (The Craft)
        </h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-700">Story Title</label>
            <input
              name="story_title"
              defaultValue={content.story.title}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-700">Full Story Content</label>
            <textarea
              name="story_description"
              defaultValue={content.story.description}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none min-h-[150px]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-700">Side Image URL</label>
            <input
              name="story_imageUrl"
              defaultValue={content.story.imageUrl}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none font-mono text-xs"
              placeholder="https://example.com/craft-image.jpg"
            />
          </div>
        </div>
      </section>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-7xl px-4 sm:px-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-stone-900 text-white font-bold py-4 rounded-2xl hover:bg-stone-800 transition-all disabled:opacity-50 shadow-2xl ring-4 ring-white"
        >
          {loading ? "Publishing Changes..." : "Publish to Live Store"}
        </button>
      </div>
    </form>
  );
}
