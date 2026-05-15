import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  cached.promise =
    cached.promise || mongoose.connect(process.env.MONGODB_URI);

  cached.conn = await cached.promise;
  return cached.conn;
}