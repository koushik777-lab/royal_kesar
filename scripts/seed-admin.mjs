import mongoose from "mongoose";
import { createHash } from "crypto";

// Replicate the hashing logic from api-server/src/lib/auth.ts
function hashPassword(password) {
  const salt = "royal-kesar-salt-2024";
  return createHash("sha256").update(password + salt).digest("hex");
}

const MONGODB_URI = process.env.DATABASE_URL || "mongodb://localhost:27017/royal-kesar";

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const UserSchema = new mongoose.Schema({
      id: { type: Number, unique: true },
      email: { type: String, required: true, unique: true },
      passwordHash: { type: String, required: true },
      name: { type: String, required: true },
      role: { type: String, enum: ["customer", "admin"], default: "customer" },
      createdAt: { type: Date, default: Date.now },
    });

    // Counter logic is needed for common ID generation if using the models normally,
    // but here we can just find the max ID or let the pre-save hook deal with it if we loaded the model.
    // However, to keep it simple and independent, we'll just check if the user exists and create it.

    const User = mongoose.models.User || mongoose.model("User", UserSchema);

    const adminEmail = "admin@royalkesar.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("Admin user already exists. Updating password...");
      existingAdmin.passwordHash = hashPassword("admin@741");
      existingAdmin.role = "admin";
      await existingAdmin.save();
      console.log("Admin user updated successfully.");
    } else {
      console.log("Creating admin user...");
      
      // We need to handle the numeric ID. Let's check the Counter collection.
      const CounterSchema = new mongoose.Schema({
        _id: String,
        seq: { type: Number, default: 0 }
      });
      const Counter = mongoose.models.Counter || mongoose.model("Counter", CounterSchema);
      
      let counter = await Counter.findByIdAndUpdate(
        { _id: "user_id" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      const newAdmin = new User({
        id: counter.seq,
        email: adminEmail,
        passwordHash: hashPassword("admin@741"),
        name: "Admin User",
        role: "admin"
      });

      await newAdmin.save();
      console.log("Admin user created successfully with ID:", counter.seq);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
}

seedAdmin();
