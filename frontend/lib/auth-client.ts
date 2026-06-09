import { createAuthClient } from "better-auth/react";

export const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      const envUrl = process.env.NEXT_PUBLIC_API_URL;
      if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
        return envUrl;
      }
      return "https://phom-backend.onrender.com";
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
};

export const authClient = createAuthClient({
  baseURL: getApiBaseUrl(),
});
