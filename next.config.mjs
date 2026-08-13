const scriptSources =
  process.env.NODE_ENV === 'development'
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com"
    : "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/runtime-config.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self' https://*.razorpay.com; connect-src 'self' https://*.razorpay.com; frame-src https://*.razorpay.com; img-src 'self' data: blob: https://*.razorpay.com; font-src 'self' data:; style-src 'self' 'unsafe-inline'; ${scriptSources}; upgrade-insecure-requests`,
          },
        ],
      },
    ];
  },
}

export default nextConfig
