import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button, Input, Textarea } from "@/components/ui";

export const AdminMenu = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleAddItem = async () => {
    if (!name || !price || !imageFile) return alert("All fields are required");

    // Upload image to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("menu_images")
      .upload(`public/${Date.now()}_${imageFile.name}`, imageFile);

    if (uploadError) return alert("Image upload failed: " + uploadError.message);

    const imageUrl = supabase.storage
      .from("menu_images")
      .getPublicUrl(uploadData.path).publicUrl;

    // Insert new menu item into Supabase
    const { data, error } = await supabase.from("menu_items").insert([
      { name, description, price: parseFloat(price), image_url: imageUrl }
    ]);

    if (error) return alert("Failed to add item: " + error.message);

    alert("Menu item added successfully!");
    setName(""); setDescription(""); setPrice(""); setImageFile(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Add New Menu Item</h1>
      <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="mb-2" />
      <Textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="mb-2" />
      <input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} className="mb-2" />
      <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="mb-4" />
      <Button onClick={handleAddItem}>Add Item</Button>
    </div>
  );
};
