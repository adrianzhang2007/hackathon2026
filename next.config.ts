import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['hackathon.marscn.com', 'localhost', '192.168.111.133'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
