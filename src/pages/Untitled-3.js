// 1️⃣ Fetch all orders
const { data: orders, error: orderError } = await supabase
  .from("orders")
  .select("*");

if (orderError) {
  console.error("Order fetch error:", orderError.message);
  return;
}

// 2️⃣ Fetch all order_items + join menu_items manually
const { data: orderItems, error: itemsError } = await supabase
  .from("order_items")
  .select("order_id, quantity, menu_items(name, price)");

if (itemsError) {
  console.error("Order items fetch error:", itemsError.message);
  return;
}

// 3️⃣ Combine them in JS
const ordersWithItems = orders.map(order => ({
  ...order,
  items: orderItems
    .filter(oi => oi.order_id === order.id)
    .map(oi => ({
      name: oi.menu_items.name,
      price: oi.menu_items.price,
      quantity: oi.quantity,
    })),
}));
