import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;

const globalWithMongo = globalThis as typeof globalThis & {
  _mongoClient?: MongoClient;
  _mongoClientPromise?: Promise<MongoClient>;
};

if (!globalWithMongo._mongoClient) {
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  globalWithMongo._mongoClient = client;
  globalWithMongo._mongoClientPromise = client.connect().catch((err) => {
    delete globalWithMongo._mongoClient;
    delete globalWithMongo._mongoClientPromise;
    throw err;
  });
}

const client = globalWithMongo._mongoClient;
const clientPromise = globalWithMongo._mongoClientPromise;

export default client;
export { clientPromise };