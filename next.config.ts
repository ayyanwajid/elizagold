import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: fontMode(),
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    qualities: [25, 50, 70, 75, 80, 85, 90, 100],
  },
};

function fontMode() {
  return true;
}

export default nextConfig;
