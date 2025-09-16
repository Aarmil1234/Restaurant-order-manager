import { supabase } from "@/lib/supabaseClient";

export async function placeOrder(orderItems) {
  const token = Math.floor(10000 + Math.random() * 90000).toString();
  const total = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const { data, error } = await supabase
    .from('orders')
    .insert([
      { token, status: 'current', total }
    ])
    .select()
    .single();

  if (error) {
    console.error('Failed to place order:', error);
    return null;
  }

  console.log('Order placed successfully:', data);
  return data;
}
