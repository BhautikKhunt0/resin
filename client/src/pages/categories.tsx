import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Grid3X3 } from "lucide-react";
import { api } from "@/lib/api";
import type { Category, Subcategory } from "@shared/schema";

export default function Categories() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const catId = parseInt(categoryId || "0");

  const { data: category, isLoading: categoryLoading } = useQuery<Category>({
    queryKey: ["/api/categories", catId],
    queryFn: () => api.getCategoryById(catId),
    enabled: !!catId,
  });

  const { data: subcategories, isLoading: subcategoriesLoading } = useQuery<Subcategory[]>({
    queryKey: ["/api/categories", catId, "subcategories"],
    queryFn: () => api.getSubcategoriesByCategory(catId),
    enabled: !!catId,
  });

  if (categoryLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
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
        <span className="text-gray-600">{category?.name}</span>
      </div>

      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{category?.name}</h1>
        {category?.description && (
          <p className="text-gray-600 text-lg">{category.description}</p>
        )}
      </div>

      {/* Subcategories Grid */}
      {subcategoriesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : subcategories && subcategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subcategories.map((subcategory) => (
            <Link key={subcategory.id} href={`/subcategory/${subcategory.id}/products`}>
              <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
{(() => {
                  const imageUrl = subcategory.imageBlob ? `data:image/jpeg;base64,${subcategory.imageBlob}` : subcategory.imageUrl;
                  return imageUrl ? (
                    <div className="relative h-48 w-full overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={subcategory.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Grid3X3 className="h-16 w-16 text-white group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  );
                })()}
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors text-lg">
                    {subcategory.name}
                  </h3>
                  {subcategory.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {subcategory.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Grid3X3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subcategories found</h3>
          <p className="text-gray-600">This category doesn't have any subcategories yet.</p>
          <Link href="/">
            <Button className="mt-4">Browse All Products</Button>
          </Link>
        </div>
      )}
    </div>
  );
}