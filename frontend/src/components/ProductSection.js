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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const notebooks = Object.values(productData.notebooks).map((item) => ({
    ...item,
    type: "notebook",
  }));
  const diaries = Object.values(productData.diaries).map((item) => ({
    ...item,
    type: "diary",
  }));
  const products = [...notebooks, ...diaries];

  const checkScrollPosition = () => {
    if (!containerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setIsAtStart(scrollLeft === 0);
    setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 10);
  };

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: -300,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: 300,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startX = 0;
    let isScrolling = false;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      isScrolling = true;
      // Disable vertical scroll only for this container
      container.style.touchAction = 'pan-y';
      container.style.overflowY = 'hidden';
    };

    const handleTouchMove = (e) => {
      if (!isScrolling) return;
      const x = e.touches[0].clientX;
      const diff = startX - x;
      
      if (Math.abs(diff) > 10) {
        container.scrollLeft += diff;
        startX = x;
      }
    };

    const handleTouchEnd = () => {
      isScrolling = false;
      checkScrollPosition();
      // Re-enable default touch behavior
      container.style.touchAction = '';
      container.style.overflowY = '';
    };

    const handleScroll = () => {
      checkScrollPosition();
    };

    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchmove", handleTouchMove);
    container.addEventListener("touchend", handleTouchEnd);
    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section className="py-8 px-4">
      <h1 className="text-center text-xl md:text-2xl font-bold mb-4 md:mb-6">Our Products</h1>
      
      {/* Container with vertical scroll disabled only for this section */}
      <div 
        className="relative flex items-center"
        style={{
          overflowY: 'hidden',
          touchAction: isMobile ? 'pan-y' : 'auto'
        }}
      >
        {!isAtStart && (
          <button
            className={`absolute left-0 z-10 ${
              isMobile 
                ? "text-xl bg-white/80 rounded-full p-2 shadow-lg" 
                : "bg-gray-800 text-white p-2 rounded-full"
            }`}
            onClick={scrollLeft}
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
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            overflowY: 'hidden' // Disable vertical scroll
          }}
        >
          {products.map((product) => (
            <div
              key={`${product.type}-${product.id}`}
              className={`flex-shrink-0 ${
                isMobile 
                  ? "w-[60vw] snap-center"  // Wider mobile size for A4 proportions
                  : "w-[280px]" // Fixed desktop size for A4
              }`}
            >
              <Link href={`/${product.type}/${product.id}`} className="block h-full">
                <div className="border rounded-lg shadow-sm overflow-hidden bg-white h-full flex flex-col">
                  {/* A4 aspect ratio container (210:297 ≈ 1:1.414) */}
                  <div className="relative" style={{ paddingBottom: '141.4%' }}>
                    <Image 
                      src={product.gridImage} 
                      alt={product.name} 
                      fill
                      sizes="(max-width: 768px) 60vw, 280px"
                      className="object-contain"
                      priority={false}
                    />
                  </div>
                  <div className="p-3 text-center flex-grow flex flex-col justify-center">
                    <h3 className="text-sm font-medium line-clamp-1">{product.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">Rs. {product.price}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {!isAtEnd && (
          <button
            className={`absolute right-0 z-10 ${
              isMobile 
                ? "text-xl bg-white/80 rounded-full p-2 shadow-lg" 
                : "bg-gray-800 text-white p-2 rounded-full"
            }`}
            onClick={scrollRight}
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