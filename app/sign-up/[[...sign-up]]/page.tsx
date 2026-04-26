import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tighter text-stone-900 mb-2">TAMA ARTS</h1>
          <p className="text-stone-500 font-medium">Join us today and start your collection.</p>
        </div>
        
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "bg-white border border-stone-200 shadow-xl rounded-3xl overflow-hidden",
              headerTitle: "text-stone-900 font-black",
              headerSubtitle: "text-stone-500",
              formButtonPrimary: "bg-stone-900 hover:bg-stone-800 text-white rounded-full transition-all border-none py-3 h-auto",
              formFieldInput: "rounded-2xl border-stone-200 focus:border-stone-900 focus:ring-stone-900/10 transition-all",
              footerActionLink: "text-stone-900 font-bold hover:text-orange-600 transition-colors",
              socialButtonsBlockButton: "rounded-2xl border-stone-200 hover:bg-stone-50 transition-all",
              dividerLine: "bg-stone-100",
              dividerText: "text-stone-400 text-xs font-bold uppercase tracking-widest",
              formLabel: "text-stone-700 font-bold text-sm",
            }
          }}
        />
      </div>
    </div>
  );
}
