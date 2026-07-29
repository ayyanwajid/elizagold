import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: fontMode(),
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
  },
};

function fontMode() {
  return true;
}

export default nextConfig;
