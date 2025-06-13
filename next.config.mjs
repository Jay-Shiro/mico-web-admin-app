/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
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
  // Increase body size limits for file uploads
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
  // Configure experimental features for better file handling
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
