import { createAuthClient } from "better-auth/react";

function getClientBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  let envUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000";
  envUrl = envUrl.trim();
  if (!envUrl.startsWith("http://") && !envUrl.startsWith("https://")) {
    envUrl = `https://${envUrl}`;
  }
  try {
    return new URL(envUrl).origin;
  } catch {
    return "http://localhost:3000";
  }
}

export const authClient = createAuthClient({
  baseURL: getClientBaseUrl(),
});

export const { signIn, signUp, signOut, useSession } = authClient;