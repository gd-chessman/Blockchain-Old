/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
      domains: [
          'coin-images.coingecko.com',
      ],
      unoptimized: true,
  },
  async rewrites() {
      return [
          {
              source: '/api/:path*',
              destination: process.env.NEXT_PUBLIC_API_URL + '/api/:path*',
          },
      ];
  },
};

export default nextConfig;