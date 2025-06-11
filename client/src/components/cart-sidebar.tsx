import { X, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { Link } from "wouter";

export default function CartSidebar() {
  const { state, removeItem, updateQuantity, closeCart, getTotalPrice } = useCart();

  if (!state.isOpen) return null;

  const totalPrice = getTotalPrice();

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-semibold">Shopping Cart</h3>
            <Button variant="ghost" size="sm" onClick={closeCart}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {state.items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center space-x-4 py-4 border-b border-gray-200"
                  >
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-gray-600 text-sm">₹{item.price.toFixed(2)}</p>
                      {item.weight && (
                        <p className="text-blue-600 text-xs font-medium">Size: {item.weight}</p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateQuantity(item.productId, item.weight, item.quantity - 1)
                          }
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="px-3 py-1 bg-gray-100 rounded text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateQuantity(item.productId, item.weight, item.quantity + 1)
                          }
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.productId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {state.items.length > 0 && (
            <div className="border-t p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-xl font-bold text-primary">
                  ₹{totalPrice.toFixed(2)}
                </span>
              </div>
              <Link href="/checkout">
                <Button className="w-full" onClick={closeCart}>
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
