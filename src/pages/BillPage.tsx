import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

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

    return (
        <div className="min-h-screen bg-[#fdfdfb] p-6">
            {/* Header same as Admin */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Billing Dashboard</h1>
                <p className="text-gray-500">Manage table bills and close sessions</p>
            </div>
            <div className="flex items-center justify-start mb-6">
            <Link to="/admin">
                <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Admin
                </Button>
            </Link>
            </div>
            {sessions.length === 0 ? (
                <div className="bg-white p-6 rounded-xl shadow-md text-center">
                    <p className="text-gray-500">No active bills</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sessions.map((session) => {
                        // aggregate items
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
                                className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
                            >
                                {/* Table Header */}
                                <h2 className="text-xl font-semibold mb-4 text-orange-600">
                                    🍽 Table {session.table_number}
                                </h2>

                                {/* Items Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full border rounded-lg">
                                        <thead>
                                            <tr className="bg-gray-100 text-left">
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
                                                    <td className="p-2 border">
                                                        ₹{item.price * item.quantity}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Total + Button */}
                                <div className="flex justify-between items-center mt-6">
                                    <div className="text-lg font-semibold text-gray-800">
                                        Grand Total: <span className="text-green-600">₹{totalAmount}</span>
                                    </div>
                                    <Button
                                        className="bg-orange-500 hover:bg-orange-600 text-white"
                                        onClick={async () => {
                                            await supabase
                                                .from("table_sessions")
                                                .update({ status: "closed", closed_at: new Date() })
                                                .eq("id", session.id);
                                            window.location.reload();
                                        }}
                                    >
                                        Payment Done
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default BillingPage;
