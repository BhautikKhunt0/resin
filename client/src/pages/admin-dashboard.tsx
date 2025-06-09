import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tags,
  Plus,
  Edit,
  Trash2,
  Eye,
  LogOut,
  Users,
  DollarSign,
  TrendingUp,
  Menu,
  X,
  Upload,
  Image as ImageIcon,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { Product, Category, Order, Banner } from "@shared/schema";

// Form schemas
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().min(1, "Price is required"),
  imageUrl: z.string().optional(),
  imageBlob: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  subcategoryId: z.string().optional(),
  isFeatured: z.boolean().optional(),
}).refine((data) => {
  if (data.imageUrl && data.imageUrl.trim() !== '') {
    try {
      new URL(data.imageUrl);
      return true;
    } catch {
      return false;
    }
  }
  return true;
}, {
  message: "Please enter a valid URL",
  path: ["imageUrl"]
});

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  imageBlob: z.string().optional(),
}).refine((data) => {
  if (data.imageUrl && data.imageUrl.trim() !== '') {
    try {
      new URL(data.imageUrl);
      return true;
    } catch {
      return false;
    }
  }
  return true;
}, {
  message: "Please enter a valid URL",
  path: ["imageUrl"]
});

const subcategorySchema = z.object({
  name: z.string().min(1, "Subcategory name is required"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  imageUrl: z.string().optional(),
  imageBlob: z.string().optional(),
}).refine((data) => {
  if (data.imageUrl && data.imageUrl.trim() !== '') {
    try {
      new URL(data.imageUrl);
      return true;
    } catch {
      return false;
    }
  }
  return true;
}, {
  message: "Please enter a valid URL",
  path: ["imageUrl"]
});

const bannerSchema = z.object({
  title: z.string().min(1, "Banner title is required"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  imageBlob: z.string().optional(),
  isActive: z.boolean().optional(),
}).refine((data) => {
  if (data.imageUrl && data.imageUrl.trim() !== '') {
    try {
      new URL(data.imageUrl);
      return true;
    } catch {
      return false;
    }
  }
  return true;
}, {
  message: "Please enter a valid URL",
  path: ["imageUrl"]
});

type ProductFormData = z.infer<typeof productSchema>;
type CategoryFormData = z.infer<typeof categorySchema>;
type SubcategoryFormData = z.infer<typeof subcategorySchema>;
type BannerFormData = z.infer<typeof bannerSchema>;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<any>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false);
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [imageUploadDialogOpen, setImageUploadDialogOpen] = useState(false);
  const [currentImageField, setCurrentImageField] = useState<string | null>(null);
  const [orderDetailsDialogOpen, setOrderDetailsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { admin, token, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated || !token) {
    return null;
  }

  // Queries
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: () => api.getProducts(),
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: api.getCategories,
  });

  const { data: subcategories, isLoading: subcategoriesLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/subcategories"],
    queryFn: () => api.getAdminSubcategories(token),
  });

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    queryFn: () => api.getOrders(token),
  });

  const { data: banners, isLoading: bannersLoading } = useQuery<Banner[]>({
    queryKey: ["/api/admin/banners"],
    queryFn: () => api.getAdminBanners(token),
  });

  // Forms
  const productForm = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      imageUrl: "",
      imageBlob: "",
      categoryId: "",
      subcategoryId: "",
      isFeatured: false,
    },
  });

  const bannerForm = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      imageBlob: "",
      isActive: true,
    },
  });

  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      imageBlob: "",
    },
  });

  const subcategoryForm = useForm<SubcategoryFormData>({
    resolver: zodResolver(subcategorySchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      imageUrl: "",
      imageBlob: "",
    },
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: (data: any) => api.createProduct(token, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setProductDialogOpen(false);
      productForm.reset();
      setEditingProduct(null);
      toast({ title: "Product created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create product", variant: "destructive" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.updateProduct(token, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setProductDialogOpen(false);
      productForm.reset();
      setEditingProduct(null);
      toast({ title: "Product updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update product", variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => api.deleteProduct(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete product", variant: "destructive" });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: any) => api.createCategory(token, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setCategoryDialogOpen(false);
      categoryForm.reset();
      setEditingCategory(null);
      toast({ title: "Category created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create category", variant: "destructive" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.updateCategory(token, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setCategoryDialogOpen(false);
      categoryForm.reset();
      setEditingCategory(null);
      toast({ title: "Category updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update category", variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => api.deleteCategory(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Category deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete category", variant: "destructive" });
    },
  });

  // Subcategory mutations
  const createSubcategoryMutation = useMutation({
    mutationFn: (data: any) => api.createSubcategory(token, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subcategories"] });
      setSubcategoryDialogOpen(false);
      subcategoryForm.reset();
      setEditingSubcategory(null);
      toast({ title: "Subcategory created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create subcategory", variant: "destructive" });
    },
  });

  const updateSubcategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.updateSubcategory(token, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subcategories"] });
      setSubcategoryDialogOpen(false);
      subcategoryForm.reset();
      setEditingSubcategory(null);
      toast({ title: "Subcategory updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update subcategory", variant: "destructive" });
    },
  });

  const deleteSubcategoryMutation = useMutation({
    mutationFn: (id: number) => api.deleteSubcategory(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subcategories"] });
      toast({ title: "Subcategory deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete subcategory", variant: "destructive" });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      api.updateOrderStatus(token, id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Order status updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update order status", variant: "destructive" });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: (id: number) => api.deleteOrder(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Order deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete order", variant: "destructive" });
    },
  });

  // Banner mutations
  const createBannerMutation = useMutation({
    mutationFn: (data: any) => api.createBanner(token, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      setBannerDialogOpen(false);
      bannerForm.reset();
      setEditingBanner(null);
      toast({ title: "Banner created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create banner", variant: "destructive" });
    },
  });

  const updateBannerMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => {
      return api.updateBanner(token, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
      setBannerDialogOpen(false);
      bannerForm.reset();
      setEditingBanner(null);
      toast({ title: "Banner updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to update banner", variant: "destructive" });
    },
  });

  const deleteBannerMutation = useMutation({
    mutationFn: (id: number) => api.deleteBanner(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      toast({ title: "Banner deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete banner", variant: "destructive" });
    },
  });

  // Image upload mutation
  const uploadImageMutation = useMutation({
    mutationFn: ({ imageData, filename }: { imageData: string; filename?: string }) => 
      api.uploadImage(token, imageData, filename),
    onSuccess: (data) => {
      if (currentImageField === 'product') {
        productForm.setValue('imageBlob', data.imageBlob);
        productForm.setValue('imageUrl', '');
      } else if (currentImageField === 'banner') {
        bannerForm.setValue('imageBlob', data.imageBlob);
        bannerForm.setValue('imageUrl', '');
      } else if (currentImageField === 'category') {
        categoryForm.setValue('imageBlob', data.imageBlob);
        categoryForm.setValue('imageUrl', '');
      } else if (currentImageField === 'subcategory') {
        subcategoryForm.setValue('imageBlob', data.imageBlob);
        subcategoryForm.setValue('imageUrl', '');
      }
      setImageUploadDialogOpen(false);
      setCurrentImageField(null);
      toast({ title: "Image uploaded successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to upload image", variant: "destructive" });
    },
  });

  // Clear blob when URL is changed
  const handleProductImageUrlChange = (value: string) => {
    if (value && value.trim() !== '') {
      productForm.setValue('imageBlob', '');
    }
  };

  const handleBannerImageUrlChange = (value: string) => {
    if (value && value.trim() !== '') {
      bannerForm.setValue('imageBlob', '');
    }
  };

  const handleCategoryImageUrlChange = (value: string) => {
    if (value && value.trim() !== '') {
      categoryForm.setValue('imageBlob', '');
    }
  };

  const handleSubcategoryImageUrlChange = (value: string) => {
    if (value && value.trim() !== '') {
      subcategoryForm.setValue('imageBlob', '');
    }
  };

  // Handlers
  const handleProductSubmit = (data: ProductFormData) => {
    const productData = {
      ...data,
      price: data.price,
      categoryId: parseInt(data.categoryId),
      subcategoryId: data.subcategoryId && data.subcategoryId.trim() !== "" ? parseInt(data.subcategoryId) : null,
      imageUrl: data.imageUrl || undefined,
      imageBlob: data.imageBlob || undefined,
      isFeatured: data.isFeatured ? 1 : 0,
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const handleBannerSubmit = (data: BannerFormData) => {
    const bannerData = {
      ...data,
      imageUrl: data.imageUrl || undefined,
      imageBlob: data.imageBlob || undefined,
      isActive: data.isActive ? 1 : 0,
    };

    if (editingBanner) {
      updateBannerMutation.mutate({ id: editingBanner.id, data: bannerData });
    } else {
      createBannerMutation.mutate(bannerData);
    }
  };

  const handleCategorySubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const handleSubcategorySubmit = (data: SubcategoryFormData) => {
    const subcategoryData = {
      ...data,
      categoryId: parseInt(data.categoryId),
    };

    if (editingSubcategory) {
      updateSubcategoryMutation.mutate({ id: editingSubcategory.id, data: subcategoryData });
    } else {
      createSubcategoryMutation.mutate(subcategoryData);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    productForm.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl || "",
      imageBlob: product.imageBlob || "",
      categoryId: product.categoryId.toString(),
      subcategoryId: product.subcategoryId?.toString() || "",
      isFeatured: Boolean(product.isFeatured),
    });
    setProductDialogOpen(true);
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    bannerForm.reset({
      title: banner.title,
      description: banner.description || "",
      imageUrl: banner.imageUrl || "",
      imageBlob: banner.imageBlob || "",
      isActive: Boolean(banner.isActive),
    });
    setBannerDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    categoryForm.reset({
      name: category.name,
      description: category.description || "",
      imageUrl: category.imageUrl || "",
      imageBlob: category.imageBlob || "",
    });
    setCategoryDialogOpen(true);
  };

  const handleEditSubcategory = (subcategory: any) => {
    setEditingSubcategory(subcategory);
    subcategoryForm.reset({
      name: subcategory.name,
      description: subcategory.description || "",
      categoryId: subcategory.categoryId.toString(),
      imageUrl: subcategory.imageUrl || "",
      imageBlob: subcategory.imageBlob || "",
    });
    setSubcategoryDialogOpen(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    productForm.reset();
    setProductDialogOpen(true);
  };

  const handleAddBanner = () => {
    setEditingBanner(null);
    bannerForm.reset();
    setBannerDialogOpen(true);
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    categoryForm.reset();
    setCategoryDialogOpen(true);
  };

  const handleAddSubcategory = () => {
    setEditingSubcategory(null);
    subcategoryForm.reset();
    setSubcategoryDialogOpen(true);
  };

  const handleImageUpload = (fieldType: string) => {
    setCurrentImageField(fieldType);
    setImageUploadDialogOpen(true);
  };

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsDialogOpen(true);
  };

  const handleLogout = () => {
    logout();
    setLocation("/admin/login");
  };

  // Statistics
  const totalProducts = products?.length || 0;
  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0) || 0;
  const processingOrders = orders?.filter(order => order.status === "Processing").length || 0;

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "categories", label: "Categories", icon: Tags },
    { id: "subcategories", label: "Subcategories", icon: Tags },
    { id: "banners", label: "Banners", icon: Eye },
    { id: "orders", label: "Orders", icon: ShoppingBag },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 bg-slate-900">
          <h2 className="text-xl font-bold text-white">Admin Panel</h2>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-4">
          <div className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  className={`w-full justify-start ${
                    activeTab === item.id
                      ? "bg-primary text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-700"
                  }`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          <div className="mt-8 pt-8 border-t border-slate-700">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Logout
            </Button>
          </div>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900 ml-4 lg:ml-0">
                {sidebarItems.find(item => item.id === activeTab)?.label || "Dashboard"}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {admin?.email}</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-600">Total Products</p>
                        <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-600">Total Orders</p>
                        <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-600">Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-600">Processing</p>
                        <p className="text-2xl font-bold text-gray-900">{processingOrders}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders?.slice(0, 5).map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">#ORD-{order.id}</TableCell>
                            <TableCell>{order.customerName}</TableCell>
                            <TableCell>${parseFloat(order.totalAmount).toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  order.status === "Processing"
                                    ? "secondary"
                                    : order.status === "Shipped"
                                    ? "default"
                                    : "destructive"
                                }
                              >
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
                <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAddProduct} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="pb-6 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <DialogTitle className="text-2xl font-bold text-gray-900">
                            {editingProduct ? "Edit Product" : "Add New Product"}
                          </DialogTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            {editingProduct ? "Update product details below" : "Fill in the details to create a new product"}
                          </p>
                        </div>
                      </div>
                    </DialogHeader>
                    
                    <div className="py-6">
                      <Form {...productForm}>
                        <form onSubmit={productForm.handleSubmit(handleProductSubmit)} className="space-y-8">
                          {/* Basic Information Section */}
                          <div className="space-y-6">
                            <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">1</span>
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <FormField
                                control={productForm.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm font-medium text-gray-700">
                                      Product Name <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="e.g., iPhone 15 Pro Max" 
                                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={productForm.control}
                                name="price"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm font-medium text-gray-700">
                                      Price <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                                        <Input 
                                          type="number" 
                                          step="0.01" 
                                          placeholder="999.99" 
                                          className="h-11 pl-8 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                          {...field} 
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={productForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-gray-700">
                                    Description <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Describe your product features, specifications, and benefits..."
                                      className="min-h-[120px] border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Product Image Section */}
                          <div className="space-y-6">
                            <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 font-semibold text-sm">2</span>
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">Product Image</h3>
                            </div>
                            
                            <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-200">
                              <FormField
                                control={productForm.control}
                                name="imageUrl"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm font-medium text-gray-700">Image URL</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="https://images.unsplash.com/photo-..." 
                                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                        {...field}
                                        onChange={(e) => {
                                          field.onChange(e);
                                          handleProductImageUrlChange(e.target.value);
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <div className="flex items-center my-6">
                                <div className="flex-1 border-t border-gray-300"></div>
                                <span className="px-4 text-sm text-gray-500 bg-gray-50 font-medium">OR</span>
                                <div className="flex-1 border-t border-gray-300"></div>
                              </div>
                              
                              <div className="text-center">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="h-12 px-8 border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                  onClick={() => handleImageUpload('product')}
                                >
                                  <Upload className="h-5 w-5 mr-2" />
                                  Upload Image File
                                </Button>
                                <p className="text-xs text-gray-500 mt-3">
                                  Supports JPG, PNG, WebP up to 5MB
                                </p>
                              </div>
                              
                              {/* Image Preview */}
                              {(() => {
                                const imageBlob = productForm.watch('imageBlob');
                                const imageUrl = productForm.watch('imageUrl');
                                const hasImage = imageBlob || (imageUrl && imageUrl.trim() !== '');
                                
                                if (!hasImage) return null;
                                
                                return (
                                  <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                                    <div className="flex items-center mb-3">
                                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                      <span className="text-sm font-medium text-green-700">
                                        Image {imageBlob ? 'uploaded' : 'loaded'} successfully
                                      </span>
                                    </div>
                                    <div className="relative overflow-hidden rounded-lg bg-gray-100">
                                      <img
                                        src={imageBlob ? `data:image/jpeg;base64,${imageBlob}` : imageUrl || ''}
                                        alt="Product preview"
                                        className="w-full h-56 object-cover"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Category & Inventory Section */}
                          <div className="space-y-6">
                            <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-purple-600 font-semibold text-sm">3</span>
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">Category & Inventory</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              <FormField
                                control={productForm.control}
                                name="categoryId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm font-medium text-gray-700">
                                      Category <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                                          <SelectValue placeholder="Choose a category" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {categories?.map((category) => (
                                          <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={productForm.control}
                                name="subcategoryId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm font-medium text-gray-700">Subcategory</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                                          <SelectValue placeholder="Choose a subcategory (optional)" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {subcategories?.filter(sub => 
                                          !productForm.watch('categoryId') || 
                                          sub.categoryId.toString() === productForm.watch('categoryId')
                                        ).map((subcategory) => (
                                          <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                                            {subcategory.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                            </div>

                            <FormField
                              control={productForm.control}
                              name="isFeatured"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                    <div className="flex items-center space-x-4">
                                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <TrendingUp className="h-6 w-6 text-blue-600" />
                                      </div>
                                      <div>
                                        <FormLabel className="text-base font-semibold text-gray-900">Featured Product</FormLabel>
                                        <p className="text-sm text-gray-600 mt-1">
                                          Featured products appear prominently on the homepage and get more visibility
                                        </p>
                                      </div>
                                    </div>
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="data-[state=checked]:bg-blue-600"
                                      />
                                    </FormControl>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-end space-x-4 pt-8 border-t border-gray-100">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setProductDialogOpen(false)}
                              className="px-8 h-11 border-gray-200 hover:bg-gray-50"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              className="px-10 h-11 bg-blue-600 hover:bg-blue-700 shadow-lg"
                              disabled={createProductMutation.isPending || updateProductMutation.isPending}
                            >
                              {createProductMutation.isPending || updateProductMutation.isPending ? (
                                <div className="flex items-center">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                  {editingProduct ? "Updating..." : "Creating..."}
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <Package className="h-4 w-4 mr-2" />
                                  {editingProduct ? "Update Product" : "Create Product"}
                                </div>
                              )}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent className="p-0">
                  {productsLoading ? (
                    <div className="p-6 space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Featured</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products?.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              {(() => {
                                const imageUrl = product.imageBlob ? `data:image/jpeg;base64,${product.imageBlob}` : product.imageUrl;
                                return imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={product.name}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                    <Package className="h-6 w-6 text-gray-400" />
                                  </div>
                                );
                              })()}
                            </TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>
                              {categories?.find(c => c.id === product.categoryId)?.name}
                            </TableCell>
                            <TableCell>${parseFloat(product.price).toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant={product.isFeatured ? "default" : "secondary"}>
                                {product.isFeatured ? "Featured" : "Standard"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditProduct(product)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteProductMutation.mutate(product.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === "categories" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Category Management</h2>
                <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAddCategory} className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="pb-4 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Tags className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <DialogTitle className="text-xl font-bold text-gray-900">
                            {editingCategory ? "Edit Category" : "Add New Category"}
                          </DialogTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            {editingCategory ? "Update category details" : "Create a new product category"}
                          </p>
                        </div>
                      </div>
                    </DialogHeader>
                    
                    <div className="py-4">
                      <Form {...categoryForm}>
                        <form onSubmit={categoryForm.handleSubmit(handleCategorySubmit)} className="space-y-4">
                          <FormField
                            control={categoryForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  Category Name <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g., Electronics, Clothing, Books" 
                                    className="h-9 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={categoryForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Describe this category and what products it contains..."
                                    className="min-h-[60px] border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Image Upload Section */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-medium text-gray-700">Category Image</h3>
                              <div className="flex space-x-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setCurrentImageField('category');
                                    setImageUploadDialogOpen(true);
                                  }}
                                  className="h-9 px-3"
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Upload
                                </Button>
                              </div>
                            </div>

                            <FormField
                              control={categoryForm.control}
                              name="imageUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-gray-700">Image URL (Optional)</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="https://example.com/image.jpg"
                                      className="h-11 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(e.target.value);
                                        handleCategoryImageUrlChange(e.target.value);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="space-y-2">
                              {(() => {
                                const imageUrl = categoryForm.watch('imageUrl');
                                const imageBlob = categoryForm.watch('imageBlob');
                                
                                if (!imageUrl && !imageBlob) {
                                  return (
                                    <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                                      <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                      <p className="text-sm text-gray-500">No image selected</p>
                                    </div>
                                  );
                                }
                                
                                return (
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      <span className="text-sm font-medium text-green-700">
                                        Image {imageBlob ? 'uploaded' : 'loaded'} successfully
                                      </span>
                                    </div>
                                    <div className="relative overflow-hidden rounded-lg bg-gray-100">
                                      <img
                                        src={imageBlob ? `data:image/jpeg;base64,${imageBlob}` : imageUrl || ''}
                                        alt="Category preview"
                                        className="w-full h-48 object-cover"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-100">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setCategoryDialogOpen(false)}
                              className="px-6 h-11"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              className="px-8 h-11 bg-green-600 hover:bg-green-700"
                              disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                            >
                              {createCategoryMutation.isPending || updateCategoryMutation.isPending ? (
                                <div className="flex items-center">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                  {editingCategory ? "Updating..." : "Creating..."}
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <Tags className="h-4 w-4 mr-2" />
                                  {editingCategory ? "Update Category" : "Create Category"}
                                </div>
                              )}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent className="p-0">
                  {categoriesLoading ? (
                    <div className="p-6 space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Products</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories?.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell>
                              {(() => {
                                const imageUrl = category.imageBlob ? `data:image/jpeg;base64,${category.imageBlob}` : category.imageUrl;
                                return imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={category.name}
                                    className="w-16 h-12 object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                                    <Tags className="h-6 w-6 text-gray-400" />
                                  </div>
                                );
                              })()}
                            </TableCell>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell className="text-gray-600">{category.description || "No description"}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {products?.filter(p => p.categoryId === category.id).length || 0} products
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditCategory(category)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteCategoryMutation.mutate(category.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Subcategories Tab */}
          {activeTab === "subcategories" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Subcategory Management</h2>
                <Dialog open={subcategoryDialogOpen} onOpenChange={setSubcategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAddSubcategory} className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Subcategory
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="pb-4 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Tags className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <DialogTitle className="text-xl font-bold text-gray-900">
                            {editingSubcategory ? "Edit Subcategory" : "Add New Subcategory"}
                          </DialogTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            {editingSubcategory ? "Update subcategory details" : "Create a new product subcategory"}
                          </p>
                        </div>
                      </div>
                    </DialogHeader>
                    
                    <div className="py-4">
                      <Form {...subcategoryForm}>
                        <form onSubmit={subcategoryForm.handleSubmit(handleSubcategorySubmit)} className="space-y-4">
                          <div className="space-y-4">
                            <FormField
                              control={subcategoryForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-gray-700">
                                    Subcategory Name <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="e.g., Smartphones, Laptops" 
                                      className="h-11 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={subcategoryForm.control}
                              name="categoryId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-gray-700">
                                    Parent Category <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="h-11 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200">
                                        <SelectValue placeholder="Choose parent category" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {categories?.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                          {category.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={subcategoryForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Describe this subcategory and what products it contains..."
                                    className="min-h-[100px] border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Image Upload Section */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-medium text-gray-700">Subcategory Image</h3>
                              <div className="flex space-x-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setCurrentImageField('subcategory');
                                    setImageUploadDialogOpen(true);
                                  }}
                                  className="h-9 px-3"
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Upload
                                </Button>
                              </div>
                            </div>

                            <FormField
                              control={subcategoryForm.control}
                              name="imageUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-gray-700">Image URL (Optional)</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="https://example.com/image.jpg"
                                      className="h-11 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(e.target.value);
                                        handleSubcategoryImageUrlChange(e.target.value);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="space-y-2">
                              {(() => {
                                const imageUrl = subcategoryForm.watch('imageUrl');
                                const imageBlob = subcategoryForm.watch('imageBlob');
                                
                                if (!imageUrl && !imageBlob) {
                                  return (
                                    <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                                      <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                      <p className="text-sm text-gray-500">No image selected</p>
                                    </div>
                                  );
                                }
                                
                                return (
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                      <span className="text-sm font-medium text-purple-700">
                                        Image {imageBlob ? 'uploaded' : 'loaded'} successfully
                                      </span>
                                    </div>
                                    <div className="relative overflow-hidden rounded-lg bg-gray-100">
                                      <img
                                        src={imageBlob ? `data:image/jpeg;base64,${imageBlob}` : imageUrl || ''}
                                        alt="Subcategory preview"
                                        className="w-full h-48 object-cover"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-100">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setSubcategoryDialogOpen(false)}
                              className="px-6 h-11"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              className="px-8 h-11 bg-purple-600 hover:bg-purple-700"
                              disabled={createSubcategoryMutation.isPending || updateSubcategoryMutation.isPending}
                            >
                              {createSubcategoryMutation.isPending || updateSubcategoryMutation.isPending ? (
                                <div className="flex items-center">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                  {editingSubcategory ? "Updating..." : "Creating..."}
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <Tags className="h-4 w-4 mr-2" />
                                  {editingSubcategory ? "Update Subcategory" : "Create Subcategory"}
                                </div>
                              )}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent className="p-0">
                  {subcategoriesLoading ? (
                    <div className="p-6 space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Parent Category</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subcategories?.map((subcategory) => (
                          <TableRow key={subcategory.id}>
                            <TableCell>
                              {(() => {
                                const imageUrl = subcategory.imageBlob ? `data:image/jpeg;base64,${subcategory.imageBlob}` : subcategory.imageUrl;
                                return imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={subcategory.name}
                                    className="w-16 h-12 object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                                    <Tags className="h-6 w-6 text-gray-400" />
                                  </div>
                                );
                              })()}
                            </TableCell>
                            <TableCell className="font-medium">{subcategory.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {categories?.find(cat => cat.id === subcategory.categoryId)?.name || "Unknown"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-600">{subcategory.description || "No description"}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditSubcategory(subcategory)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteSubcategoryMutation.mutate(subcategory.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Banners Tab */}
          {activeTab === "banners" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Banner Management</h2>
                <Dialog open={bannerDialogOpen} onOpenChange={setBannerDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAddBanner} className="bg-orange-600 hover:bg-orange-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Banner
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="pb-6 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Eye className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <DialogTitle className="text-2xl font-bold text-gray-900">
                            {editingBanner ? "Edit Banner" : "Add New Banner"}
                          </DialogTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            {editingBanner ? "Update banner details" : "Create a new promotional banner"}
                          </p>
                        </div>
                      </div>
                    </DialogHeader>
                    
                    <div className="py-6">
                      <Form {...bannerForm}>
                        <form onSubmit={bannerForm.handleSubmit(handleBannerSubmit)} className="space-y-6">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <FormField
                              control={bannerForm.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-gray-700">
                                    Banner Title <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="e.g., Summer Sale - Up to 50% Off" 
                                      className="h-11 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={bannerForm.control}
                              name="isActive"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                                    <div>
                                      <FormLabel className="text-base font-medium text-gray-900">Active Banner</FormLabel>
                                      <p className="text-sm text-gray-600 mt-1">
                                        Show this banner on the website
                                      </p>
                                    </div>
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="data-[state=checked]:bg-orange-600"
                                      />
                                    </FormControl>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={bannerForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Describe the promotion or message for this banner..."
                                    className="min-h-[100px] border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Banner Image Section */}
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                <ImageIcon className="h-4 w-4 text-orange-600" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">Banner Image</h3>
                            </div>
                            
                            <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-200">
                              <FormField
                                control={bannerForm.control}
                                name="imageUrl"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm font-medium text-gray-700">Image URL</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="https://images.unsplash.com/photo-..." 
                                        className="h-11 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                                        {...field}
                                        onChange={(e) => {
                                          field.onChange(e);
                                          handleBannerImageUrlChange(e.target.value);
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <div className="flex items-center my-6">
                                <div className="flex-1 border-t border-gray-300"></div>
                                <span className="px-4 text-sm text-gray-500 bg-gray-50 font-medium">OR</span>
                                <div className="flex-1 border-t border-gray-300"></div>
                              </div>
                              
                              <div className="text-center">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="h-12 px-8 border-2 border-gray-200 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50"
                                  onClick={() => handleImageUpload('banner')}
                                >
                                  <Upload className="h-5 w-5 mr-2" />
                                  Upload Banner Image
                                </Button>
                                <p className="text-xs text-gray-500 mt-3">
                                  Recommended: 1200x400px, JPG or PNG up to 5MB
                                </p>
                              </div>
                              
                              {/* Image Preview */}
                              {(() => {
                                const imageBlob = bannerForm.watch('imageBlob');
                                const imageUrl = bannerForm.watch('imageUrl');
                                const hasImage = imageBlob || (imageUrl && imageUrl.trim() !== '');
                                
                                if (!hasImage) return null;
                                
                                return (
                                  <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                                    <div className="flex items-center mb-3">
                                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                      <span className="text-sm font-medium text-green-700">
                                        Image {imageBlob ? 'uploaded' : 'loaded'} successfully
                                      </span>
                                    </div>
                                    <div className="relative overflow-hidden rounded-lg bg-gray-100">
                                      <img
                                        src={imageBlob ? `data:image/jpeg;base64,${imageBlob}` : imageUrl || ''}
                                        alt="Banner preview"
                                        className="w-full h-48 object-cover"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-100">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setBannerDialogOpen(false)}
                              className="px-6 h-11"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              className="px-8 h-11 bg-orange-600 hover:bg-orange-700"
                              disabled={createBannerMutation.isPending || updateBannerMutation.isPending}
                            >
                              {createBannerMutation.isPending || updateBannerMutation.isPending ? (
                                <div className="flex items-center">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                  {editingBanner ? "Updating..." : "Creating..."}
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <Eye className="h-4 w-4 mr-2" />
                                  {editingBanner ? "Update Banner" : "Create Banner"}
                                </div>
                              )}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent className="p-0">
                  {bannersLoading ? (
                    <div className="p-6 space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {banners?.map((banner) => (
                          <TableRow key={banner.id}>
                            <TableCell>
                              {banner.imageUrl || banner.imageBlob ? (
                                <img
                                  src={banner.imageBlob ? `data:image/jpeg;base64,${banner.imageBlob}` : banner.imageUrl || ''}
                                  alt={banner.title}
                                  className="w-16 h-12 object-cover rounded"
                                />
                              ) : (
                                <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                                  <Eye className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{banner.title}</TableCell>
                            <TableCell className="text-gray-600 max-w-xs truncate">
                              {banner.description || "No description"}
                            </TableCell>
                            <TableCell>
                              <Badge variant={banner.isActive ? "default" : "secondary"}>
                                {banner.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(banner.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditBanner(banner)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteBannerMutation.mutate(banner.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
              </div>

              <Card>
                <CardContent className="p-0">
                  {ordersLoading ? (
                    <div className="p-6 space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders?.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">#ORD-{order.id}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{order.customerName}</div>
                                <div className="text-sm text-gray-500">{order.customerEmail}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{order.customerPhone}</div>
                                <div className="text-gray-500 max-w-xs truncate" title={order.shippingAddress}>
                                  {order.shippingAddress}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {Array.isArray(order.orderItems) ? (
                                  <div>
                                    <div className="font-medium">{order.orderItems.length} items</div>
                                    <div className="text-gray-500">
                                      {order.orderItems.slice(0, 2).map((item, idx) => (
                                        <div key={idx} className="truncate max-w-xs">
                                          {item.quantity}x {item.name}
                                        </div>
                                      ))}
                                      {order.orderItems.length > 2 && (
                                        <div className="text-gray-400">
                                          +{order.orderItems.length - 2} more...
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">No items</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">${parseFloat(order.totalAmount).toFixed(2)}</TableCell>
                            <TableCell>
                              <Select
                                value={order.status}
                                onValueChange={(status) => 
                                  updateOrderStatusMutation.mutate({ id: order.id, status })
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Processing">Processing</SelectItem>
                                  <SelectItem value="Shipped">Shipped</SelectItem>
                                  <SelectItem value="Delivered">Delivered</SelectItem>
                                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                                <div className="text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewOrderDetails(order)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteOrderMutation.mutate(order.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

        </main>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={orderDetailsDialogOpen} onOpenChange={setOrderDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Order Details - #ORD-{selectedOrder?.id}
                </DialogTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Complete order information and status
                </p>
              </div>
            </div>
          </DialogHeader>

          {selectedOrder && (
            <div className="py-6 space-y-8">
              {/* Order Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Users className="h-5 w-5 mr-2 text-blue-600" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Name</label>
                      <p className="text-gray-900">{selectedOrder.customerName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{selectedOrder.customerEmail}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{selectedOrder.customerPhone}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Truck className="h-5 w-5 mr-2 text-green-600" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-900 leading-relaxed">{selectedOrder.shippingAddress}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-purple-600" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount</span>
                      <span className="font-semibold text-lg">${parseFloat(selectedOrder.totalAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status</span>
                      <Badge variant={
                        selectedOrder.status === "Processing" ? "secondary" :
                        selectedOrder.status === "Shipped" ? "default" :
                        selectedOrder.status === "Delivered" ? "outline" : "destructive"
                      }>
                        {selectedOrder.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Date</span>
                      <span>{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Time</span>
                      <span>{new Date(selectedOrder.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Package className="h-5 w-5 mr-2 text-orange-600" />
                    Order Items ({Array.isArray(selectedOrder.orderItems) ? selectedOrder.orderItems.length : 0} items)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {Array.isArray(selectedOrder.orderItems) && selectedOrder.orderItems.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.orderItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-sm text-gray-500">Product ID: {item.productId}</div>
                              </div>
                            </TableCell>
                            <TableCell>${parseFloat(item.price.toString()).toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.quantity}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              ${(parseFloat(item.price.toString()) * item.quantity).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      No items found in this order
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Update Order Status</label>
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(status) => {
                        updateOrderStatusMutation.mutate({ id: selectedOrder.id, status });
                        setSelectedOrder({ ...selectedOrder, status });
                      }}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Processing">Processing</SelectItem>
                        <SelectItem value="Shipped">Shipped</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setOrderDetailsDialogOpen(false)}
                    className="px-6"
                  >
                    Close
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      deleteOrderMutation.mutate(selectedOrder.id);
                      setOrderDetailsDialogOpen(false);
                    }}
                    className="px-6"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Order
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Upload Dialog */}
      <Dialog open={imageUploadDialogOpen} onOpenChange={setImageUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Create canvas for image compression
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  const img = new Image();
                  
                  img.onload = () => {
                    // Set maximum dimensions
                    const maxWidth = 1200;
                    const maxHeight = 800;
                    let { width, height } = img;
                    
                    // Calculate new dimensions
                    if (width > height) {
                      if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                      }
                    } else {
                      if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                      }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    // Draw and compress
                    ctx?.drawImage(img, 0, 0, width, height);
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    const base64 = compressedDataUrl.split(',')[1];
                    
                    uploadImageMutation.mutate({ 
                      imageData: base64, 
                      filename: file.name 
                    });
                  };
                  
                  const reader = new FileReader();
                  reader.onload = () => {
                    img.src = reader.result as string;
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer block w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            >
              <div className="text-center">
                <Plus className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900">
                    Click to upload image
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </label>
          </div>
          <Button
            variant="outline"
            onClick={() => setImageUploadDialogOpen(false)}
            className="w-full"
          >
            Cancel
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}