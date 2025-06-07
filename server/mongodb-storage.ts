import { 
  type Category,
  type Subcategory,
  type Product,
  type Order,
  type Admin,
  type Banner,
  type InsertCategory,
  type InsertSubcategory,
  type InsertProduct,
  type InsertOrder,
  type InsertAdmin,
  type InsertBanner
} from "@shared/schema";
import { IStorage } from "./storage";
import {
  CategoryModel,
  SubcategoryModel,
  ProductModel,
  OrderModel,
  AdminModel,
  BannerModel,
  type ICategory,
  type ISubcategory,
  type IProduct,
  type IOrder,
  type IAdmin,
  type IBanner
} from "@shared/mongodb-schema";

export class MongoDBStorage implements IStorage {
  
  // Helper method to convert MongoDB document to app type
  private convertCategory(doc: ICategory): Category {
    return {
      id: parseInt(doc._id.toString().slice(-8), 16), // Convert ObjectId to number for compatibility
      name: doc.name,
      description: doc.description || null
    };
  }

  private convertSubcategory(doc: ISubcategory): Subcategory {
    return {
      id: parseInt(doc._id.toString().slice(-8), 16),
      name: doc.name,
      description: doc.description || null,
      categoryId: parseInt(doc.categoryId.slice(-8), 16)
    };
  }

  private convertProduct(doc: IProduct): Product {
    return {
      id: parseInt(doc._id.toString().slice(-8), 16),
      name: doc.name,
      description: doc.description,
      price: doc.price,
      imageUrl: doc.imageUrl || null,
      imageBlob: null,
      categoryId: parseInt(doc.categoryId.slice(-8), 16),
      subcategoryId: doc.subcategoryId ? parseInt(doc.subcategoryId.slice(-8), 16) : null,
      stock: doc.stock,
      isFeatured: doc.isFeatured,
      createdAt: doc.createdAt
    };
  }

