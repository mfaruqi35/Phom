import { createAuthClient } from "better-auth/react";

export const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Client-side: use relative path to go through Next.js proxy/rewrites
    return "";
  }
  // Server-side: must use absolute URL (Next.js server-side node fetch doesn't support relative URLs)
  const isProd = process.env.NODE_ENV === "production";
  return process.env.NEXT_PUBLIC_API_URL || (isProd ? "https://phom-backend.onrender.com" : "http://localhost:3001");
};

export const authClient = createAuthClient({
  baseURL: getApiBaseUrl(),
});
