/** @type {import('next').NextConfig} */
const nextConfig = {
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
