/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'mjjkzamyqisgmiekwupp.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'logos-world.net',
      },
      {
        protocol: 'https',
        hostname: 'www.portoseguro.com.br',
      },
      {
        protocol: 'https',
        hostname: 'www.sulamerica.com.br',
      },
      {
        protocol: 'https',
        hostname: 'www.bradescoseguros.com.br',
      }
    ],
  },
  // Otimizações para PWA e mobile
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  // Configuração do Turbopack (Next.js 16+)
  turbopack: {},
  // Headers para PWA
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
