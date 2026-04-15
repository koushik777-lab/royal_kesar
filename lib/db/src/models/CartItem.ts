import mongoose, { Schema, Document } from "mongoose";
import { getNextSequenceValue } from "./Counter";

export interface ICartItem extends Document {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  createdAt: Date;
}

const cartItemSchema = new Schema<ICartItem>({
  id: { type: Number, unique: true },
  userId: { type: Number, required: true },
  productId: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

cartItemSchema.pre<ICartItem>("save", async function (this: ICartItem, next) {
  if (this.isNew) {
    this.id = await getNextSequenceValue("cart_item_id");
  }
  next();
});

export const CartItem = mongoose.models.CartItem || mongoose.model<ICartItem>("CartItem", cartItemSchema);
