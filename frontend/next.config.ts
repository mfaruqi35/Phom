import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: process.env.NODE_ENV === "production"
          ? "https://phom-backend.onrender.com/api/:path*"
          : "http://localhost:3001/api/:path*",
      },
    ];
  },
};

export default nextConfig;
