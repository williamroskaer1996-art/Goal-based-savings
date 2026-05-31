import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Silence build warnings from optional peer deps
  typescript: { ignoreBuildErrors: false },
  eslint:     { ignoreDuringBuilds: true },
};

export default nextConfig;
