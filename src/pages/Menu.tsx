import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { MenuItem } from "@/components/MenuItem";
import { OrderSummary } from "@/components/OrderSummary";
import { OrderToken } from "@/components/OrderToken";
import { Settings } from "lucide-react";
import { Link } from "react-router-dom";

interface MenuItemType {
  id: number;
  name: string;
  price: number;
  image_url: string;
  description: string;
}

interface OrderItem extends MenuItemType {
  quantity: number;
}

const generateOrderToken = (): string => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

export const Menu = () => {
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderToken, setOrderToken] = useState<string | null>(null);
  const [loadingMenu, setLoadingMenu] = useState<boolean>(false);

  useEffect(() => {
    const fetchMenu = async () => {
      setLoadingMenu(true);
      const { data, error } = await supabase
        .from<MenuItemType>("menu_items")
        .select("*")
        .order("created_at", { ascending: false });

      console.log("Fetch menu data:", data);
      console.log("Fetch menu error:", error);

      if (error) {
        console.error("Failed to fetch menu:", error.message);
      } else if (data) {
        setMenuItems(data);
      }
      setLoadingMenu(false);
    };

    fetchMenu();

    const subscription = supabase
      .channel("public:menu_items")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_items" },
        () => fetchMenu()
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  const handleQuantityChange = (id: number, quantity: number) => {
    const menuItem = menuItems.find((item) => item.id === id);
    if (!menuItem) return;

    setOrderItems((prev) => {
      const existing = prev.find((itm) => itm.id === id);

      if (quantity === 0) {
        return prev.filter((itm) => itm.id !== id);
      }

      if (existing) {
        return prev.map((itm) =>
          itm.id === id ? { ...itm, quantity } : itm
        );
      }

      return [...prev, { ...menuItem, quantity }];
    });
  };

  const handlePlaceOrder = async () => {
    if (orderItems.length === 0) {
      alert("Please select at least one item.");
      return;
    }

    const token = generateOrderToken();
    const total = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const { data, error } = await supabase
      .from("orders")
      .insert([{ token, status: "current", total }])
      .select()
      .single();

    if (error) {
      console.error("Place order error:", error.message);
      alert("Failed to place order: " + error.message);
      return;
    }

    setOrderToken(token);
  };

  const handleNewOrder = () => {
    setOrderToken(null);
    setOrderItems([]);
  };

  if (orderToken) {
    return <OrderToken token={orderToken} onNewOrder={handleNewOrder} />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-restaurant-charcoal">Savory Station</h1>
            <p className="text-sm text-muted-foreground">Delicious food, quick service</p>
          </div>
          <Link to="/admin">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Admin Panel
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-restaurant-charcoal mb-2">Our Menu</h2>
              <p className="text-muted-foreground">Fresh ingredients, bold flavors, made to order</p>
            </div>

            {loadingMenu ? (
              <p>Loading menu...</p>
            ) : menuItems.length === 0 ? (
              <p className="text-gray-500">No menu items available.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {menuItems.map((item) => (
                  <MenuItem
                    key={item.id}
                    {...item}
                    quantity={orderItems.find((oi) => oi.id === item.id)?.quantity || 0}
                    onQuantityChange={handleQuantityChange}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <OrderSummary items={orderItems} onPlaceOrder={handlePlaceOrder} />
          </div>
        </div>
      </div>
    </div>
  );
};
