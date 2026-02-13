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
};

export default nextConfig;
