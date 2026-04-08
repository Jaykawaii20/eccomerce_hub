/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/shop', destination: '/store/products', permanent: false },
      { source: '/shop/:path*', destination: '/store/products/:path*', permanent: false },
      { source: '/about', destination: '/store/about', permanent: false },
      { source: '/contact', destination: '/store/contact', permanent: false },
      { source: '/deals', destination: '/store/products', permanent: false },
      { source: '/sale', destination: '/store/products', permanent: false },
    ];
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.supabase.co http://localhost:4000",
              "connect-src 'self' https://*.supabase.co https://eccomerce-hub.vercel.app http://localhost:4000 http://localhost:3000",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
