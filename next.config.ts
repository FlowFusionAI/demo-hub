import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // demo-hub is nested inside other folders that have their own
    // package-lock.json — pin the workspace root to this app
    root: __dirname,
  },
};

export default nextConfig;
