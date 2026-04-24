import { SignInButton, UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'

export default async function Home() {
  const { userId } = await auth()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 items-center sm:items-start text-center sm:text-left">
        <h1 className="text-4xl font-bold">Welcome to Our E-Commerce App</h1>
        <p className="text-lg max-w-md">
          This is the public landing page. Sign in to access your personalized dashboard and start shopping!
        </p>
        
        <div className="flex gap-4 items-center mt-4">
          {!userId ? (
            <SignInButton mode="modal">
              <button className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-8">
                Sign In
              </button>
            </SignInButton>
          ) : (
            <div className="flex gap-4 items-center">
              <Link 
                href="/dashboard"
                className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-8 sm:min-w-44"
              >
                Go to Dashboard
              </Link>
              <UserButton />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
