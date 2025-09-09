import mongoose from "mongoose";

let isConnected = false;

export async function connectDB(uri) {
  if (isConnected) return;

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(uri);
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    throw err;
  }
}
