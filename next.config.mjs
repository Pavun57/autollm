/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  reactStrictMode: false,
  // Suppress webpack logs
  webpack: (config, { isServer }) => {
    config.infrastructureLogging = {
      level: 'error',
    };
    return config;
  },
}

export default nextConfig
