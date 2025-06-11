import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import Header from "@/components/header";
import Footer from "@/components/footer";
import CartSidebar from "@/components/cart-sidebar";
import MobileBottomNav from "@/components/mobile-bottom-nav";
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Categories from "@/pages/categories";
import SubcategoryProducts from "@/pages/subcategory-products";
import Checkout from "@/pages/checkout";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import TermsOfService from "@/pages/terms-of-service";
import NotFound from "@/pages/not-found";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
      <MobileBottomNav />
      <CartSidebar />
    </div>
  );
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public routes with layout */}
      <Route path="/">
        <Layout>
          <Home />
        </Layout>
      </Route>
      
      <Route path="/products">
        <Layout>
          <Products />
        </Layout>
      </Route>
      
      <Route path="/products/:id">
        <Layout>
          <ProductDetail />
        </Layout>
      </Route>
      
      <Route path="/category/:categoryId">
        <Layout>
          <Categories />
        </Layout>
      </Route>
      
      <Route path="/subcategory/:subcategoryId/products">
        <Layout>
          <SubcategoryProducts />
        </Layout>
      </Route>
      
      <Route path="/checkout">
        <Layout>
          <Checkout />
        </Layout>
      </Route>
      
      <Route path="/terms-of-service">
        <Layout>
          <TermsOfService />
        </Layout>
      </Route>

      {/* Admin routes without main layout */}
      <Route path="/admin/login">
        <AdminLayout>
          <AdminLogin />
        </AdminLayout>
      </Route>
      
      <Route path="/admin/dashboard">
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </Route>

      {/* Fallback to 404 */}
      <Route>
        <Layout>
          <NotFound />
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Router />
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
