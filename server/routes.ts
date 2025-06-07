import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { insertProductSchema, insertCategorySchema, insertSubcategorySchema, insertOrderSchema } from "@shared/schema";
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

  app.get("/api/categories/:id/subcategories", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const subcategories = await storage.getSubcategoriesByCategory(categoryId);
      res.json(subcategories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subcategories" });
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
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: "Failed to create category" });
    }
  });

  app.put("/api/admin/categories/:id", authenticateAdmin, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(categoryId, categoryData);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(category);
    } catch (error) {
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
      const subcategoryData = insertSubcategorySchema.parse(req.body);
      const subcategory = await storage.createSubcategory(subcategoryData);
      res.status(201).json(subcategory);
    } catch (error) {
      res.status(400).json({ message: "Failed to create subcategory" });
    }
  });

  app.put("/api/admin/subcategories/:id", authenticateAdmin, async (req, res) => {
    try {
      const subcategoryId = parseInt(req.params.id);
      const subcategoryData = insertSubcategorySchema.partial().parse(req.body);
      const subcategory = await storage.updateSubcategory(subcategoryId, subcategoryData);
      
      if (!subcategory) {
        return res.status(404).json({ message: "Subcategory not found" });
      }

      res.json(subcategory);
    } catch (error) {
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
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(productId, productData);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Failed to update product" });
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

  const httpServer = createServer(app);
  return httpServer;
}
