import { Schema, model, Document } from 'mongoose';

// Category Schema
export interface ICategory extends Document {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  imageBlob?: Buffer;
}

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true, index: true },
  description: { type: String },
  imageUrl: { type: String },
  imageBlob: { type: Buffer }
}, { timestamps: false });

// Add indexes for better query performance
categorySchema.index({ _id: 1 });
categorySchema.index({ name: 1 });

export const CategoryModel = model<ICategory>('Category', categorySchema);

// Subcategory Schema
export interface ISubcategory extends Document {
  _id: string;
  name: string;
  description?: string;
  categoryId: string;
  imageUrl?: string;
  imageBlob?: Buffer;
}

const subcategorySchema = new Schema<ISubcategory>({
  name: { type: String, required: true, index: true },
  description: { type: String },
  categoryId: { type: String, required: true, index: true },
  imageUrl: { type: String },
  imageBlob: { type: Buffer }
}, { timestamps: false });

// Add indexes for better query performance
subcategorySchema.index({ _id: 1 });
subcategorySchema.index({ categoryId: 1 });
subcategorySchema.index({ name: 1 });

export const SubcategoryModel = model<ISubcategory>('Subcategory', subcategorySchema);

// Product Schema
export interface IProduct extends Document {
  _id: string;
  name: string;
  description: string;
  price: string;
  weight?: string;
  imageUrl?: string;
  imageBlob?: Buffer;
  images?: Array<{
    imageUrl?: string;
    imageBlob?: Buffer;
    priority: number;
  }>;
  categoryId: string;
  subcategoryId?: string;
  isFeatured: number;
  createdAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true, index: true },
  description: { type: String, required: true },
  price: { type: String, required: true },
  weight: { type: String },
  imageUrl: { type: String },
  imageBlob: { type: Buffer },
  images: [{
    imageUrl: { type: String },
    imageBlob: { type: Buffer },
    priority: { type: Number, default: 0 }
  }],
  categoryId: { type: String, required: true, index: true },
  subcategoryId: { type: String, index: true },
  isFeatured: { type: Number, default: 0, index: true }
}, { timestamps: true });

// Add compound indexes for better query performance
productSchema.index({ _id: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ subcategoryId: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ categoryId: 1, subcategoryId: 1 });
productSchema.index({ categoryId: 1, isFeatured: 1 });
productSchema.index({ name: 1 });
productSchema.index({ createdAt: -1 });

export const ProductModel = model<IProduct>('Product', productSchema);

// Product Image Schema
export interface IProductImage extends Document {
  _id: string;
  productId: string;
  imageUrl?: string;
  imageBlob?: Buffer;
  priority: number;
  createdAt: Date;
}

const productImageSchema = new Schema<IProductImage>({
  productId: { type: String, required: true },
  imageUrl: { type: String },
  imageBlob: { type: Buffer },
  priority: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const ProductImageModel = model<IProductImage>('ProductImage', productImageSchema);

// Order Schema
export interface IOrder extends Document {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  orderItems: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: string;
  status: string;
  createdAt: Date;
}

const orderSchema = new Schema<IOrder>({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  shippingAddress: { type: String, required: true },
  orderItems: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
  }],
  totalAmount: { type: String, required: true },
  status: { type: String, default: "Processing" }
}, { timestamps: true });

export const OrderModel = model<IOrder>('Order', orderSchema);

// Admin Schema
export interface IAdmin extends Document {
  _id: string;
  email: string;
  password: string;
}

const adminSchema = new Schema<IAdmin>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: false });

export const AdminModel = model<IAdmin>('Admin', adminSchema);

// Banner Schema
export interface IBanner extends Document {
  _id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  imageBlob?: Buffer;
  isActive: number;
  createdAt: Date;
}

const bannerSchema = new Schema<IBanner>({
  title: { type: String, required: true, index: true },
  description: { type: String },
  imageUrl: { type: String },
  imageBlob: { type: Buffer },
  isActive: { type: Number, default: 1, index: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: false });

// Add indexes for better query performance
bannerSchema.index({ _id: 1 });
bannerSchema.index({ isActive: 1 });
bannerSchema.index({ createdAt: -1 });

export const BannerModel = model<IBanner>('Banner', bannerSchema);

// Page Schema
export interface IPage extends Document {
  _id: string;
  title: string;
  slug: string;
  content: string;
  isActive: number;
  createdAt: Date;
  updatedAt: Date;
}

const pageSchema = new Schema<IPage>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  isActive: { type: Number, default: 1 }
}, { timestamps: true });

export const PageModel = model<IPage>('Page', pageSchema);