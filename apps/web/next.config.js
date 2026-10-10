/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: '10mb' }
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' }
    ]
  },
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: [
    '@dd/db-mongo',
    '@dd/redis-client',
    '@dd/security',
    '@dd/money',
    '@dd/payments',
    '@dd/shipping',
    '@dd/storage',
    '@dd/notifications',
    '@dd/auth',
    '@dd/validation',
    '@dd/shared-types',
    '@dd/config'
  ]
}

module.exports = nextConfig
