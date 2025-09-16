import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MenuItem } from "@/components/MenuItem";
import { OrderSummary } from "@/components/OrderSummary";
import { OrderToken } from "@/components/OrderToken";
import { Settings } from "lucide-react";
import { Link } from "react-router-dom";

// Import food images
import burgerImage from "@/assets/burger.jpg";
import pizzaImage from "@/assets/pizza.jpg";
import saladImage from "@/assets/salad.jpg";
import pastaImage from "@/assets/pasta.jpg";

interface MenuItemType {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
}

interface OrderItem extends MenuItemType {
  quantity: number;
}

const menuItems: MenuItemType[] = [
  {
    id: 1,
    name: "Classic Burger",
    price: 12.99,
    image: burgerImage,
    description: "Juicy beef patty with fresh lettuce, tomato, cheese, and our special sauce"
  },
  {
    id: 2,
    name: "Margherita Pizza",
    price: 14.99,
    image: pizzaImage,
    description: "Fresh mozzarella, tomato sauce, and basil on our hand-tossed crust"
  },
  {
    id: 3,
    name: "Caesar Salad",
    price: 9.99,
    image: saladImage,
    description: "Crisp romaine lettuce with parmesan cheese, croutons, and Caesar dressing"
  },
  {
    id: 4,
    name: "Pasta Carbonara",
    price: 16.99,
    image: pastaImage,
    description: "Creamy pasta with pancetta, parmesan cheese, and fresh black pepper"
  }
];

const generateOrderToken = (): string => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

export const Menu = () => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderToken, setOrderToken] = useState<string | null>(null);

  const handleQuantityChange = (id: number, quantity: number) => {
    const menuItem = menuItems.find(item => item.id === id);
    if (!menuItem) return;

    setOrderItems(prev => {
      const existingItem = prev.find(item => item.id === id);
      
      if (quantity === 0) {
        return prev.filter(item => item.id !== id);
      }
      
      if (existingItem) {
        return prev.map(item =>
          item.id === id ? { ...item, quantity } : item
        );
      }
      
      return [...prev, { ...menuItem, quantity }];
    });
  };

  const handlePlaceOrder = () => {
    const token = generateOrderToken();
    setOrderToken(token);
    
    // Here you would typically save the order to your backend
    // For now, we'll just log it
    console.log('Order placed:', {
      token,
      items: orderItems,
      total: orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      timestamp: new Date()
    });
  };

  const handleNewOrder = () => {
    setOrderToken(null);
    setOrderItems([]);
  };

  if (orderToken) {
    return <OrderToken token={orderToken} onNewOrder={handleNewOrder} />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-restaurant-charcoal">
                Savory Station
              </h1>
              <p className="text-sm text-muted-foreground">
                Delicious food, quick service
              </p>
            </div>
            
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Admin Panel
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Menu Items */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-restaurant-charcoal mb-2">
                Our Menu
              </h2>
              <p className="text-muted-foreground">
                Fresh ingredients, bold flavors, made to order
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {menuItems.map((item) => (
                <MenuItem
                  key={item.id}
                  {...item}
                  quantity={orderItems.find(orderItem => orderItem.id === item.id)?.quantity || 0}
                  onQuantityChange={handleQuantityChange}
                />
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary 
              items={orderItems}
              onPlaceOrder={handlePlaceOrder}
            />
          </div>
        </div>
      </div>
    </div>
  );
};