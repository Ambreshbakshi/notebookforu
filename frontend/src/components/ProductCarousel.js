"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const products = [
  // Notebooks
  { id: 1, name: "Notebook | Vines", price: 75, image: "/products/notebook/notebook1.png", type: "notebook" },
  { id: 2, name: "Notebook | Floral", price: 80, image: "/products/notebook/notebook2.png", type: "notebook" },
  { id: 3, name: "Notebook | Minimal", price: 85, image: "/products/notebook/notebook3.png", type: "notebook" },
  { id: 4, name: "Notebook | Abstract", price: 90, image: "/products/notebook/notebook4.png", type: "notebook" },
  { id: 5, name: "Notebook | Classic", price: 95, image: "/products/notebook/notebook5.jpg", type: "notebook" },
  { id: 6, name: "Notebook | Art", price: 100, image: "/products/notebook/notebook6.jpg", type: "notebook" },
  // Diaries
  { id: 7, name: "Diary | Vintage", price: 150, image: "/products/diary/diary1.png", type: "diary" },
  { id: 8, name: "Diary | Elegant", price: 160, image: "/products/diary/diary2.png", type: "diary" },
  { id: 9, name: "Diary | Premium", price: 170, image: "/products/diary/diary3.jpg", type: "diary" },
  { id: 10, name: "Diary | Leather", price: 180, image: "/products/diary/diary4.jpg", type: "diary" },
  { id: 11, name: "Diary | Classic", price: 190, image: "/products/diary/diary5.jpg", type: "diary" },
  { id: 12, name: "Diary | Luxury", price: 200, image: "/products/diary/diary6.jpg", type: "diary" },
];

const itemsPerPage = 3;
const totalSlides = Math.ceil(products.length / itemsPerPage);

const ProductCarousel = () => {
  const [index, setIndex] = useState(0);

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Title */}
      <h2 className="text-2xl font-bold text-center mb-6">Our Products</h2>

      {/* Carousel */}
      <div className="flex items-center justify-between">
        {/* Left Arrow */}
        <button onClick={prevSlide} className="text-3xl px-4 hover:text-gray-600 transition cursor-pointer">&#8592;</button>

        {/* Product Display */}
        <div className="relative flex w-full justify-center overflow-hidden">
          <div className="flex gap-4">
            {products
              .slice(index * itemsPerPage, index * itemsPerPage + itemsPerPage)
              .map((product) => (
                <Link key={product.id} href={`/${product.type}/${product.id}`}>
                  <div className="bg-white rounded-lg shadow-lg p-4 hover:scale-105 transition w-56 text-center">
                    <Image src={product.image} alt={product.name} width={200} height={250} className="rounded-lg" />
                    <h3 className="text-lg font-bold mt-2">{product.name}</h3>
                    <p className="text-gray-600">Rs. {product.price}</p>
                  </div>
                </Link>
              ))}
          </div>
        </div>

        {/* Right Arrow */}
        <button onClick={nextSlide} className="text-3xl px-4 hover:text-gray-600 transition cursor-pointer">&#8594;</button>
      </div>

      {/* View All Button (Centered Below the Carousel) */}
      <div className="flex justify-center mt-6">
        <Link href="/notebook-gallery">
          <button className="bg-gray-800 text-white px-6 py-2 rounded-lg text-lg hover:bg-gray-900 transition">
            View All
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ProductCarousel;
