import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Hash } from "lucide-react";

interface OrderTokenProps {
  token: string;
  onNewOrder: () => void;
}

export const OrderToken = ({ token, onNewOrder }: OrderTokenProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md animate-bounce-in">
        <CardHeader className="text-center bg-gradient-primary text-white rounded-t-lg">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16" />
          </div>
          <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div>
              <p className="text-muted-foreground mb-2">Your order token is:</p>
              <div className="inline-flex items-center gap-2 bg-restaurant-cream p-4 rounded-lg">
                <Hash className="h-5 w-5 text-restaurant-orange" />
                <span className="text-3xl font-bold text-restaurant-charcoal tracking-widest">
                  {token}
                </span>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Please keep this token for order tracking.</p>
              <p>You will be notified when your order is ready!</p>
            </div>
            
            <Button 
              variant="order" 
              size="lg" 
              onClick={onNewOrder}
              className="w-full"
            >
              Start New Order
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};