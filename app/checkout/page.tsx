import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import CheckoutClient from "@/components/CheckoutClient";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function CheckoutPage() {
  const { userId } = await auth();

  // If logged in, check role
  if (userId) {
    const { data: dbUser } = await supabase
      .from("User")
      .select("role")
      .eq("clerkId", userId)
      .single();

    if (dbUser?.role === "admin") {
      redirect("/admin");
    }
  }

  return <CheckoutClient />;
}
