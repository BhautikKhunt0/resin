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
  name: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
  imageBlob: { type: Buffer }
}, { timestamps: false });

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
  name: { type: String, required: true },
  description: { type: String },
  categoryId: { type: String, required: true },
  imageUrl: { type: String },
  imageBlob: { type: Buffer }
}, { timestamps: false });

export const SubcategoryModel = model<ISubcategory>('Subcategory', subcategorySchema);

// Product Schema
export interface IProduct extends Document {
  _id: string;
  name: string;
  description: string;
  price: string;
  imageUrl?: string;
  imageBlob?: Buffer;
  categoryId: string;
  subcategoryId?: string;
  isFeatured: number;
  createdAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: String, required: true },
  imageUrl: { type: String },
  imageBlob: { type: Buffer },
  categoryId: { type: String, required: true },
  subcategoryId: { type: String },
  isFeatured: { type: Number, default: 0 }
}, { timestamps: true });

export const ProductModel = model<IProduct>('Product', productSchema);

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
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
  imageBlob: { type: Buffer },
  isActive: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: false });

export const BannerModel = model<IBanner>('Banner', bannerSchema);