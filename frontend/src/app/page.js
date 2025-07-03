"use client";

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Head from 'next/head';
import Hero from "@/components/Hero";
import ProductSection from "@/components/ProductSection";
import CustomerReviews from "@/components/CustomerReviews";
import AboutUs from "@/components/AboutUs";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Home() {
return (
<>
<Head>
<title>NotebookForU – Stationery & Supplies for Everyone</title>
<meta property="og:title" content="NotebookForU – Stationery & Supplies for Everyone" />
<meta property="og:description" content="Explore affordable notebooks, art supplies, and more – delivered across India." />
<meta property="og:image" content="https://notebookforu.in/logo.jpg" />
<meta property="og:url" content="https://notebookforu.in/" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="NotebookForU – Stationery & Supplies for Everyone" />
<meta name="twitter:description" content="Explore affordable notebooks, art supplies, and more – delivered across India." />
<meta name="twitter:image" content="https://notebookforu.in/logo.jpg" />
</Head>
      <main className="bg-gradient-to-b from-blue-50 to-blue-100 text-gray-900">
    
    {/* Hero Section */}
    <Suspense fallback={<LoadingSpinner />}>
      <Hero 
        showArrows={true} 
        autoSlide={true}
        slideInterval={5000}
      />
    </Suspense>

    {/* Inspirational Quote */}
    <section className="text-center py-12 px-6 bg-white/50 backdrop-blur-sm">
      <motion.blockquote 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto"
      >
        <h2 className="text-2xl md:text-3xl font-medium italic text-gray-800 leading-relaxed">
          "Your thoughts, your words, your notebook: where inspiration meets expression."
        </h2>
        <p className="mt-4 text-blue-600 font-medium">— NotebookForU Team</p>
      </motion.blockquote>
    </section>

    {/* Products Section */}
    <Suspense fallback={<LoadingSpinner />}>
      <ProductSection 
        includeDiaries={true}
        featuredOnly={false}
        showViewAll={true}
      />
    </Suspense>

    {/* Customer Reviews */}
    <section className="py-12 bg-white/30">
      <Suspense fallback={<div className="h-96 flex items-center justify-center"><LoadingSpinner /></div>}>
        <CustomerReviews 
          autoRotate={true}
          showRatings={true}
        />
      </Suspense>
    </section>

    {/* About Us Section */}
    <AboutUs />

    {/* Final CTA */}
    <section className="py-16 text-center bg-gradient-to-r from-blue-100 to-blue-200">
      <h3 className="text-2xl md:text-3xl font-bold mb-6">Ready to Find Your Perfect Notebook?</h3>
      <Link href="/notebook-gallery" className="inline-block">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105">
          Browse Collection
        </button>
      </Link>
    </section>

  </main>
</>
  );
}