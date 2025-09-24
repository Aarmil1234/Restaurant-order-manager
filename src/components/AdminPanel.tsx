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
  table_number: number; // new
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

  const OrderCard = ({
    order,
    showPreparedButton = false,
    showReceivedButton = false
  }: {
    order: Order;
    showPreparedButton?: boolean;
    showReceivedButton?: boolean;
  }) => (
    <Card className="shadow-food-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Hash className="h-4 w-4 text-restaurant-orange" />
            Token: {order.token}
          </CardTitle>
          <span className="text-sm font-semibold text-white bg-restaurant-orange px-2 py-1 rounded">
          Table: {order.table_number}
        </span>
          <Badge variant="outline" className="text-xs">
            {/* {order.timestamp.toLocaleTimeString()} */}
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
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No completed orders</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedOrders.map((order) => (
                <OrderCard key={order.token} order={order} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};