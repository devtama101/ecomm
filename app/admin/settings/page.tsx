import { prisma } from "@/lib/prisma";
import { updateSiteSettings } from "@/app/actions/settings";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "global" }
  }) || {
    brandName: "Tama Arts",
    logoUrl: "",
    faviconUrl: "",
    metaTitle: "Tama Arts | Artisan Clothing",
    metaDescription: "Discover our curated selection of premium garments.",
    whatsappNumber: "628123456789",
    whatsappMessage: "Halo, saya tertarik dengan produk Anda.",
    primaryColor: "#000000"
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">General Settings</h1>
        <p className="text-stone-500 mt-1">Manage your brand identity and global configurations.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">🏷️</span>
            Brand Identity
          </h2>
          <SettingsForm settings={settings} />
        </section>

        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">💬</span>
            Contact & Support
          </h2>
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-sm text-green-800">
              Your WhatsApp CTA will appear on the homepage using these details.
            </div>
            {/* We reuse the same form component or separate it, but for simplicity we keep it in one form */}
            <p className="text-stone-500 text-sm italic">Use the form on the left to update these details.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
