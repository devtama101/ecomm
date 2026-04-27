import { UserButton } from '@clerk/nextjs'
import { auth, currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PayButton from '@/components/PayButton'

export default async function DashboardPage() {
  const { userId } = await auth()
  const user = await currentUser()
  
  if (!user || !userId) {
    redirect('/')
  }

  let dbUser;
  try {
    // 1. Robust Sync using Prisma (bypasses RLS)
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, id: true }
    });

    dbUser = await prisma.user.upsert({
      where: { clerkId: userId },
      update: { 
        email: user.emailAddresses[0]?.emailAddress || "",
        role: existingUser ? existingUser.role : 'user'
      },
      create: {
        clerkId: userId,
        email: user.emailAddresses[0]?.emailAddress || "",
        role: 'user'
      }
    });
  } catch (syncError) {
    console.error("[Dashboard] Sync error:", syncError);
    dbUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    });
    if (!dbUser) throw new Error("Could not find user after sync error");
  }

  if (dbUser.role === 'admin') {
    redirect('/admin')
  }

  let transactions = [];
  try {
    // 2. Fetch Transactions using Prisma (bypasses RLS)
    transactions = await prisma.transaction.findMany({
      where: { userId: dbUser.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (fetchError) {
    console.error("[Dashboard] Fetch error:", fetchError);
  }

  try {
    return (
      <div className="min-h-screen bg-[#fdfbf7] text-stone-800 selection:bg-orange-500/30">
        <nav className="w-full border-b border-stone-200 bg-white/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/" className="text-2xl font-black tracking-tighter text-stone-900">
              TAMA ARTS
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">Store</Link>
              <UserButton />
            </div>
          </div>
        </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-black mb-2 text-stone-900">Order History</h1>
          <p className="text-stone-500">Welcome back, {user?.firstName}. View and manage your recent transactions.</p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-6 border border-stone-200 relative">
                <div className="absolute inset-0 bg-orange-500/5 blur-xl rounded-full" />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-stone-400 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-stone-900">No transactions yet</h3>
              <p className="text-stone-500 max-w-sm mb-8">You haven't made any purchases. Explore our catalog and find something you love.</p>
              <Link href="/" className="px-8 py-3 bg-stone-900 text-[#fdfbf7] font-bold rounded-full hover:bg-stone-800 transition-all hover:scale-105 shadow-sm">
                Browse Store
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-widest text-stone-500">
                    <th className="px-6 py-4 font-semibold">Order ID</th>
                    <th className="px-6 py-4 font-semibold">Product</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Amount</th>
                    <th className="px-6 py-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-5 font-mono text-sm text-stone-700">
                        {tx.orderId}
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-stone-900">
                        {tx.items?.length > 1 
                          ? `${tx.items[0]?.product?.name} (+${tx.items.length - 1} more)`
                          : tx.items?.[0]?.product?.name || "No items"}
                      </td>
                      <td className="px-6 py-5 text-sm text-stone-500">
                        {new Date(tx.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-stone-900">
                        Rp {tx.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-5 text-right whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                          ${tx.status === 'settlement' ? 'bg-green-100 text-green-700 border border-green-200' : 
                            tx.status === 'pending' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 
                            'bg-red-100 text-red-700 border border-red-200'}
                        `}>
                          {tx.status}
                        </span>
                        {tx.status === 'pending' && tx.snapToken && (
                          <div className="mt-2 inline-block">
                            <PayButton snapToken={tx.snapToken} />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} catch (error) {
  console.error("Dashboard error:", error);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#fdfbf7]">
      <h1 className="text-2xl font-black text-stone-900 mb-4">Something went wrong</h1>
      <p className="text-stone-500 mb-8 text-center max-w-md">
        We encountered an error loading your dashboard. This usually happens if your account sync is still in progress.
      </p>
      <Link href="/" className="px-8 py-3 bg-stone-900 text-white rounded-full font-bold">
        Back to Store
      </Link>
    </div>
  );
}
}
