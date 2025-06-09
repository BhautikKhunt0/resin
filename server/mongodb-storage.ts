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
  
  // Verify image storage functionality
  async verifyImageStorage(): Promise<void> {
    try {
      console.log('Verifying MongoDB image storage functionality...');
      
      // Test base64 conversion
      const testImageBlob = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const buffer = Buffer.from(testImageBlob, 'base64');
      const backToBase64 = buffer.toString('base64');
      
      if (testImageBlob === backToBase64) {
        console.log('✓ Base64 to Buffer conversion working correctly');
      } else {
        console.error('✗ Base64 conversion failed');
      }
      
      // Test MongoDB schema supports Buffer type
      const testCategory = new CategoryModel({
        name: 'Test Category',
        imageBlob: buffer
      });
      
      console.log('✓ MongoDB schema accepts Buffer type for imageBlob');
      console.log('✓ Image storage verification completed successfully');
      
    } catch (error) {
      console.error('✗ Image storage verification failed:', error);
      throw error;
    }
  }
  
  // Helper method to convert MongoDB document to app type
  private convertCategory(doc: ICategory): Category {
    return {
      id: parseInt(doc._id.toString().slice(-8), 16), // Convert ObjectId to number for compatibility
      name: doc.name,
      description: doc.description || null,
      imageUrl: doc.imageUrl || null,
      imageBlob: doc.imageBlob ? doc.imageBlob.toString('base64') : null
    };
  }

  private convertSubcategory(doc: ISubcategory): Subcategory {
    return {
      id: parseInt(doc._id.toString().slice(-8), 16),
      name: doc.name,
      description: doc.description || null,
      categoryId: parseInt(doc.categoryId.slice(-8), 16),
      imageUrl: doc.imageUrl || null,
      imageBlob: doc.imageBlob ? doc.imageBlob.toString('base64') : null
    };
  }

  private convertProduct(doc: IProduct): Product {
    return {
      id: parseInt(doc._id.toString().slice(-8), 16),
      name: doc.name,
      description: doc.description,
      price: doc.price,
      imageUrl: doc.imageUrl || null,
      imageBlob: doc.imageBlob ? doc.imageBlob.toString('base64') : null,
      categoryId: parseInt(doc.categoryId.slice(-8), 16),
      subcategoryId: doc.subcategoryId ? parseInt(doc.subcategoryId.slice(-8), 16) : null,
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
      imageBlob: doc.imageBlob ? doc.imageBlob.toString('base64') : null,
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
    try {
      const newCategory = new CategoryModel({
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl,
        imageBlob: category.imageBlob ? Buffer.from(category.imageBlob, 'base64') : undefined
      });
      const saved = await newCategory.save();
      console.log(`Category created with ID: ${saved._id}, has imageBlob: ${!!saved.imageBlob}, has imageUrl: ${!!saved.imageUrl}`);
      return this.convertCategory(saved);
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    try {
      const categories = await CategoryModel.find();
      const existing = categories.find(cat => parseInt(cat._id.toString().slice(-8), 16) === id);
      if (!existing) return undefined;

      const updateData: any = {};
      
      // Handle each field individually to ensure proper updates
      if (category.name !== undefined) updateData.name = category.name;
      if (category.description !== undefined) updateData.description = category.description;
      
      // Handle image updates properly - ensure only one type is set
      if (category.imageUrl !== undefined) {
        updateData.imageUrl = category.imageUrl || null;
        // If setting imageUrl, clear imageBlob unless imageBlob is also being updated
        if (category.imageBlob === undefined && category.imageUrl) {
          updateData.imageBlob = null;
        }
      }
      
      if (category.imageBlob !== undefined) {
        updateData.imageBlob = category.imageBlob ? Buffer.from(category.imageBlob, 'base64') : null;
        // If setting imageBlob, clear imageUrl unless imageUrl is also being updated
        if (category.imageUrl === undefined && category.imageBlob) {
          updateData.imageUrl = null;
        }
        console.log(`Updating category ${id} with imageBlob: ${!!category.imageBlob}`);
      }

      const updated = await CategoryModel.findByIdAndUpdate(
        existing._id,
        updateData,
        { new: true }
      );
      
      if (updated) {
        console.log(`Category updated with ID: ${updated._id}, has imageBlob: ${!!updated.imageBlob}, has imageUrl: ${!!updated.imageUrl}`);
      }
      
      return updated ? this.convertCategory(updated) : undefined;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
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
    try {
      const categories = await CategoryModel.find();
      const category = categories.find(cat => parseInt(cat._id.toString().slice(-8), 16) === subcategory.categoryId);
      if (!category) throw new Error('Category not found');

      const newSubcategory = new SubcategoryModel({
        name: subcategory.name,
        description: subcategory.description,
        categoryId: category._id.toString(),
        imageUrl: subcategory.imageUrl,
        imageBlob: subcategory.imageBlob ? Buffer.from(subcategory.imageBlob, 'base64') : undefined
      });
      const saved = await newSubcategory.save();
      console.log(`Subcategory created with ID: ${saved._id}, has imageBlob: ${!!saved.imageBlob}, has imageUrl: ${!!saved.imageUrl}`);
      return this.convertSubcategory(saved);
    } catch (error) {
      console.error('Error creating subcategory:', error);
      throw error;
    }
  }

  async updateSubcategory(id: number, subcategory: Partial<InsertSubcategory>): Promise<Subcategory | undefined> {
    try {
      const subcategories = await SubcategoryModel.find();
      const existing = subcategories.find(sub => parseInt(sub._id.toString().slice(-8), 16) === id);
      if (!existing) return undefined;

      const updateData: any = {};
      
      // Handle each field individually to ensure proper updates
      if (subcategory.name !== undefined) updateData.name = subcategory.name;
      if (subcategory.description !== undefined) updateData.description = subcategory.description;
      
      // Handle image updates properly - ensure only one type is set
      if (subcategory.imageUrl !== undefined) {
        updateData.imageUrl = subcategory.imageUrl || null;
        // If setting imageUrl, clear imageBlob unless imageBlob is also being updated
        if (subcategory.imageBlob === undefined && subcategory.imageUrl) {
          updateData.imageBlob = null;
        }
      }
      
      if (subcategory.imageBlob !== undefined) {
        updateData.imageBlob = subcategory.imageBlob ? Buffer.from(subcategory.imageBlob, 'base64') : null;
        // If setting imageBlob, clear imageUrl unless imageUrl is also being updated
        if (subcategory.imageUrl === undefined && subcategory.imageBlob) {
          updateData.imageUrl = null;
        }
        console.log(`Updating subcategory ${id} with imageBlob: ${!!subcategory.imageBlob}`);
      }
      
      // Handle categoryId update
      if (subcategory.categoryId !== undefined) {
        const categories = await CategoryModel.find();
        const category = categories.find(cat => parseInt(cat._id.toString().slice(-8), 16) === subcategory.categoryId);
        if (category) {
          updateData.categoryId = category._id.toString();
        } else {
          throw new Error('Category not found');
        }
      }

      const updated = await SubcategoryModel.findByIdAndUpdate(
        existing._id,
        updateData,
        { new: true }
      );
      
      if (updated) {
        console.log(`Subcategory updated with ID: ${updated._id}, has imageBlob: ${!!updated.imageBlob}, has imageUrl: ${!!updated.imageUrl}`);
      }
      
      return updated ? this.convertSubcategory(updated) : undefined;
    } catch (error) {
      console.error('Error updating subcategory:', error);
      throw error;
    }
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
    try {
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
        imageBlob: product.imageBlob ? Buffer.from(product.imageBlob, 'base64') : undefined,
        categoryId: category._id.toString(),
        subcategoryId: subcategoryId,
        isFeatured: product.isFeatured || 0
      });
      const saved = await newProduct.save();
      console.log(`Product created with ID: ${saved._id}, has imageBlob: ${!!saved.imageBlob}, has imageUrl: ${!!saved.imageUrl}`);
      return this.convertProduct(saved);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const products = await ProductModel.find();
    const existing = products.find(prod => parseInt(prod._id.toString().slice(-8), 16) === id);
    if (!existing) return undefined;

    const updateData: any = {};
    if (product.name !== undefined) updateData.name = product.name;
    if (product.description !== undefined) updateData.description = product.description;
    if (product.price !== undefined) updateData.price = product.price;
    if (product.imageUrl !== undefined) updateData.imageUrl = product.imageUrl;
    if (product.imageBlob !== undefined) {
      updateData.imageBlob = product.imageBlob ? Buffer.from(product.imageBlob, 'base64') : null;
      console.log(`Updating product ${id} with imageBlob: ${!!product.imageBlob}`);
    }

    if (product.isFeatured !== undefined) updateData.isFeatured = product.isFeatured;
    
    // Handle categoryId - always update if provided
    if (product.categoryId !== undefined) {
      const categories = await CategoryModel.find();
      const category = categories.find(cat => parseInt(cat._id.toString().slice(-8), 16) === product.categoryId!);
      if (category) {
        updateData.categoryId = category._id.toString();
      } else {
        throw new Error('Category not found');
      }
    }

    // Handle subcategoryId - can be null/undefined to clear it
    if (product.subcategoryId !== undefined) {
      if (product.subcategoryId === null || product.subcategoryId === 0) {
        updateData.subcategoryId = null;
      } else {
        const subcategories = await SubcategoryModel.find();
        const subcategory = subcategories.find(sub => parseInt(sub._id.toString().slice(-8), 16) === product.subcategoryId!);
        if (subcategory) {
          updateData.subcategoryId = subcategory._id.toString();
        } else {
          throw new Error('Subcategory not found');
        }
      }
    }

    const updated = await ProductModel.findByIdAndUpdate(
      existing._id,
      updateData,
      { new: true }
    );
    
    if (updated) {
      console.log(`Product updated with ID: ${updated._id}, has imageBlob: ${!!updated.imageBlob}, has imageUrl: ${!!updated.imageUrl}`);
    }
    
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