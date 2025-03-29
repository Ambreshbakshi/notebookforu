"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight, FaStar } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import customerData from "@/data/customerData";

const CustomerReviews = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef();

  // Fetch reviews from customer data
  useEffect(() => {
    const fetchReviews = () => {
      try {
        const allReviews = customerData.getAllReviews();
        setReviews(allReviews);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading reviews:", error);
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Auto-rotation effect
  useEffect(() => {
    if (reviews.length > 0) {
      intervalRef.current = setInterval(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
      }, 5000);

      return () => clearInterval(intervalRef.current);
    }
  }, [reviews]);

  const nextReview = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
    resetInterval();
  };

  const prevReview = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    resetInterval();
  };

  const goToReview = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    resetInterval();
  };

  const resetInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
  };

  // Animation variants
  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      position: "absolute"
    }),
    center: {
      x: 0,
      opacity: 1,
      position: "relative"
    },
    exit: (direction) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      position: "absolute"
    })
  };

  if (isLoading) {
    return (
      <section className="py-12 px-4 bg-gray-50 rounded-lg">
        <div className="max-w-3xl mx-auto text-center">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-6"></div>
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="animate-pulse flex flex-col items-center">
              <div className="rounded-full bg-gray-200 h-24 w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mt-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
              <div className="flex mt-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-5 w-5 bg-gray-200 rounded-full mx-1"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section className="py-12 px-4 bg-blue-50 rounded-lg">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Customer Reviews</h2>
          <p className="text-gray-600">No reviews yet. Be the first to review our products!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 sm:px-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 text-center">
          What Our Customers Say
        </h2>
        
        <div className="relative flex items-center justify-center">
          {/* Navigation Arrows */}
          <button 
            onClick={prevReview}
            className="absolute left-0 sm:left-4 z-10 bg-white/80 text-blue-600 p-3 rounded-full shadow-lg hover:bg-blue-600 hover:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Previous review"
          >
            <FaChevronLeft size={20} />
          </button>

          {/* Reviews Container */}
          <div className="w-full max-w-3xl mx-12 sm:mx-16 overflow-hidden relative min-h-[300px]">
            <AnimatePresence custom={direction} initial={false}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="w-full top-0 left-0"
              >
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative shrink-0">
                      <Image
                        src={reviews[currentIndex].customerImage || "/customers/default-profile.png"}
                        alt={`${reviews[currentIndex].customerName}'s profile`}
                        width={120}
                        height={120}
                        className="rounded-full border-4 border-blue-400 shadow-md object-cover"
                        priority={currentIndex === 0}
                      />
                      <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full p-2 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-center md:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {reviews[currentIndex].customerName}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {new Date(reviews[currentIndex].date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 mt-3 italic">
                        "{reviews[currentIndex].comment}"
                      </p>
                      <div className="flex justify-center md:justify-start mt-4">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`w-5 h-5 ${i < reviews[currentIndex].rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Reviewed: {reviews[currentIndex].productName}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <button 
            onClick={nextReview}
            className="absolute right-0 sm:right-4 z-10 bg-white/80 text-blue-600 p-3 rounded-full shadow-lg hover:bg-blue-600 hover:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Next review"
          >
            <FaChevronRight size={20} />
          </button>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center mt-8 gap-2">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => goToReview(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${currentIndex === index ? 'bg-blue-600 w-6' : 'bg-blue-300'}`}
              aria-label={`Go to review ${index + 1} of ${reviews.length}`}
            />
          ))}
        </div>

        {/* Review stats */}
        <div className="mt-6 text-center text-gray-600">
          Showing {currentIndex + 1} of {reviews.length} reviews
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;