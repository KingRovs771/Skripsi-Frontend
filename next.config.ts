import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**', // Mengizinkan semua domain HTTPS untuk fleksibilitas saat deploy
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/public',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
