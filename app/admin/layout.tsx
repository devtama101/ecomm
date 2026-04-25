import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

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
      {/* Admin Top Navigation */}
      <nav className="w-full border-b border-stone-200 bg-[#fdfbf7]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-tight text-stone-900 hover:text-stone-600 transition-colors uppercase">
              Tama Arts
            </Link>
            <div className="flex items-center gap-6 text-sm font-medium">
              <Link href="/admin" className="text-stone-500 hover:text-stone-900 transition-colors">Overview</Link>
              <Link href="/admin/products" className="text-stone-500 hover:text-stone-900 transition-colors">Products</Link>
              <Link href="/admin/transactions" className="text-stone-500 hover:text-stone-900 transition-colors">Transactions</Link>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <UserButton />
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-6 py-8 w-full">
        {children}
      </main>
    </div>
  );
}
