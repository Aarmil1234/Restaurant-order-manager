import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AdminPanel, Order } from "@/components/AdminPanel";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient"

export const Admin = () => {
  const [currentOrders, setCurrentOrders] = useState<Order[]>([]);
  const [preparedOrders, setPreparedOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);

  useEffect(() => {
  async function fetchOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*');

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      const orders = data.map(order => ({
        token: order.token,
        items: [],  // You can implement this later
        timestamp: new Date(order.created_at),
        total: order.total || 0,
        status: order.status
      }));

      setCurrentOrders(orders.filter(o => o.status === 'current'));
      setPreparedOrders(orders.filter(o => o.status === 'prepared'));
      setCompletedOrders(orders.filter(o => o.status === 'received'));
    }
  }

  fetchOrders();

  const orderSubscription = supabase
    .channel('public:orders')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      payload => {
        console.log('Realtime order change:', payload);
        fetchOrders();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(orderSubscription);
  };
}, []);


  const handleMarkPrepared = async (token: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'prepared' })
      .eq('token', token);

    if (error) {
      console.error('Error updating to prepared:', error);
    }
  };

  const handleMarkReceived = async (token: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'received' })
      .eq('token', token);

    if (error) {
      console.error('Error updating to received:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Menu
              </Button>
            </Link>

            <div className="h-6 w-px bg-border" />

            <div>
              <h1 className="text-xl font-bold text-restaurant-charcoal">
                Admin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage restaurant orders
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Panel */}
      <AdminPanel
        currentOrders={currentOrders}
        preparedOrders={preparedOrders}
        completedOrders={completedOrders}
        onMarkPrepared={handleMarkPrepared}
        onMarkReceived={handleMarkReceived}
      />
    </div>
  );
};
