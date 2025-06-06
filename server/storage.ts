import { 
  categories, 
  subcategories, 
  products, 
  orders, 
  admins,
  type Category,
  type Subcategory,
  type Product,
  type Order,
  type Admin,
  type InsertCategory,
  type InsertSubcategory,
  type InsertProduct,
  type InsertOrder,
  type InsertAdmin
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

  // Orders
  getOrders(): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  deleteOrder(id: number): Promise<boolean>;

  // Admins
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
}

export class MemStorage implements IStorage {
  private categories: Map<number, Category>;
  private subcategories: Map<number, Subcategory>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private admins: Map<number, Admin>;
  private currentCategoryId: number;
  private currentSubcategoryId: number;
  private currentProductId: number;
  private currentOrderId: number;
  private currentAdminId: number;

  constructor() {
    this.categories = new Map();
    this.subcategories = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.admins = new Map();
    this.currentCategoryId = 1;
    this.currentSubcategoryId = 1;
    this.currentProductId = 1;
    this.currentOrderId = 1;
    this.currentAdminId = 1;

    this.seedData();
  }

  private seedData() {
    // Seed categories
    const electronics: Category = { id: this.currentCategoryId++, name: "Electronics", description: "Electronic devices and gadgets" };
    const clothing: Category = { id: this.currentCategoryId++, name: "Clothing", description: "Fashion and apparel" };
    const homeGarden: Category = { id: this.currentCategoryId++, name: "Home & Garden", description: "Home and garden essentials" };
    const sports: Category = { id: this.currentCategoryId++, name: "Sports", description: "Sports and fitness equipment" };

    [electronics, clothing, homeGarden, sports].forEach(cat => this.categories.set(cat.id, cat));

    // Seed subcategories
    const smartphones: Subcategory = { id: this.currentSubcategoryId++, name: "Smartphones", description: "Mobile phones", categoryId: electronics.id };
    const laptops: Subcategory = { id: this.currentSubcategoryId++, name: "Laptops", description: "Portable computers", categoryId: electronics.id };
    const headphones: Subcategory = { id: this.currentSubcategoryId++, name: "Headphones", description: "Audio devices", categoryId: electronics.id };

    [smartphones, laptops, headphones].forEach(sub => this.subcategories.set(sub.id, sub));

    // Seed products
    const products: Product[] = [
      {
        id: this.currentProductId++,
        name: "Premium Wireless Headphones",
        description: "High-quality sound with noise cancellation technology",
        price: "199.99",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronics.id,
        subcategoryId: headphones.id,
        stock: 45,
        createdAt: new Date(),
      },
      {
        id: this.currentProductId++,
        name: "Smart Watch Pro",
        description: "Advanced fitness tracking and smart notifications",
        price: "299.99",
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronics.id,
        subcategoryId: undefined,
        stock: 32,
        createdAt: new Date(),
      },
      {
        id: this.currentProductId++,
        name: "Ultra-thin Laptop",
        description: "Powerful performance in a portable design",
        price: "1299.99",
        imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronics.id,
        subcategoryId: laptops.id,
        stock: 18,
        createdAt: new Date(),
      },
      {
        id: this.currentProductId++,
        name: "Premium Smartphone",
        description: "Latest flagship model with advanced camera system",
        price: "899.99",
        imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronics.id,
        subcategoryId: smartphones.id,
        stock: 67,
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
}

export const storage = new MemStorage();
