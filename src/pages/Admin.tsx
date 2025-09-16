import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AdminPanel, Order } from "@/components/AdminPanel";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";


export const Admin = () => {
  const [currentOrders, setCurrentOrders] = useState<Order[]>([]);
  const [preparedOrders, setPreparedOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);

  // New food item state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Fetch orders
  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase.from("orders").select("*");
      if (error) {
        console.error("Error fetching orders:", error);
        return;
      }
      const orders = data.map((order) => ({
        token: order.token,
        items: [], // You can later fetch items if needed
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
      // 1️⃣ Upload image to Supabase Storage (menu_images bucket)
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

      console.log("Upload data:", uploadData);

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
      <div className="container mx-auto px-4 py-6 border-b border-gray-200 mb-6">
        <h2 className="text-2xl font-bold mb-4">Add New Menu Item</h2>
        <div className="flex flex-col gap-3 max-w-md">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input input-bordered"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea textarea-bordered"
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input input-bordered"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
          <Button onClick={handleAddMenuItem}>Add Food Item</Button>
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
    </div>
  );
};
