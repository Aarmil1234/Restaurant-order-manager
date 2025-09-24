// src/pages/AddMenu.tsx
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Power, PowerOff } from "lucide-react";
import { Link } from "react-router-dom";

export default function AddMenu() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);

  // Fetch menu items
  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setMenuItems(data || []);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  // Add menu item
  const handleAddMenuItem = async () => {
    if (!name || !price || !imageFile) {
      return alert("Please fill all fields and select an image.");
    }

    try {
      const filePath = `${Date.now()}_${imageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("menu_images")
        .upload(filePath, imageFile, { upsert: true });

      if (uploadError || !uploadData) throw uploadError;

      const { data: publicUrlData, error: publicUrlError } = supabase.storage
        .from("menu_images")
        .getPublicUrl(filePath);

      if (publicUrlError) throw publicUrlError;

      const publicUrl = publicUrlData.publicUrl;

      const { error: insertError } = await supabase.from("menu_items").insert([
        {
          name,
          description,
          price: parseFloat(price),
          image_url: publicUrl,
          status: "enabled", // default status
        },
      ]);

      if (insertError) throw insertError;

      alert("Menu item added successfully!");
      setName("");
      setDescription("");
      setPrice("");
      setImageFile(null);
      fetchMenuItems(); // refresh list
    } catch (err: any) {
      console.error(err);
      alert("Failed to add menu item: " + err.message);
    }
  };

  // Delete menu item
  const handleDelete = async (id: number) => {
    console.log("Deleting id:", id, typeof id);
  await supabase.from("menu_items").delete().eq("id", id);
};


  // Toggle status (enable/disable)
  // Toggle status (enable/disable)
const handleToggleStatus = async (id: number, currentStatus: string) => {
  const newStatus = currentStatus === "enabled" ? "disabled" : "enabled";

  const { data, error } = await supabase
    .from("menu_items")
    .update({ status: newStatus })
    .eq("id", id)
    .select("*"); // get updated row back

  if (error) {
    console.error("Update error:", error);
    alert("Failed to update status");
  } else {
    console.log("Updated row:", data);
    fetchMenuItems(); // refresh UI
  }
};

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>

          <div className="h-6 w-px bg-border" />

          <div>
            <h1 className="text-xl font-bold text-restaurant-charcoal">
              Add Menu Item
            </h1>
            <p className="text-sm text-muted-foreground">
              Create a new item for your restaurant menu
            </p>
          </div>
        </div>
      </header>

      {/* Form Section */}
      <main className="container mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Add Form */}
          <div className="bg-white shadow-md rounded-2xl p-8 w-full max-w-lg">
            <h2 className="text-lg font-semibold text-restaurant-charcoal mb-6">
              Menu Item Details
            </h2>

            <div className="flex flex-col gap-5">
              {/* Name */}
              <input
                type="text"
                placeholder="e.g., Margherita Pizza"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered w-full"
                style={{
                  border: "1px solid #aaa",
                  padding: "10px 20px",
                  borderRadius: "10px",
                }}
              />

              {/* Description */}
              <textarea
                placeholder="Brief description of the dish"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea textarea-bordered w-full"
                style={{
                  border: "1px solid #aaa",
                  padding: "10px 20px",
                  borderRadius: "10px",
                }}
              />

              {/* Price */}
              <input
                type="number"
                placeholder="e.g., 299"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input input-bordered w-full"
                style={{
                  border: "1px solid #aaa",
                  padding: "10px 20px",
                  borderRadius: "10px",
                }}
              />

              {/* Image Upload */}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="file-input file-input-bordered w-full"
                style={{ border: "1px solid #aaa" }}
              />

              {/* Submit */}
              <Button onClick={handleAddMenuItem} className="mt-4">
                Add Food Item
              </Button>
            </div>
          </div>

          {/* Menu Table */}
          <div className="bg-white shadow-md rounded-2xl p-8 w-full">
            <h2 className="text-lg font-semibold text-restaurant-charcoal mb-6">
              Current Menu Items
            </h2>

            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-left">Image</th>
                  <th className="border p-3 text-left">Name</th>
                  <th className="border p-3 text-left">Description</th>
                  <th className="border p-3 text-left">Price</th>
                  <th className="border p-3 text-left">Status</th>
                  <th className="border p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border p-3">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="border p-3">{item.name}</td>
                    <td className="border p-3">{item.description}</td>
                    <td className="border p-3">₹{item.price}</td>
                    <td className="border p-3 capitalize">{item.status}</td>
                    <td className="border p-3 flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    console.log("Toggling item:", item.id, "Current:", item.status);
                                    handleToggleStatus(item.id, item.status);
                                }}
                            >

                        {item.status === "enabled" ? (
                          <>
                            <PowerOff className="h-4 w-4 mr-1" /> Disable
                          </>
                        ) : (
                          <>
                            <Power className="h-4 w-4 mr-1" /> Enable
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
