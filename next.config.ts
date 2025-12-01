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
};

export default nextConfig;