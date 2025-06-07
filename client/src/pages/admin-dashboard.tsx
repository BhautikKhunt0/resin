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
  imageUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  imageBlob: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  subcategoryId: z.string().optional(),
  stock: z.string().min(0, "Stock must be 0 or greater"),
  isFeatured: z.boolean().optional(),
});

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
});

const bannerSchema = z.object({
  title: z.string().min(1, "Banner title is required"),
  description: z.string().optional(),
  imageUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  imageBlob: z.string().optional(),
  isActive: z.boolean().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;
type CategoryFormData = z.infer<typeof categorySchema>;
type BannerFormData = z.infer<typeof bannerSchema>;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [imageUploadDialogOpen, setImageUploadDialogOpen] = useState(false);
  const [currentImageField, setCurrentImageField] = useState<string | null>(null);

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
      stock: "0",
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
    mutationFn: ({ id, data }: { id: number; data: any }) => api.updateBanner(token, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      setBannerDialogOpen(false);
      bannerForm.reset();
      setEditingBanner(null);
      toast({ title: "Banner updated successfully" });
    },
    onError: () => {
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
        productForm.setValue('imageUrl', ''); // Clear URL when using blob
      } else if (currentImageField === 'banner') {
        bannerForm.setValue('imageBlob', data.imageBlob);
        bannerForm.setValue('imageUrl', ''); // Clear URL when using blob
      }
      setImageUploadDialogOpen(false);
      setCurrentImageField(null);
      toast({ title: "Image uploaded successfully" });
    },
    onError: () => {
      toast({ title: "Failed to upload image", variant: "destructive" });
    },
  });

  // Handlers
  const handleProductSubmit = (data: ProductFormData) => {
    const productData = {
      ...data,
      price: data.price,
      categoryId: parseInt(data.categoryId),
      subcategoryId: data.subcategoryId ? parseInt(data.subcategoryId) : undefined,
      stock: parseInt(data.stock),
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
      stock: product.stock?.toString() || "0",
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

  const handleAddBanner = () => {
    setEditingBanner(null);
    bannerForm.reset();
    setBannerDialogOpen(true);
  };

  const handleImageUpload = (fieldType: string) => {
    setCurrentImageField(fieldType);
    setImageUploadDialogOpen(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        uploadImageMutation.mutate({ 
          imageData, 
          filename: file.name 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    categoryForm.reset({
      name: category.name,
      description: category.description || "",
    });
    setCategoryDialogOpen(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    productForm.reset();
    setProductDialogOpen(true);
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    categoryForm.reset();
    setCategoryDialogOpen(true);
  };

  const handleLogout = () => {
    logout();
    setLocation("/admin/login");
  };

  // Calculate stats
  const totalProducts = products?.length || 0;
  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0) || 0;
  const processingOrders = orders?.filter(order => order.status === "Processing").length || 0;

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "categories", label: "Categories", icon: Tags },
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

          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
                <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAddProduct}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProduct ? "Edit Product" : "Add New Product"}
                      </DialogTitle>
                    </DialogHeader>
                    <Form {...productForm}>
                      <form onSubmit={productForm.handleSubmit(handleProductSubmit)} className="space-y-4">
                        <FormField
                          control={productForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter product name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={productForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Enter product description" {...field} />
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
                              <FormLabel>Price</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="0.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-4">
                          <FormField
                            control={productForm.control}
                            name="imageUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Image URL</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://example.com/image.jpg" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="text-center">
                            <p className="text-sm text-gray-500 mb-2">Or upload an image</p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleImageUpload('product')}
                            >
                              Upload Image
                            </Button>
                          </div>
                        </div>

                        <FormField
                          control={productForm.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
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
                          name="stock"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stock</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={productForm.control}
                          name="isFeatured"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Featured Product</FormLabel>
                                <div className="text-sm text-muted-foreground">
                                  Mark this product as featured to show it prominently on the homepage
                                </div>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setProductDialogOpen(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="flex-1"
                            disabled={createProductMutation.isPending || updateProductMutation.isPending}
                          >
                            {editingProduct ? "Update" : "Create"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent>
                  {productsLoading ? (
                    <div className="space-y-3 p-6">
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
                          <TableHead>Stock</TableHead>
                          <TableHead>Featured</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products?.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>
                              {categories?.find(c => c.id === product.categoryId)?.name}
                            </TableCell>
                            <TableCell>${parseFloat(product.price).toFixed(2)}</TableCell>
                            <TableCell>{product.stock}</TableCell>
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

          {activeTab === "categories" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Category Management</h2>
                <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAddCategory}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingCategory ? "Edit Category" : "Add New Category"}
                      </DialogTitle>
                    </DialogHeader>
                    <Form {...categoryForm}>
                      <form onSubmit={categoryForm.handleSubmit(handleCategorySubmit)} className="space-y-4">
                        <FormField
                          control={categoryForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter category name" {...field} />
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
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Enter category description" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCategoryDialogOpen(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="flex-1"
                            disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                          >
                            {editingCategory ? "Update" : "Create"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent>
                  {categoriesLoading ? (
                    <div className="space-y-3 p-6">
                      {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Products</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories?.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell>{category.description || "No description"}</TableCell>
                            <TableCell>
                              {products?.filter(p => p.categoryId === category.id).length || 0}
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

          {activeTab === "orders" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>

              <Card>
                <CardContent>
                  {ordersLoading ? (
                    <div className="space-y-3 p-6">
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
                          <TableHead>Email</TableHead>
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
                            <TableCell>{order.customerName}</TableCell>
                            <TableCell>{order.customerEmail}</TableCell>
                            <TableCell>${parseFloat(order.totalAmount).toFixed(2)}</TableCell>
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
                                  <SelectItem value="Canceled">Canceled</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm">
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

          {activeTab === "banners" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Banner Management</h2>
                <Dialog open={bannerDialogOpen} onOpenChange={setBannerDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAddBanner}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Banner
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingBanner ? "Edit Banner" : "Add New Banner"}
                      </DialogTitle>
                    </DialogHeader>
                    <Form {...bannerForm}>
                      <form onSubmit={bannerForm.handleSubmit(handleBannerSubmit)} className="space-y-4">
                        <FormField
                          control={bannerForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Banner title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={bannerForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Banner description (optional)" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-4">
                          <FormField
                            control={bannerForm.control}
                            name="imageUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Image URL</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://example.com/image.jpg" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="text-center">
                            <p className="text-sm text-gray-500 mb-2">Or upload an image</p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleImageUpload('banner')}
                            >
                              Upload Image
                            </Button>
                          </div>
                        </div>

                        <FormField
                          control={bannerForm.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Active Banner</FormLabel>
                                <div className="text-sm text-muted-foreground">
                                  Show this banner on the homepage
                                </div>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setBannerDialogOpen(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="flex-1"
                            disabled={createBannerMutation.isPending || updateBannerMutation.isPending}
                          >
                            {editingBanner ? "Update" : "Create"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent>
                  {bannersLoading ? (
                    <div className="space-y-3 p-6">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Preview</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Status</TableHead>
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
                            <TableCell className="max-w-xs truncate">
                              {banner.description || "No description"}
                            </TableCell>
                            <TableCell>
                              <Badge variant={banner.isActive ? "default" : "secondary"}>
                                {banner.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
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
        </main>

        {/* Image Upload Dialog */}
        <Dialog open={imageUploadDialogOpen} onOpenChange={setImageUploadDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        const base64 = (reader.result as string).split(',')[1];
                        uploadImageMutation.mutate({ 
                          imageData: base64, 
                          filename: file.name 
                        });
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
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
