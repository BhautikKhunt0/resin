import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, X, ChevronDown, Grid3X3, Package, Star } from "lucide-react";
import { useState } from "react";
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
  const { toggleCart, getTotalItems } = useCart();
  const [location] = useLocation();

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

  // Collections dropdown component
  const CollectionsDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="text-sm font-medium text-gray-600 hover:text-gray-900 h-auto p-0 bg-transparent border-0 shadow-none flex items-center gap-1"
        >
          <Grid3X3 className="h-4 w-4" />
          Collections
          <ChevronDown className="h-3 w-3 transition-transform duration-200" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 p-2" align="start">
        <DropdownMenuLabel className="flex items-center gap-2 px-2 py-3 text-base font-semibold">
          <Package className="h-5 w-5 text-primary" />
          Shop by Category
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {categories.length > 0 ? (
          categories.map((category) => {
            const categorySubcategories = getSubcategoriesForCategory(category.id);
            
            if (categorySubcategories.length > 0) {
              return (
                <DropdownMenuSub key={category.id}>
                  <DropdownMenuSubTrigger className="flex items-center gap-3 px-2 py-3 cursor-pointer hover:bg-gray-50 rounded-md">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{category.name}</div>
                      <div className="text-xs text-gray-500">{categorySubcategories.length} collections</div>
                    </div>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-64 p-2" sideOffset={8}>
                    <DropdownMenuLabel className="px-2 py-2 text-sm font-semibold text-primary">
                      {category.name} Collections
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {categorySubcategories.map((subcategory) => (
                      <DropdownMenuItem key={subcategory.id} asChild className="px-2 py-3 cursor-pointer">
                        <Link href={`/subcategory/${subcategory.id}/products`}>
                          <div className="flex items-center gap-3 w-full">
                            <div className="w-6 h-6 bg-gradient-to-br from-gray-100 to-gray-50 rounded-md flex items-center justify-center">
                              <Star className="h-3 w-3 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{subcategory.name}</div>
                              <div className="text-xs text-gray-500">{subcategory.description}</div>
                            </div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="px-2 py-2 cursor-pointer">
                      <Link href={`/category/${category.id}`}>
                        <div className="flex items-center gap-2 w-full text-primary font-medium">
                          <Package className="h-4 w-4" />
                          View all {category.name}
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              );
            } else {
              return (
                <DropdownMenuItem key={category.id} asChild className="px-2 py-3 cursor-pointer">
                  <Link href={`/category/${category.id}`}>
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{category.name}</div>
                        <div className="text-xs text-gray-500">{category.description}</div>
                      </div>
                    </div>
                  </Link>
                </DropdownMenuItem>
              );
            }
          })
        ) : (
          <DropdownMenuItem disabled className="px-2 py-3 text-center text-gray-500">
            No collections available
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="px-2 py-3 cursor-pointer">
          <Link href="/products">
            <div className="flex items-center gap-2 w-full text-primary font-medium">
              <Grid3X3 className="h-4 w-4" />
              Browse All Products
            </div>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <h1 className="text-2xl font-bold text-primary cursor-pointer">
              ModernShop
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span
                  className={`text-sm font-medium transition-colors cursor-pointer ${
                    location === item.href
                      ? "text-primary"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
            <CollectionsDropdown />
          </nav>

          {/* Cart & Admin */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCart}
              className="relative p-2"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-cart-bounce">
                  {totalItems}
                </span>
              )}
            </Button>

            <Link href="/admin/login">
              <Button variant="ghost" size="sm">
                Admin
              </Button>
            </Link>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span
                    className={`block px-3 py-2 text-base font-medium transition-colors cursor-pointer ${
                      location === item.href
                        ? "text-primary bg-gray-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
              
              {/* Mobile Collections Section */}
              <div className="px-3 py-2">
                <div className="flex items-center gap-2 mb-3 text-base font-medium text-gray-900">
                  <Grid3X3 className="h-5 w-5 text-primary" />
                  Collections
                </div>
                <div className="space-y-1">
                  {categories.map((category) => {
                    const categorySubcategories = getSubcategoriesForCategory(category.id);
                    return (
                      <div key={category.id} className="space-y-1">
                        <Link href={`/category/${category.id}`}>
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
                          <div className="ml-6 space-y-1">
                            {categorySubcategories.map((subcategory) => (
                              <Link key={subcategory.id} href={`/subcategory/${subcategory.id}/products`}>
                                <div
                                  className="flex items-center gap-2 px-2 py-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50 cursor-pointer"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  <Star className="h-3 w-3" />
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
