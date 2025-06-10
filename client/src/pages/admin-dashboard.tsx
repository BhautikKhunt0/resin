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
  images: z.array(z.object({
    url: z.string().optional(),
    blob: z.string().optional(),
    priority: z.number().default(0),
  })).optional(),
  categoryId: z.string().min(1, "Category is required"),
  subcategoryId: z.string().optional(),
  isFeatured: z.boolean().optional(),
});

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  imageBlob: z.string().optional(),
});

const subcategorySchema = z.object({
  name: z.string().min(1, "Subcategory name is required"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  imageUrl: z.string().optional(),
  imageBlob: z.string().optional(),
});

const bannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  imageBlob: z.string().optional(),
  isActive: z.boolean().optional(),
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
  const [orderDetailsDialogOpen, setOrderDetailsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [productImages, setProductImages] = useState<Array<{url: string; blob: string; priority: number}>>([]);

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
      images: [],
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
      setProductImages([]);
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
      setProductImages([]);
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

  // Handle individual image file uploads for product images
  const handleImageFileUpload = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        const newImages = [...productImages];
        newImages[index] = { ...newImages[index], blob: result, url: '' };
        setProductImages(newImages);
        productForm.setValue('images', newImages);
      }
    };
    reader.readAsDataURL(file);
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
      images: productImages.filter(img => img.url || img.blob).map((img, index) => ({
        url: img.url || undefined,
        blob: img.blob ? img.blob.split(',')[1] : undefined, // Extract base64 part
        priority: index,
      })),
      isFeatured: data.isFeatured ? 1 : 0,
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: productData });
    } else {
      createProductMutation.mutate(productData);
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
      images: [],
      categoryId: product.categoryId.toString(),
      subcategoryId: product.subcategoryId?.toString() || "",
      isFeatured: Boolean(product.isFeatured),
    });
    setProductImages([]);
    setProductDialogOpen(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    productForm.reset({
      name: "",
      description: "",
      price: "",
      imageUrl: "",
      imageBlob: "",
      images: [],
      categoryId: "",
      subcategoryId: "",
      isFeatured: false,
    });
    setProductImages([]);
    setProductDialogOpen(true);
  };

  const handleLogout = () => {
    logout();
    setLocation("/admin/login");
  };

  // Statistics
  const totalProducts = products?.length || 0;
  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0) || 0;

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "categories", label: "Categories", icon: Tags },
    { id: "banners", label: "Banners", icon: ImageIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors
                      ${activeTab === item.id
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{admin?.email}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 dark:bg-gray-800 dark:border-gray-700">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Page content */}
        <main className="py-10 px-4 sm:px-6 lg:px-8">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              
              {/* Stats */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalProducts}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalOrders}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product Management</h2>
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
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
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

                          {/* Product Images Section */}
                          <div className="space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <span className="text-green-600 font-semibold text-sm">2</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newImages = [...productImages, { url: '', blob: '', priority: productImages.length }];
                                  setProductImages(newImages);
                                  productForm.setValue('images', newImages);
                                }}
                                className="text-green-600 border-green-200 hover:bg-green-50"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Image
                              </Button>
                            </div>
                            
                            {/* Image Upload Areas */}
                            <div className="space-y-4">
                              {productImages.length === 0 ? (
                                <div className="bg-gray-50 rounded-xl p-8 border-2 border-dashed border-gray-200 text-center">
                                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                  <h4 className="text-lg font-medium text-gray-900 mb-2">No product images yet</h4>
                                  <p className="text-sm text-gray-500 mb-6">Add multiple images to showcase your product from different angles</p>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      const newImages = [{ url: '', blob: '', priority: 0 }];
                                      setProductImages(newImages);
                                      productForm.setValue('images', newImages);
                                    }}
                                    className="text-green-600 border-green-200 hover:bg-green-50"
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add First Image
                                  </Button>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {productImages.map((image, index) => (
                                    <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                                      <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-sm font-medium text-gray-700">Image {index + 1}</span>
                                          {index === 0 && (
                                            <Badge variant="outline" className="text-xs">Primary</Badge>
                                          )}
                                        </div>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            const newImages = productImages.filter((_, i) => i !== index);
                                            setProductImages(newImages);
                                            productForm.setValue('images', newImages);
                                          }}
                                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      
                                      {/* Image URL Input */}
                                      <div className="space-y-3">
                                        <Input
                                          placeholder="Enter image URL"
                                          value={image.url}
                                          onChange={(e) => {
                                            const newImages = [...productImages];
                                            newImages[index] = { ...newImages[index], url: e.target.value };
                                            setProductImages(newImages);
                                            productForm.setValue('images', newImages);
                                          }}
                                          className="h-9 text-sm"
                                        />
                                        
                                        <div className="flex items-center">
                                          <div className="flex-1 border-t border-gray-300"></div>
                                          <span className="px-2 text-xs text-gray-500 bg-white">OR</span>
                                          <div className="flex-1 border-t border-gray-300"></div>
                                        </div>
                                        
                                        <div className="text-center">
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageFileUpload(e, index)}
                                            className="hidden"
                                            id={`image-upload-${index}`}
                                          />
                                          <label
                                            htmlFor={`image-upload-${index}`}
                                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                                          >
                                            <Upload className="h-4 w-4 mr-2" />
                                            Upload File
                                          </label>
                                        </div>
                                      </div>
                                      
                                      {/* Image Preview */}
                                      {(image.blob || image.url) && (
                                        <div className="mt-4">
                                          <div className="relative overflow-hidden rounded-lg bg-gray-100">
                                            <img
                                              src={image.blob || image.url}
                                              alt={`Product image ${index + 1}`}
                                              className="w-full h-32 object-cover"
                                              onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                              }}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Category & Settings Section */}
                          <div className="space-y-6">
                            <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-purple-600 font-semibold text-sm">3</span>
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">Category & Settings</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <TrendingUp className="h-5 w-5 text-blue-600" />
                                      </div>
                                      <div>
                                        <FormLabel className="text-base font-medium text-gray-900">Featured Product</FormLabel>
                                        <p className="text-sm text-gray-600 mt-1">
                                          Featured products appear prominently on the homepage
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
                                  <FormMessage />
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
                <CardContent className="p-6">
                  {productsLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
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
                            <TableCell>₹{parseFloat(product.price).toFixed(2)}</TableCell>
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
        </main>
      </div>
    </div>
  );
}