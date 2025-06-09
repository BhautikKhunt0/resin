import { Home, ShoppingCart, Grid3X3 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/lib/cart-context";

export default function MobileBottomNav() {
  const [location] = useLocation();
  const { getTotalItems, toggleCart } = useCart();

  const cartItemCount = getTotalItems();

  const navItems: Array<{
    href: string;
    icon: any;
    label: string;
    isActive: boolean;
    badge?: number | null;
    onClick?: (() => void) | null;
  }> = [
    {
      href: "/",
      icon: Home,
      label: "Home",
      isActive: location === "/",
      onClick: null
    },
    {
      href: "/products",
      icon: Grid3X3,
      label: "All Products", 
      isActive: location === "/products",
      onClick: null
    },
    {
      href: "#",
      icon: ShoppingCart,
      label: "Cart",
      isActive: false,
      badge: cartItemCount > 0 ? cartItemCount : null,
      onClick: toggleCart
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item, index) => {
          const IconComponent = item.icon;
          
          if (item.onClick) {
            return (
              <button
                key={index}
                onClick={item.onClick}
                className={`flex flex-col items-center px-3 py-2 relative ${
                  item.isActive ? 'text-primary' : 'text-gray-500'
                }`}
              >
                <div className="relative">
                  <IconComponent className="h-6 w-6" />
                  {item.badge && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            );
          }
          
          return (
            <Link key={index} href={item.href}>
              <div className={`flex flex-col items-center px-3 py-2 relative ${
                item.isActive ? 'text-primary' : 'text-gray-500'
              }`}>
                <div className="relative">
                  <IconComponent className="h-6 w-6" />
                  {item.badge && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-1">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}