import mongoose from "mongoose";
import "@/models";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const rawUri = process.env.MONGODB_URI;

  if (isProduction && !rawUri) {
    throw new Error("MONGODB_URI environment variable is required in production mode!");
  }

  const MONGODB_URI = rawUri || "mongodb://127.0.0.1:27017/infast-crm";

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
