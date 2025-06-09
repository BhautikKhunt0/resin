import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Star, ShoppingBag, Truck, Shield, Headphones, ArrowRight, Grid3X3, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import ProductCard from "@/components/product-card";
import type { Category, Product, Banner } from "@shared/schema";

export default function Home() {
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: api.getCategories,
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: () => api.getProducts(),
  });

  const { data: banners, isLoading: bannersLoading } = useQuery<Banner[]>({
    queryKey: ["/api/banners"],
    queryFn: api.getBanners,
  });



  const featuredProducts = products?.filter(p => p.isFeatured === 1).slice(0, 8) || [];
  const bestSellingProducts = products?.slice(0, 8) || [];
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Auto-slide banners every 5 seconds
  useEffect(() => {
    if (banners && banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  const nextBanner = () => {
    if (banners && banners.length > 1) {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }
  };

  const prevBanner = () => {
    if (banners && banners.length > 1) {
      setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Mobile Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 to-amber-50 md:from-white md:to-white">
        <div className="px-4 py-8 md:py-16">
          <div className="max-w-sm mx-auto md:max-w-7xl">
            {/* Mobile Hero Content */}
            <div className="text-center md:text-left md:grid md:grid-cols-2 md:gap-12 md:items-center">
              <div className="mb-8 md:mb-0">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                  shop
                </h1>
                <h2 className="text-2xl md:text-3xl font-medium text-gray-800 mb-2">
                  resin & art
                </h2>
                <h3 className="text-2xl md:text-3xl font-medium text-gray-800 mb-6">
                  products.
                </h3>
                <p className="text-gray-600 text-lg mb-8 font-medium">
                  THE KRAFTY KART
                </p>
                <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex">
                  <Link href="/products">
                    <Button size="lg" className="w-full md:w-auto">
                      Shop Now
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Product Showcase */}
              <div className="relative">
                <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-3xl p-8 md:p-12">
                  {/* Featured Products Display */}
                  {productsLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="w-full h-64 rounded-2xl" />
                    </div>
                  ) : featuredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {featuredProducts.slice(0, 2).map((product, index) => (
                        <div key={product.id} className="relative">
                          <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg">
                            {(() => {
                              const imageUrl = product.imageBlob ? `data:image/jpeg;base64,${product.imageBlob}` : product.imageUrl;
                              return imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                  <span className="text-gray-400">No image</span>
                                </div>
                              );
                            })()}
                          </div>
                          {index === 0 && (
                            <div className="absolute -top-2 -right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                              Featured
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="aspect-square bg-white rounded-2xl flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p>Featured products will appear here</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Decorative dots */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {[0, 1, 2].map((dot) => (
                      <div key={dot} className={`w-2 h-2 rounded-full ${dot === 0 ? 'bg-primary' : 'bg-gray-300'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Top Collections */}
      <section className="py-8 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Top Collections</h2>
            <p className="text-gray-600 text-sm md:text-base">Craft Your Imagination - Explore Our Exclusive Collections!</p>
          </div>
          
          {categoriesLoading ? (
            <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2 md:space-y-4">
                  <Skeleton className="aspect-square rounded-xl w-full h-20 md:h-40" />
                  <Skeleton className="h-4 md:h-5 w-3/4 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8">
              {/* Display Categories Only */}
              {categories?.map((category) => (
                <Link key={`category-${category.id}`} href={`/category/${category.id}`} className="block">
                  <div className="group cursor-pointer w-full flex flex-col items-center">
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-2 md:mb-4 group-hover:shadow-xl transition-all duration-300 h-20 md:h-40">
                      {(() => {
                        const imageUrl = category.imageBlob ? `data:image/jpeg;base64,${category.imageBlob}` : category.imageUrl;
                        return imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                            <Grid3X3 className="w-8 md:w-16 h-8 md:h-16 text-gray-400" />
                          </div>
                        );
                      })()}
                    </div>
                    <h3 className="text-xs md:text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-center w-full">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-8 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Products</h2>
            <Link href="/products">
              <Button variant="outline" size="sm" className="text-xs md:text-sm">
                View All
              </Button>
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-0">
                    <Skeleton className="w-full h-32 md:h-48 rounded-t-lg" />
                    <div className="p-2 md:p-4">
                      <Skeleton className="h-4 md:h-6 mb-1 md:mb-2" />
                      <Skeleton className="h-3 md:h-4 mb-2 md:mb-4" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-4 md:h-6 w-16 md:w-20" />
                        <Skeleton className="h-6 md:h-9 w-16 md:w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>



      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide exceptional service and quality products to ensure your satisfaction
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Free Shipping</h3>
              <p className="text-gray-600 text-sm">
                Free delivery on orders over $50. Fast and secure shipping worldwide.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Payment</h3>
              <p className="text-gray-600 text-sm">
                Your payment information is processed securely with industry-standard encryption.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-sm">
                Our customer support team is available around the clock to help you.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Guarantee</h3>
              <p className="text-gray-600 text-sm">
                We guarantee the quality of our products with easy returns and exchanges.
              </p>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}
