import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Package } from "lucide-react";
import { api } from "@/lib/api";
import ProductCard from "@/components/product-card";
import type { Subcategory, Product, Category } from "@shared/schema";

export default function SubcategoryProducts() {
  const { subcategoryId } = useParams<{ subcategoryId: string }>();
  const [location] = useLocation();
  const subId = parseInt(subcategoryId || "0");

  // Auto scroll to top when URL changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const { data: subcategory, isLoading: subcategoryLoading } = useQuery<Subcategory>({
    queryKey: ["/api/subcategories", subId],
    queryFn: () => api.getSubcategoryById(subId),
    enabled: !!subId,
  });

  const { data: category, isLoading: categoryLoading } = useQuery<Category>({
    queryKey: ["/api/categories", subcategory?.categoryId],
    queryFn: () => api.getCategoryById(subcategory!.categoryId),
    enabled: !!subcategory?.categoryId,
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", "subcategory", subId],
    queryFn: () => api.getProductsBySubcategory(subId),
    enabled: !!subId,
  });

  if (subcategoryLoading || categoryLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-96 mb-6" />
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-64 md:h-80 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Button>
        </Link>
        <span className="text-gray-400">/</span>
        <Link href={`/category/${subcategory?.categoryId}`}>
          <Button variant="ghost" size="sm">
            {category?.name}
          </Button>
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600">{subcategory?.name}</span>
      </div>

      {/* Subcategory Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{subcategory?.name}</h1>
        {subcategory?.description && (
          <p className="text-gray-600 text-lg">{subcategory.description}</p>
        )}
        <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
          <Package className="h-4 w-4" />
          <span>{products?.length || 0} products found</span>
        </div>
      </div>

      {/* Products Grid */}
      {productsLoading ? (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-64 md:h-80 w-full" />
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">This subcategory doesn't have any products yet.</p>
          <div className="flex gap-4 justify-center mt-6">
            <Link href={`/category/${subcategory?.categoryId}`}>
              <Button variant="outline">Browse Category</Button>
            </Link>
            <Link href="/">
              <Button>Browse All Products</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}