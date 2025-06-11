import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Filter, Search, Grid, List, X, Star, Tag, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { api } from "@/lib/api";
import ProductCard from "@/components/product-card";
import type { Category, Product, Subcategory } from "@shared/schema";

export default function Products() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const initialCategoryId = searchParams.get('categoryId');
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
    initialCategoryId ? [parseInt(initialCategoryId)] : []
  );
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [debouncedPriceRange, setDebouncedPriceRange] = useState<[number, number]>([0, 10000]);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Data queries
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: api.getCategories,
  });

  const { data: subcategories, isLoading: subcategoriesLoading } = useQuery<Subcategory[]>({
    queryKey: ["/api/subcategories"],
    queryFn: api.getSubcategories,
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: () => api.getProducts(),
  });

  // Debounce price range updates for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPriceRange(priceRange);
    }, 150); // Reduced delay for smoother experience
    return () => clearTimeout(timer);
  }, [priceRange]);

  // Calculate price range from products with smart rounding
  const productPriceRange = useMemo(() => {
    if (!products || products.length === 0) return [0, 10000];
    const prices = products.map(p => parseFloat(p.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    // Round to nearest 50 for smoother slider experience
    const roundedMin = Math.floor(minPrice / 50) * 50;
    const roundedMax = Math.ceil(maxPrice / 50) * 50;
    
    return [roundedMin, roundedMax];
  }, [products]);

  // Initialize price range when products load
  useEffect(() => {
    if (products && products.length > 0 && priceRange[0] === 0 && priceRange[1] === 10000) {
      const range = productPriceRange as [number, number];
      setPriceRange(range);
      setDebouncedPriceRange(range);
    }
  }, [products, productPriceRange, priceRange]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products.filter(product => {
      // Search filter
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !product.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategoryIds.length > 0 && !selectedCategoryIds.includes(product.categoryId)) {
        return false;
      }

      // Subcategory filter
      if (selectedSubcategoryIds.length > 0 && product.subcategoryId && 
          !selectedSubcategoryIds.includes(product.subcategoryId)) {
        return false;
      }

      // Price filter
      const price = parseFloat(product.price);
      if (price < debouncedPriceRange[0] || price > debouncedPriceRange[1]) {
        return false;
      }

      // Featured filter
      if (showFeaturedOnly && !product.isFeatured) {
        return false;
      }

      return true;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return parseFloat(a.price) - parseFloat(b.price);
        case "price-high":
          return parseFloat(b.price) - parseFloat(a.price);
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "featured":
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [products, searchQuery, selectedCategoryIds, selectedSubcategoryIds, priceRange, showFeaturedOnly, sortBy]);

  // Filter handlers
  const toggleCategory = (categoryId: number) => {
    setSelectedCategoryIds(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleSubcategory = (subcategoryId: number) => {
    setSelectedSubcategoryIds(prev => 
      prev.includes(subcategoryId) 
        ? prev.filter(id => id !== subcategoryId)
        : [...prev, subcategoryId]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategoryIds([]);
    setSelectedSubcategoryIds([]);
    setPriceRange(productPriceRange as [number, number]);
    setShowFeaturedOnly(false);
  };

  const activeFiltersCount = [
    searchQuery,
    selectedCategoryIds.length > 0,
    selectedSubcategoryIds.length > 0,
    priceRange[0] !== productPriceRange[0] || priceRange[1] !== productPriceRange[1],
    showFeaturedOnly
  ].filter(Boolean).length;

  // Filter sidebar component
  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Search Products
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Tag className="h-5 w-5 mr-2" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {categoriesLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-6" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {categories?.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategoryIds.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subcategories */}
      {selectedCategoryIds.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              Subcategories
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {subcategoriesLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-6" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {subcategories
                  ?.filter(sub => selectedCategoryIds.includes(sub.categoryId))
                  .map((subcategory) => (
                  <div key={subcategory.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`subcategory-${subcategory.id}`}
                      checked={selectedSubcategoryIds.includes(subcategory.id)}
                      onCheckedChange={() => toggleSubcategory(subcategory.id)}
                    />
                    <label
                      htmlFor={`subcategory-${subcategory.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {subcategory.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Price Range */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Price Range
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Interactive Price Range Cards */}
            <div className="space-y-4">
              {/* Price Range Selector with Visual Bars */}
              <div className="relative">
                <div className="flex justify-between text-xs font-medium text-gray-600 mb-2">
                  <span>₹{productPriceRange[0].toLocaleString()}</span>
                  <span>₹{productPriceRange[1].toLocaleString()}</span>
                </div>
                
                {/* Visual Price Range Bar */}
                <div className="relative h-12 bg-gradient-to-r from-green-100 via-yellow-100 to-red-100 dark:from-green-900/30 dark:via-yellow-900/30 dark:to-red-900/30 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  {/* Active Range Overlay */}
                  <div 
                    className="absolute top-0 h-full bg-gradient-to-r from-blue-500/40 to-purple-500/40 backdrop-blur-sm transition-all duration-300 rounded-xl border-2 border-blue-400"
                    style={{
                      left: `${((priceRange[0] - productPriceRange[0]) / (productPriceRange[1] - productPriceRange[0])) * 100}%`,
                      width: `${((priceRange[1] - priceRange[0]) / (productPriceRange[1] - productPriceRange[0])) * 100}%`
                    }}
                  />
                  
                  {/* Price Range Indicators */}
                  <div className="absolute inset-0 flex items-center justify-between px-4">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-medium text-green-700 dark:text-green-300">Budget</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">Mid-Range</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-xs font-medium text-red-700 dark:text-red-300">Premium</span>
                    </div>
                  </div>
                </div>
                
                {/* Current Selection Display */}
                <div className="flex justify-center mt-2">
                  <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-200 dark:border-blue-800">
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                      ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Manual Input Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Min Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                  <Input
                    type="number"
                    min={productPriceRange[0]}
                    max={priceRange[1]}
                    value={priceRange[0]}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || productPriceRange[0];
                      if (value <= priceRange[1] && value >= productPriceRange[0]) {
                        setPriceRange([value, priceRange[1]]);
                      }
                    }}
                    onBlur={(e) => {
                      // Ensure value is within bounds on blur
                      const value = parseInt(e.target.value) || productPriceRange[0];
                      const clampedValue = Math.max(productPriceRange[0], Math.min(value, priceRange[1]));
                      setPriceRange([clampedValue, priceRange[1]]);
                    }}
                    className="pl-8 text-sm h-9 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    placeholder="Min"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Max Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                  <Input
                    type="number"
                    min={priceRange[0]}
                    max={productPriceRange[1]}
                    value={priceRange[1]}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || productPriceRange[1];
                      if (value >= priceRange[0] && value <= productPriceRange[1]) {
                        setPriceRange([priceRange[0], value]);
                      }
                    }}
                    onBlur={(e) => {
                      // Ensure value is within bounds on blur
                      const value = parseInt(e.target.value) || productPriceRange[1];
                      const clampedValue = Math.min(productPriceRange[1], Math.max(value, priceRange[0]));
                      setPriceRange([priceRange[0], clampedValue]);
                    }}
                    className="pl-8 text-sm h-9 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
            
            {/* Interactive Price Range Cards */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-600">Quick Select Ranges</p>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { 
                    range: [productPriceRange[0], 2000], 
                    label: "Budget Friendly", 
                    subtitle: "Under ₹2K",
                    icon: "💚",
                    color: "from-green-400 to-green-600",
                    bgColor: "bg-green-50 dark:bg-green-900/20",
                    borderColor: "border-green-200 dark:border-green-800"
                  },
                  { 
                    range: [2000, 5000], 
                    label: "Mid Range", 
                    subtitle: "₹2K - ₹5K",
                    icon: "💛",
                    color: "from-yellow-400 to-yellow-600",
                    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
                    borderColor: "border-yellow-200 dark:border-yellow-800"
                  },
                  { 
                    range: [5000, 10000], 
                    label: "Premium", 
                    subtitle: "₹5K - ₹10K",
                    icon: "🧡",
                    color: "from-orange-400 to-orange-600",
                    bgColor: "bg-orange-50 dark:bg-orange-900/20",
                    borderColor: "border-orange-200 dark:border-orange-800"
                  },
                  { 
                    range: [10000, productPriceRange[1]], 
                    label: "Luxury", 
                    subtitle: "Above ₹10K",
                    icon: "💜",
                    color: "from-purple-400 to-purple-600",
                    bgColor: "bg-purple-50 dark:bg-purple-900/20",
                    borderColor: "border-purple-200 dark:border-purple-800"
                  }
                ].map((option, index) => {
                  const isSelected = priceRange[0] === option.range[0] && priceRange[1] === option.range[1];
                  return (
                    <div
                      key={index}
                      onClick={() => setPriceRange(option.range as [number, number])}
                      className={`
                        relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md
                        ${isSelected 
                          ? `${option.bgColor} ${option.borderColor} shadow-lg ring-2 ring-blue-400 ring-opacity-50` 
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }
                      `}
                    >
                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{option.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{option.label}</h4>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{option.subtitle}</span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${option.color} transition-all duration-500 ${
                                isSelected ? 'animate-pulse' : ''
                              }`}
                              style={{ 
                                width: `${Math.min(100, ((option.range[1] - option.range[0]) / (productPriceRange[1] - productPriceRange[0])) * 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Advanced Price Range Controls */}
            <div className="space-y-4">
              {/* Drag & Drop Price Adjusters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600">Minimum Price</label>
                  <div className="relative group">
                    <div 
                      className="w-full h-16 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl border-2 border-dashed border-green-300 dark:border-green-700 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
                      onClick={() => {
                        const newMin = Math.max(productPriceRange[0], priceRange[0] - 500);
                        setPriceRange([newMin, priceRange[1]]);
                      }}
                    >
                      <div className="text-xs font-medium text-green-600 dark:text-green-400">Tap to adjust</div>
                      <div className="text-lg font-bold text-green-700 dark:text-green-300">₹{priceRange[0].toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600">Maximum Price</label>
                  <div className="relative group">
                    <div 
                      className="w-full h-16 bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-700 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
                      onClick={() => {
                        const newMax = Math.min(productPriceRange[1], priceRange[1] + 500);
                        setPriceRange([priceRange[0], newMax]);
                      }}
                    >
                      <div className="text-xs font-medium text-purple-600 dark:text-purple-400">Tap to adjust</div>
                      <div className="text-lg font-bold text-purple-700 dark:text-purple-300">₹{priceRange[1].toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Adjustment Controls */}
              <div className="flex justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPriceRange([Math.max(productPriceRange[0], priceRange[0] - 1000), priceRange[1]])}
                  className="flex items-center space-x-1 h-8 px-3"
                >
                  <span className="text-xs">-₹1K</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPriceRange(productPriceRange as [number, number])}
                  className="flex items-center space-x-1 h-8 px-3"
                >
                  <span className="text-xs">Reset</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPriceRange([priceRange[0], Math.min(productPriceRange[1], priceRange[1] + 1000)])}
                  className="flex items-center space-x-1 h-8 px-3"
                >
                  <span className="text-xs">+₹1K</span>
                </Button>
              </div>

              {/* Live Price Range Display */}
              <div className="relative overflow-hidden">
                <div className="text-center p-4 bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 dark:from-indigo-900/20 dark:via-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Active Filter</span>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                  
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                    ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-blue-600 dark:text-blue-400">
                    <span>Range: ₹{(priceRange[1] - priceRange[0]).toLocaleString()}</span>
                    <span>{Math.round(((priceRange[1] - priceRange[0]) / (productPriceRange[1] - productPriceRange[0])) * 100)}% of total</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured Products */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Special
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={showFeaturedOnly}
              onCheckedChange={(checked) => setShowFeaturedOnly(!!checked)}
            />
            <label
              htmlFor="featured"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Featured Products Only
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          onClick={clearAllFilters}
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Products
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Discover our complete product collection
              </p>
            </div>

            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Refine your product search
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar />
                  </div>
                </SheetContent>
              </Sheet>

              {/* View Mode Toggle */}
              <div className="hidden sm:flex border rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="featured">Featured First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{searchQuery}"
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setSearchQuery("")}
                  />
                </Badge>
              )}
              {selectedCategoryIds.map(id => {
                const category = categories?.find(c => c.id === id);
                return category ? (
                  <Badge key={id} variant="secondary" className="flex items-center gap-1">
                    {category.name}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => toggleCategory(id)}
                    />
                  </Badge>
                ) : null;
              })}
              {showFeaturedOnly && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Featured Only
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setShowFeaturedOnly(false)}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block lg:w-80">
            <FilterSidebar />
          </div>

          {/* Products Area */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {productsLoading ? "Loading..." : `${filteredAndSortedProducts.length} products found`}
              </p>
              {filteredAndSortedProducts.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <TrendingUp className="h-4 w-4" />
                  <span>Showing best matches</span>
                </div>
              )}
            </div>

            {/* Products Grid/List */}
            {productsLoading ? (
              <div className={`grid gap-6 ${
                viewMode === "grid" 
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                  : "grid-cols-1"
              }`}>
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-0">
                      <Skeleton className="w-full h-48" />
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
            ) : filteredAndSortedProducts.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="mb-4">
                    <Search className="h-16 w-16 text-gray-400 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Try adjusting your filters or search terms to find what you're looking for.
                  </p>
                  <Button onClick={clearAllFilters} variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </Button>
                </div>
              </Card>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === "grid" 
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                  : "grid-cols-1"
              }`}>
                {filteredAndSortedProducts.map((product) => (
                  <div key={product.id} className="group">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
