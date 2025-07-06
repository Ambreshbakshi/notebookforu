"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const images = [
  { src: "https://ik.imagekit.io/h5by6dwco/public/hero/hero11.jpeg", alt: "Customizable notebook designs", caption: "Make It Your Own" },
  { src: "https://ik.imagekit.io/h5by6dwco/public/hero/hero7.jpg", alt: "Premium quality notebooks", caption: "Handcrafted with Care" },
  { src: "https://ik.imagekit.io/h5by6dwco/public/hero/hero15.jpeg", alt: "Writing in our notebooks", caption: "Perfect for Every Story" },
  { src: "https://ik.imagekit.io/h5by6dwco/public/hero/hero8.jpeg", alt: "Notebook collection display", caption: "Endless Possibilities" },
  { src: "https://ik.imagekit.io/h5by6dwco/public/hero/hero13.jpg", alt: "Eco-friendly materials", caption: "Sustainable Choices" },
  { src: "https://ik.imagekit.io/h5by6dwco/public/hero/hero6.jpg", alt: "Notebook accessories", caption: "Complete Your Set" },
];

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef();

  useEffect(() => {
    const startRotation = () => {
      intervalRef.current = setInterval(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 5000);
    };
    if (!isHovered) startRotation();
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

  const variants = {
    enter: (direction) => ({ x: direction > 0 ? "100%" : "-100%", opacity: 0.7 }),
    center: { x: 0, opacity: 1, transition: { x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.5 } } },
    exit: (direction) => ({ x: direction < 0 ? "100%" : "-100%", opacity: 0.7 }),
  };

  return (
    <div
      className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] max-h-[800px] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
          <div className="relative w-full h-full overflow-hidden">
            {/* Blurred Background */}
            <Image
              src={images[currentIndex].src}
              alt="Background Blur"
              fill
              className="object-cover filter blur-md scale-110 z-0"
              priority={currentIndex === 0}
            />

            {/* Main Image */}
         <Image
  src={images[currentIndex].src}
  alt={images[currentIndex].alt}
  fill
  priority={currentIndex === 0}
  className="object-cover sm:object-contain object-center z-0"
  sizes="(max-width: 768px) 100vw, 100vw"
/>


            {/* Caption */}
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center px-4"
              >
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white drop-shadow-lg mb-2 sm:mb-4">
                  {images[currentIndex].caption}
                </h1>
               <p className="text-sm sm:text-lg text-white drop-shadow-md mb-3 sm:mb-6 max-w-[90%] sm:max-w-2xl mx-auto text-center px-4">
  Discover our premium collection of handcrafted notebooks
</p>

              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 p-0 sm:p-2 rounded-full text-white hover:bg-opacity-40 transition-all duration-300 z-20 backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} strokeWidth={2} />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 p-0 sm:p-2 rounded-full text-white hover:bg-opacity-40 transition-all duration-300 z-20 backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight size={24} strokeWidth={2} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              currentIndex === index ? "bg-white w-5" : "bg-white bg-opacity-40"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* CTA */}
     <div className="absolute bottom-12 sm:bottom-10 left-1/2 -translate-x-1/2 z-20">
  <Link
    href="/notebook-gallery"
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-1.5 sm:py-3 text-sm sm:text-lg font-medium rounded-full shadow-md transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-1.5"
  >
    Browse Collection
    <ChevronRight size={14} className="inline" />
  </Link>
</div>


      {/* Gradient */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
    </div>
  );
};

export default Hero;
