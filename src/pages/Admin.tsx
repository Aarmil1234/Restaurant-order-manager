import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AdminPanel, Order } from "@/components/AdminPanel";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabaseClient";


export const Admin = () => {
  const [currentOrders, setCurrentOrders] = useState<Order[]>([]);
  const [preparedOrders, setPreparedOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
 const [openTableDialog, setOpenTableDialog] = useState(false);
  const [totalTables, setTotalTables] = useState<number | null>(null);

  // console.log("currentOrders",currentOrders);

  // New food item state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSaveTables = async () => {
    if (!totalTables || totalTables <= 0) {
      alert("Please enter a valid number of tables");
      return;
    }

    try {
      // ✅ Insert or Update in `restaurant_settings`
      const { data, error } = await supabase
        .from("restaurant_settings")
        .upsert(
          [{ id: 1, total_tables: totalTables }], // upsert ensures update if id=1 exists
          { onConflict: "id" }
        );

      if (error) throw error;

      alert("Total tables saved successfully!");
      setOpenTableDialog(false);
    } catch (err: any) {
      console.error("Error saving tables:", err);
      alert("Failed to save tables: " + err.message);
    }
  };

  useEffect(() => {
    async function fetchOrders() {

      const { data, error } = await supabase
        .from("orders")
        .select(`
    *,
    order_items (
      menu_item_id,
      menu_items (
        *
      )
    )
  `);

      if (error) {
        console.error("Error fetching orders:", error);
        return;
      }

      const orders = data.map((order) => (
        {
          token: order.token,
          items: order.order_items || [], // You can later fetch items if needed
          table_number: order.table_number, 
          timestamp: new Date(order.created_at),
          total: order.total || 0,
          status: order.status,
        }));

      setCurrentOrders(orders.filter((o) => o.status === "current"));
      setPreparedOrders(orders.filter((o) => o.status === "prepared"));
      setCompletedOrders(orders.filter((o) => o.status === "received"));
    }

    fetchOrders();

    const orderSubscription = supabase
      .channel("public:orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(orderSubscription);
    };
  }, []);

  // Handle order status updates
  const handleMarkPrepared = async (token: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "prepared" })
      .eq("token", token);
    if (error) console.error("Error updating to prepared:", error);
  };

  const handleMarkReceived = async (token: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "received" })
      .eq("token", token);
    if (error) console.error("Error updating to received:", error);
  };

  // Handle adding new menu item

  const handleAddMenuItem = async () => {
    if (!name || !price || !imageFile) {
      return alert("Please fill all fields and select an image.");
    }

    try {
      // 1️ Upload image to Supabase Storage (menu_images bucket)
      const filePath = `${Date.now()}_${imageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("menu_images")
        .upload(filePath, imageFile, {
          upsert: true, // Optional: allows overwriting files with same name
        });

      if (uploadError || !uploadData) {
        console.error("Upload failed:", uploadError);
        throw new Error("Image upload failed");
      }

      // 2️⃣ Get public URL
      const { data: publicUrlData, error: publicUrlError } = supabase.storage
        .from("menu_images")
        .getPublicUrl(filePath);

      if (publicUrlError || !publicUrlData?.publicUrl) {
        console.error("Failed to get public URL:", publicUrlError);
        throw new Error("Failed to get public URL of image");
      }

      const publicUrl = publicUrlData.publicUrl;
      console.log("Image public URL:", publicUrl);

      // 3️⃣ Insert into menu_items table
      const { error: insertError } = await supabase.from("menu_items").insert([
        {
          name,
          description,
          price: parseFloat(price),
          image_url: publicUrl,
        },
      ]);

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error("Failed to insert menu item");
      }

      // 4️⃣ Success
      alert("Menu item added successfully!");
      setName("");
      setDescription("");
      setPrice("");
      setImageFile(null);
    } catch (err: any) {
      console.error("Failed to add menu item:", err);
      alert("Failed to add menu item: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
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
      </header>

      {/* Add Menu Item Section */}
      <div className="flex justify-between w-full p-4">
        <div className="heading">
          <h1 className="text-3xl font-bold text-restaurant-charcoal mb-2">
          Restaurant Admin Panel
        </h1>
        <p className="text-muted-foreground">Manage orders and track kitchen workflow</p>
        </div>
      <div className="flex gap-2">
          <Link to="/add-menu">
            <Button>Add Menu Item</Button>
          </Link>
          <Button onClick={() => setOpenTableDialog(true)}>Manage Tables</Button>
        </div>
      </div>

      {/* Admin Panel */}
      <AdminPanel
        currentOrders={currentOrders}
        preparedOrders={preparedOrders}
        completedOrders={completedOrders}
        onMarkPrepared={handleMarkPrepared}
        onMarkReceived={handleMarkReceived}
      />
      <Dialog open={openTableDialog} onOpenChange={setOpenTableDialog}>
        <DialogContent>
          <DialogHeader>
            <h2 className="text-lg font-semibold">Set Total Tables</h2>
          </DialogHeader>

          <input
            type="number"
            min={1}
            value={totalTables ?? ""}
            onChange={(e) => setTotalTables(parseInt(e.target.value))}
            className="border rounded p-2 w-full"
            placeholder="Enter total number of tables"
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenTableDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTables}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
