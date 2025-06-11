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
  Settings,
  MessageCircle,
  FileText,
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
const weightVariantSchema = z.object({
  weight: z.string().min(1, "Weight is required"),
  price: z.number().min(0, "Price must be positive"),
});

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().min(1, "Price is required"),
  weight: z.string().optional(),
  weightVariants: z.array(weightVariantSchema).optional(),
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

const settingSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
  description: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;
type CategoryFormData = z.infer<typeof categorySchema>;
type SubcategoryFormData = z.infer<typeof subcategorySchema>;
type BannerFormData = z.infer<typeof bannerSchema>;
type SettingFormData = z.infer<typeof settingSchema>;

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
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("");
  const [orderDateFrom, setOrderDateFrom] = useState<string>("");
  const [orderDateTo, setOrderDateTo] = useState<string>("");

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

  const { data: whatsappSetting } = useQuery({
    queryKey: ["/api/admin/settings/whatsapp_number"],
    queryFn: () => api.getAdminSetting(token, "whatsapp_number").catch(() => null),
  });

  const { data: termsSetting } = useQuery({
    queryKey: ["/api/admin/settings/terms_of_service"],
    queryFn: () => api.getAdminSetting(token, "terms_of_service").catch(() => null),
  });

  // Initialize state values from settings
  useEffect(() => {
    if (whatsappSetting?.value) {
      setWhatsappNumber(whatsappSetting.value);
    }
  }, [whatsappSetting]);

  useEffect(() => {
    if (termsSetting?.value) {
      setTermsOfService(termsSetting.value);
    }
  }, [termsSetting]);

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

  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isEditingWhatsapp, setIsEditingWhatsapp] = useState(false);
  const [termsOfService, setTermsOfService] = useState("");
  const [isEditingTerms, setIsEditingTerms] = useState(false);

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

  // Category mutations
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

  // Order status update mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.updateOrderStatus(token, id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      setOrderDetailsDialogOpen(false);
      toast({ title: "Order status updated and email sent to customer" });
    },
    onError: () => {
      toast({ title: "Failed to update order status", variant: "destructive" });
    },
  });

  // WhatsApp settings mutations
  const updateWhatsAppMutation = useMutation({
    mutationFn: (number: string) => {
      if (whatsappSetting && whatsappSetting.key) {
        return api.updateSetting(token, "whatsapp_number", number);
      } else {
        return api.createSetting(token, {
          key: "whatsapp_number",
          value: number,
          description: "WhatsApp number for order notifications"
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/whatsapp_number"] });
      setIsEditingWhatsapp(false);
      toast({ title: "WhatsApp number updated successfully" });
    },
    onError: (error) => {
      console.error("WhatsApp update error:", error);
      toast({ title: "Failed to update WhatsApp number", variant: "destructive" });
    },
  });

  // Terms of Service mutations
  const updateTermsMutation = useMutation({
    mutationFn: (content: string) => {
      if (termsSetting && termsSetting.key) {
        return api.updateSetting(token, "terms_of_service", content);
      } else {
        return api.createSetting(token, {
          key: "terms_of_service",
          value: content,
          description: "Terms of Service content"
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/terms_of_service"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/terms_of_service"] });
      setIsEditingTerms(false);
      toast({ title: "Terms of Service updated successfully" });
    },
    onError: (error) => {
      console.error("Terms update error:", error);
      toast({ title: "Failed to update Terms of Service", variant: "destructive" });
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
        const base64Data = result.split(',')[1]; // Extract base64 part
        const newImages = [...productImages];
        newImages[index] = { ...newImages[index], blob: `data:image/jpeg;base64,${base64Data}`, url: '' };
        setProductImages(newImages);
        productForm.setValue('images', newImages);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle multiple image file uploads at once
  const handleMultipleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newImages = [...productImages];
    
    Array.from(files).forEach((file, fileIndex) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          const base64Data = result.split(',')[1]; // Extract base64 part
          const imageIndex = productImages.length + fileIndex;
          
          if (newImages[imageIndex]) {
            newImages[imageIndex] = { 
              ...newImages[imageIndex], 
              blob: `data:image/jpeg;base64,${base64Data}`, 
              url: '' 
            };
          } else {
            newImages.push({ 
              url: '', 
              blob: `data:image/jpeg;base64,${base64Data}`, 
              priority: imageIndex 
            });
          }
          
          setProductImages([...newImages]);
          productForm.setValue('images', [...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle single image file uploads for category/subcategory/banner/product main image
  const handleMainImageFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'category' | 'subcategory' | 'banner') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        const base64Data = result.split(',')[1]; // Extract base64 part without data:image/type;base64,
        
        if (type === 'product') {
          productForm.setValue('imageBlob', base64Data);
          productForm.setValue('imageUrl', '');
        } else if (type === 'category') {
          categoryForm.setValue('imageBlob', base64Data);
          categoryForm.setValue('imageUrl', '');
        } else if (type === 'subcategory') {
          subcategoryForm.setValue('imageBlob', base64Data);
          subcategoryForm.setValue('imageUrl', '');
        } else if (type === 'banner') {
          bannerForm.setValue('imageBlob', base64Data);
          bannerForm.setValue('imageUrl', '');
        }
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
      weightVariants: data.weightVariants || [],
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

  const handleEditProduct = async (product: Product) => {
    setEditingProduct(product);
    
    // Load existing product images
    try {
      const existingImages = await api.getAdminProductImages(token, product.id);
      const formattedImages = existingImages.map((img: any) => ({
        url: img.imageUrl || '',
        blob: img.imageBlob ? `data:image/jpeg;base64,${img.imageBlob}` : '',
        priority: img.priority || 0,
      }));
      setProductImages(formattedImages);
      
      productForm.reset({
        name: product.name,
        description: product.description,
        price: product.price,
        weight: product.weight || "",
        weightVariants: product.weightVariants as any[] || [],
        imageUrl: product.imageUrl || "",
        imageBlob: product.imageBlob || "",
        images: formattedImages,
        categoryId: product.categoryId.toString(),
        subcategoryId: product.subcategoryId?.toString() || "",
        isFeatured: Boolean(product.isFeatured),
      });
    } catch (error) {
      console.error('Error loading product images:', error);
      productForm.reset({
        name: product.name,
        description: product.description,
        price: product.price,
        weight: product.weight || "",
        weightVariants: product.weightVariants as any[] || [],
        imageUrl: product.imageUrl || "",
        imageBlob: product.imageBlob || "",
        images: [],
        categoryId: product.categoryId.toString(),
        subcategoryId: product.subcategoryId?.toString() || "",
        isFeatured: Boolean(product.isFeatured),
      });
      setProductImages([]);
    }
    
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

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsDialogOpen(true);
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    categoryForm.reset({
      name: "",
      description: "",
      imageUrl: "",
      imageBlob: "",
    });
    setCategoryDialogOpen(true);
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

  const handleAddSubcategory = () => {
    setEditingSubcategory(null);
    subcategoryForm.reset({
      name: "",
      description: "",
      categoryId: "",
      imageUrl: "",
      imageBlob: "",
    });
    setSubcategoryDialogOpen(true);
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

  const handleAddBanner = () => {
    setEditingBanner(null);
    bannerForm.reset({
      title: "",
      description: "",
      imageUrl: "",
      imageBlob: "",
      isActive: true,
    });
    setBannerDialogOpen(true);
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    bannerForm.reset({
      title: banner.title,
      description: banner.description || "",
      imageUrl: banner.imageUrl || "",
      imageBlob: banner.imageBlob || "",
      isActive: banner.isActive === 1,
    });
    setBannerDialogOpen(true);
  };

  // Form submit handlers
  const handleCategorySubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const handleSubcategorySubmit = (data: SubcategoryFormData) => {
    const submitData = {
      ...data,
      categoryId: parseInt(data.categoryId),
    };
    if (editingSubcategory) {
      updateSubcategoryMutation.mutate({ id: editingSubcategory.id, data: submitData });
    } else {
      createSubcategoryMutation.mutate(submitData);
    }
  };

  const handleBannerSubmit = (data: BannerFormData) => {
    const submitData = {
      ...data,
      isActive: data.isActive ? 1 : 0,
    };
    if (editingBanner) {
      updateBannerMutation.mutate({ id: editingBanner.id, data: submitData });
    } else {
      createBannerMutation.mutate(submitData);
    }
  };

  const handleOrderStatusChange = (orderId: number, newStatus: string) => {
    updateOrderStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  // Filter orders based on status and date
  const filteredOrders = orders?.filter(order => {
    const statusMatch = !orderStatusFilter || order.status === orderStatusFilter;
    const orderDate = new Date(order.createdAt);
    const fromDate = orderDateFrom ? new Date(orderDateFrom) : null;
    const toDate = orderDateTo ? new Date(orderDateTo) : null;
    
    const dateMatch = (!fromDate || orderDate >= fromDate) && (!toDate || orderDate <= toDate);
    
    return statusMatch && dateMatch;
  }) || [];

  // Statistics
  const totalProducts = products?.length || 0;
  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0) || 0;

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "categories", label: "Categories", icon: Tags },
    { id: "subcategories", label: "Subcategories", icon: Tags },
    { id: "banners", label: "Banners", icon: ImageIcon },
    { id: "content", label: "Content", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Admin Panel</h1>
              <p className="text-blue-100 text-xs">E-commerce Management</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-md text-blue-100 hover:text-white hover:bg-blue-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
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
                      w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                      ${activeTab === item.id
                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{admin?.email}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="w-full text-xs border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top bar */}
        <div className="flex-shrink-0 h-16 flex items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6">
          <button
            type="button"
            className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-md"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
                  <p className="text-gray-600 mt-2">Here's what's happening with your store today</p>
                </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-700">Total Products</CardTitle>
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-900">{totalProducts}</div>
                    <p className="text-xs text-blue-600 mt-1">Active products in store</p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-700">Total Orders</CardTitle>
                    <div className="p-2 bg-green-500 rounded-lg">
                      <ShoppingBag className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-900">{totalOrders}</div>
                    <p className="text-xs text-green-600 mt-1">Orders received</p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-700">Total Revenue</CardTitle>
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-900">₹{totalRevenue.toFixed(2)}</div>
                    <p className="text-xs text-purple-600 mt-1">Total sales revenue</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders Section */}
              <div className="mt-8">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-semibold text-gray-900">Recent Orders</CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setActiveTab("orders")}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {ordersLoading ? (
                      <div className="p-6 space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-48" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-6 w-16" />
                          </div>
                        ))}
                      </div>
                    ) : orders && orders.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {orders.slice(0, 5).map((order) => (
                          <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                                  <ShoppingBag className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{order.customerName}</p>
                                  <p className="text-sm text-gray-500">{order.customerEmail}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">₹{parseFloat(order.totalAmount).toFixed(2)}</p>
                                <Badge 
                                  variant={order.status === "Processing" ? "default" : "secondary"}
                                  className="mt-1"
                                >
                                  {order.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-500">Orders will appear here once customers start purchasing</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
                  <p className="text-gray-600 mt-1">Manage your product catalog and inventory</p>
                </div>
                <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAddProduct} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
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
                                      Base Price <span className="text-red-500">*</span>
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
                                    <p className="text-xs text-gray-500 mt-1">This will be used as fallback if no weight variants are added</p>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Weight Variants Section */}
                            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <FormLabel className="text-lg font-semibold text-gray-900">Size/Weight Variants</FormLabel>
                                  <p className="text-sm text-gray-600 mt-1">Configure different size options with their respective prices</p>
                                </div>
                                <Button
                                  type="button"
                                  variant="default"
                                  size="sm"
                                  onClick={() => {
                                    const currentVariants = productForm.getValues('weightVariants') || [];
                                    productForm.setValue('weightVariants', [...currentVariants, { weight: '', price: 0 }]);
                                  }}
                                  className="h-9 bg-blue-600 hover:bg-blue-700"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Size Variant
                                </Button>
                              </div>
                              
                              <div className="space-y-4">
                                {(productForm.watch('weightVariants') || []).map((variant, index) => (
                                  <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                                    <div className="flex-1">
                                      <label className="text-xs font-medium text-gray-600 mb-1 block">Size/Weight</label>
                                      <Input
                                        placeholder="e.g., Small (50g), Medium (100g), Large (200g)"
                                        value={variant.weight}
                                        onChange={(e) => {
                                          const variants = productForm.getValues('weightVariants') || [];
                                          variants[index] = { ...variants[index], weight: e.target.value };
                                          productForm.setValue('weightVariants', variants);
                                        }}
                                        className="h-10 border-gray-300 focus:border-blue-500"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <label className="text-xs font-medium text-gray-600 mb-1 block">Price</label>
                                      <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          placeholder="0.00"
                                          value={variant.price || ''}
                                          onChange={(e) => {
                                            const variants = productForm.getValues('weightVariants') || [];
                                            variants[index] = { ...variants[index], price: parseFloat(e.target.value) || 0 };
                                            productForm.setValue('weightVariants', variants);
                                          }}
                                          className="h-10 pl-8 border-gray-300 focus:border-blue-500"
                                        />
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const variants = productForm.getValues('weightVariants') || [];
                                        const newVariants = variants.filter((_, i) => i !== index);
                                        productForm.setValue('weightVariants', newVariants);
                                      }}
                                      className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 self-end"
                                      title="Remove variant"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                                
                                {(!productForm.watch('weightVariants') || productForm.watch('weightVariants')?.length === 0) && (
                                  <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg bg-white">
                                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-lg font-medium text-gray-600 mb-2">No size variants configured</p>
                                    <p className="text-sm text-gray-500">Add size variants to enable different pricing options for customers</p>
                                  </div>
                                )}
                              </div>
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

                          {/* Main Product Image Section */}
                          <div className="space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 font-semibold text-sm">2</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Main Product Image</h3>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <FormField
                                control={productForm.control}
                                name="imageUrl"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Image URL</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="https://example.com/product-image.jpg" 
                                        {...field}
                                        onChange={(e) => {
                                          field.onChange(e);
                                          if (e.target.value && e.target.value.trim() !== '') {
                                            productForm.setValue('imageBlob', '');
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <div className="flex items-center my-4">
                                <div className="flex-1 border-t border-gray-200"></div>
                                <span className="px-3 text-sm text-gray-500 bg-gray-50">OR</span>
                                <div className="flex-1 border-t border-gray-200"></div>
                              </div>
                              
                              <div className="text-center">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleMainImageFileUpload(e, 'product')}
                                  className="hidden"
                                  id="product-main-image-upload"
                                />
                                <label
                                  htmlFor="product-main-image-upload"
                                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Upload Main Image
                                </label>
                              </div>
                              
                              {/* Image Preview */}
                              {(() => {
                                const imageBlob = productForm.watch('imageBlob');
                                const imageUrl = productForm.watch('imageUrl');
                                const hasImage = imageBlob || (imageUrl && imageUrl.trim() !== '');
                                
                                if (!hasImage) return null;
                                
                                return (
                                  <div className="mt-4">
                                    <p className="text-sm text-green-600 mb-2">
                                      ✓ Image {imageBlob ? 'uploaded' : 'loaded'} successfully
                                    </p>
                                    <div className="border rounded-lg p-2 bg-gray-50">
                                      <img
                                        src={imageBlob ? `data:image/jpeg;base64,${imageBlob}` : imageUrl || ''}
                                        alt="Product preview"
                                        className="w-full h-48 object-cover rounded"
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

                          {/* Product Images Section */}
                          <div className="space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <span className="text-green-600 font-semibold text-sm">3</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
                              </div>
                              <div className="flex space-x-2">
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={handleMultipleImageUpload}
                                  className="hidden"
                                  id="multiple-images-upload"
                                />
                                <label
                                  htmlFor="multiple-images-upload"
                                  className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 cursor-pointer"
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Upload Multiple
                                </label>
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
                                  Add Single
                                </Button>
                              </div>
                            </div>
                            
                            {/* Image Upload Areas */}
                            <div className="space-y-4">
                              {productImages.length === 0 ? (
                                <div className="bg-gray-50 rounded-xl p-8 border-2 border-dashed border-gray-200 text-center">
                                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                  <h4 className="text-lg font-medium text-gray-900 mb-2">No product images yet</h4>
                                  <p className="text-sm text-gray-500 mb-6">Add multiple images to showcase your product from different angles</p>
                                  <div className="flex justify-center space-x-3">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      onChange={handleMultipleImageUpload}
                                      className="hidden"
                                      id="first-multiple-upload"
                                    />
                                    <label
                                      htmlFor="first-multiple-upload"
                                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 cursor-pointer"
                                    >
                                      <Upload className="h-4 w-4 mr-2" />
                                      Upload Multiple Images
                                    </label>
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
                                      Add Single Image
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                    <span>{productImages.length} image{productImages.length !== 1 ? 's' : ''} added</span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setProductImages([]);
                                        productForm.setValue('images', []);
                                      }}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      Clear All
                                    </Button>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {productImages.map((image, index) => (
                                      <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-3">
                                          <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-gray-700">Image {index + 1}</span>
                                            {index === 0 && (
                                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600">Primary</Badge>
                                            )}
                                          </div>
                                          <div className="flex space-x-1">
                                            {index > 0 && (
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                  const newImages = [...productImages];
                                                  [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
                                                  setProductImages(newImages);
                                                  productForm.setValue('images', newImages);
                                                }}
                                                className="text-gray-500 hover:text-gray-700 p-1 h-6 w-6"
                                                title="Move up"
                                              >
                                                ↑
                                              </Button>
                                            )}
                                            {index < productImages.length - 1 && (
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                  const newImages = [...productImages];
                                                  [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
                                                  setProductImages(newImages);
                                                  productForm.setValue('images', newImages);
                                                }}
                                                className="text-gray-500 hover:text-gray-700 p-1 h-6 w-6"
                                                title="Move down"
                                              >
                                                ↓
                                              </Button>
                                            )}
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => {
                                                const newImages = productImages.filter((_, i) => i !== index);
                                                setProductImages(newImages);
                                                productForm.setValue('images', newImages);
                                              }}
                                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-6 w-6"
                                              title="Delete image"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
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

              <Card className="border-0 shadow-lg">
                <CardContent className="p-0">
                  {productsLoading ? (
                    <div className="p-6 space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-16 w-16 rounded-lg" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                          <Skeleton className="h-8 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : products && products.length > 0 ? (
                    <div className="overflow-hidden">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow className="border-none">
                            <TableHead className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Image</TableHead>
                            <TableHead className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</TableHead>
                            <TableHead className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</TableHead>
                            <TableHead className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</TableHead>
                            <TableHead className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Featured</TableHead>
                            <TableHead className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.map((product, index) => (
                            <TableRow key={product.id} className={`border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                              <TableCell className="py-4 px-6">
                                {(() => {
                                  const imageUrl = product.imageBlob ? `data:image/jpeg;base64,${product.imageBlob}` : product.imageUrl;
                                  return imageUrl ? (
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                                      <img
                                        src={imageUrl}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shadow-sm">
                                      <Package className="h-8 w-8 text-gray-400" />
                                    </div>
                                  );
                                })()}
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <div>
                                  <div className="font-semibold text-gray-900 text-sm">{product.name}</div>
                                  <div className="text-gray-500 text-xs mt-1 line-clamp-2">{product.description}</div>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {categories?.find(c => c.id === product.categoryId)?.name || 'Unknown'}
                                </span>
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <div className="font-semibold text-gray-900">₹{parseFloat(product.price).toFixed(2)}</div>
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <Badge 
                                  variant={product.isFeatured ? "default" : "secondary"}
                                  className={product.isFeatured ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-600 hover:bg-gray-100"}
                                >
                                  {product.isFeatured ? "Featured" : "Standard"}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4 px-6 text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditProduct(product)}
                                    className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteProductMutation.mutate(product.id)}
                                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                      <p className="text-gray-500 mb-6">Get started by adding your first product to the catalog</p>
                      <Button onClick={handleAddProduct} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Product
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
                  <p className="text-gray-600 mt-1">View and manage customer orders</p>
                </div>
              </div>

              {/* Order Filters */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Orders</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                      <Select value={orderStatusFilter || "all"} onValueChange={(value) => setOrderStatusFilter(value === "all" ? "" : value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="Processing">Processing</SelectItem>
                          <SelectItem value="Shipped">Shipped</SelectItem>
                          <SelectItem value="Delivered">Delivered</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">From Date</label>
                      <Input
                        type="date"
                        value={orderDateFrom}
                        onChange={(e) => setOrderDateFrom(e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">To Date</label>
                      <Input
                        type="date"
                        value={orderDateTo}
                        onChange={(e) => setOrderDateTo(e.target.value)}
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setOrderStatusFilter("");
                        setOrderDateFrom("");
                        setOrderDateTo("");
                      }}
                    >
                      Clear Filters
                    </Button>
                    <span className="text-sm text-gray-500 flex items-center">
                      Showing {filteredOrders.length} of {orders?.length || 0} orders
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-0">
                  {ordersLoading ? (
                    <div className="p-6 space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-16 w-16 rounded-lg" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                          <Skeleton className="h-8 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : filteredOrders && filteredOrders.length > 0 ? (
                    <div className="overflow-hidden">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow className="border-none">
                            <TableHead className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</TableHead>
                            <TableHead className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Order Details</TableHead>
                            <TableHead className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</TableHead>
                            <TableHead className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</TableHead>
                            <TableHead className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</TableHead>
                            <TableHead className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredOrders.map((order, index) => (
                            <TableRow key={order.id} className={`border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                              <TableCell className="py-4 px-6">
                                <div>
                                  <div className="font-semibold text-gray-900 text-sm">{order.customerName}</div>
                                  <div className="text-gray-500 text-xs mt-1">{order.customerEmail}</div>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <div className="text-sm text-gray-900">
                                  {Array.isArray(order.orderItems) ? (
                                    <div className="space-y-1">
                                      <div>{order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''}</div>
                                      <div className="text-xs text-gray-500">
                                        {order.orderItems.slice(0, 2).map((item: any, idx: number) => (
                                          <div key={idx} className="flex items-center gap-1">
                                            <span className="truncate max-w-[100px]">{item.name}</span>
                                            {item.weight ? (
                                              <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                                                {item.weight}
                                              </Badge>
                                            ) : (
                                              <Badge variant="outline" className="text-xs px-1 py-0 h-4 text-gray-400">
                                                Standard
                                              </Badge>
                                            )}
                                          </div>
                                        ))}
                                        {order.orderItems.length > 2 && (
                                          <div className="text-xs text-gray-400">
                                            +{order.orderItems.length - 2} more
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    '0 items'
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <div className="font-semibold text-gray-900">₹{parseFloat(order.totalAmount).toFixed(2)}</div>
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <Select
                                  value={order.status}
                                  onValueChange={(newStatus) => handleOrderStatusChange(order.id, newStatus)}
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
                              <TableCell className="py-4 px-6">
                                <div className="text-sm text-gray-500">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewOrderDetails(order)}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                      <p className="text-gray-500 mb-6">No orders match your current filters</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === "categories" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Categories Management</h2>
                  <p className="text-gray-600 mt-1">Organize your products into categories</p>
                </div>
                <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAddCategory} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-0">
                  {categoriesLoading ? (
                    <div className="p-6 space-y-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-16 w-16 rounded-lg" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : categories && categories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                      {categories.map((category) => (
                        <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                              <Tags className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{category.name}</h3>
                              <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2 mt-4">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditCategory(category)}
                              className="text-gray-400 hover:text-blue-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => deleteCategoryMutation.mutate(category.id)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Tags className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
                      <p className="text-gray-500 mb-6">Create categories to organize your products</p>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Category
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Subcategories Tab */}
          {activeTab === "subcategories" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Subcategories Management</h2>
                  <p className="text-gray-600 mt-1">Create subcategories within your main categories</p>
                </div>
                <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subcategory
                </Button>
              </div>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-0">
                  {subcategoriesLoading ? (
                    <div className="p-6 space-y-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-16 w-16 rounded-lg" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : subcategories && subcategories.length > 0 ? (
                    <div className="overflow-hidden">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow className="border-none">
                            <TableHead className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</TableHead>
                            <TableHead className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Parent Category</TableHead>
                            <TableHead className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</TableHead>
                            <TableHead className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {subcategories.map((subcategory, index) => (
                            <TableRow key={subcategory.id} className={`border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                              <TableCell className="py-4 px-6">
                                <div className="font-semibold text-gray-900">{subcategory.name}</div>
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {categories?.find(c => c.id === subcategory.categoryId)?.name || 'Unknown'}
                                </span>
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <div className="text-sm text-gray-500">{subcategory.description}</div>
                              </TableCell>
                              <TableCell className="py-4 px-6 text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                    onClick={() => {
                                      setEditingSubcategory(subcategory);
                                      subcategoryForm.reset({
                                        name: subcategory.name,
                                        description: subcategory.description || "",
                                        categoryId: subcategory.categoryId.toString(),
                                        imageUrl: subcategory.imageUrl || "",
                                        imageBlob: subcategory.imageBlob || "",
                                      });
                                      setSubcategoryDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => deleteSubcategoryMutation.mutate(subcategory.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Tags className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No subcategories yet</h3>
                      <p className="text-gray-500 mb-6">Create subcategories to further organize your products</p>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Subcategory
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Banners Tab */}
          {activeTab === "banners" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Banners Management</h2>
                  <p className="text-gray-600 mt-1">Manage promotional banners and announcements</p>
                </div>
                <Button 
                  className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-lg"
                  onClick={() => {
                    setEditingBanner(null);
                    bannerForm.reset({
                      title: "",
                      description: "",
                      imageUrl: "",
                      imageBlob: "",
                      isActive: true,
                    });
                    setBannerDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Banner
                </Button>
              </div>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-0">
                  {bannersLoading ? (
                    <div className="p-6 space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-24 w-32 rounded-lg" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                          <Skeleton className="h-6 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : banners && banners.length > 0 ? (
                    <div className="overflow-hidden">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow className="border-none">
                            <TableHead className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Banner</TableHead>
                            <TableHead className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</TableHead>
                            <TableHead className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</TableHead>
                            <TableHead className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</TableHead>
                            <TableHead className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {banners.map((banner, index) => (
                            <TableRow key={banner.id} className={`border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                              <TableCell className="py-4 px-6">
                                <div className="w-20 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                  {banner.imageUrl || banner.imageBlob ? (
                                    <img 
                                      src={banner.imageUrl || `data:image/jpeg;base64,${banner.imageBlob}`} 
                                      alt={banner.title}
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                  ) : (
                                    <ImageIcon className="h-6 w-6 text-gray-400" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <div>
                                  <div className="font-semibold text-gray-900 text-sm">{banner.title}</div>
                                  <div className="text-gray-500 text-xs mt-1 line-clamp-1">{banner.description}</div>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <Badge 
                                  variant={banner.isActive ? "default" : "secondary"}
                                  className={banner.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                                >
                                  {banner.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <div className="text-sm text-gray-500">
                                  {new Date(banner.createdAt).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-6 text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                    onClick={() => {
                                      setEditingBanner(banner);
                                      bannerForm.reset({
                                        title: banner.title,
                                        description: banner.description || "",
                                        imageUrl: banner.imageUrl || "",
                                        imageBlob: banner.imageBlob || "",
                                        isActive: banner.isActive === 1,
                                      });
                                      setBannerDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => deleteBannerMutation.mutate(banner.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No banners yet</h3>
                      <p className="text-gray-500 mb-6">Create promotional banners to showcase your offers</p>
                      <Button className="bg-orange-600 hover:bg-orange-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Banner
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                  <p className="text-gray-600 mt-1">Manage your store settings and configuration</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* WhatsApp Configuration Card */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                    <CardTitle className="flex items-center text-green-800">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      WhatsApp Configuration
                    </CardTitle>
                    <p className="text-green-600 text-sm mt-1">Configure WhatsApp integration for order notifications</p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        WhatsApp Number
                      </label>
                      <p className="text-sm text-gray-600 mb-4">
                        This number will receive order notifications from the checkout process
                      </p>
                      {isEditingWhatsapp ? (
                        <div className="space-y-3">
                          <Input
                            value={whatsappNumber}
                            onChange={(e) => setWhatsappNumber(e.target.value)}
                            placeholder="+1234567890"
                            className="text-base"
                          />
                          <div className="flex space-x-3">
                            <Button
                              onClick={() => {
                                if (whatsappNumber.trim()) {
                                  updateWhatsAppMutation.mutate(whatsappNumber.trim());
                                }
                              }}
                              disabled={updateWhatsAppMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {updateWhatsAppMutation.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button
                              onClick={() => {
                                setIsEditingWhatsapp(false);
                                setWhatsappNumber(whatsappSetting?.value || "");
                              }}
                              variant="outline"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm text-gray-500 mb-1">Current Number</div>
                              <div className="text-lg font-medium text-gray-900">
                                {whatsappSetting?.value || "Not configured"}
                              </div>
                            </div>
                            <Button
                              onClick={() => {
                                setIsEditingWhatsapp(true);
                                setWhatsappNumber(whatsappSetting?.value || "");
                              }}
                              variant="outline"
                              className="border-green-300 text-green-700 hover:bg-green-50"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Number
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <MessageCircle className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-semibold text-blue-800 mb-2">
                            How it works
                          </h3>
                          <div className="text-sm text-blue-700">
                            <p className="mb-2">When customers complete checkout, they'll be redirected to WhatsApp with their order details including:</p>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Customer name and contact information</li>
                              <li>Complete product list with quantities and sizes</li>
                              <li>Shipping address</li>
                              <li>Total order amount</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* General Settings Card */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <CardTitle className="flex items-center text-gray-800">
                      <Settings className="h-5 w-5 mr-2" />
                      General Settings
                    </CardTitle>
                    <p className="text-gray-600 text-sm mt-1">Configure general store preferences</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm">
                        Additional settings will be available here
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Content Management Tab */}
          {activeTab === "content" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
                  <p className="text-gray-600 mt-1">Manage website content and legal pages</p>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                    <CardTitle className="flex items-center text-blue-800">
                      <FileText className="h-5 w-5 mr-2" />
                      Terms of Service
                    </CardTitle>
                    <p className="text-blue-600 text-sm mt-1">Manage your website's Terms of Service content</p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Terms of Service Content
                      </label>
                      <p className="text-sm text-gray-600 mb-4">
                        This content will be displayed on the Terms of Service page
                      </p>
                      {isEditingTerms ? (
                        <div className="space-y-4">
                          <div className="w-full max-w-full">
                            <Textarea
                              value={termsOfService}
                              onChange={(e) => setTermsOfService(e.target.value)}
                              placeholder="Enter your Terms of Service content..."
                              className="w-full h-80 resize-none font-mono text-sm border-2 border-blue-200 focus:border-blue-400 overflow-y-auto"
                              rows={15}
                            />
                          </div>
                          <div className="flex space-x-3">
                            <Button
                              onClick={() => {
                                if (termsOfService.trim()) {
                                  updateTermsMutation.mutate(termsOfService.trim());
                                }
                              }}
                              disabled={updateTermsMutation.isPending}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {updateTermsMutation.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button
                              onClick={() => {
                                setIsEditingTerms(false);
                                setTermsOfService(termsSetting?.value || "");
                              }}
                              variant="outline"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="border border-gray-200 rounded-lg bg-gray-50 p-4 max-h-80 overflow-y-auto">
                            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                              {termsSetting?.value || "No Terms of Service content configured"}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Button
                              onClick={() => {
                                setIsEditingTerms(true);
                                setTermsOfService(termsSetting?.value || "");
                              }}
                              variant="outline"
                              className="border-blue-300 text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Content
                            </Button>
                            <Button
                              onClick={() => window.open('/terms-of-service', '_blank')}
                              variant="outline"
                              className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Preview Page
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <FileText className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-semibold text-blue-800 mb-2">
                            Formatting Tips
                          </h3>
                          <div className="text-sm text-blue-700">
                            <p className="mb-2">You can use simple formatting in your content:</p>
                            <ul className="list-disc list-inside space-y-1">
                              <li><strong># Title</strong> for main headings</li>
                              <li><strong>## Subtitle</strong> for section headings</li>
                              <li><strong>**bold text**</strong> for emphasis</li>
                              <li><strong>*italic text*</strong> for emphasis</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={orderDetailsDialogOpen} onOpenChange={setOrderDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Order Details #{selectedOrder?.id}
                </DialogTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Placed on {selectedOrder ? new Date(selectedOrder.createdAt).toLocaleDateString() : ''}
                </p>
              </div>
            </div>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="py-6 space-y-6">
              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Name</p>
                    <p className="text-gray-900">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-gray-900">{selectedOrder.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phone</p>
                    <p className="text-gray-900">{selectedOrder.customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <Badge 
                      variant={selectedOrder.status === "Processing" ? "default" : "secondary"}
                      className={selectedOrder.status === "Processing" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"}
                    >
                      {selectedOrder.status}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700">Shipping Address</p>
                  <p className="text-gray-900">{selectedOrder.shippingAddress}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h3>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(selectedOrder.orderItems) && selectedOrder.orderItems.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="font-medium">{item.name}</div>
                            </TableCell>
                            <TableCell>
                              {item.weight && item.weight !== '' && item.weight !== 'undefined' && item.weight !== 'null' ? (
                                <Badge variant="secondary" className="text-xs">
                                  {item.weight}
                                </Badge>
                              ) : (
                                <span className="text-gray-400 text-xs">Standard</span>
                              )}
                            </TableCell>
                            <TableCell>₹{parseFloat(item.price.toString()).toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.quantity}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              ₹{(parseFloat(item.price.toString()) * item.quantity).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-blue-600">₹{parseFloat(selectedOrder.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="max-w-2xl">
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
                      <Input placeholder="Electronics, Clothing, etc." {...field} />
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
                      <Textarea placeholder="Category description..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Image Upload Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Category Image</h3>
                
                <FormField
                  control={categoryForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/image.jpg" 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            if (e.target.value && e.target.value.trim() !== '') {
                              categoryForm.setValue('imageBlob', '');
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center my-4">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="px-3 text-sm text-gray-500 bg-gray-50">OR</span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>
                
                <div className="text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleMainImageFileUpload(e, 'category')}
                    className="hidden"
                    id="category-image-upload"
                  />
                  <label
                    htmlFor="category-image-upload"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image File
                  </label>
                </div>
                
                {/* Image Preview */}
                {(() => {
                  const imageBlob = categoryForm.watch('imageBlob');
                  const imageUrl = categoryForm.watch('imageUrl');
                  const hasImage = imageBlob || (imageUrl && imageUrl.trim() !== '');
                  
                  if (!hasImage) return null;
                  
                  return (
                    <div className="mt-4">
                      <p className="text-sm text-green-600 mb-2">
                        ✓ Image {imageBlob ? 'uploaded' : 'loaded'} successfully
                      </p>
                      <div className="border rounded-lg p-2 bg-gray-50">
                        <img
                          src={imageBlob ? `data:image/jpeg;base64,${imageBlob}` : imageUrl || ''}
                          alt="Category preview"
                          className="w-full h-32 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}>
                  {editingCategory ? "Update" : "Create"} Category
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Subcategory Dialog */}
      <Dialog open={subcategoryDialogOpen} onOpenChange={setSubcategoryDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSubcategory ? "Edit Subcategory" : "Add New Subcategory"}
            </DialogTitle>
          </DialogHeader>
          <Form {...subcategoryForm}>
            <form onSubmit={subcategoryForm.handleSubmit(handleSubcategorySubmit)} className="space-y-4">
              <FormField
                control={subcategoryForm.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Category</FormLabel>
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
                control={subcategoryForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Smartphones, T-shirts, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={subcategoryForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Subcategory description..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Image Upload Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Subcategory Image</h3>
                
                <FormField
                  control={subcategoryForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/image.jpg" 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            if (e.target.value && e.target.value.trim() !== '') {
                              subcategoryForm.setValue('imageBlob', '');
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center my-4">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="px-3 text-sm text-gray-500 bg-gray-50">OR</span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>
                
                <div className="text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleMainImageFileUpload(e, 'subcategory')}
                    className="hidden"
                    id="subcategory-image-upload"
                  />
                  <label
                    htmlFor="subcategory-image-upload"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image File
                  </label>
                </div>
                
                {/* Image Preview */}
                {(() => {
                  const imageBlob = subcategoryForm.watch('imageBlob');
                  const imageUrl = subcategoryForm.watch('imageUrl');
                  const hasImage = imageBlob || (imageUrl && imageUrl.trim() !== '');
                  
                  if (!hasImage) return null;
                  
                  return (
                    <div className="mt-4">
                      <p className="text-sm text-green-600 mb-2">
                        ✓ Image {imageBlob ? 'uploaded' : 'loaded'} successfully
                      </p>
                      <div className="border rounded-lg p-2 bg-gray-50">
                        <img
                          src={imageBlob ? `data:image/jpeg;base64,${imageBlob}` : imageUrl || ''}
                          alt="Subcategory preview"
                          className="w-full h-32 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setSubcategoryDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createSubcategoryMutation.isPending || updateSubcategoryMutation.isPending}>
                  {editingSubcategory ? "Update" : "Create"} Subcategory
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Banner Dialog */}
      <Dialog open={bannerDialogOpen} onOpenChange={setBannerDialogOpen}>
        <DialogContent className="max-w-2xl">
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
                    <FormLabel>Banner Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Summer Sale - Up to 50% Off!" {...field} />
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
                      <Textarea placeholder="Banner description..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Image Upload Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Banner Image</h3>
                
                <FormField
                  control={bannerForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/banner.jpg" 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            if (e.target.value && e.target.value.trim() !== '') {
                              bannerForm.setValue('imageBlob', '');
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center my-4">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="px-3 text-sm text-gray-500 bg-gray-50">OR</span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>
                
                <div className="text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleMainImageFileUpload(e, 'banner')}
                    className="hidden"
                    id="banner-image-upload"
                  />
                  <label
                    htmlFor="banner-image-upload"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image File
                  </label>
                </div>
                
                {/* Image Preview */}
                {(() => {
                  const imageBlob = bannerForm.watch('imageBlob');
                  const imageUrl = bannerForm.watch('imageUrl');
                  const hasImage = imageBlob || (imageUrl && imageUrl.trim() !== '');
                  
                  if (!hasImage) return null;
                  
                  return (
                    <div className="mt-4">
                      <p className="text-sm text-green-600 mb-2">
                        ✓ Image {imageBlob ? 'uploaded' : 'loaded'} successfully
                      </p>
                      <div className="border rounded-lg p-2 bg-gray-50">
                        <img
                          src={imageBlob ? `data:image/jpeg;base64,${imageBlob}` : imageUrl || ''}
                          alt="Banner preview"
                          className="w-full h-32 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
              
              <FormField
                control={bannerForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Banner</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Display this banner on the homepage
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
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setBannerDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createBannerMutation.isPending || updateBannerMutation.isPending}>
                  {editingBanner ? "Update" : "Create"} Banner
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>



      {/* Order Details Dialog */}
      <Dialog open={orderDetailsDialogOpen} onOpenChange={setOrderDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogTitle className="text-xl font-bold text-gray-900 mb-4">
            Order Details #{selectedOrder?.id}
          </DialogTitle>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedOrder.customerName}</div>
                    <div><span className="font-medium">Email:</span> {selectedOrder.customerEmail}</div>
                    <div><span className="font-medium">Phone:</span> {selectedOrder.customerPhone}</div>
                    <div><span className="font-medium">Address:</span> {selectedOrder.shippingAddress}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        selectedOrder.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        selectedOrder.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                        selectedOrder.status === 'shipped' ? 'bg-green-100 text-green-800' :
                        selectedOrder.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div><span className="font-medium">Date:</span> {new Date(selectedOrder.createdAt).toLocaleDateString()}</div>
                    <div><span className="font-medium">Total:</span> ₹{selectedOrder.totalAmount}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Product</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Price</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Quantity</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        try {
                          const items = typeof selectedOrder.orderItems === 'string' 
                            ? JSON.parse(selectedOrder.orderItems) 
                            : selectedOrder.orderItems;
                          return Array.isArray(items) ? items.map((item: any, index: number) => (
                            <tr key={index} className="border-t border-gray-200">
                              <td className="px-4 py-2 text-sm">{item.name}</td>
                              <td className="px-4 py-2 text-sm">₹{item.price}</td>
                              <td className="px-4 py-2 text-sm">{item.quantity}</td>
                              <td className="px-4 py-2 text-sm">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                            </tr>
                          )) : <tr><td colSpan={4} className="px-4 py-2 text-sm text-gray-500">No items found</td></tr>;
                        } catch (e) {
                          return <tr><td colSpan={4} className="px-4 py-2 text-sm text-gray-500">Error parsing order items</td></tr>;
                        }
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}