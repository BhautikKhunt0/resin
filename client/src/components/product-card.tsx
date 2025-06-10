import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    
    // Use first image from images array for cart item
    const productImages = Array.isArray((product as any)?.images) ? (product as any).images : [];
    const firstImage = productImages.length > 0 ? productImages[0] : null;
    let imageUrl = null;
    
    if (firstImage && typeof firstImage === 'object') {
      imageUrl = firstImage.imageBlob ? `data:image/jpeg;base64,${firstImage.imageBlob}` : firstImage.imageUrl;
    }
    
    if (!imageUrl) {
      imageUrl = product.imageBlob ? `data:image/jpeg;base64,${product.imageBlob}` : product.imageUrl;
    }
    
    addItem({
      productId: product.id,
      name: product.name,
      price: parseFloat(product.price),
      quantity: 1,
      imageUrl: imageUrl || undefined,
    });

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  // Get display image - prioritize first image from images array
  const getDisplayImage = () => {
    try {
      const productImages = Array.isArray((product as any)?.images) ? (product as any).images : [];
      const firstImage = productImages.length > 0 ? productImages[0] : null;
      
      if (firstImage && typeof firstImage === 'object') {
        return firstImage.imageBlob ? `data:image/jpeg;base64,${firstImage.imageBlob}` : firstImage.imageUrl;
      }
      
      return product.imageBlob ? `data:image/jpeg;base64,${product.imageBlob}` : product.imageUrl;
    } catch (error) {
      console.error('Error getting display image:', error);
      return product.imageUrl;
    }
  };

  const displayImageUrl = getDisplayImage();

  return (
    <div className="group">
      <Link href={`/products/${product.id}`}>
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-200">
            {displayImageUrl ? (
              <img
                src={displayImageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
            
            {/* Add to Cart button on hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
              <Button
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0 text-xs md:text-sm"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Add to Cart</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
          
          {/* Title and Price below image */}
          <div className="p-2 md:p-4 text-center">
            <h3 className="font-medium text-gray-900 line-clamp-2 leading-tight mb-1 md:mb-2 text-sm md:text-base">
              {product.name}
            </h3>
            <p className="text-sm md:text-lg font-bold text-primary">
              ₹{parseFloat(product.price).toFixed(2)}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}