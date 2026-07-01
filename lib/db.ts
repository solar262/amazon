import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  if (db) return db;
  try {
    client = client || new MongoClient(uri);
    await client.connect();
    db = client.db(process.env.MONGODB_DB || "storefront");
    return db;
  } catch (error) {
    console.warn("MongoDB unavailable; using seed data only.", error);
    return null;
  }
}
