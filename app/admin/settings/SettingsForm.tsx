"use client";

import { useState } from "react";
import { updateSiteSettings } from "@/app/actions/settings";
import { useRouter } from "next/navigation";

export default function SettingsForm({ settings }: { settings: any }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      brandName: formData.get("brandName") as string,
      logoUrl: formData.get("logoUrl") as string,
      faviconUrl: formData.get("faviconUrl") as string,
      metaTitle: formData.get("metaTitle") as string,
      metaDescription: formData.get("metaDescription") as string,
      whatsappNumber: formData.get("whatsappNumber") as string,
      whatsappMessage: formData.get("whatsappMessage") as string,
    };

    const res = await updateSiteSettings(data);
    setLoading(false);

    if (res.success) {
      setMessage({ type: "success", text: "Settings updated successfully!" });
      router.refresh();
    } else {
      setMessage({ type: "error", text: res.message || "Failed to update settings" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium ${
          message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-stone-700">Brand Name</label>
          <input
            name="brandName"
            defaultValue={settings.brandName}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
            placeholder="e.g. Tama Arts"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-stone-700">Favicon URL</label>
          <input
            name="faviconUrl"
            defaultValue={settings.faviconUrl}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none font-mono text-xs"
            placeholder="https://example.com/favicon.ico"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-stone-700">Title Bar Name (Meta Title)</label>
          <input
            name="metaTitle"
            defaultValue={settings.metaTitle}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
            placeholder="e.g. Tama Arts | Artisan Clothing"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-stone-700">Meta Description</label>
          <textarea
            name="metaDescription"
            defaultValue={settings.metaDescription}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none min-h-[100px]"
            placeholder="Brief description for search engines..."
          />
        </div>

        <div className="pt-4 border-t border-stone-100">
          <h3 className="text-sm font-bold text-stone-900 mb-4 uppercase tracking-wider">WhatsApp Configuration</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-stone-700">WhatsApp Number</label>
              <input
                name="whatsappNumber"
                defaultValue={settings.whatsappNumber}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                placeholder="e.g. 628123456789 (international format)"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-stone-700">Default WhatsApp Message</label>
              <textarea
                name="whatsappMessage"
                defaultValue={settings.whatsappMessage}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none min-h-[80px]"
                placeholder="Message that will be pre-filled for the user..."
              />
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-stone-900 text-white font-bold py-4 rounded-xl hover:bg-stone-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-stone-200"
      >
        {loading ? "Saving Changes..." : "Save Settings"}
      </button>
    </form>
  );
}
