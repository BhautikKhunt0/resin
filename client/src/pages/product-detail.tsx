import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useState } from "react";
import { ArrowLeft, ShoppingCart, Package, Truck, Shield, ChevronLeft, ChevronRight, Minus, Plus, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Link } from "wouter";
import type { Product, ProductImage, WeightVariant } from "@shared/schema";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const productId = params?.id ? parseInt(params.id) : null;
  const { addItem } = useCart();
  const { toast } = useToast();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedWeight, setSelectedWeight] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    queryFn: () => productId ? api.getProduct(productId) : Promise.reject(new Error("No product ID")),
    enabled: !!productId,
  });

  const { data: productImages = [] } = useQuery<ProductImage[]>({
    queryKey: ["/api/products", productId, "images"],
    queryFn: () => productId ? api.getProductImages(productId) : Promise.reject(new Error("No product ID")),
    enabled: !!productId,
  });

  // Combine product main image with additional images
  const allImages: ProductImage[] = [];
  
  // Always include the main product image as the first image if it exists
  if (product && (product.imageUrl || product.imageBlob)) {
    allImages.push({
      id: 0,
      productId: product.id,
      imageUrl: product.imageUrl,
      imageBlob: product.imageBlob,
      priority: -1, // Ensure it's always first
      createdAt: new Date()
    });
  }
  
  // Add additional product images
  allImages.push(...productImages);
  
  // Sort images by priority (main image will be first due to priority -1)
  allImages.sort((a, b) => a.priority - b.priority);
  
  // Get weight variants or create default variant
  const weightVariants: WeightVariant[] = product?.weightVariants as WeightVariant[] || [];
  if (weightVariants.length === 0 && product) {
    // Create default variant if no weight variants exist
    weightVariants.push({
      weight: product.weight || "Standard",
      price: parseFloat(product.price)
    });
  }
  
  // Set default selected weight if not already set
  if (!selectedWeight && weightVariants.length > 0) {
    setSelectedWeight(weightVariants[0].weight);
  }
  
  // Get current price based on selected weight
  const currentVariant = weightVariants.find(v => v.weight === selectedWeight) || weightVariants[0];
  const currentPrice = currentVariant?.price || parseFloat(product?.price || "0");

  const handleAddToCart = () => {
    if (!product) return;

    const imageUrl = allImages[0]?.imageUrl || 
                    (allImages[0]?.imageBlob ? `data:image/jpeg;base64,${allImages[0].imageBlob}` : undefined);

    addItem({
      productId: product.id,
      name: product.name,
      price: currentPrice,
      quantity,
      weight: selectedWeight,
      imageUrl
    });

    toast({
      title: "Added to cart",
      description: `${quantity} × ${product.name} added to your cart`,
    });
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <Skeleton className="w-full h-[500px] rounded-lg" />
              <div className="flex space-x-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="w-20 h-20 rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/" className="hover:text-gray-900">Wall Art</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-gray-50 rounded-lg overflow-hidden">
              {allImages.length > 0 ? (
                <div className="relative">
                  <img
                    src={allImages[selectedImageIndex]?.imageUrl || 
                         (allImages[selectedImageIndex]?.imageBlob ? 
                          `data:image/jpeg;base64,${allImages[selectedImageIndex].imageBlob}` : 
                          '/api/placeholder/600/500')}
                    alt={product.name}
                    className="w-full h-[500px] object-cover"
                  />
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-700" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                      >
                        <ChevronRight className="h-5 w-5 text-gray-700" />
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="h-[500px] flex items-center justify-center">
                  <Package className="h-16 w-16 text-gray-300" />
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {allImages.length > 1 && (
              <div className="flex space-x-3">
                {allImages.slice(0, 4).map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image.imageUrl || 
                           (image.imageBlob ? `data:image/jpeg;base64,${image.imageBlob}` : '/api/placeholder/80/80')}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Title and Stock */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  <Check className="h-3 w-3 mr-1" />
                  In Stock
                </Badge>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-lg font-medium w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Size Options */}
            {weightVariants.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Size Options</h3>
                <div className="grid grid-cols-3 gap-3">
                  {weightVariants.map((variant) => (
                    <button
                      key={variant.weight}
                      onClick={() => setSelectedWeight(variant.weight)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                        selectedWeight === variant.weight
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        {variant.weight.split('(')[0].trim()}
                      </div>
                      <div className={`text-lg font-bold ${
                        selectedWeight === variant.weight ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        ₹{variant.price.toFixed(2)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 h-12 bg-gray-800 hover:bg-gray-900 text-white font-medium"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button 
                  className="h-12 px-8 bg-orange-400 hover:bg-orange-500 text-white font-medium"
                >
                  Buy Now
                </Button>
              </div>
              
              <div className="flex items-center justify-center text-sm text-gray-600">
                <Shield className="h-4 w-4 mr-2" />
                Secure checkout • Free shipping over ₹2,000
              </div>
            </div>

            {/* Features */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Truck className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Free Delivery</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Secure Payment</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Package className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Easy Returns</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Premium Quality</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}