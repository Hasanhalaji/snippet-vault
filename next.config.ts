import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "export",
  distDir: "out",
  images: { unoptimized: true },
  // Tauri expects static files
  trailingSlash: true,
}

export default nextConfig
