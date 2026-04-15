import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.DATABASE_URL || "mongodb://localhost:27017/royal-kesar";

// Counter Schema
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

async function getNextSequenceValue(sequenceName) {
  const sequenceDocument = await Counter.findByIdAndUpdate(
    sequenceName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDocument.seq;
}

// Category Schema
const categorySchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

categorySchema.pre('save', async function (next) {
  if (this.isNew) {
    this.id = await getNextSequenceValue('category_id');
  }
  next();
});

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

const categories = [
  { name: "Saffron", slug: "saffron", description: "The world's finest spice, harvested from the valleys of Kashmir." },
  { name: "Dry Fruits", slug: "dry-fruits", description: "Natural, sun-dried goodness from the heart of the Himalayas." },
  { name: "Shawls", slug: "shawls", description: "Authentic, hand-woven luxury crafted from the finest Pashmina wool." }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    for (const cat of categories) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (!exists) {
        await new Category(cat).save();
        console.log(`Seeded category: ${cat.name}`);
      } else {
        console.log(`Category already exists: ${cat.name}`);
      }
    }

    console.log("Seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seed();
