import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  allowedDevOrigins: ["module-relieving-handstand.ngrok-free.dev"],
};

export default nextConfig;
