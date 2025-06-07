import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

  const featuredProducts = products?.slice(0, 4) || [];
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
      {/* Banner Section */}
      {bannersLoading ? (
        <section className="relative">
          <Skeleton className="w-full h-96" />
        </section>
      ) : banners && banners.length > 0 ? (
        <section className="relative">
          <div className="relative w-full h-96 overflow-hidden">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                  index === currentBannerIndex ? 'translate-x-0' : 
                  index < currentBannerIndex ? '-translate-x-full' : 'translate-x-full'
                }`}
              >
                {banner.imageUrl || banner.imageBlob ? (
                  <div className="relative w-full h-full">
                    <img
                      src={banner.imageBlob ? `data:image/jpeg;base64,${banner.imageBlob}` : (banner.imageUrl || '')}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <div className="text-center text-white max-w-4xl px-4">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                          {banner.title}
                        </h1>
                        {banner.description && (
                          <p className="text-xl md:text-2xl mb-8">
                            {banner.description}
                          </p>
                        )}
                        <Link href="/products">
                          <Button size="lg" variant="secondary">
                            Shop Now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative bg-gradient-to-r from-primary to-blue-700 text-white h-full flex items-center justify-center">
                    <div className="text-center max-w-4xl px-4">
                      <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        {banner.title}
                      </h1>
                      {banner.description && (
                        <p className="text-xl md:text-2xl mb-8 text-blue-100">
                          {banner.description}
                        </p>
                      )}
                      <Link href="/products">
                        <Button size="lg" variant="secondary" className="text-primary">
                          Shop Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Navigation arrows */}
            {banners.length > 1 && (
              <>
                <button
                  onClick={prevBanner}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-200"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextBanner}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-200"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Dots indicator */}
            {banners.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBannerIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentBannerIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="relative bg-gradient-to-r from-primary to-blue-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Amazing Products
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Shop the latest trends with fast, secure delivery
            </p>
            <Link href="/products">
              <Button size="lg" variant="secondary" className="text-primary">
                Shop Now
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Featured Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Shop by Category
          </h2>
          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories?.map((category) => (
                <Link key={category.id} href={`/products?categoryId=${category.id}`}>
                  <Card className="group cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                        <i className="fas fa-laptop text-primary text-2xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {category.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <Link href="/products">
              <Button variant="outline">
                View All Products
              </Button>
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-0">
                    <Skeleton className="w-full h-48 rounded-t-lg" />
                    <div className="p-4">
                      <Skeleton className="h-6 mb-2" />
                      <Skeleton className="h-4 mb-4" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-8 text-blue-100">
            Get the latest deals and product updates delivered to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <Button variant="secondary" className="px-6 py-3">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
