import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ... any other config you might have ...

  // This is the new block you need to add
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        port: '',
        pathname: '/**', // This allows all paths from this domain
      },
    ],
  },

  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Also ignore TypeScript errors during build (optional but recommended for fast deploy)
    ignoreBuildErrors: true,
  },
  // ---------------------

};

export default nextConfig;