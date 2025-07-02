"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import productData from "@/data/productData";

const ProductSection = () => {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [centerIndex, setCenterIndex] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const products = [
    ...Object.values(productData.combinations || {}).map((item) => ({ ...item, type: "combination" })),
    ...Object.values(productData.notebooks).map((item) => ({ ...item, type: "notebook" })),
    ...Object.values(productData.diaries).map((item) => ({ ...item, type: "diary" })),
  ];

  const checkScrollPosition = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setIsAtStart(scrollLeft <= 10);
    setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 10);

    const cardWidth = isMobile ? window.innerWidth * 0.6 : 280;
    const centerPos = scrollLeft + clientWidth / 2;
    const newCenterIndex = Math.round(centerPos / (cardWidth + 16)) - 1;
    setCenterIndex(newCenterIndex);
  };

  const scrollByAmount = (direction) => {
    if (!containerRef.current) return;
    const cardWidth = isMobile ? window.innerWidth * 0.6 : 280;
    containerRef.current.scrollBy({
      left: direction * (cardWidth + 16),
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startX = 0;
    let isDragging = false;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      const x = e.touches[0].clientX;
      const diff = startX - x;
      container.scrollLeft += diff;
      startX = x;
    };

    const handleTouchEnd = () => {
      isDragging = false;
      checkScrollPosition();
    };

    const handleScroll = () => {
      checkScrollPosition();
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleTouchEnd);
    container.addEventListener("scroll", handleScroll);

    checkScrollPosition();

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [isMobile]);

  return (
    <section className="py-8 px-4 overflow-hidden">
      <h1 className="text-center text-xl md:text-2xl font-bold mb-4 md:mb-6">Our Products</h1>

      <div className="relative flex items-center overflow-hidden">
        {!isAtStart && (
          <button
            className={`absolute left-0 z-10 ${
              isMobile
                ? "text-xl bg-white/80 rounded-full p-2 shadow-lg"
                : "bg-gray-800 text-white p-2 rounded-full"
            }`}
            onClick={() => scrollByAmount(-1)}
            aria-label="Scroll left"
          >
            {isMobile ? "←" : "❮"}
          </button>
        )}

        <div
          ref={containerRef}
          className={`flex gap-4 w-full no-scrollbar ${
            isMobile ? "overflow-x-auto snap-x px-2" : "overflow-hidden"
          }`}
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            overflowY: "hidden",
          }}
        >
          {products.map((product, index) => {
            const isCenter = index === centerIndex;
            return (
              <div
                key={`${product.type}-${product.id}`}
                className={`flex-shrink-0 transition-transform duration-300 ${
                  isMobile ? "w-[60vw] snap-center" : "w-[280px]"
                }`}
                style={{
                  transform: isCenter ? "scale(1.05)" : "scale(0.9)",
                  opacity: isCenter ? 1 : 0.7,
                }}
              >
                <Link href={`/${product.type}/${product.id}`} className="block h-full">
                  <div className="border rounded-lg shadow-sm overflow-hidden bg-white h-full flex flex-col">
                    <div className="relative" style={{ paddingBottom: "141.4%" }}>
                      <Image
                        src={product.gridImage}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 60vw, 280px"
                        className="object-contain"
                      />
                      {product.type === "combination" && (
                        <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-md text-xs font-bold">
                          COMBO
                        </div>
                      )}
                    </div>
                    <div className="p-3 text-center flex-grow flex flex-col justify-center">
                      <h3 className="text-sm font-medium line-clamp-1">
                        {product.type === "combination" ? (
                          <span className="text-blue-600">{product.name}</span>
                        ) : (
                          product.name
                        )}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {product.type === "combination" ? (
                          <span className="text-green-600 font-semibold">{product.price}</span>
                        ) : (
                          `Rs. ${product.price}`
                        )}
                      </p>
                      {product.type === "combination" && (
                        <p className="text-xs text-gray-500 mt-1">Special value pack</p>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {!isAtEnd && (
          <button
            className={`absolute right-0 z-10 ${
              isMobile
                ? "text-xl bg-white/80 rounded-full p-2 shadow-lg"
                : "bg-gray-800 text-white p-2 rounded-full"
            }`}
            onClick={() => scrollByAmount(1)}
            aria-label="Scroll right"
          >
            {isMobile ? "→" : "❯"}
          </button>
        )}
      </div>

      <div className="text-center mt-6">
        <Link href="/notebook-gallery" className="inline-block">
          <span className="text-blue-600 font-medium hover:underline text-sm md:text-base">
            View All Products
          </span>
        </Link>
      </div>
    </section>
  );
};

export default ProductSection;
