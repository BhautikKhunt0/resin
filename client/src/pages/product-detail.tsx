import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart, Package, Truck, Shield, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
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
  const [location, setLocation] = useLocation();
  const productId = params?.id ? parseInt(params.id) : null;

  // Auto scroll to top when URL changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  const { addItem, buyNow } = useCart();
  const { toast } = useToast();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedWeight, setSelectedWeight] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    queryFn: () => productId ? api.getProduct(productId) : Promise.reject(new Error("No product ID")),
    enabled: !!productId,
  });

  const { data: productImages = [], isLoading: imagesLoading } = useQuery<ProductImage[]>({
    queryKey: ["/api/products", productId, "images"],
    queryFn: () => productId ? fetch(`/api/products/${productId}/images`).then(res => res.json()) : Promise.reject(new Error("No product ID")),
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

    const primaryImage = allImages[0];
    const imageUrl = primaryImage?.imageBlob ? `data:image/jpeg;base64,${primaryImage.imageBlob}` : primaryImage?.imageUrl;

    addItem({
      productId: product.id,
      name: product.name,
      price: currentPrice,
      quantity: quantity,
      weight: selectedWeight,
      imageUrl: imageUrl || undefined,
    });

    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} (${selectedWeight}) has been added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    if (!product) return;

    // Navigate directly to checkout page without modifying cart
    setLocation("/checkout");

    toast({
      title: "Proceeding to checkout",
      description: "Redirecting to checkout with your current cart items.",
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Skeleton className="w-full h-96 rounded-lg" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/products">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image Gallery */}
          <div className="space-y-4">
            {/* Main Image Display */}
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-sm">
              {allImages.length > 0 ? (
                <>
                  {(() => {
                    const currentImage = allImages[selectedImageIndex];
                    if (!currentImage) {
                      return (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Package className="h-24 w-24 text-gray-400" />
                        </div>
                      );
                    }
                    
                    let imageUrl = '';
                    if (currentImage.imageBlob) {
                      // Handle base64 data from MongoDB
                      if (currentImage.imageBlob.startsWith('data:')) {
                        imageUrl = currentImage.imageBlob;
                      } else {
                        imageUrl = `data:image/jpeg;base64,${currentImage.imageBlob}`;
                      }
                    } else if (currentImage.imageUrl) {
                      imageUrl = currentImage.imageUrl;
                    }
                    

                    
                    return imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Package className="h-24 w-24 text-gray-400" />
                      </div>
                    );
                  })()}
                  
                  {/* Navigation Arrows */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-200"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-200"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                      
                      {/* Image Counter */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                        {selectedImageIndex + 1} / {allImages.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Package className="h-24 w-24 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Thumbnail Navigation */}
            {allImages.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((image, index) => {
                  let imageUrl = '';
                  if (image.imageBlob) {
                    if (image.imageBlob.startsWith('data:')) {
                      imageUrl = image.imageBlob;
                    } else {
                      imageUrl = `data:image/jpeg;base64,${image.imageBlob}`;
                    }
                  } else if (image.imageUrl) {
                    imageUrl = image.imageUrl;
                  }
                  
                  return (
                    <button
                      key={image.id || index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 bg-white rounded-md overflow-hidden shadow-sm border-2 transition-all duration-200 ${
                        index === selectedImageIndex ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={`${product.name} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Package className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                {product.name}
              </h1>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
            </div>

            {/* Quantity Selector */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-6 py-2 font-semibold text-lg bg-gray-50 min-w-[60px] text-center border-x-2 border-gray-200">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Size Options */}
            {weightVariants.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Size Options</h3>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {weightVariants.map((variant) => (
                    <button
                      key={variant.weight}
                      onClick={() => setSelectedWeight(variant.weight)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                        selectedWeight === variant.weight
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
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

            {/* Price Display */}
            <div className="mb-6">
              <span className="text-3xl font-bold text-green-600">
                ₹{currentPrice.toFixed(2)}
              </span>
            </div>

            {/* Add to Cart Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">
                  <Shield className="h-4 w-4 inline mr-1" />
                  Secure checkout • Free shipping over ₹2,000
                </span>
              </div>
              
              <div className="flex gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 h-12 text-base font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                
                <Button
                  size="lg"
                  className="flex-1 h-12 text-base font-semibold bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Truck className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold text-sm">Free Shipping</h4>
                  <p className="text-xs text-gray-600">On orders over $50</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold text-sm">Warranty</h4>
                  <p className="text-xs text-gray-600">1 year coverage</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Package className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold text-sm">Easy Returns</h4>
                  <p className="text-xs text-gray-600">30-day policy</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
