import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // إعدادات الأداء
  compress: true,
  poweredByHeader: false,
  
  // Headers الأمان
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      // Cache headers لـ Static Assets
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // API headers
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ]
  },

  // Redirects للـ legacy routes
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/',
        permanent: false,
      },
    ]
  },

  // Rewrites للـ API
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/v1/:path*',
          destination: '/api/:path*',
        },
      ],
    }
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },

  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
    ],
  },
}

export default nextConfig
