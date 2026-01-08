import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/uploads/projects/:path*",
        destination: "/api/uploads/projects/:path*",
      },
    ];
  },
};

export default nextConfig;
