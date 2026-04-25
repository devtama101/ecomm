import { UserButton } from '@clerk/nextjs'
import { auth, currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'
import { createClient } from "@supabase/supabase-js"
import { redirect } from 'next/navigation'
import PayButton from '@/components/PayButton'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default async function DashboardPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/')
  }

  const user = await currentUser()

  // Fetch dbUser
  const { data: dbUser } = await supabase
    .from("User")
    .select("id")
    .eq("clerkId", userId)
    .single()

  let transactions: any[] = []
  if (dbUser) {
    const { data: txs } = await supabase
      .from("Transaction")
      .select("*")
      .eq("userId", dbUser.id)
      .order('createdAt', { ascending: false })
      
    if (txs) {
      transactions = txs
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-indigo-500/30">
      <nav className="w-full border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tighter bg-gradient-to-r from-indigo-500 to-violet-400 bg-clip-text text-transparent">
            DEVTAMA
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Store</Link>
            <UserButton />
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-black mb-2">Order History</h1>
          <p className="text-zinc-400">Welcome back, {user?.firstName}. View and manage your recent transactions.</p>
        </div>

        <div className="bg-zinc-900/50 rounded-3xl border border-white/5 overflow-hidden shadow-xl">
          {transactions.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p>You haven't made any purchases yet.</p>
              <Link href="/" className="inline-block mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-full transition-all">
                Browse Store
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-black/20 text-xs uppercase tracking-widest text-zinc-500">
                    <th className="px-6 py-4 font-semibold">Order ID</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Amount</th>
                    <th className="px-6 py-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-5 font-mono text-sm text-zinc-300">
                        {tx.orderId}
                      </td>
                      <td className="px-6 py-5 text-sm text-zinc-400">
                        {new Date(tx.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-5 text-sm font-medium">
                        Rp {tx.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-5 text-right whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                          ${tx.status === 'settlement' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                            tx.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                            'bg-red-500/10 text-red-400 border border-red-500/20'}
                        `}>
                          {tx.status}
                        </span>
                        {tx.status === 'pending' && tx.snapToken && (
                          <PayButton snapToken={tx.snapToken} />
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
}
