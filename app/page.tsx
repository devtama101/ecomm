import CheckoutButton from "@/components/CheckoutButton";
import { UserButton, SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function StorePage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tighter bg-gradient-to-r from-indigo-500 to-violet-400 bg-clip-text text-transparent">
            DEVTAMA
          </Link>
          
          <div className="flex items-center gap-8 text-sm font-medium text-zinc-400">
            {userId ? (
              <>
                <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                <UserButton />
              </>
            ) : (
              <>
                <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                  <button className="hover:text-white transition-colors">Dashboard</button>
                </SignInButton>
                <SignInButton mode="modal" forceRedirectUrl="/">
                  <button className="px-5 py-2.5 bg-white text-black rounded-full hover:bg-zinc-200 transition-all font-semibold">
                    Sign In
                  </button>
                </SignInButton>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <h1 className="text-6xl md:text-7xl font-black tracking-tight mb-6 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
              Premium E-Commerce Experience.
            </h1>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Secure payments powered by Midtrans. Test the integration with a single click.
            </p>
          </div>

          {/* Product Card */}
          <div className="grid md:grid-cols-2 gap-12 items-center bg-zinc-900/50 rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full -mr-20 -mt-20" />
            
            <div className="relative aspect-square bg-gradient-to-br from-zinc-800 to-black rounded-3xl overflow-hidden border border-white/5 shadow-inner">
              <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-48 w-48 text-indigo-500/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="absolute bottom-8 left-8">
                <span className="px-4 py-2 bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 rounded-full text-xs font-bold text-indigo-300 uppercase tracking-widest">
                  Featured Product
                </span>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold mb-4">Elite Pro Smartwatch</h2>
                <div className="flex items-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-zinc-500 text-sm ml-2">(128 Reviews)</span>
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  Experience the next generation of wearable technology. Minimalist design meets maximum performance. Precision crafted for those who demand excellence.
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-zinc-500 uppercase tracking-widest font-bold mb-1">Price</p>
                  <p className="text-3xl font-black">Rp 2,499,000</p>
                </div>
              </div>

              <div className="pt-4">
                <CheckoutButton amount={2499000} />
              </div>
              
              <p className="text-xs text-zinc-600 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure 256-bit SSL encrypted payment
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
