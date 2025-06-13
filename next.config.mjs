/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Suppress hydration warnings during development (only for known safe mismatches)
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "deliveryapi-ten.vercel.app",
      },
      {
        protocol: "https",
        hostname: "deliveryapi-plum.vercel.app",
      },
    ],
  },
  // Configure experimental features for better file handling
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
    // Enable optimistic UI updates
    optimisticClientCache: true,
  },
  // Compiler options to help with hydration
  compiler: {
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
