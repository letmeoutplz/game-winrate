import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  allowedDevOrigins: ["unrasping-unscabrously-davian.ngrok-free.dev"],
};

export default nextConfig;
