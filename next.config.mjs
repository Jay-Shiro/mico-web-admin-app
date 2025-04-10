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
};

export default nextConfig;
