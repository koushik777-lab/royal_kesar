import mongoose, { Schema, Document } from "mongoose";
import { getNextSequenceValue } from "./Counter";

export interface IProduct extends Document {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  originalPrice?: string;
  imageUrl?: string;
  images: string[];
  categoryId: number;
  stock: number;
  featured: boolean;
  weight?: string;
  origin?: string;
  rating: string;
  reviewCount: number;
  createdAt: Date;
}

const productSchema = new Schema<IProduct>({
  id: { type: Number, unique: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: String, required: true },
  originalPrice: { type: String },
  imageUrl: { type: String },
  images: { type: [String], default: [] },
  categoryId: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  weight: { type: String },
  origin: { type: String },
  rating: { type: String, default: "0" },
  reviewCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

productSchema.pre<IProduct>("save", async function (this: IProduct, next) {
  if (this.isNew) {
    this.id = await getNextSequenceValue("product_id");
  }
  next();
});

export const Product = mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);
