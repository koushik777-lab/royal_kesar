import mongoose, { Schema, Document } from "mongoose";
import { getNextSequenceValue } from "./Counter";

export interface IOrder extends Document {
  id: number;
  userId: number;
  items: any; // jsonb in SQL
  total: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  shippingAddress: string;
  phone: string;
  paymentMethod: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  notes?: string;
  createdAt: Date;
}

const orderSchema = new Schema<IOrder>({
  id: { type: Number, unique: true },
  userId: { type: Number, required: true },
  items: { type: Schema.Types.Mixed, required: true },
  total: { type: String, required: true },
  status: { type: String, enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"], default: "pending" },
  shippingAddress: { type: String, required: true },
  phone: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

orderSchema.pre<IOrder>("save", async function (this: IOrder, next) {
  if (this.isNew) {
    this.id = await getNextSequenceValue("order_id");
  }
  next();
});

export const Order = mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);
