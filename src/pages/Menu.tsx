import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { MenuItem } from "@/components/MenuItem";
import { OrderSummary } from "@/components/OrderSummary";
import { OrderToken } from "@/components/OrderToken";
import { Settings } from "lucide-react";
import { Link } from "react-router-dom";
import moment from "moment";
import loader from "../assets/loader.gif";
import "../App.css";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";

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

// Generates random number between 100 and 999
const generateOrderToken = () => {
  return Math.floor(100 + Math.random() * 900).toString();
};


export const Menu = () => {
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderToken, setOrderToken] = useState<string | null>(null);
  const [loadingMenu, setLoadingMenu] = useState<boolean>(false);

  const [openTableDialog, setOpenTableDialog] = useState(false);
  const [totalTables, setTotalTables] = useState<number>(0);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  // 🔸 NEW: Track service type (dine-in or parcel)
  const [serviceType, setServiceType] = useState<"dine-in" | "parcel" | null>(null);
  const [openServiceDialog, setOpenServiceDialog] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      setLoadingMenu(true);
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("status", "enabled")
        .order("name", { ascending: true });

      if (!error) setMenuItems(data || []);
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

  useEffect(() => {
    const fetchTables = async () => {
      const { data, error } = await supabase
        .from("restaurant_settings")
        .select("total_tables")
        .eq("id", 1)
        .single();

      if (!error && data) {
        setTotalTables(data.total_tables);
      }
    };

    fetchTables();
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

  const handlePlaceOrder = () => {
    if (orderItems.length === 0) {
      alert("Please select at least one item.");
      return;
    }

    if (serviceType === "dine-in") {
      setOpenTableDialog(true);
    } else if (serviceType === "parcel") {
      confirmParcelOrder();
    }
  };

  // 🔸 NEW: Place Parcel Order (no table)
  const confirmParcelOrder = async () => {
    const token = generateOrderToken();
    const total = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([{
        token,
        status: "current",
        total,
        table_number: null,    // 🔸 no table
        service_type: "parcel", // 🔸 new column (make sure it's in DB)
        created_at: moment().format("YYYY-MM-DDTHH:mm:ss")
      }])
      .select()
      .single();

    if (orderError || !order) {
      console.error("Parcel order error:", orderError?.message);
      alert("Failed to place order: " + orderError?.message);
      return;
    }

    const orderItemsData = orderItems.map((item) => ({
      order_id: order.id,
      menu_item_id: item.id,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsData);

    if (itemsError) {
      console.error("Order items insert error:", itemsError.message);
      alert("Failed to add order items: " + itemsError.message);
      return;
    }

    setOrderToken(token);
  };

  const confirmOrderWithTable = async () => {
    if (!selectedTable) {
      alert("Please select your table number.");
      return;
    }

    let { data: session, error: sessionError } = await supabase
    .from("table_sessions")
    .select("*")
    .eq("table_number", selectedTable)
    .eq("status", "open")
    .single();

    if (!session) {
    // 🔹 Create new session if none exists
    const { data: newSession, error: newSessionError } = await supabase
      .from("table_sessions")
      .insert([{ table_number: selectedTable, status: "open" }])
      .select()
      .single();

    if (newSessionError) {
      alert("Failed to create session: " + newSessionError.message);
      return;
    }
    session = newSession;
  }


    const token = generateOrderToken();
    const total = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([{
        token,
        status: "current",
        total,
        table_number: selectedTable,
        session_id: session.id,  // 🔸 Link to session
        service_type: "dine-in", // 🔸 mark as dine-in
        created_at: moment().format("YYYY-MM-DDTHH:mm:ss")
      }])
      .select()
      .single();

    if (orderError || !order) {
      console.error("Place order error:", orderError?.message);
      alert("Failed to place order: " + orderError?.message);
      return;
    }

    const orderItemsData = orderItems.map((item) => ({
      order_id: order.id,
      menu_item_id: item.id,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsData);

    if (itemsError) {
      console.error("Order items insert error:", itemsError.message);
      alert("Failed to add order items: " + itemsError.message);
      return;
    }

    setOrderToken(token);
    setOpenTableDialog(false);
  };

  const handleNewOrder = () => {
    setOrderToken(null);
    setOrderItems([]);
    setSelectedTable(null);
    setServiceType(null);
    setOpenServiceDialog(true);
  };

  if (orderToken) {
    return <OrderToken token={orderToken} onNewOrder={handleNewOrder} />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-restaurant-charcoal">ROMS</h1>
          </div>
          <Link to="/admin">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Admin Panel
            </Button>
          </Link>
        </div>
      </header>

      {/* Menu */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-restaurant-charcoal mb-6">
              Our Menu
            </h2>
            {loadingMenu ? (
              <div className="flex justify-center items-center py-10">
                <img src={loader} alt="Loading..." className="w-24 h-24" />
              </div>
            ) : menuItems.length === 0 ? (
              <p className="text-gray-500">No menu items available.</p>
            ) : (
              <div className="grid sm:grid-cols-3 gap-6">
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

      {/* 🔸 Service Type Popup */}
      <Dialog open={openServiceDialog} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <h2 className="text-lg font-semibold text-center">Choose Service Type</h2>
          </DialogHeader>
          <div className="flex justify-center gap-4 mt-4">
            <Button onClick={() => { setServiceType("dine-in"); setOpenServiceDialog(false); }}>
              Dine In
            </Button>
            <Button variant="outline" onClick={() => { setServiceType("parcel"); setOpenServiceDialog(false); }}>
              Parcel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Table Selection Popup */}
      <Dialog open={openTableDialog} onOpenChange={setOpenTableDialog}>
        <DialogContent>
          <DialogHeader>
            <h2 className="text-lg font-semibold">Select Your Table</h2>
          </DialogHeader>

          {totalTables > 0 ? (
            <div className="grid grid-cols-4 gap-2 my-4">
              {Array.from({ length: totalTables }, (_, i) => i + 1).map((num) => (
                <Button
                  key={num}
                  variant={selectedTable === num ? "default" : "outline"}
                  onClick={() => setSelectedTable(num)}
                >
                  {num}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No tables configured.</p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenTableDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmOrderWithTable}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
