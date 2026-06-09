import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

const isProd = !!(process.env.NODE_ENV === "production" || 
  (process.env.BETTER_AUTH_URL && 
   !process.env.BETTER_AUTH_URL.includes("localhost") && 
   !process.env.BETTER_AUTH_URL.includes("127.0.0.1")));

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: "https://phom-backend.onrender.com/api/auth/callback/google",
    },
  },
  trustedOrigins: [process.env.FRONTEND_URL].filter(Boolean) as string[],
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  advanced: {
    trustedProxyHeaders: true,
    useSecureCookies: isProd,
    defaultCookieAttributes: {
      sameSite: isProd ? "none" : undefined,
      secure: isProd ? true : undefined,
    },
  },
});
