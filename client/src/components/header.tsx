import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, X, ChevronDown, Grid3X3, Package, Star } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import type { Category, Subcategory } from "@shared/schema";


export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [expandedMobileCategories, setExpandedMobileCategories] = useState<Set<number>>(new Set());
  const { toggleCart, getTotalItems } = useCart();
  const [location] = useLocation();
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const categoryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const totalItems = getTotalItems();

  // Fetch categories and subcategories for the collections dropdown
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: subcategories = [] } = useQuery<Subcategory[]>({
    queryKey: ['/api/subcategories'],
  });

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
  ];

  // Helper function to get subcategories for a specific category
  const getSubcategoriesForCategory = (categoryId: number) => {
    return subcategories.filter(sub => sub.categoryId === categoryId);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (categoryTimeoutRef.current) {
        clearTimeout(categoryTimeoutRef.current);
      }
    };
  }, []);

  // Handle collections dropdown hover
  const handleCollectionsEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsCollectionsOpen(true);
  };

  const handleCollectionsLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsCollectionsOpen(false);
      setActiveCategory(null);
    }, 150);
  };

  // Handle category hover
  const handleCategoryEnter = (categoryId: number) => {
    if (categoryTimeoutRef.current) {
      clearTimeout(categoryTimeoutRef.current);
    }
    setActiveCategory(categoryId);
  };

  const handleCategoryLeave = () => {
    categoryTimeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 100);
  };

  // Handle mobile category toggle
  const toggleMobileCategory = (categoryId: number) => {
    setExpandedMobileCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Collections dropdown component with stable hover functionality
  const CollectionsDropdown = () => (
    <div 
      className="relative"
      onMouseEnter={handleCollectionsEnter}
      onMouseLeave={handleCollectionsLeave}
    >
      <Button 
        variant="ghost" 
        className="text-sm font-medium text-pink-100 hover:text-white hover:bg-transparent h-auto p-0 bg-transparent border-0 shadow-none flex items-center gap-1"
      >
        <Grid3X3 className="h-4 w-4" />
        Collections
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isCollectionsOpen ? 'rotate-180' : ''}`} />
      </Button>
      
      {isCollectionsOpen && (
        <div 
          className="absolute top-full left-0 mt-1 w-72 bg-white rounded-md shadow-lg border border-gray-200 p-2 z-50"
          onMouseEnter={handleCollectionsEnter}
          onMouseLeave={handleCollectionsLeave}
        >
          <div className="flex items-center gap-2 px-2 py-3 text-base font-semibold">
            <Package className="h-5 w-5 text-primary" />
            Shop by Category
          </div>
          <div className="h-px bg-gray-200 my-1"></div>
          
          {categories.length > 0 ? (
            categories.map((category) => {
              const categorySubcategories = getSubcategoriesForCategory(category.id);
              
              if (categorySubcategories.length > 0) {
                return (
                  <div 
                    key={category.id} 
                    className="relative"
                    onMouseEnter={() => handleCategoryEnter(category.id)}
                    onMouseLeave={handleCategoryLeave}
                  >
                    <div className="flex items-center gap-3 px-2 py-3 cursor-pointer hover:bg-gray-50 rounded-md">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{category.name}</div>
                        <div className="text-xs text-gray-500">{categorySubcategories.length} collections</div>
                      </div>
                      <ChevronDown className="h-3 w-3 -rotate-90 text-gray-400" />
                    </div>
                    
                    {/* Subcategory submenu with improved hover zone */}
                    {activeCategory === category.id && (
                      <div 
                        className="absolute left-full top-0 ml-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 p-2 z-50"
                        onMouseEnter={() => handleCategoryEnter(category.id)}
                        onMouseLeave={handleCategoryLeave}
                      >
                        <div className="px-2 py-2 text-sm font-semibold text-primary">
                          {category.name} Collections
                        </div>
                        <div className="h-px bg-gray-200 my-1"></div>
                        {categorySubcategories.map((subcategory) => (
                          <Link key={subcategory.id} href={`/subcategory/${subcategory.id}/products`}>
                            <div className="flex items-center gap-3 px-2 py-3 cursor-pointer hover:bg-gray-50 rounded-md">
                              <div className="w-6 h-6 bg-gradient-to-br from-gray-100 to-gray-50 rounded-md flex items-center justify-center">
                                <Package className="h-3 w-3 text-gray-600" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-sm">{subcategory.name}</div>
                                <div className="text-xs text-gray-500">{subcategory.description}</div>
                              </div>
                            </div>
                          </Link>
                        ))}
                        <div className="h-px bg-gray-200 my-1"></div>
                        <Link href={`/category/${category.id}`}>
                          <div className="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-gray-50 rounded-md text-primary font-medium">
                            <Package className="h-4 w-4" />
                            View all {category.name}
                          </div>
                        </Link>
                      </div>
                    )}
                    
                    {/* Invisible bridge to prevent menu from closing */}
                    {activeCategory === category.id && (
                      <div className="absolute left-full top-0 w-1 h-full bg-transparent"></div>
                    )}
                  </div>
                );
              } else {
                return (
                  <Link key={category.id} href={`/category/${category.id}`}>
                    <div className="flex items-center gap-3 px-2 py-3 cursor-pointer hover:bg-gray-50 rounded-md">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{category.name}</div>
                        <div className="text-xs text-gray-500">{category.description}</div>
                      </div>
                    </div>
                  </Link>
                );
              }
            })
          ) : (
            <div className="px-2 py-3 text-center text-gray-500">
              No collections available
            </div>
          )}
          
          <div className="h-px bg-gray-200 my-1"></div>
          <Link href="/products">
            <div className="flex items-center gap-2 px-2 py-3 cursor-pointer hover:bg-gray-50 rounded-md text-primary font-medium">
              <Grid3X3 className="h-4 w-4" />
              Browse All Products
            </div>
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <header className="shadow-lg sticky top-0 z-50" style={{ backgroundColor: '#A12971' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Button - Left side */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-white hover:bg-pink-600/20 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          {/* Logo - Center on mobile, left on desktop */}
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <h1 className="text-white text-xl font-bold">The Resin Studio</h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span
                  className={`text-sm font-medium transition-colors cursor-pointer ${
                    location === item.href
                      ? "text-white border-b-2 border-white pb-1"
                      : "text-pink-100 hover:text-white"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
            <CollectionsDropdown />
          </nav>

          {/* Cart & Admin */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCart}
              className="relative p-2 md:hidden text-white hover:bg-pink-600/20 hover:text-white"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-pink-700 text-xs rounded-full h-5 w-5 flex items-center justify-center animate-cart-bounce font-semibold">
                  {totalItems}
                </span>
              )}
            </Button>

            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCart}
                className="relative p-2 text-white hover:bg-pink-600/20 hover:text-white"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-pink-700 text-xs rounded-full h-5 w-5 flex items-center justify-center animate-cart-bounce font-semibold">
                    {totalItems}
                  </span>
                )}
              </Button>

              <Link href="/admin/login">
                <Button variant="ghost" size="sm" className="text-white hover:bg-pink-600/20 hover:text-white">
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-pink-500/30 py-4">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span
                    className={`block px-3 py-2 text-base font-medium transition-colors cursor-pointer ${
                      location === item.href
                        ? "text-white bg-pink-600/20 border-l-4 border-white"
                        : "text-pink-100 hover:text-white hover:bg-pink-600/20"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
              
              {/* Mobile Collections Section */}
              <div className="px-3 py-2">
                <div className="flex items-center gap-2 mb-3 text-base font-medium text-white">
                  <Grid3X3 className="h-5 w-5 text-white" />
                  Collections
                </div>
                <div className="space-y-1">
                  {categories.map((category) => {
                    const categorySubcategories = getSubcategoriesForCategory(category.id);
                    const isExpanded = expandedMobileCategories.has(category.id);
                    
                    return (
                      <div key={category.id} className="space-y-1">
                        <div className="flex items-center">
                          <Link href={`/category/${category.id}`} className="flex-1">
                            <div
                              className="flex items-center gap-3 px-2 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 cursor-pointer"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <div className="w-6 h-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                                <Package className="h-3 w-3 text-primary" />
                              </div>
                              <span className="font-medium text-sm">{category.name}</span>
                            </div>
                          </Link>
                          {categorySubcategories.length > 0 && (
                            <button
                              onClick={() => toggleMobileCategory(category.id)}
                              className="p-2 hover:bg-gray-50 rounded-md transition-colors"
                            >
                              <ChevronDown 
                                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                                  isExpanded ? 'rotate-180' : ''
                                }`} 
                              />
                            </button>
                          )}
                        </div>
                        {categorySubcategories.length > 0 && isExpanded && (
                          <div className="ml-6 space-y-1 animate-in slide-in-from-top-2 duration-200">
                            {categorySubcategories.map((subcategory) => (
                              <Link key={subcategory.id} href={`/subcategory/${subcategory.id}/products`}>
                                <div
                                  className="flex items-center gap-2 px-2 py-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50 cursor-pointer"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  <Package className="h-3 w-3" />
                                  <span className="text-sm">{subcategory.name}</span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
