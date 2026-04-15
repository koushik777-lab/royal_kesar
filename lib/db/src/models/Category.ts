import mongoose, { Schema, Document } from "mongoose";
import { getNextSequenceValue } from "./Counter";

export interface ICategory extends Document {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  createdAt: Date;
}

const categorySchema = new Schema<ICategory>({
  id: { type: Number, unique: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

categorySchema.pre<ICategory>("save", async function (this: ICategory, next) {
  if (this.isNew) {
    this.id = await getNextSequenceValue("category_id");
  }
  next();
});

export const Category = mongoose.models.Category || mongoose.model<ICategory>("Category", categorySchema);
