/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  // Use relative paths so it works with file:// protocol
  basePath: '',
  assetPrefix: '',
}

module.exports = nextConfig
