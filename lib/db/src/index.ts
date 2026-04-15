import mongoose from "mongoose";
import * as models from "./models";

const MONGODB_URI = process.env.DATABASE_URL || "mongodb://localhost:27017/royal-kesar";

if (!MONGODB_URI) {
  throw new Error(
    "DATABASE_URL (MongoDB URI) must be set. Defaulting to local if not provided.",
  );
}

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

// Ensure connection is established (useful for CLI/scripts, though Express usually calls it)
// In a server environment, we usually call this in the entry point.

export { models };
export * from "./models";
