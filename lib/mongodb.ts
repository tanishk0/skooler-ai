import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;

const globalWithMongo = globalThis as typeof globalThis & {
  _mongoClient?: MongoClient;
};

const client = globalWithMongo._mongoClient ?? new MongoClient(uri);

if (process.env.NODE_ENV !== "production") {
  globalWithMongo._mongoClient = client;
}

export default client;