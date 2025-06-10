import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { insertProductSchema, insertProductImageSchema, insertCategorySchema, insertSubcategorySchema, insertOrderSchema, insertBannerSchema } from "@shared/schema";
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from "./email-service";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";



// JWT middleware for admin routes
const authenticateAdmin = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Public routes - Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await storage.getCategoryById(categoryId);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  app.get("/api/categories/:id/subcategories", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const subcategories = await storage.getSubcategoriesByCategory(categoryId);
      res.json(subcategories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subcategories" });
    }
  });

  // Get all subcategories
  app.get("/api/subcategories", async (req, res) => {
    try {
      const subcategories = await storage.getSubcategories();
      res.json(subcategories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subcategories" });
    }
  });

  app.get("/api/subcategories/:id", async (req, res) => {
    try {
      const subcategoryId = parseInt(req.params.id);
      const subcategory = await storage.getSubcategoryById(subcategoryId);
      
      if (!subcategory) {
        return res.status(404).json({ message: "Subcategory not found" });
      }

      res.json(subcategory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subcategory" });
    }
  });

  // Public routes - Products
  app.get("/api/products", async (req, res) => {
    try {
      const { categoryId, subcategoryId } = req.query;
      let products;

      if (categoryId) {
        products = await storage.getProductsByCategory(parseInt(categoryId as string));
      } else if (subcategoryId) {
        products = await storage.getProductsBySubcategory(parseInt(subcategoryId as string));
      } else {
        products = await storage.getProducts();
      }

      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProductById(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Public routes - Product Images
  app.get("/api/products/:id/images", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const images = await storage.getProductImages(productId);
      res.json(images);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product images" });
    }
  });

  // Public routes - Banners
  app.get("/api/banners", async (req, res) => {
    try {
      const banners = await storage.getActiveBanners();
      res.json(banners);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch banners" });
    }
  });

  // Public route - Place order
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);

      // Send email confirmation
      try {
        await sendOrderConfirmationEmail(order);
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // Don't fail the order if email fails
      }

      res.status(201).json(order);
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(400).json({ message: "Failed to create order" });
    }
  });

  // Admin authentication
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const admin = await storage.getAdminByEmail(email);
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: admin.id, email: admin.email },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({ token, admin: { id: admin.id, email: admin.email } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Admin routes - Categories
  app.post("/api/admin/categories", authenticateAdmin, async (req, res) => {
    try {
      console.log('Creating category with data:', JSON.stringify(req.body, null, 2));
      const categoryData = insertCategorySchema.parse(req.body);
      console.log('Parsed category data:', JSON.stringify(categoryData, null, 2));
      const category = await storage.createCategory(categoryData);
      console.log('Created category result:', JSON.stringify(category, null, 2));
      res.status(201).json(category);
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(400).json({ message: "Failed to create category" });
    }
  });

  app.put("/api/admin/categories/:id", authenticateAdmin, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      console.log('Updating category', categoryId, 'with data:', JSON.stringify(req.body, null, 2));
      const categoryData = insertCategorySchema.partial().parse(req.body);
      console.log('Parsed category data:', JSON.stringify(categoryData, null, 2));
      const category = await storage.updateCategory(categoryId, categoryData);
      console.log('Updated category result:', JSON.stringify(category, null, 2));
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(category);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(400).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/admin/categories/:id", authenticateAdmin, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const deleted = await storage.deleteCategory(categoryId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Admin routes - Subcategories
  app.get("/api/admin/subcategories", authenticateAdmin, async (req, res) => {
    try {
      const subcategories = await storage.getSubcategories();
      res.json(subcategories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subcategories" });
    }
  });

  app.post("/api/admin/subcategories", authenticateAdmin, async (req, res) => {
    try {
      console.log('Creating subcategory with data:', JSON.stringify(req.body, null, 2));
      const subcategoryData = insertSubcategorySchema.parse(req.body);
      console.log('Parsed subcategory data:', JSON.stringify(subcategoryData, null, 2));
      const subcategory = await storage.createSubcategory(subcategoryData);
      console.log('Created subcategory result:', JSON.stringify(subcategory, null, 2));
      res.status(201).json(subcategory);
    } catch (error) {
      console.error('Error creating subcategory:', error);
      res.status(400).json({ message: "Failed to create subcategory" });
    }
  });

  app.put("/api/admin/subcategories/:id", authenticateAdmin, async (req, res) => {
    try {
      const subcategoryId = parseInt(req.params.id);
      console.log('Updating subcategory', subcategoryId, 'with data:', JSON.stringify(req.body, null, 2));
      const subcategoryData = insertSubcategorySchema.partial().parse(req.body);
      console.log('Parsed subcategory data:', JSON.stringify(subcategoryData, null, 2));
      const subcategory = await storage.updateSubcategory(subcategoryId, subcategoryData);
      console.log('Updated subcategory result:', JSON.stringify(subcategory, null, 2));
      
      if (!subcategory) {
        return res.status(404).json({ message: "Subcategory not found" });
      }

      res.json(subcategory);
    } catch (error) {
      console.error('Error updating subcategory:', error);
      res.status(400).json({ message: "Failed to update subcategory" });
    }
  });

  app.delete("/api/admin/subcategories/:id", authenticateAdmin, async (req, res) => {
    try {
      const subcategoryId = parseInt(req.params.id);
      const deleted = await storage.deleteSubcategory(subcategoryId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Subcategory not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete subcategory" });
    }
  });

  // Admin routes - Products
  app.post("/api/admin/products", authenticateAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/admin/products/:id", authenticateAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      console.log('Updating product:', productId, 'with data:', req.body);
      
      // Validate and parse the request data
      const productData = insertProductSchema.partial().parse(req.body);
      console.log('Parsed product data:', productData);
      
      const product = await storage.updateProduct(productId, productData);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      console.error('Product update error:', error);
      res.status(400).json({ 
        message: "Failed to update product",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Product Images routes
  app.get("/api/products/:id/images", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const images = await storage.getProductImages(productId);
      res.json(images);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product images" });
    }
  });

  app.get("/api/admin/products/:id/images", authenticateAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const images = await storage.getProductImages(productId);
      res.json(images);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product images" });
    }
  });

  app.delete("/api/admin/products/:id", authenticateAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const deleted = await storage.deleteProduct(productId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Admin routes - Product Images
  app.get("/api/admin/products/:id/images", authenticateAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const images = await storage.getProductImages(productId);
      res.json(images);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product images" });
    }
  });

  app.post("/api/admin/products/:id/images", authenticateAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const imageData = insertProductImageSchema.parse({
        ...req.body,
        productId
      });
      const image = await storage.createProductImage(imageData);
      res.status(201).json(image);
    } catch (error) {
      res.status(400).json({ message: "Failed to create product image" });
    }
  });

  app.put("/api/admin/product-images/:id", authenticateAdmin, async (req, res) => {
    try {
      const imageId = parseInt(req.params.id);
      const imageData = req.body;
      const image = await storage.updateProductImage(imageId, imageData);
      
      if (!image) {
        return res.status(404).json({ message: "Product image not found" });
      }

      res.json(image);
    } catch (error) {
      res.status(400).json({ message: "Failed to update product image" });
    }
  });

  app.put("/api/admin/product-images/:id/priority", authenticateAdmin, async (req, res) => {
    try {
      const imageId = parseInt(req.params.id);
      const { priority } = req.body;
      
      if (typeof priority !== 'number') {
        return res.status(400).json({ message: "Priority must be a number" });
      }

      const image = await storage.updateProductImagePriority(imageId, priority);
      
      if (!image) {
        return res.status(404).json({ message: "Product image not found" });
      }

      res.json(image);
    } catch (error) {
      res.status(400).json({ message: "Failed to update image priority" });
    }
  });

  app.delete("/api/admin/product-images/:id", authenticateAdmin, async (req, res) => {
    try {
      const imageId = parseInt(req.params.id);
      const deleted = await storage.deleteProductImage(imageId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Product image not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product image" });
    }
  });

  // Admin routes - Orders
  app.get("/api/admin/orders", authenticateAdmin, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.put("/api/admin/orders/:id/status", authenticateAdmin, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["Processing", "Shipped", "Canceled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // Get the current order to capture the previous status
      const currentOrder = await storage.getOrderById(orderId);
      if (!currentOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      const previousStatus = currentOrder.status;
      const order = await storage.updateOrderStatus(orderId, status);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Send email notification for status update
      try {
        console.log(`Sending status update email for order ${order.id} from ${previousStatus} to ${order.status}`);
        await sendOrderStatusUpdateEmail(order, previousStatus);
        console.log(`Status update email sent successfully for order ${order.id}`);
      } catch (emailError) {
        console.error("Failed to send status update email:", emailError);
        // Don't fail the order update if email fails
      }

      res.json(order);
    } catch (error) {
      res.status(400).json({ message: "Failed to update order status" });
    }
  });

  app.delete("/api/admin/orders/:id", authenticateAdmin, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const deleted = await storage.deleteOrder(orderId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete order" });
    }
  });

  // Public routes - Banners
  app.get("/api/banners", async (req, res) => {
    try {
      const banners = await storage.getActiveBanners();
      res.json(banners);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch banners" });
    }
  });

  // Admin routes - Banners
  app.get("/api/admin/banners", authenticateAdmin, async (req, res) => {
    try {
      const banners = await storage.getBanners();
      res.json(banners);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch banners" });
    }
  });

  app.post("/api/admin/banners", authenticateAdmin, async (req, res) => {
    try {
      const bannerData = insertBannerSchema.parse(req.body);
      const banner = await storage.createBanner(bannerData);
      res.status(201).json(banner);
    } catch (error) {
      res.status(400).json({ message: "Failed to create banner" });
    }
  });

  app.put("/api/admin/banners/:id", authenticateAdmin, async (req, res) => {
    try {
      const bannerId = parseInt(req.params.id);
      const bannerData = insertBannerSchema.partial().parse(req.body);
      const banner = await storage.updateBanner(bannerId, bannerData);
      
      if (!banner) {
        return res.status(404).json({ message: "Banner not found" });
      }

      res.json(banner);
    } catch (error) {
      res.status(400).json({ message: "Failed to update banner" });
    }
  });

  app.delete("/api/admin/banners/:id", authenticateAdmin, async (req, res) => {
    try {
      const bannerId = parseInt(req.params.id);
      const deleted = await storage.deleteBanner(bannerId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Banner not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete banner" });
    }
  });

  // Image upload utility route
  app.post("/api/admin/upload-image", authenticateAdmin, async (req, res) => {
    try {
      const { imageData, filename } = req.body;
      
      if (!imageData) {
        return res.status(400).json({ message: "No image data provided" });
      }

      // Return the base64 data for blob storage
      res.json({ 
        imageBlob: imageData,
        filename: filename || 'uploaded-image'
      });
    } catch (error) {
      res.status(400).json({ message: "Failed to process image" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
