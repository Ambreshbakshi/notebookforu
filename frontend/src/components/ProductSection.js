"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import productData from "@/data/productData";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ProductSection = () => {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [centerIndex, setCenterIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(checkScrollPosition, 100);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
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

    const cardWidth = isMobile ? window.innerWidth * 0.7 : 260;
    const centerPos = scrollLeft + clientWidth / 2;
    const newCenterIndex = Math.min(Math.max(0, Math.round(centerPos / (cardWidth + 16)) - 1), products.length - 1);
    setCenterIndex(newCenterIndex);
  }, [isMobile, products.length]);

  const handleScrollLeft = useCallback(() => {
    if (containerRef.current) {
      const cardWidth = isMobile ? window.innerWidth * 0.8 : 320;
      containerRef.current.scrollBy({ left: -cardWidth - 16, behavior: "smooth" });
    }
  }, [isMobile]);

  const handleScrollRight = useCallback(() => {
    if (containerRef.current) {
      const cardWidth = isMobile ? window.innerWidth * 0.8 : 320;
      containerRef.current.scrollBy({ left: cardWidth + 16, behavior: "smooth" });
    }
  }, [isMobile]);

  const handleMouseDown = (e) => {
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
  };

  const handleMouseLeave = () => {
    if (isDragging) handleMouseUp();
  };

  const handleTouchStart = (e) => {
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
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") handleScrollLeft();
      if (e.key === "ArrowRight") handleScrollRight();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleScrollLeft, handleScrollRight]);

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-center text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-gray-900">
          Our Premium Collection
        </h1>

        <div>
          <div
            ref={containerRef}
            className={`flex gap-6 w-full no-scrollbar ${
              isMobile ? "overflow-x-auto snap-x px-4" : "overflow-hidden px-2"
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
                    isMobile ? "w-[70vw] snap-center" : "w-[260px]"
                  }`}
                  style={{
                    transform: isCenter ? "scale(1.05)" : "scale(0.95)",
                    opacity: isCenter ? 1 : 0.85,
                  }}
                >
                  <Link href={`/${product.type}/${product.id}`} className="block h-full">
                    <div className="border rounded-xl shadow-sm overflow-hidden bg-white h-full flex flex-col hover:shadow-md transition-shadow">
                      <div className="relative" style={{ paddingBottom: "100%" }}>
                        <Image
                          src={product.gridImage}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 70vw, 260px"
                          className="object-contain"
                          priority={index < 3}
                        />
                        {product.type === "combination" && (
                          <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-2 py-0.5 rounded-md text-xs font-bold shadow-sm">
                            COMBO OFFER
                          </div>
                        )}
                      </div>
                      <div className="p-2 text-center flex-grow flex flex-col justify-center">
                        <h3 className="text-sm font-semibold line-clamp-1">
                          {product.type === "combination" ? (
                            <span className="text-blue-600">{product.name}</span>
                          ) : (
                            product.name
                          )}
                        </h3>
                        <p
                          className={`mt-1 ${
                            product.type === "combination"
                              ? "text-green-600 font-bold text-base"
                              : "text-gray-700 font-medium text-sm"
                          }`}
                        >
                          {product.type === "combination" ? product.price : `Rs. ${product.price}`}
                        </p>
                        {product.type === "combination" && (
                          <p className="text-xs text-gray-500 mt-0.5">Save up to 15%</p>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center items-center gap-4 mt-8 flex-wrap">
            <button
              className="bg-white text-gray-800 p-3 rounded-full shadow-md hover:bg-gray-100 transition-colors disabled:opacity-50"
              onClick={handleScrollLeft}
              aria-label="Scroll left"
              disabled={isAtStart}
            >
              <ChevronLeft size={24} strokeWidth={2} />
            </button>

            <Link href="/notebook-gallery" passHref>
              <button className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                Explore All Products
                <ChevronRight size={18} className="ml-1" />
              </button>
            </Link>

            <button
              className="bg-white text-gray-800 p-3 rounded-full shadow-md hover:bg-gray-100 transition-colors disabled:opacity-50"
              onClick={handleScrollRight}
              aria-label="Scroll right"
              disabled={isAtEnd}
            >
              <ChevronRight size={24} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
