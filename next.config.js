/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/supabaseproxy/:path*',
        destination: 'https://kdzmgpqqgahgpidnqxdu.supabase.co/:path*' // Proxy to supabase
      }
    ]
  }
}

module.exports = nextConfig 