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
 
     // **Trigger Custom Event for Cart Update**
     window.dispatchEvent(new Event("cartUpdated"));
 
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
    <div className="min-h-screen pt-14 px-4 pb-16 bg-gradient-to-b from-white to-gray-50">
  <ToastContainer />
  <div className="max-w-7xl mx-auto pt-2 pb-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-3">Your Wishlist</h1>


        {wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {wishlistProducts.map((product) => (
              <div key={`${product.type}-${product.id}`} className="bg-white p-2 rounded-lg shadow-md flex flex-col group relative overflow-hidden border border-gray-100">
                
                <div className="relative w-full" style={{ paddingBottom: "100%" }}>
                  <Link href={product.type === "combination" ? `/combination/${product.id}` : `/${product.type}/${product.id}`} className="block w-full h-full">
                    <Image
                      src={product.gridImage || product.images?.[0] || "/placeholder.png"}
                      alt={product.name}
                      fill
                      className="object-contain rounded-lg transition group-hover:opacity-90"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                    />
                  </Link>

                  <button
                    onClick={() => removeFromWishlist(product)}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-gray-100 transition z-10"
                    aria-label="Remove from wishlist"
                  >
                    <FaHeart className="text-red-500 text-sm" />
                  </button>
                </div>

                <div className="mt-2 flex flex-col flex-1">
                  <h2 className="text-xs font-semibold text-gray-800 line-clamp-2 mb-1">
                    {product.name}
                  </h2>

                  <div className="flex items-center mb-1">
                    <div className="flex text-yellow-400 text-xs">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={i < (product.rating || 4) ? "text-yellow-400" : "text-gray-300"} />
                      ))}
                    </div>
                    <span className="text-gray-500 text-[10px] ml-1">({product.reviews || 24})</span>
                  </div>

                  <div className="flex items-center mb-1">
                    <p className="text-sm font-bold text-indigo-600">₹{product.price}</p>
                    {product.originalPrice && (
                      <p className="text-[10px] text-gray-500 line-through ml-1">₹{product.originalPrice}</p>
                    )}
                  </div>

                  <div className="mt-auto flex gap-1">
                    <button
                      onClick={() => addToCart(product)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-1 rounded flex items-center justify-center gap-1 text-xs"
                    >
                      <FaCartPlus /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 flex flex-col items-center justify-center">
            <div className="text-red-500 mb-6">
              <FaHeart className="text-7xl mx-auto" />
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
