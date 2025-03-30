/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image handling (compatible with Render backend)
  images: {
    unoptimized: true, // Disables Vercel's default image optimization
    domains: ['notebookforu-backend.onrender.com'], // Allow backend image URLs
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'notebookforu-backend.onrender.com',
      },
    ],
  },

  // Build settings
  output: 'standalone', // Creates optimized production bundle
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint during builds
  },

  // Enable React Strict Mode
  reactStrictMode: true,

  // Experimental features
  experimental: {
    serverActions: { // Corrected format - must be an object
      bodySizeLimit: '2mb', // Recommended to set a size limit
    },
    // Other experimental features can be added here
  }
};

module.exports = nextConfig;