useEffect(() => {
  async function fetchOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        token,
        created_at,
        total,
        status,
        order_items (
          id,
          quantity,
          menu_items (
            name,
            price
          )
        )
      `);

    if (error) {
      console.error("Error fetching orders:", error);
      return;
    }

    const orders = data.map((order) => ({
      token: order.token,
      items: order.order_items.map((oi) => ({
        name: oi.menu_items.name,
        price: oi.menu_items.price,
        quantity: oi.quantity,
      })),
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
