/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/index.html',
      },
    ];
  },
  experimental: {
    allowedDevOrigins: ["localhost:3000", "192.168.186.1:3000"]
  }
};

export default nextConfig;