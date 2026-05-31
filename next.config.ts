import type { NextConfig } from 'next';

const isPagesDeployment = process.env.GITHUB_PAGES === 'true';

const nextConfig: NextConfig = {
  output:      'export',
  basePath:    isPagesDeployment ? '/Goal-based-savings' : '',
  trailingSlash: true,
  images:      { unoptimized: true },
  eslint:      { ignoreDuringBuilds: true },
};

export default nextConfig;
