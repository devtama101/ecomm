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
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">All Transactions</h1>
        <p className="text-stone-500 text-sm mt-1">View all customer orders and payments</p>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-stone-500">
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {transactions?.map((tx) => (
                <tr key={tx.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-stone-700">
                    {tx.orderId}
                  </td>
                  <td className="px-6 py-4 text-stone-900">
                    {tx.User?.email || "Unknown"}
                  </td>
                  <td className="px-6 py-4 text-stone-700">
                    {tx.Product?.name || "Unknown"}
                  </td>
                  <td className="px-6 py-4 font-medium text-stone-900">
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
                  <td className="px-6 py-4 text-stone-500 text-right text-xs">
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {!transactions?.length && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-stone-500">
                    No transactions found.
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
