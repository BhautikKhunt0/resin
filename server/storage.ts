import { 
  categories, 
  subcategories, 
  products, 
  productImages,
  orders, 
  admins,
  banners,
  pages,
  type Category,
  type Subcategory,
  type Product,
  type ProductImage,
  type Order,
  type Admin,
  type Banner,
  type Page,
  type InsertCategory,
  type InsertSubcategory,
  type InsertProduct,
  type InsertProductImage,
  type InsertOrder,
  type InsertAdmin,
  type InsertBanner,
  type InsertPage
} from "@shared/schema";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Subcategories
  getSubcategories(): Promise<Subcategory[]>;
  getSubcategoriesByCategory(categoryId: number): Promise<Subcategory[]>;
  getSubcategoryById(id: number): Promise<Subcategory | undefined>;
  createSubcategory(subcategory: InsertSubcategory): Promise<Subcategory>;
  updateSubcategory(id: number, subcategory: Partial<InsertSubcategory>): Promise<Subcategory | undefined>;
  deleteSubcategory(id: number): Promise<boolean>;

  // Products
  getProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getProductsBySubcategory(subcategoryId: number): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Product Images
  getProductImages(productId: number): Promise<ProductImage[]>;
  getProductImageById(id: number): Promise<ProductImage | undefined>;
  createProductImage(productImage: InsertProductImage): Promise<ProductImage>;
  updateProductImage(id: number, productImage: Partial<InsertProductImage>): Promise<ProductImage | undefined>;
  deleteProductImage(id: number): Promise<boolean>;
  updateProductImagePriority(id: number, priority: number): Promise<ProductImage | undefined>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  deleteOrder(id: number): Promise<boolean>;

  // Admins
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;

  // Banners
  getBanners(): Promise<Banner[]>;
  getActiveBanners(): Promise<Banner[]>;
  getBannerById(id: number): Promise<Banner | undefined>;
  createBanner(banner: InsertBanner): Promise<Banner>;
  updateBanner(id: number, banner: Partial<InsertBanner>): Promise<Banner | undefined>;
  deleteBanner(id: number): Promise<boolean>;

  // Pages
  getPages(): Promise<Page[]>;
  getActivePages(): Promise<Page[]>;
  getPageById(id: number): Promise<Page | undefined>;
  getPageBySlug(slug: string): Promise<Page | undefined>;
  createPage(page: InsertPage): Promise<Page>;
  updatePage(id: number, page: Partial<InsertPage>): Promise<Page | undefined>;
  deletePage(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private categories: Map<number, Category>;
  private subcategories: Map<number, Subcategory>;
  private products: Map<number, Product>;
  private productImages: Map<number, ProductImage>;
  private orders: Map<number, Order>;
  private admins: Map<number, Admin>;
  private banners: Map<number, Banner>;
  private pages: Map<number, Page>;
  private currentCategoryId: number;
  private currentSubcategoryId: number;
  private currentProductId: number;
  private currentProductImageId: number;
  private currentOrderId: number;
  private currentAdminId: number;
  private currentBannerId: number;
  private currentPageId: number;

  constructor() {
    this.categories = new Map();
    this.subcategories = new Map();
    this.products = new Map();
    this.productImages = new Map();
    this.orders = new Map();
    this.admins = new Map();
    this.banners = new Map();
    this.pages = new Map();
    this.currentCategoryId = 1;
    this.currentSubcategoryId = 1;
    this.currentProductId = 1;
    this.currentProductImageId = 1;
    this.currentOrderId = 1;
    this.currentAdminId = 1;
    this.currentBannerId = 1;
    this.currentPageId = 1;

    this.seedData();
  }

  private seedData() {
    // Seed categories
    const electronics: Category = { id: this.currentCategoryId++, name: "Electronics", description: "Electronic devices and gadgets", imageUrl: null, imageBlob: null };
    const clothing: Category = { id: this.currentCategoryId++, name: "Clothing", description: "Fashion and apparel", imageUrl: null, imageBlob: null };
    const homeGarden: Category = { id: this.currentCategoryId++, name: "Home & Garden", description: "Home and garden essentials", imageUrl: null, imageBlob: null };
    const sports: Category = { id: this.currentCategoryId++, name: "Sports", description: "Sports and fitness equipment", imageUrl: null, imageBlob: null };

    [electronics, clothing, homeGarden, sports].forEach(cat => this.categories.set(cat.id, cat));

    // Seed subcategories
    const smartphones: Subcategory = { id: this.currentSubcategoryId++, name: "Smartphones", description: "Mobile phones", categoryId: electronics.id, imageUrl: null, imageBlob: null };
    const laptops: Subcategory = { id: this.currentSubcategoryId++, name: "Laptops", description: "Portable computers", categoryId: electronics.id, imageUrl: null, imageBlob: null };
    const headphones: Subcategory = { id: this.currentSubcategoryId++, name: "Headphones", description: "Audio devices", categoryId: electronics.id, imageUrl: null, imageBlob: null };

    [smartphones, laptops, headphones].forEach(sub => this.subcategories.set(sub.id, sub));

    // Seed products
    const products: Product[] = [
      {
        id: this.currentProductId++,
        name: "Premium Wireless Headphones",
        description: "High-quality sound with noise cancellation technology",
        price: "199.99",
        weight: null,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        imageBlob: null,
        images: [],
        categoryId: electronics.id,
        subcategoryId: headphones.id,
        isFeatured: 1,
        createdAt: new Date(),
      },
      {
        id: this.currentProductId++,
        name: "Smart Watch Pro",
        description: "Advanced fitness tracking and smart notifications",
        price: "299.99",
        weight: null,
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        imageBlob: null,
        images: [],
        categoryId: electronics.id,
        subcategoryId: null,
        isFeatured: 0,
        createdAt: new Date(),
      },
      {
        id: this.currentProductId++,
        name: "Ultra-thin Laptop",
        description: "Powerful performance in a portable design",
        price: "1299.99",
        weight: null,
        imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        imageBlob: null,
        images: [],
        categoryId: electronics.id,
        subcategoryId: laptops.id,
        isFeatured: 1,
        createdAt: new Date(),
      },
      {
        id: this.currentProductId++,
        name: "Premium Smartphone",
        description: "Latest flagship model with advanced camera system",
        price: "899.99",
        weight: null,
        imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        imageBlob: null,
        images: [],
        categoryId: electronics.id,
        subcategoryId: smartphones.id,
        isFeatured: 1,
        createdAt: new Date(),
      },
    ];

    products.forEach(product => this.products.set(product.id, product));

    // Seed default admin
    const defaultAdmin: Admin = {
      id: this.currentAdminId++,
      email: "admin@modernshop.com",
      password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // "password" hashed
    };
    this.admins.set(defaultAdmin.id, defaultAdmin);

    // Seed banners
    const banners: Banner[] = [
      {
        id: this.currentBannerId++,
        title: "Summer Sale - Up to 50% Off",
        description: "Don't miss out on our biggest sale of the year!",
        imageUrl: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
        imageBlob: null,
        isActive: 1,
        createdAt: new Date(),
      },
    ];

    banners.forEach(banner => this.banners.set(banner.id, banner));

    // Seed sample orders
    const sampleOrders: Order[] = [
      {
        id: this.currentOrderId++,
        customerName: "John Smith",
        customerEmail: "john.smith@email.com",
        customerPhone: "+1-555-0123",
        shippingAddress: "123 Main St, New York, NY 10001",
        orderItems: [
          { productId: 1, name: "Premium Wireless Headphones", price: 199.99, quantity: 1 },
          { productId: 4, name: "Premium Smartphone", price: 899.99, quantity: 1 }
        ],
        totalAmount: "1099.98",
        status: "processing",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        id: this.currentOrderId++,
        customerName: "Sarah Johnson",
        customerEmail: "sarah.j@email.com",
        customerPhone: "+1-555-0456",
        shippingAddress: "456 Oak Ave, Los Angeles, CA 90210",
        orderItems: [
          { productId: 3, name: "Ultra-thin Laptop", price: 1299.99, quantity: 1 }
        ],
        totalAmount: "1299.99",
        status: "shipped",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        id: this.currentOrderId++,
        customerName: "Mike Wilson",
        customerEmail: "mike.wilson@email.com",
        customerPhone: "+1-555-0789",
        shippingAddress: "789 Pine St, Chicago, IL 60601",
        orderItems: [
          { productId: 2, name: "Smart Watch Pro", price: 299.99, quantity: 2 }
        ],
        totalAmount: "599.98",
        status: "delivered",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      }
    ];

    sampleOrders.forEach(order => this.orders.set(order.id, order));
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const newCategory: Category = {
      ...category,
      id: this.currentCategoryId++,
      description: category.description || null,
      imageUrl: category.imageUrl || null,
      imageBlob: category.imageBlob || null,
    };
    this.categories.set(newCategory.id, newCategory);
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const existing = this.categories.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...category };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Subcategories
  async getSubcategories(): Promise<Subcategory[]> {
    return Array.from(this.subcategories.values());
  }

  async getSubcategoriesByCategory(categoryId: number): Promise<Subcategory[]> {
    return Array.from(this.subcategories.values()).filter(sub => sub.categoryId === categoryId);
  }

  async getSubcategoryById(id: number): Promise<Subcategory | undefined> {
    return this.subcategories.get(id);
  }

  async createSubcategory(subcategory: InsertSubcategory): Promise<Subcategory> {
    const newSubcategory: Subcategory = {
      ...subcategory,
      id: this.currentSubcategoryId++,
      description: subcategory.description || null,
      imageUrl: subcategory.imageUrl || null,
      imageBlob: subcategory.imageBlob || null,
    };
    this.subcategories.set(newSubcategory.id, newSubcategory);
    return newSubcategory;
  }

  async updateSubcategory(id: number, subcategory: Partial<InsertSubcategory>): Promise<Subcategory | undefined> {
    const existing = this.subcategories.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...subcategory };
    this.subcategories.set(id, updated);
    return updated;
  }

  async deleteSubcategory(id: number): Promise<boolean> {
    return this.subcategories.delete(id);
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.categoryId === categoryId);
  }

  async getProductsBySubcategory(subcategoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.subcategoryId === subcategoryId);
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct: Product = {
      id: this.currentProductId++,
      name: product.name,
      description: product.description,
      price: product.price,
      weight: product.weight || null,
      imageUrl: product.imageUrl || null,
      imageBlob: product.imageBlob || null,
      images: (product as any).images || [],
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId || null,
      isFeatured: product.isFeatured || 0,
      createdAt: new Date(),
    };
    this.products.set(newProduct.id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...product };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Product Images
  async getProductImages(productId: number): Promise<ProductImage[]> {
    return Array.from(this.productImages.values())
      .filter(image => image.productId === productId)
      .sort((a, b) => a.priority - b.priority);
  }

  async getProductImageById(id: number): Promise<ProductImage | undefined> {
    return this.productImages.get(id);
  }

  async createProductImage(productImage: InsertProductImage): Promise<ProductImage> {
    const newProductImage: ProductImage = {
      ...productImage,
      id: this.currentProductImageId++,
      imageUrl: productImage.imageUrl || null,
      imageBlob: productImage.imageBlob || null,
      priority: productImage.priority || 0,
      createdAt: new Date(),
    };
    this.productImages.set(newProductImage.id, newProductImage);
    return newProductImage;
  }

  async updateProductImage(id: number, productImage: Partial<InsertProductImage>): Promise<ProductImage | undefined> {
    const existing = this.productImages.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...productImage };
    this.productImages.set(id, updated);
    return updated;
  }

  async deleteProductImage(id: number): Promise<boolean> {
    return this.productImages.delete(id);
  }

  async updateProductImagePriority(id: number, priority: number): Promise<ProductImage | undefined> {
    const existing = this.productImages.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, priority };
    this.productImages.set(id, updated);
    return updated;
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const newOrder: Order = {
      ...order,
      id: this.currentOrderId++,
      createdAt: new Date(),
      status: order.status || "Processing",
    };
    this.orders.set(newOrder.id, newOrder);
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const existing = this.orders.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, status };
    this.orders.set(id, updated);
    return updated;
  }

  async deleteOrder(id: number): Promise<boolean> {
    return this.orders.delete(id);
  }

  // Admins
  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(admin => admin.email === email);
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const newAdmin: Admin = {
      ...admin,
      id: this.currentAdminId++,
    };
    this.admins.set(newAdmin.id, newAdmin);
    return newAdmin;
  }

  // Banners
  async getBanners(): Promise<Banner[]> {
    return Array.from(this.banners.values());
  }

  async getActiveBanners(): Promise<Banner[]> {
    return Array.from(this.banners.values()).filter(banner => banner.isActive === 1);
  }

  async getBannerById(id: number): Promise<Banner | undefined> {
    return this.banners.get(id);
  }

  async createBanner(banner: InsertBanner): Promise<Banner> {
    const newBanner: Banner = {
      ...banner,
      id: this.currentBannerId++,
      description: banner.description || null,
      imageUrl: banner.imageUrl || null,
      imageBlob: banner.imageBlob || null,
      isActive: banner.isActive || 1,
      createdAt: new Date(),
    };
    this.banners.set(newBanner.id, newBanner);
    return newBanner;
  }

  async updateBanner(id: number, banner: Partial<InsertBanner>): Promise<Banner | undefined> {
    const existingBanner = this.banners.get(id);
    if (!existingBanner) return undefined;

    const updatedBanner: Banner = {
      ...existingBanner,
      ...banner,
    };
    this.banners.set(id, updatedBanner);
    return updatedBanner;
  }

  async deleteBanner(id: number): Promise<boolean> {
    return this.banners.delete(id);
  }
}

import { MongoDBStorage } from "./mongodb-storage";

// Using MongoDB storage to access existing orders data
export const storage = new MongoDBStorage();

// Force database reset to implement new product features
const shouldForceReset = true;

// Initialize and verify image storage
export async function initializeStorage(): Promise<void> {
  try {
    if (storage instanceof MongoDBStorage) {
      await storage.verifyImageStorage();
    }
  } catch (error) {
    console.error('Failed to initialize storage:', error);
    throw error;
  }
}
