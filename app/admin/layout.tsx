import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import AdminNavbar from "@/components/admin/AdminNavbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check user role from database
  const { data: dbUser } = await supabase
    .from("User")
    .select("role")
    .eq("clerkId", userId)
    .single();

  if (!dbUser || dbUser.role !== "admin") {
    // If not admin, redirect to normal dashboard
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-stone-800 selection:bg-orange-200 flex flex-col font-sans">
      <AdminNavbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
        {children}
      </main>
    </div>
  );
}
