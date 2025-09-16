import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Minus } from "lucide-react";

interface MenuItemProps {
  id: number;
  name: string;
  price: number;
  image_url: string;  // Use `image_url` consistently
  description: string;
  quantity: number;
  onQuantityChange: (id: number, quantity: number) => void;
}

export const MenuItem = ({
  id,
  name,
  price,
  image_url,
  description,
  quantity,
  onQuantityChange,
}: MenuItemProps) => {
  const handleIncrement = () => onQuantityChange(id, quantity + 1);
  const handleDecrement = () => quantity > 0 && onQuantityChange(id, quantity - 1);

  return (
    <Card className="overflow-hidden shadow-food-card hover:shadow-elevated transition-smooth group">
      <div className="relative overflow-hidden">
        <img
          src={image_url}
          alt={name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-smooth"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-restaurant-charcoal">{name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-restaurant-orange">
              ${price.toFixed(2)}
            </span>

            <div className="flex items-center gap-3">
              {quantity > 0 ? (
                <div className="flex items-center gap-2 animate-slide-up">
                  <Button variant="quantity" size="icon" onClick={handleDecrement} className="h-8 w-8">
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-semibold text-restaurant-charcoal w-8 text-center">{quantity}</span>
                  <Button variant="quantity" size="icon" onClick={handleIncrement} className="h-8 w-8">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="order" onClick={handleIncrement}>
                  Add to Order
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
