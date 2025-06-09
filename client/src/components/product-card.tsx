import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      productId: product.id,
      name: product.name,
      price: parseFloat(product.price),
      quantity: 1,
      imageUrl: product.imageBlob ? `data:image/jpeg;base64,${product.imageBlob}` : product.imageUrl || undefined,
    });

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group cursor-pointer hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-0">
          <div className="relative overflow-hidden rounded-t-lg">
            {product.imageUrl || product.imageBlob ? (
              <img
                src={product.imageBlob ? `data:image/jpeg;base64,${product.imageBlob}` : product.imageUrl || ''}
                alt={product.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {product.name}
            </h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {product.description}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-primary">
                ${parseFloat(product.price).toFixed(2)}
              </span>
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="group-hover:bg-primary-600"
              >
                Add to Cart
              </Button>
            </div>
            {product.stock !== null && (
              <p className="text-xs text-gray-500 mt-2">
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
