import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const BillingPage = () => {
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    const fetchSessions = async () => {
      const { data, error } = await supabase
        .from("table_sessions")
        .select(`
          id,
          table_number,
          orders (
            id,
            order_items (
              quantity,
              menu_items ( name, price )
            )
          )
        `)
        .eq("status", "open");

      if (!error) setSessions(data || []);
    };

    fetchSessions();
  }, []);

  if (sessions.length === 0) return <p>No active bills</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Billing Dashboard</h1>

      {sessions.map((session) => {
        // aggregate order items
        const allItems: any[] = [];
        session.orders.forEach((order: any) => {
          order.order_items.forEach((oi: any) => {
            const existing = allItems.find(i => i.name === oi.menu_items.name);
            if (existing) {
              existing.quantity += oi.quantity;
            } else {
              allItems.push({
                name: oi.menu_items.name,
                price: oi.menu_items.price,
                quantity: oi.quantity
              });
            }
          });
        });

        const totalAmount = allItems.reduce(
          (sum, i) => sum + i.price * i.quantity,
          0
        );

        return (
          <div
            key={session.id}
            className="mb-6 p-4 bg-white rounded-xl shadow-md"
          >
            <h2 className="text-xl font-semibold mb-2">
              Table {session.table_number}
            </h2>

            <table className="w-full border mb-2">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Item</th>
                  <th className="p-2 border">Qty</th>
                  <th className="p-2 border">Price</th>
                  <th className="p-2 border">Total</th>
                </tr>
              </thead>
              <tbody>
                {allItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border">{item.name}</td>
                    <td className="p-2 border">{item.quantity}</td>
                    <td className="p-2 border">₹{item.price}</td>
                    <td className="p-2 border">₹{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-right text-lg font-semibold">
              Grand Total: ₹{totalAmount}
            </div>

            <div className="flex justify-end mt-3">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={async () => {
                  await supabase
                    .from("table_sessions")
                    .update({ status: "closed", closed_at: new Date() })
                    .eq("id", session.id);
                  window.location.reload();
                }}
              >
                Payment Done
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BillingPage;
