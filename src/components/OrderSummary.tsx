import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Receipt } from "lucide-react";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface OrderSummaryProps {
  items: OrderItem[];
  onPlaceOrder: () => void;
}

export const OrderSummary = ({ items, onPlaceOrder }: OrderSummaryProps) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (items.length === 0) {
    return (
      <Card className="sticky top-4">
        <CardContent className="p-6 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Your order is empty</p>
          <p className="text-sm text-muted-foreground mt-1">Add items to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-4 shadow-elevated">
      <CardHeader className="bg-gradient-subtle">
        <CardTitle className="flex items-center gap-2 text-restaurant-charcoal">
          <Receipt className="h-5 w-5" />
          Order Summary
          <Badge variant="secondary" className="ml-auto">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b border-border/50">
              <div className="flex-1">
                <p className="font-medium text-restaurant-charcoal">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  ${item.price.toFixed(2)} × {item.quantity}
                </p>
              </div>
              <div className="font-semibold text-restaurant-orange">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span className="text-restaurant-charcoal">Total:</span>
            <span className="text-restaurant-orange">${totalPrice.toFixed(2)}</span>
          </div>
        </div>
        
        <Button 
          variant="order" 
          size="lg" 
          onClick={onPlaceOrder}
          className="w-full"
        >
          Place Order
        </Button>
      </CardContent>
    </Card>
  );
};