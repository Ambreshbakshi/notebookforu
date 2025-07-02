"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
  
const images = [
  {
    src: "/hero/hero7.jpg",
    alt: "Premium quality notebooks",
    caption: "Handcrafted with Care"
  },
  {
    src: "/hero/hero11.jpeg",
    alt: "Customizable notebook designs",
    caption: "Make It Your Own"
  },
  {
    src: "/hero/hero9.jpeg",
    alt: "Eco-friendly materials",
    caption: "Sustainable Choices"
  },
  {
    src: "/hero/hero8.jpeg",
    alt: "Notebook collection display",
    caption: "Endless Possibilities"
  },
  {
    src: "/hero/hero5.jpg",
    alt: "Writing in our notebooks",
    caption: "Perfect for Every Story"
  },
  {
    src: "/hero/hero6.jpg",
    alt: "Notebook accessories",
    caption: "Complete Your Set"
  },
];

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef();

  // Auto-slide effect with pause on hover
  useEffect(() => {
    const startRotation = () => {
      intervalRef.current = setInterval(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 5000);
    };

    if (!isHovered) {
      startRotation();
    }

    return () => clearInterval(intervalRef.current);
  }, [isHovered]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
    resetInterval();
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    resetInterval();
  };

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    resetInterval();
  };

  const resetInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
  };

  // Animation variants
  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0.7,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 }
      }
    },
    exit: (direction) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0.7,
    })
  };

  return (
    <div 
      className="relative w-full h-[60vh] min-h-[400px] max-h-[800px] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Slideshow */}
      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          <Image
            src={images[currentIndex].src}
            alt={images[currentIndex].alt}
            fill
            priority={currentIndex === 0}
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
          />
          
          {/* Image Caption */}
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center px-4"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-4">
                {images[currentIndex].caption}
              </h1>
              <p className="text-lg sm:text-xl text-white drop-shadow-md mb-6 max-w-2xl mx-auto">
                Discover our premium collection of handcrafted notebooks
              </p>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
     <button
  onClick={prevSlide}
  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 p-0 md:p-2 rounded-full text-white hover:bg-opacity-40 transition-all duration-300 z-20 backdrop-blur-sm"
  aria-label="Previous slide"
>
  <ChevronLeft size={32} strokeWidth={2.5} />
</button>

<button
  onClick={nextSlide}
  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 p-0 md:p-2 rounded-full text-white hover:bg-opacity-40 transition-all duration-300 z-20 backdrop-blur-sm"
  aria-label="Next slide"
>
  <ChevronRight size={32} strokeWidth={2.5} />
</button>


      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${currentIndex === index ? 'bg-white w-6' : 'bg-white bg-opacity-40'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* CTA Button */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
        <Link
          href="/notebook-gallery"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-2"
        >
          Browse Collection
          <ChevronRight size={20} className="inline" />
        </Link>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
    </div>
  );
};

export default Hero;