'use client';

import { FiFileText } from "react-icons/fi";

export default function BlogPage() {
  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold flex items-center mb-4">
        <FiFileText className="mr-2" /> Blog
      </h1>
      <p className="text-gray-700">
        Welcome to our blog! Stay tuned for updates, tips, and insights about our products and services.
      </p>

      {/* You can later map blog posts here */}
    </div>
  );
}
