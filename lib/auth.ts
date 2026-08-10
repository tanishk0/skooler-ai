import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import client from "@/lib/mongodb";

function getCleanOrigin(urlStr?: string): string | null {
  if (!urlStr) return null;
  let trimmed = urlStr.trim();
  if (!trimmed) return null;
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    trimmed = `https://${trimmed}`;
  }
  try {
    return new URL(trimmed).origin;
  } catch {
    return null;
  }
}

function getBaseUrl(): string {
  const rawUrl = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";
  return getCleanOrigin(rawUrl) || "http://localhost:3000";
}

function getTrustedOrigins(): string[] {
  const origins = new Set<string>([
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
  ]);

  [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_API_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ].forEach((envVal) => {
    const origin = getCleanOrigin(envVal);
    if (origin) {
      origins.add(origin);
    }
  });

  return Array.from(origins);
}

export const auth = betterAuth({
  database: mongodbAdapter(client.db()),

  emailAndPassword: {
    enabled: true,
  },

  secret: process.env.BETTER_AUTH_SECRET,

  baseURL: getBaseUrl(),

  trustedOrigins: getTrustedOrigins(),
});

