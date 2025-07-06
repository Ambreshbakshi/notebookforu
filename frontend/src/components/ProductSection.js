"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import productData from "@/data/productData";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FaHeart, FaRegHeart, FaStar, FaCartPlus, FaSearch } from "react-icons/fa";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(initialValue);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(error);
    }
  }, [key]);

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (isClient) {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

const ProductSection = () => {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [centerIndex, setCenterIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [autoPlayActive, setAutoPlayActive] = useState(true);
  const autoPlayRef = useRef(null);
  const [wishlist, setWishlist] = useLocalStorage("wishlist", []);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      checkScrollPosition();
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const notebooks = Object.values(productData.notebooks).map((item) => ({ ...item, type: "notebook" }));
  const diaries = Object.values(productData.diaries).map((item) => ({ ...item, type: "diary" }));
  const combinations = Object.values(productData.combinations || {}).map((item) => ({ ...item, type: "combination" }));
  const products = [...notebooks, ...diaries, ...combinations].sort((a, b) => {
    if (a.type === "combination") return -1;
    if (b.type === "combination") return 1;
    if (a.type === "notebook") return -1;
    if (b.type === "notebook") return 1;
    return 0;
  });

  const checkScrollPosition = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setIsAtStart(scrollLeft <= 10);
    setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 10);

    const cardWidth = isMobile ? window.innerWidth * 0.8 : 280;
    const centerPos = scrollLeft + clientWidth / 2;
    const newCenterIndex = Math.min(Math.max(0, Math.round(centerPos / (cardWidth + 20)) - 1, products.length - 1));
    setCenterIndex(newCenterIndex);
  }, [isMobile, products.length]);

  const snapToCenter = useCallback(() => {
    if (!containerRef.current) return;
    const cardWidth = isMobile ? window.innerWidth * 0.8 : 280;
    const targetScroll = centerIndex * (cardWidth + 20) - (containerRef.current.clientWidth - cardWidth) / 2;
    containerRef.current.scrollTo({ left: targetScroll, behavior: "smooth" });
  }, [centerIndex, isMobile]);

  const handleScrollLeft = useCallback(() => {
    setAutoPlayActive(false);
    if (containerRef.current) {
      const cardWidth = isMobile ? window.innerWidth * 0.8 : 280;
      containerRef.current.scrollBy({ left: -cardWidth - 20, behavior: "smooth" });
    }
  }, [isMobile]);

  const handleScrollRight = useCallback(() => {
    setAutoPlayActive(false);
    if (containerRef.current) {
      const cardWidth = isMobile ? window.innerWidth * 0.8 : 280;
      containerRef.current.scrollBy({ left: cardWidth + 20, behavior: "smooth" });
    }
  }, [isMobile]);

  const handleMouseDown = (e) => {
    setAutoPlayActive(false);
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    checkScrollPosition();
    setTimeout(snapToCenter, 100);
  };

  const handleMouseLeave = () => {
    if (isDragging) handleMouseUp();
  };

  const handleTouchStart = (e) => {
    setAutoPlayActive(false);
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].clientX;
    const walk = startX - x;
    containerRef.current.scrollLeft = scrollLeft + walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    checkScrollPosition();
    setTimeout(snapToCenter, 100);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", checkScrollPosition);
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("scroll", checkScrollPosition);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [checkScrollPosition]);

  useEffect(() => {
    if (!autoPlayActive) return;
    autoPlayRef.current = setInterval(() => {
      handleScrollRight();
    }, 3000);

    return () => clearInterval(autoPlayRef.current);
  }, [autoPlayActive, handleScrollRight]);

  const toggleWishlist = (product) => {
    const productKey = `${product.type}-${product.id}`;
    if (wishlist.includes(productKey)) {
      setWishlist(wishlist.filter(item => item !== productKey));
      toast.info(`${product.name} removed from wishlist`);
    } else {
      setWishlist([...wishlist, productKey]);
      toast.success(`${product.name} added to wishlist`);
    }
  };

  const isInWishlist = (product) => {
    if (!isClient) return false;
    return wishlist.includes(`${product.type}-${product.id}`);
  };

  const addToCart = (product) => {
  try {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItemIndex = cart.findIndex(
      (item) => item.id === product.id && item.type === product.type
    );

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += 1;
    } else {
      cart.push({
        id: product.id,
        type: product.type,
        name: product.name,
        price: product.price,
        gridImage: product.gridImage,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    toast.success(`${product.name} added to cart`);
  } catch (error) {
    toast.error("Failed to add item to cart");
    console.error("Error adding to cart:", error);
  }
};



  const getProductRoute = (type, id) => {
    return type === "combination" ? `/combination/${id}` : `/${type}/${id}`;
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Our Premium Collection
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our handcrafted notebooks and diaries, perfect for your creative journey
          </p>
        </div>

        <div className="relative">
          {!isMobile && (
            <>
              <button
                onClick={handleScrollLeft}
                disabled={isAtStart}
                className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-100 transition-all ${
                  isAtStart ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
                aria-label="Previous"
              >
                <ChevronLeft size={28} className="text-gray-700" strokeWidth={2.5} />
              </button>
              <button
                onClick={handleScrollRight}
                disabled={isAtEnd}
                className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-100 transition-all ${
                  isAtEnd ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
                aria-label="Next"
              >
                <ChevronRight size={28} className="text-gray-700" strokeWidth={2.5} />
              </button>
            </>
          )}

          <div
            ref={containerRef}
            className={`flex gap-5 w-full overflow-x-auto no-scrollbar ${
              isMobile ? "snap-x snap-mandatory px-4" : "px-12"
            }`}
            style={{
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              cursor: isDragging ? "grabbing" : "grab",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            {products.map((product, index) => {
              const isCenter = index === centerIndex;
              return (
                <div
                  key={`${product.type}-${product.id}`}
                  className={`flex-shrink-0 transition-all duration-300 ${
                    isMobile ? "w-[80vw] snap-center" : "w-[280px]"
                  }`}
                  style={{
                    transform: isCenter && !isMobile ? "scale(1.05)" : "scale(1)",
                    opacity: isCenter && !isMobile ? 1 : 0.95,
                    transition: "transform 0.3s ease, opacity 0.3s ease",
                  }}
                >
                  <div className="bg-white p-2 rounded-lg shadow-md hover:shadow-lg transition h-full flex flex-col group relative overflow-hidden border border-gray-100">
                    <div className="relative w-full" style={{ paddingBottom: "100%" }}>
                      <Link href={getProductRoute(product.type, product.id)} className="block w-full h-full">
                        <Image
                          src={product.gridImage || "/placeholder.png"}
                          alt={product.name}
                          fill
                          className="object-contain rounded-lg transition group-hover:opacity-90"
                          sizes="(max-width: 640px) 80vw, 280px"
                          priority={index < 4}
                        />
                      </Link>

                      {product.discount && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
                          -{product.discount}%
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleWishlist(product);
                        }}
                        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-gray-100 transition z-10"
                        aria-label={isInWishlist(product) ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        {isInWishlist(product) ? (
                          <FaHeart className="text-red-500 text-sm" />
                        ) : (
                          <FaRegHeart className="text-sm" />
                        )}
                      </button>
                    </div>

                    <div className="mt-2 flex flex-col flex-1">
                      <h2 className="text-xs font-semibold text-gray-800 line-clamp-2 mb-1">
                        {product.name}
                      </h2>

                      <div className="flex items-center mb-1">
                        <div className="flex text-yellow-400 text-xs">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={i < (product.rating || 4) ? "text-yellow-400" : "text-gray-300"}
                            />
                          ))}
                        </div>
                        <span className="text-gray-500 text-[10px] ml-1">({product.reviews || 24})</span>
                      </div>

                      <div className="flex items-center mb-1">
                        <p className="text-sm font-bold text-indigo-600">
                          {product.maxPrice && product.maxPrice > product.price && (
                            <span className="line-through text-gray-400 mr-1">₹{product.maxPrice}</span>
                          )}
                          ₹{product.price}
                        </p>
                      </div>

                      <div className="mt-auto flex gap-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(product);
                          }}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-1 rounded flex items-center justify-center gap-1 text-xs"
                        >
                          <FaCartPlus /> Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {isMobile && products.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {products.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCenterIndex(index);
                    snapToCenter();
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === centerIndex ? "bg-blue-600 w-4" : "bg-gray-300"
                  }`}
                  aria-label={`Go to item ${index + 1}`}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link href="/notebook-gallery" passHref>
              <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:-translate-y-0.5">
                Explore All Products
                <ChevronRight size={20} className="ml-2" strokeWidth={2.5} />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSection;