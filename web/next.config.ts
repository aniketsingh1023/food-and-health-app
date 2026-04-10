import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,
  // Disable noisy telemetry in CI
  poweredByHeader: false,
};

export default nextConfig;
