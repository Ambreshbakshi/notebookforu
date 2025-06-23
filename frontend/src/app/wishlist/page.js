'use client';

import { FiStar } from "react-icons/fi";

export default function WishlistPage() {
  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold flex items-center mb-4">
        <FiStar className="mr-2" /> Your Wishlist
      </h1>
      <p className="text-gray-700">
        You haven't added any products to your wishlist yet. Browse our store and save your favorite items here!
      </p>

      {/* Later you can map wishlist items here */}
    </div>
  );
}
