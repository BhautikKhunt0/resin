import { 
  categories, 
  subcategories, 
  products, 
  productImages,
  orders, 
  admins,
  banners,
  settings,
  type Category,
  type Subcategory,
  type Product,
  type ProductImage,
  type Order,
  type Admin,
  type Banner,
  type Setting,
  type InsertCategory,
  type InsertSubcategory,
  type InsertProduct,
  type InsertProductImage,
  type InsertOrder,
  type InsertAdmin,
  type InsertBanner,
  type InsertSetting
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

  // Settings
  getSettings(): Promise<Setting[]>;
  getSettingByKey(key: string): Promise<Setting | undefined>;
  createSetting(setting: InsertSetting): Promise<Setting>;
  updateSetting(key: string, value: string): Promise<Setting | undefined>;
  deleteSetting(key: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private categories: Map<number, Category>;
  private subcategories: Map<number, Subcategory>;
  private products: Map<number, Product>;
  private productImages: Map<number, ProductImage>;
  private orders: Map<number, Order>;
  private admins: Map<number, Admin>;
  private banners: Map<number, Banner>;
  private settings: Map<string, Setting>;
  private currentCategoryId: number;
  private currentSubcategoryId: number;
  private currentProductId: number;
  private currentProductImageId: number;
  private currentOrderId: number;
  private currentAdminId: number;
  private currentBannerId: number;
  private currentSettingId: number;

  constructor() {
    this.categories = new Map();
    this.subcategories = new Map();
    this.products = new Map();
    this.productImages = new Map();
    this.orders = new Map();
    this.admins = new Map();
    this.banners = new Map();
    this.settings = new Map();
    this.currentCategoryId = 1;
    this.currentSubcategoryId = 1;
    this.currentProductId = 1;
    this.currentProductImageId = 1;
    this.currentOrderId = 1;
    this.currentAdminId = 1;
    this.currentBannerId = 1;
    this.currentSettingId = 1;
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
      ...product,
      id: this.currentProductId++,
      createdAt: new Date(),
      imageUrl: product.imageUrl || null,
      imageBlob: product.imageBlob || null,
      subcategoryId: product.subcategoryId || null,
      isFeatured: product.isFeatured || 0,
      weight: product.weight ?? null,
      weightVariants: product.weightVariants ?? null,
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

  // Settings methods
  async getSettings(): Promise<Setting[]> {
    return Array.from(this.settings.values());
  }

  async getSettingByKey(key: string): Promise<Setting | undefined> {
    return this.settings.get(key);
  }

  async createSetting(setting: InsertSetting): Promise<Setting> {
    const newSetting: Setting = {
      ...setting,
      id: this.currentSettingId++,
      description: setting.description || null,
      updatedAt: new Date(),
    };
    this.settings.set(setting.key, newSetting);
    return newSetting;
  }

  async updateSetting(key: string, value: string): Promise<Setting | undefined> {
    const existingSetting = this.settings.get(key);
    if (!existingSetting) return undefined;

    const updatedSetting: Setting = {
      ...existingSetting,
      value,
      updatedAt: new Date(),
    };
    this.settings.set(key, updatedSetting);
    return updatedSetting;
  }

  async deleteSetting(key: string): Promise<boolean> {
    return this.settings.delete(key);
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
    // MemStorage initializes automatically in constructor
  } catch (error) {
    console.error('Failed to initialize storage:', error);
    throw error;
  }
}
