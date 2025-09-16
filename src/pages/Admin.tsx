import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AdminPanel, Order } from "@/components/AdminPanel";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export const Admin = () => {
  // Mock data - in a real app, this would come from your backend
  const [currentOrders, setCurrentOrders] = useState<Order[]>([
    {
      token: "12345",
      items: [
        { id: 1, name: "Classic Burger", price: 12.99, quantity: 2 },
        { id: 3, name: "Caesar Salad", price: 9.99, quantity: 1 }
      ],
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      total: 35.97
    },
    {
      token: "67890",
      items: [
        { id: 2, name: "Margherita Pizza", price: 14.99, quantity: 1 },
        { id: 4, name: "Pasta Carbonara", price: 16.99, quantity: 1 }
      ],
      timestamp: new Date(Date.now() - 8 * 60 * 1000), // 8 minutes ago
      total: 31.98
    }
  ]);

  const [preparedOrders, setPreparedOrders] = useState<Order[]>([
    {
      token: "54321",
      items: [
        { id: 2, name: "Margherita Pizza", price: 14.99, quantity: 2 }
      ],
      timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
      total: 29.98
    }
  ]);

  const [completedOrders, setCompletedOrders] = useState<Order[]>([
    {
      token: "98765",
      items: [
        { id: 1, name: "Classic Burger", price: 12.99, quantity: 1 },
        { id: 3, name: "Caesar Salad", price: 9.99, quantity: 2 }
      ],
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      total: 32.97
    }
  ]);

  const handleMarkPrepared = (token: string) => {
    const order = currentOrders.find(o => o.token === token);
    if (order) {
      setCurrentOrders(prev => prev.filter(o => o.token !== token));
      setPreparedOrders(prev => [...prev, order]);
    }
  };

  const handleMarkReceived = (token: string) => {
    const order = preparedOrders.find(o => o.token === token);
    if (order) {
      setPreparedOrders(prev => prev.filter(o => o.token !== token));
      setCompletedOrders(prev => [...prev, order]);
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