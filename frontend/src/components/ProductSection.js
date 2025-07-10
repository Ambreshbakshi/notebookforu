// ProductSection.jsx - Complete updated code
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import productData from "@/data/productData";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FaHeart, FaRegHeart, FaStar, FaCartPlus, FaMinus, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(initialValue);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setReady(true);
    }
  }, [key]);

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (ready) {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue, ready];
};

const ProductSection = () => {
  const containerRef = useRef(null);
  const autoPlayRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [centerIndex, setCenterIndex] = useState(0);
  const [autoPlayActive, setAutoPlayActive] = useState(true);
  const [wishlist, setWishlist, isClient] = useLocalStorage("wishlist", []);
  const [quantityMap, setQuantityMap] = useState({});

  const notebooks = Object.values(productData.notebooks).map((item) => ({ ...item, type: "notebook" }));
  const diaries = Object.values(productData.diaries).map((item) => ({ ...item, type: "diary" }));
  const combinations = Object.values(productData.combinations || {}).map((item) => ({ ...item, type: "combination" }));

  const products = [...combinations, ...notebooks, ...diaries];

  const updateMobileStatus = () => setIsMobile(window.innerWidth <= 768);

  const checkScrollPosition = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollLeft, clientWidth } = containerRef.current;
    const cardWidth = isMobile ? window.innerWidth * 0.75 : 280;
    const centerPos = scrollLeft + clientWidth / 2;
    const index = Math.round(centerPos / (cardWidth + 20)) - 1;
    setCenterIndex(Math.max(0, Math.min(products.length - 1, index)));
  }, [isMobile, products.length]);

  const snapToCenter = useCallback(() => {
    if (!containerRef.current) return;
    const cardWidth = isMobile ? window.innerWidth * 0.75 : 280;
    const targetScroll = centerIndex * (cardWidth + 20) - (containerRef.current.clientWidth - cardWidth) / 2;
    containerRef.current.scrollTo({ left: targetScroll, behavior: "smooth" });
  }, [centerIndex, isMobile]);

  const handleScroll = useCallback(() => {
    checkScrollPosition();
  }, [checkScrollPosition]);

  useEffect(() => {
    updateMobileStatus();
    window.addEventListener("resize", updateMobileStatus);
    return () => window.removeEventListener("resize", updateMobileStatus);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll, { passive: true });
    container.addEventListener("mouseenter", () => setAutoPlayActive(false));
    container.addEventListener("mouseleave", () => setAutoPlayActive(true));

    return () => {
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("mouseenter", () => setAutoPlayActive(false));
      container.removeEventListener("mouseleave", () => setAutoPlayActive(true));
    };
  }, [handleScroll]);

  useEffect(() => {
    if (!autoPlayActive) return;
    autoPlayRef.current = setInterval(() => {
      const cardWidth = isMobile ? window.innerWidth * 0.75 : 280;
      if (containerRef.current) {
        containerRef.current.scrollBy({ left: cardWidth + 20, behavior: "smooth" });
      }
    }, 6000);
    return () => clearInterval(autoPlayRef.current);
  }, [autoPlayActive, isMobile]);

  const toggleWishlist = (product) => {
    const key = `${product.type}-${product.id}`;
    const updatedList = wishlist.includes(key)
      ? wishlist.filter((item) => item !== key)
      : [...wishlist, key];
    setWishlist(updatedList);
    toast[updatedList.includes(key) ? "success" : "info"](
      `${product.name} ${updatedList.includes(key) ? "added to" : "removed from"} wishlist`,
      { position: "bottom-right", autoClose: 2000, hideProgressBar: true }
    );
  };

  const addToCart = (product) => {
    try {
      const qty = quantityMap[`${product.type}-${product.id}`] || 1;
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const index = cart.findIndex((item) => item.id === product.id && item.type === product.type);
      if (index !== -1) {
        cart[index].quantity += qty;
      } else {
        cart.push({ ...product, quantity: qty });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success(`${product.name} added to cart`, { position: "bottom-right", autoClose: 2000 });
    } catch (error) {
      console.error("Cart error:", error);
    }
  };

  const getProductRoute = (type, id) => (type === "combination" ? `/combination/${id}` : `/${type}/${id}`);

  const updateQuantity = (productKey, change) => {
    setQuantityMap((prev) => {
      const newQty = Math.max(1, (prev[productKey] || 1) + change);
      return { ...prev, [productKey]: newQty };
    });
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Our Premium Collection</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover our handcrafted notebooks and diaries, perfect for your creative journey
        </p>
      </div>

      <div className="relative">
        {/* Desktop Arrows */}
        {!isMobile && (
          <>
            <button
              onClick={() => {
                setAutoPlayActive(false);
                const cardWidth = 280;
                containerRef.current.scrollBy({ left: -(cardWidth + 20), behavior: "smooth" });
              }}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white shadow rounded-full"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={() => {
                setAutoPlayActive(false);
                const cardWidth = 280;
                containerRef.current.scrollBy({ left: cardWidth + 20, behavior: "smooth" });
              }}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white shadow rounded-full"
            >
              <ChevronRight />
            </button>
          </>
        )}

        {/* Product List */}
        <div
          ref={containerRef}
          className={`flex gap-5 w-full overflow-x-auto no-scrollbar ${
            isMobile ? "snap-x snap-mandatory px-8" : "px-12"
          }`}
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {products.map((product, index) => {
            const productKey = `${product.type}-${product.id}`;
            const quantity = quantityMap[productKey] || 1;

            return (
              <div
                key={productKey}
                className={`flex-shrink-0 transition-all duration-300 ${
                  isMobile ? "w-[75vw] snap-center" : "w-[280px]"
                }`}
              >
                <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition h-full flex flex-col relative overflow-hidden border border-gray-100 hover:border-gray-200">
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                    <Link href={getProductRoute(product.type, product.id)} className="block w-full h-full">
                      <Image
                        src={product.gridImage || "/placeholder.png"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 75vw, 280px"
                        priority={index < 4}
                      />
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(product);
                      }}
                      className="absolute top-3 right-3 p-2 bg-white/80 rounded-full shadow hover:bg-white transition z-10"
                    >
                      {wishlist.includes(productKey) ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-gray-700" />}
                    </button>
                  </div>

                  <div className="mt-4 flex flex-col flex-1">
                    <h2 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2">{product.name}</h2>
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400 text-xs">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={i < (product.rating || 4) ? "text-yellow-400" : "text-gray-300"} />
                        ))}
                      </div>
                      <span className="text-gray-500 text-xs ml-1">({product.reviews || 24})</span>
                    </div>

                    <div className="flex items-center mb-2">
                      <p className="text-base font-bold text-indigo-600">
                        {product.maxPrice && product.maxPrice > product.price && (
                          <span className="line-through text-gray-400 mr-2">₹{product.maxPrice}</span>
                        )}
                        ₹{product.price}
                      </p>
                    </div>

                    {/* Quantity and Add to Cart */}
                    {/* <div className="mt-auto flex items-center gap-2">
                      <div className="flex items-center border rounded-md overflow-hidden">
                        <button
                          onClick={() => updateQuantity(productKey, -1)}
                          className="px-2 py-1 bg-gray-100 hover:bg-gray-200"
                        >
                          <FaMinus size={12} />
                        </button>
                        <span className="px-3 text-sm">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(productKey, 1)}
                          className="px-2 py-1 bg-gray-100 hover:bg-gray-200"
                        >
                          <FaPlus size={12} />
                        </button>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart(product);
                        }}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                      >
                        <FaCartPlus /> Add to Cart
                      </button>
                    </div> */}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Arrows + CTA */}
       <div className="mt-6 flex justify-center items-center gap-6">
  {isMobile && (
    <button
      onClick={() => {
        setAutoPlayActive(false);
        const cardWidth = window.innerWidth * 0.75;
        containerRef.current.scrollBy({ left: -(cardWidth + 20), behavior: "smooth" });
      }}
      className="p-2 bg-white shadow rounded-full"
    >
      <ChevronLeft />
    </button>
  )}

  <Link href="/notebook-gallery" legacyBehavior>
    <a className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md shadow hover:from-blue-700 hover:to-blue-800 transition-all transform hover:-translate-y-0.5">
      Explore All Products <ChevronRight size={20} className="ml-2" />
    </a>
  </Link>

  {isMobile && (
    <button
      onClick={() => {
        setAutoPlayActive(false);
        const cardWidth = window.innerWidth * 0.75;
        containerRef.current.scrollBy({ left: cardWidth + 20, behavior: "smooth" });
      }}
      className="p-2 bg-white shadow rounded-full"
    >
      <ChevronRight />
    </button>
  )}
</div>

      </div>
    </section>
  );
};

export default ProductSection;
