"use client";

import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const AboutUs = () => {
  // Counter animation for 10 designs
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (inView) {
      const interval = setInterval(() => {
        setCount(prev => {
          const nextCount = prev + 0.5; // Smooth increment
          return nextCount >= 10 ? 10 : nextCount;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [inView]);

  return (
    <section className="py-16 px-4 sm:px-6 bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Image Section with Animated Badge */}
          <div className="w-full lg:w-1/2 relative">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl"
            >
              <Image
                src="/about/about-us.jpg"
                alt="NotebookForU design team at work"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </motion.div>

            {/* Modern Link with Counter */}
            <Link
              href="/notebook-gallery"
              ref={ref}
              className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg hidden md:flex items-center hover:scale-105 transition-transform duration-300 cursor-pointer group"
              aria-label="View our 10+ notebook designs"
            >
              <div className="bg-blue-100 p-3 rounded-full mr-3 group-hover:rotate-12 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-gray-800">
                  {Math.floor(count)}+
                </p>
                <p className="text-sm text-gray-600">Unique Designs</p>
              </div>
            </Link>
          </div>

          {/* Text Content with Animations */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 space-y-6"
          >
            <span className="inline-block bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-sm font-medium">
              Our Story
            </span>
            
            <h2 className="text-4xl font-bold text-gray-900 leading-tight">
              Crafting Inspiration <br className="hidden sm:block" />
              <span className="text-blue-600">One Page at a Time</span>
            </h2>
            
            <p className="text-lg text-gray-700 leading-relaxed">
              Founded in 2015, NotebookForU began as a small passion project between two stationery enthusiasts. 
              Today, we're a team of designers dedicated to creating premium notebooks that 
              blend functionality with artistic expression.
            </p>
            
            <div className="grid grid-cols-2 gap-4 my-6">
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
              >
                <h3 className="font-bold text-gray-900 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Premium Materials
                </h3>
                <p className="text-sm text-gray-600 mt-1">Eco-friendly paper and covers</p>
              </motion.div>
              
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
              >
                <h3 className="font-bold text-gray-900 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Handcrafted
                </h3>
                <p className="text-sm text-gray-600 mt-1">Artisan quality craftsmanship</p>
              </motion.div>
            </div>

            <Link href="/about-us" className="inline-block">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                Discover Our Journey
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;