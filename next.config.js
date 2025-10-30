/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Asegurar que los paths alias funcionen correctamente
  experimental: {
    serverComponentsExternalPackages: ['cheerio'],
  },
}

module.exports = nextConfig

