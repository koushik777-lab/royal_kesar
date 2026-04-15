import mongoose, { Schema, Document } from "mongoose";
import { getNextSequenceValue } from "./Counter";

export interface IUser extends Document {
  id: number;
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  address?: string;
  role: "customer" | "admin";
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  id: { type: Number, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre<IUser>("save", async function (this: IUser, next) {
  if (this.isNew) {
    this.id = await getNextSequenceValue("user_id");
  }
  next();
});

export const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
