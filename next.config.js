/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['raw.githubusercontent.com', 'your-image-domain.com'],
  },
};

module.exports = nextConfig;
