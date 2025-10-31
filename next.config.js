/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removido 'standalone' - no es necesario en Vercel y causa problemas
  // Asegurar que los paths alias funcionen correctamente
  experimental: {
    serverComponentsExternalPackages: ['cheerio'],
  },
}

module.exports = nextConfig

