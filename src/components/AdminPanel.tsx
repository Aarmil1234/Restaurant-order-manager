import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, Package, Hash } from "lucide-react";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  token: string;
  items: OrderItem[];
  timestamp: Date;
  total: number;
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
          <Badge variant="outline" className="text-xs">
            {order.timestamp.toLocaleTimeString()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.name} × {item.quantity}</span>
              <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-3 flex justify-between items-center">
          <span className="font-semibold text-restaurant-charcoal">
            Total: ${order.total.toFixed(2)}
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-restaurant-charcoal mb-2">
          Restaurant Admin Panel
        </h1>
        <p className="text-muted-foreground">Manage orders and track kitchen workflow</p>
      </div>

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