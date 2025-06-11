import { pgTable, text, serial, integer, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  imageBlob: text("image_blob"), // Base64 encoded image data
});

export const subcategories = pgTable("subcategories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  categoryId: integer("category_id").notNull(),
  imageUrl: text("image_url"),
  imageBlob: text("image_blob"), // Base64 encoded image data
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  weight: text("weight"), // Default weight category like "500g", "1kg", "2kg"
  weightVariants: jsonb("weight_variants"), // Array of {weight: string, price: number}
  imageUrl: text("image_url"),
  imageBlob: text("image_blob"), // Base64 encoded image data
  categoryId: integer("category_id").notNull(),
  subcategoryId: integer("subcategory_id"),
  isFeatured: integer("is_featured").default(0).notNull(), // 0 = false, 1 = true
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productImages = pgTable("product_images", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  imageUrl: text("image_url"),
  imageBlob: text("image_blob"), // Base64 encoded image data
  priority: integer("priority").default(0).notNull(), // Lower number = higher priority
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  orderItems: jsonb("order_items").notNull(), // Array of {productId, name, price, quantity}
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("Processing").notNull(), // Processing, Shipped, Canceled
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // Hashed password
});

export const banners = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  imageBlob: text("image_blob"), // Base64 encoded image data
  isActive: integer("is_active").default(1).notNull(), // 0 = false, 1 = true
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertSubcategorySchema = createInsertSchema(subcategories).omit({
  id: true,
}).extend({
  categoryId: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
}).extend({
  categoryId: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
  subcategoryId: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER).optional().nullable(),
  weightVariants: z.array(z.object({
    weight: z.string(),
    price: z.number()
  })).optional(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
});

export const insertBannerSchema = createInsertSchema(banners).omit({
  id: true,
  createdAt: true,
});

export const insertProductImageSchema = createInsertSchema(productImages).omit({
  id: true,
  createdAt: true,
}).extend({
  productId: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

// Types
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Subcategory = typeof subcategories.$inferSelect;
export type InsertSubcategory = z.infer<typeof insertSubcategorySchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type ProductImage = typeof productImages.$inferSelect;
export type InsertProductImage = z.infer<typeof insertProductImageSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;

export type Banner = typeof banners.$inferSelect;
export type InsertBanner = z.infer<typeof insertBannerSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

// Extended types for frontend
export type WeightVariant = {
  weight: string;
  price: number;
};

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  weight?: string;
  imageUrl?: string;
};

export type OrderItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  weight?: string;
};
