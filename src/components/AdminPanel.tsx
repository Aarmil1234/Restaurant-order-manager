import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, Package, Hash } from "lucide-react";
import moment from 'moment';

// interface OrderItem {
//   id: number;
//   name: string;
//   price: number;
//   quantity: number;
// }

export interface Order {
  token: string;
  items: any;
  timestamp: Date;
  total: number;
  table_number: number | null;   // ✅ allow null
  service_type: "dine-in" | "parcel";
}




interface AdminPanelProps {
  currentOrders: Order[];
  preparedOrders: Order[];
  completedOrders: Order[];
  onMarkPrepared: (token: string) => void;
  onMarkReceived: (token: string) => void;
}

export const AdminPanel = ({
  currentOrders,
  preparedOrders,
  completedOrders,
  onMarkPrepared,
  onMarkReceived,
}: AdminPanelProps) => {
  // console.log("currentOrders", currentOrders);
  const [revenueFilter, setRevenueFilter] = useState<"all" | "today" | "yesterday" | "thisMonth" | "prevMonth">("all");





  const getFilteredOrders = () => {
    const now = moment();

    switch (revenueFilter) {
      case "today":
        return completedOrders.filter((o) =>
          moment(o.timestamp).isSame(now, "day")
        );

      case "yesterday":
        return completedOrders.filter((o) =>
          moment(o.timestamp).isSame(now.clone().subtract(1, "day"), "day")
        );

      case "thisMonth":
        return completedOrders.filter((o) =>
          moment(o.timestamp).isSame(now, "month")
        );

      case "prevMonth":
        return completedOrders.filter((o) =>
          moment(o.timestamp).isSame(now.clone().subtract(1, "month"), "month")
        );

      default:
        return completedOrders;
    }
  };
  const filteredOrders = getFilteredOrders();


  
  const calculateRevenue = () => {
    // return filteredOrders.reduce((acc, order) => acc + order.total, 0);
    const now = moment();

    let filteredOrders = completedOrders;

    switch (revenueFilter) {
      case "today":
        filteredOrders = completedOrders.filter((o) =>
          moment(o.timestamp).isSame(now, "day")
        );
        break;

      case "yesterday":
        filteredOrders = completedOrders.filter((o) =>
          moment(o.timestamp).isSame(now.clone().subtract(1, "day"), "day")
        );
        break;

      case "thisMonth":
        filteredOrders = completedOrders.filter((o) =>
          moment(o.timestamp).isSame(now, "month")
        );
        break;

      case "prevMonth":
        filteredOrders = completedOrders.filter((o) =>
          moment(o.timestamp).isSame(now.clone().subtract(1, "month"), "month")
        );
        break;

      default:
        break;
    }

    return filteredOrders.reduce((acc, order) => acc + order.total, 0);
  };



  const OrderCard = ({
    order,
    showPreparedButton = false,
    showReceivedButton = false,
    showTableNumber = true
  }: {
    order: Order;
    showPreparedButton?: boolean;
    showReceivedButton?: boolean;
    showTableNumber?: boolean;
  }) => (
    <Card className="shadow-food-card">
      <CardHeader className="pb-3">
  <div className="flex items-center justify-between">
    <CardTitle className="flex items-center gap-2 text-lg">
      <Hash className="h-4 w-4 text-restaurant-orange" />
      Token: {order.token}
    </CardTitle>

    {/* ✅ Show Table or Parcel badge */}
   {/* ✅ Show Table or Parcel badge with normalization */}
{/* ✅ Handle all cases: dine-in, parcel, missing service_type */}
{order.service_type ? (
  order.service_type.toLowerCase().trim() === "dine-in" && order.table_number ? (
    <span className="text-sm font-semibold text-white bg-restaurant-orange px-2 py-1 rounded">
      Table: {order.table_number}
    </span>
  ) : order.service_type.toLowerCase().trim() === "parcel" ? (
    <span className="text-sm font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
      Parcel
    </span>
  ) : null
) : order.table_number ? (
  // Fallback for old dine-in orders
  <span className="text-sm font-semibold text-white bg-restaurant-orange px-2 py-1 rounded">
    Table: {order.table_number}
  </span>
) : (
  // Fallback for parcel orders with no service_type and no table number
  <span className="text-sm font-semibold text-white bg-restaurant-orange px-2 py-1 rounded">
    Parcel
  </span>
)}

    <Badge variant="outline" className="text-xs">
      {moment(order.timestamp).format("hh:mm:ss A")}
    </Badge>
  </div>
</CardHeader>


      <CardContent className="space-y-4">
        <div className="space-y-2">
          {order.items.map((item) => {
            return (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.menu_items.name} × {item.quantity || 1}</span>
                <span className="font-medium">Rs. {(item.menu_items.price * (item.quantity || 1)).toFixed(2)}</span>
              </div>
            )
          })}
        </div>

        <div className="border-t pt-3 flex justify-between items-center">
          <span className="font-semibold text-restaurant-charcoal">
            Total: Rs. {order.total.toFixed(2)}
          </span>

          <div className="flex gap-2">
            {showPreparedButton && (
              <Button
                variant="admin"
                size="sm"
                onClick={() => onMarkPrepared(order.token)}
              >
                Mark Prepared
              </Button>
            )}
            {showReceivedButton && (
              <Button
                variant="prepared"
                size="sm"
                onClick={() => onMarkReceived(order.token)}
              >
                Mark Received
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6">

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Current Orders ({currentOrders.length})
          </TabsTrigger>
          <TabsTrigger value="prepared" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Prepared ({preparedOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed ({completedOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {currentOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No current orders</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentOrders.map((order) => (
                <OrderCard
                  key={order.token}
                  order={order}
                  showPreparedButton={true}
                  showTableNumber={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="prepared" className="space-y-4">
          {preparedOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No prepared orders</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {preparedOrders.map((order) => (
                <OrderCard
                  key={order.token}
                  order={order}
                  showReceivedButton={true}
                  showTableNumber={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {/* Total Revenue for Completed Orders */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={revenueFilter === "all" ? "default" : "outline"}
              onClick={() => setRevenueFilter("all")}
            >
              All
            </Button>
            <Button
              variant={revenueFilter === "today" ? "default" : "outline"}
              onClick={() => setRevenueFilter("today")}
            >
              Today
            </Button>
            <Button
              variant={revenueFilter === "yesterday" ? "default" : "outline"}
              onClick={() => setRevenueFilter("yesterday")}
            >
              Yesterday
            </Button>
            <Button
              variant={revenueFilter === "thisMonth" ? "default" : "outline"}
              onClick={() => setRevenueFilter("thisMonth")}
            >
              This Month
            </Button>
            <Button
              variant={revenueFilter === "prevMonth" ? "default" : "outline"}
              onClick={() => setRevenueFilter("prevMonth")}
            >
              Previous Month
            </Button>
          </div>

          <Card>
            <CardContent className="p-4 flex justify-between items-center">
              <span className="font-semibold text-lg text-restaurant-charcoal">
                Total Revenue ({revenueFilter}):
              </span>
              <span className="font-bold text-xl text-restaurant-orange">
                {/* Rs. {completedOrders.reduce((acc, order) => acc + order.total, 0).toFixed(2)} */}
                Rs. {calculateRevenue().toFixed(2)}
              </span>
            </CardContent>
          </Card>

          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No completed orders</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredOrders.map((order) => (
                <OrderCard key={order.token} order={order} showTableNumber={false} />
              ))}
            </div>
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
};