import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function AdminTransactionsPage() {
  const { data: transactions } = await supabase
    .from("Transaction")
    .select("*, User(email), Product(name)")
    .order("createdAt", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">All Transactions</h1>
          <p className="text-stone-500 text-sm mt-1">View all customer orders and payments</p>
        </div>
        <div className="lg:hidden flex items-center gap-2 text-stone-400 text-[10px] font-bold uppercase tracking-widest">
          <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          Scroll to view more
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-stone-500">
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Order ID</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Customer</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Product</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Amount</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Status</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px] text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {transactions?.map((tx) => (
                <tr key={tx.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-[10px] text-stone-700">
                    #{tx.orderId.split('-')[0]}...
                  </td>
                  <td className="px-6 py-4 text-stone-900 font-medium">
                    {tx.User?.email || "Unknown"}
                  </td>
                  <td className="px-6 py-4 text-stone-700">
                    {tx.Product?.name || "Deleted Product"}
                  </td>
                  <td className="px-6 py-4 font-bold text-stone-900">
                    Rp {tx.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      tx.status === 'settlement' ? 'bg-green-100 text-green-700' : 
                      tx.status === 'pending' ? 'bg-orange-100 text-orange-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-stone-500 text-right text-[11px]">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {!transactions?.length && (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <p className="text-stone-400 font-medium italic text-sm">No transactions recorded yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
