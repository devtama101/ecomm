import { UserButton } from '@clerk/nextjs'
import { auth, currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const { userId } = await auth()
  const user = await currentUser()

  return (
    <div className="flex flex-col min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="flex justify-between items-center w-full mb-12">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm hover:underline">
            Home
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="flex flex-col gap-6 flex-grow">
        <div className="p-6 border rounded-xl dark:border-white/[.145]">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="flex flex-col gap-2 font-mono text-sm">
            <p><span className="font-bold">Clerk ID:</span> {userId}</p>
            {user && (
              <>
                <p><span className="font-bold">Email:</span> {user.emailAddresses[0]?.emailAddress}</p>
                <p><span className="font-bold">Name:</span> {user.firstName} {user.lastName}</p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
