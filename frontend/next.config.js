/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      unoptimized: true, // Fixes image loading issues from the public folder
    },
  };
  
  module.exports = nextConfig; // Using CommonJS export for better compatibility
  module.exports = {
    eslint: {
      ignoreDuringBuilds: true,
    },
  };
  