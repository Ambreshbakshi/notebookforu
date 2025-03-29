/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image handling (compatible with Render backend)
  images: {
    unoptimized: true, // Disables Vercel's default image optimization
    domains: ['notebookforu-backend.onrender.com'], // Allow backend image URLs
  },

  // Build settings
  output: 'standalone', // Creates optimized production bundle
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint during builds
  },

  // Enable React Strict Mode
  reactStrictMode: true,

  // Vercel-specific optimizations
  experimental: {
    serverActions: true, // Enable if using Next.js 13+ server actions
  }
};

module.exports = nextConfig;