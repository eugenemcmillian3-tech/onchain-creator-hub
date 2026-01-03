/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for Cloudflare Pages compatibility
  experimental: {
    serverMinification: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vercel.app',
      },
      {
        protocol: 'https',
        hostname: '**.neynar.com',
      },
      {
        protocol: 'https',
        hostname: '**.onrender.com',
      },
    ],
  },
  // Disable features that require server during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
