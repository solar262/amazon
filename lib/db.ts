import { MongoClient, Db } from "mongodb";
import { requirePersistentStore } from "./runtime";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    if (requirePersistentStore()) throw new Error("MONGODB_URI is required in production mode.");
    return null;
  }
  if (db) return db;
  try {
    client = client || new MongoClient(uri);
    await client.connect();
    db = client.db(process.env.MONGODB_DB || "storefront");
    return db;
  } catch (error) {
    if (requirePersistentStore()) throw new Error("MongoDB connection failed in production mode.");
    console.warn("MongoDB unavailable; using seed data only.", error);
    return null;
  }
}
