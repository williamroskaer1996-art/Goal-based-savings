/** @type {import('next').NextConfig} */
const isPagesDeployment = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  output: 'export',
  basePath: isPagesDeployment ? '/Goal-based-savings' : '',
  env: {
    NEXT_PUBLIC_BASE_PATH: isPagesDeployment ? '/Goal-based-savings' : '',
  },
  trailingSlash: true,
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