  private convertOrder(doc: IOrder): Order {
    return {
      id: parseInt(doc._id.toString().slice(-8), 16),
      customerName: doc.customerName,
      customerEmail: doc.customerEmail,
      customerPhone: doc.customerPhone,
      shippingAddress: doc.shippingAddress,
      orderItems: doc.orderItems.map(item => ({
        productId: parseInt(item.productId.slice(-8), 16),
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      totalAmount: doc.totalAmount,
      status: doc.status,
      createdAt: doc.createdAt
    };
  }

  private convertAdmin(doc: IAdmin): Admin {
    return {
      id: parseInt(doc._id.toString().slice(-8), 16),
      email: doc.email,
      password: doc.password
    };
  }

  private convertBanner(doc: IBanner): Banner {
    return {
      id: parseInt(doc._id.toString().slice(-8), 16),
      title: doc.title,
      description: doc.description || "",
      imageUrl: doc.imageUrl || null,
      imageBlob: doc.imageBlob ? doc.imageBlob.toString() : null,
      isActive: doc.isActive,
      createdAt: doc.createdAt
    };
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const categories = await CategoryModel.find();
    return categories.map(cat => this.convertCategory(cat));
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const categories = await CategoryModel.find();
    const category = categories.find(cat => parseInt(cat._id.toString().slice(-8), 16) === id);
    return category ? this.convertCategory(category) : undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const newCategory = new CategoryModel({
      name: category.name,
      description: category.description
    });
    const saved = await newCategory.save();
    return this.convertCategory(saved);
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const categories = await CategoryModel.find();
    const existing = categories.find(cat => parseInt(cat._id.toString().slice(-8), 16) === id);
    if (!existing) return undefined;

    const updated = await CategoryModel.findByIdAndUpdate(
      existing._id,
      { ...category },
      { new: true }
    );
    return updated ? this.convertCategory(updated) : undefined;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const categories = await CategoryModel.find();
    const existing = categories.find(cat => parseInt(cat._id.toString().slice(-8), 16) === id);
    if (!existing) return false;

    await CategoryModel.findByIdAndDelete(existing._id);
    return true;
  }

  // Subcategories
  async getSubcategories(): Promise<Subcategory[]> {
    const subcategories = await SubcategoryModel.find();
    return subcategories.map(sub => this.convertSubcategory(sub));
  }

  async getSubcategoriesByCategory(categoryId: number): Promise<Subcategory[]> {
    const categories = await CategoryModel.find();
    const category = categories.find(cat => parseInt(cat._id.toString().slice(-8), 16) === categoryId);
    if (!category) return [];

    const subcategories = await SubcategoryModel.find({ categoryId: category._id.toString() });
    return subcategories.map(sub => this.convertSubcategory(sub));
  }

  async getSubcategoryById(id: number): Promise<Subcategory | undefined> {
    const subcategories = await SubcategoryModel.find();
    const subcategory = subcategories.find(sub => parseInt(sub._id.toString().slice(-8), 16) === id);
    return subcategory ? this.convertSubcategory(subcategory) : undefined;
  }

  async createSubcategory(subcategory: InsertSubcategory): Promise<Subcategory> {
    const categories = await CategoryModel.find();
    const category = categories.find(cat => parseInt(cat._id.toString().slice(-8), 16) === subcategory.categoryId);
    if (!category) throw new Error('Category not found');

    const newSubcategory = new SubcategoryModel({
      name: subcategory.name,
      description: subcategory.description,
      categoryId: category._id.toString()
    });
    const saved = await newSubcategory.save();
    return this.convertSubcategory(saved);
  }

  async updateSubcategory(id: number, subcategory: Partial<InsertSubcategory>): Promise<Subcategory | undefined> {
    const subcategories = await SubcategoryModel.find();
    const existing = subcategories.find(sub => parseInt(sub._id.toString().slice(-8), 16) === id);
    if (!existing) return undefined;

    let updateData: any = {};
    if (subcategory.name) updateData.name = subcategory.name;
    if (subcategory.description !== undefined) updateData.description = subcategory.description;
    
    if (subcategory.categoryId) {
      const categories = await CategoryModel.find();
      const category = categories.find(cat => parseInt(cat._id.toString().slice(-8), 16) === subcategory.categoryId);
      if (category) {
        updateData.categoryId = category._id.toString();
      }
    }

    const updated = await SubcategoryModel.findByIdAndUpdate(
      existing._id,
      updateData,
      { new: true }
    );
    return updated ? this.convertSubcategory(updated) : undefined;
  }

  async deleteSubcategory(id: number): Promise<boolean> {
    const subcategories = await SubcategoryModel.find();
    const existing = subcategories.find(sub => parseInt(sub._id.toString().slice(-8), 16) === id);
    if (!existing) return false;

    await SubcategoryModel.findByIdAndDelete(existing._id);
    return true;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    const products = await ProductModel.find();
    return products.map(prod => this.convertProduct(prod));
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    const categories = await CategoryModel.find();
    const category = categories.find(cat => parseInt(cat._id.toString().slice(-8), 16) === categoryId);
    if (!category) return [];

    const products = await ProductModel.find({ categoryId: category._id.toString() });
    return products.map(prod => this.convertProduct(prod));
  }

  async getProductsBySubcategory(subcategoryId: number): Promise<Product[]> {
    const subcategories = await SubcategoryModel.find();
    const subcategory = subcategories.find(sub => parseInt(sub._id.toString().slice(-8), 16) === subcategoryId);
    if (!subcategory) return [];

    const products = await ProductModel.find({ subcategoryId: subcategory._id.toString() });
    return products.map(prod => this.convertProduct(prod));
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const products = await ProductModel.find();
    const product = products.find(prod => parseInt(prod._id.toString().slice(-8), 16) === id);
    return product ? this.convertProduct(product) : undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const categories = await CategoryModel.find();
    const category = categories.find(cat => parseInt(cat._id.toString().slice(-8), 16) === product.categoryId);
    if (!category) throw new Error('Category not found');

    let subcategoryId: string | undefined;
    if (product.subcategoryId) {
      const subcategories = await SubcategoryModel.find();
      const subcategory = subcategories.find(sub => parseInt(sub._id.toString().slice(-8), 16) === product.subcategoryId!);
      if (subcategory) {
        subcategoryId = subcategory._id.toString();
      }
    }

    const newProduct = new ProductModel({
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      categoryId: category._id.toString(),
      subcategoryId: subcategoryId,
      stock: product.stock || 0
    });
    const saved = await newProduct.save();
    return this.convertProduct(saved);
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const products = await ProductModel.find();
    const existing = products.find(prod => parseInt(prod._id.toString().slice(-8), 16) === id);
    if (!existing) return undefined;

    let updateData: any = { ...product };
    
    if (product.categoryId) {
      const categories = await CategoryModel.find();
      const category = categories.find(cat => parseInt(cat._id.toString().slice(-8), 16) === product.categoryId!);
      if (category) {
        updateData.categoryId = category._id.toString();
      }
    }

    if (product.subcategoryId) {
      const subcategories = await SubcategoryModel.find();
      const subcategory = subcategories.find(sub => parseInt(sub._id.toString().slice(-8), 16) === product.subcategoryId!);
      if (subcategory) {
        updateData.subcategoryId = subcategory._id.toString();
      }
    }

    const updated = await ProductModel.findByIdAndUpdate(
      existing._id,
      updateData,
      { new: true }
    );
    return updated ? this.convertProduct(updated) : undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const products = await ProductModel.find();
    const existing = products.find(prod => parseInt(prod._id.toString().slice(-8), 16) === id);
    if (!existing) return false;

    await ProductModel.findByIdAndDelete(existing._id);
    return true;
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    const orders = await OrderModel.find().sort({ createdAt: -1 });
    return orders.map(order => this.convertOrder(order));
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const orders = await OrderModel.find();
    const order = orders.find(ord => parseInt(ord._id.toString().slice(-8), 16) === id);
    return order ? this.convertOrder(order) : undefined;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const newOrder = new OrderModel({
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      orderItems: order.orderItems,
      totalAmount: order.totalAmount,
      status: order.status || "Processing"
    });
    const saved = await newOrder.save();
    return this.convertOrder(saved);
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const orders = await OrderModel.find();
    const existing = orders.find(ord => parseInt(ord._id.toString().slice(-8), 16) === id);
    if (!existing) return undefined;

    const updated = await OrderModel.findByIdAndUpdate(
      existing._id,
      { status },
      { new: true }
    );
    return updated ? this.convertOrder(updated) : undefined;
  }

  async deleteOrder(id: number): Promise<boolean> {
    const orders = await OrderModel.find();
    const existing = orders.find(ord => parseInt(ord._id.toString().slice(-8), 16) === id);
    if (!existing) return false;

    await OrderModel.findByIdAndDelete(existing._id);
    return true;
  }

  // Admins
  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const admin = await AdminModel.findOne({ email });
    return admin ? this.convertAdmin(admin) : undefined;
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const newAdmin = new AdminModel({
      email: admin.email,
      password: admin.password
    });
    const saved = await newAdmin.save();
    return this.convertAdmin(saved);
  }

  // Banners
  async getBanners(): Promise<Banner[]> {
    const banners = await BannerModel.find();
    return banners.map(banner => this.convertBanner(banner));
  }

  async getActiveBanners(): Promise<Banner[]> {
    const banners = await BannerModel.find({ isActive: 1 });
    return banners.map(banner => this.convertBanner(banner));
  }

  async getBannerById(id: number): Promise<Banner | undefined> {
    const banners = await BannerModel.find();
    const banner = banners.find(b => parseInt(b._id.toString().slice(-8), 16) === id);
    return banner ? this.convertBanner(banner) : undefined;
  }

  async createBanner(banner: InsertBanner): Promise<Banner> {
    const newBanner = new BannerModel({
      title: banner.title,
      description: banner.description,
      imageUrl: banner.imageUrl,
      imageBlob: banner.imageBlob ? Buffer.from(banner.imageBlob, 'base64') : undefined,
      isActive: banner.isActive || 1
    });
    const saved = await newBanner.save();
    return this.convertBanner(saved);
  }

  async updateBanner(id: number, banner: Partial<InsertBanner>): Promise<Banner | undefined> {
    const banners = await BannerModel.find();
    const existing = banners.find(b => parseInt(b._id.toString().slice(-8), 16) === id);
    if (!existing) return undefined;

    const updateData: any = {};
    if (banner.title !== undefined) updateData.title = banner.title;
    if (banner.description !== undefined) updateData.description = banner.description;
    if (banner.imageUrl !== undefined) updateData.imageUrl = banner.imageUrl;
    if (banner.imageBlob !== undefined) updateData.imageBlob = banner.imageBlob ? Buffer.from(banner.imageBlob, 'base64') : null;
    if (banner.isActive !== undefined) updateData.isActive = banner.isActive;

    const updated = await BannerModel.findByIdAndUpdate(
      existing._id,
      updateData,
      { new: true }
    );
    return updated ? this.convertBanner(updated) : undefined;
  }

  async deleteBanner(id: number): Promise<boolean> {
    const banners = await BannerModel.find();
    const existing = banners.find(b => parseInt(b._id.toString().slice(-8), 16) === id);
    if (!existing) return false;

    await BannerModel.findByIdAndDelete(existing._id);
    return true;
  }
}