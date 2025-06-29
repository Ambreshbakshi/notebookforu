"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaHeart, FaCartPlus, FaStar } from "react-icons/fa";
import productData from "@/data/productData";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      setWishlist(savedWishlist);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const { allProducts } = useMemo(() => {
    const notebooks = Object.entries(productData.notebooks || {}).map(([key, item]) => ({
      ...item,
      key,
      type: "notebook",
    }));
    const diaries = Object.entries(productData.diaries || {}).map(([key, item]) => ({
      ...item,
      key,
      type: "diary",
    }));
    const combinations = Object.entries(productData.combinations || {}).map(([key, item]) => ({
      ...item,
      key,
      type: "combination",
    }));
    return { allProducts: [...notebooks, ...diaries, ...combinations] };
  }, []);

  const wishlistProducts = useMemo(() => {
    return allProducts.filter((product) =>
      wishlist.includes(`${product.type}-${product.id}`)
    );
  }, [allProducts, wishlist]);

  const removeFromWishlist = (product) => {
    const updatedWishlist = wishlist.filter(
      (item) => item !== `${product.type}-${product.id}`
    );
    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
    toast.info(`${product.name} removed from wishlist`);
  };

  const addToCart = (product) => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const existingItemIndex = cart.findIndex(
        (item) => item.key === product.key && item.type === product.type
      );

      if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
      } else {
        cart.push({
          key: product.key,
          id: product.id,
          type: product.type,
          quantity: 1,
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      toast.error("Failed to add item to cart");
      console.error("Error adding to cart:", error);
    }
  };

  if (!isClient) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen px-4 pb-16 bg-gradient-to-b from-white to-gray-50">
      <ToastContainer />
      <div className="max-w-7xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Wishlist</h1>

        {wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistProducts.map((product) => (
              <div key={`${product.type}-${product.id}`} className="bg-white p-4 rounded-xl shadow-md flex flex-col group">
                <div className="relative flex-1 flex justify-center items-center">
                  <Link href={product.type === "combination" ? `/combination/${product.id}` : `/${product.type}/${product.id}`}>
                    <div className="relative w-full" style={{ paddingBottom: "141.4%" }}>
                      <Image
                        src={product.gridImage || "/placeholder.png"} 
                        alt={product.name}
                        fill
                        className="object-contain rounded-lg"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                  </Link>

                  <button
                    onClick={() => removeFromWishlist(product)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition"
                    aria-label="Remove from wishlist"
                  >
                    <FaHeart className="text-red-500" />
                  </button>
                </div>

                <div className="mt-4">
                  <h2 className="text-lg font-semibold text-gray-800 line-clamp-2">
                    <Link href={product.type === "combination" ? `/combination/${product.id}` : `/${product.type}/${product.id}`}>
                      {product.name}
                    </Link>
                  </h2>

                  <div className="flex items-center mt-1">
                    <div className="flex text-yellow-400 text-sm">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={i < (product.rating || 4) ? "text-yellow-400" : "text-gray-300"} />
                      ))}
                    </div>
                    <span className="text-gray-500 text-sm ml-1">({product.reviews || 24})</span>
                  </div>

                  <div className="mt-2 flex items-center">
                    <p className="text-lg font-bold text-indigo-600">Rs. {product.price}</p>
                    {product.originalPrice && (
                      <p className="text-sm text-gray-500 line-through ml-2">Rs. {product.originalPrice}</p>
                    )}
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition text-sm"
                  >
                    <FaCartPlus /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 flex flex-col items-center justify-center">
            <div className="w-48 h-48 relative mb-6">
              <Image
                src="/empty-wishlist.png"
                alt="Empty Wishlist"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-xl text-gray-600 mb-4">Your wishlist is empty.</p>
            <Link href="/">
              <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                Browse Products
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
