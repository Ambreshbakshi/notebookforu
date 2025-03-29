"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import productData from "@/data/productData";
import Image from "next/image";

const NotebookGallery = () => {
  const [selectedType, setSelectedType] = useState("all");

  // Memoize product data transformation to avoid recomputation
  const { notebooks, diaries, allProducts } = useMemo(() => {
    const notebooks = Object.values(productData.notebooks).map((item) => ({
      ...item,
      type: "notebook",
    }));
    const diaries = Object.values(productData.diaries).map((item) => ({
      ...item,
      type: "diary",
    }));
    return { notebooks, diaries, allProducts: [...notebooks, ...diaries] };
  }, []);

  // Memoize filtered products for better performance
  const filteredProducts = useMemo(() => {
    if (selectedType === "notebook") return notebooks;
    if (selectedType === "diary") return diaries;
    if (selectedType.includes("notebook")) {
      const pages = parseInt(selectedType.split(" ")[1]);
      return notebooks.filter((item) => item.details.pages === pages);
    }
    return allProducts;
  }, [selectedType, notebooks, diaries, allProducts]);

  // Filter options organized for better maintainability
  const filterOptions = [
    { value: "all", label: "All Products" },
    { value: "diary", label: "Diaries" },
    { value: "notebook", label: "Notebooks" },
    { value: "notebook 200", label: "Notebook (200 Pages)" },
    { value: "notebook 300", label: "Notebook (300 Pages)" },
    { value: "notebook 400", label: "Notebook (400 Pages)" },
    { value: "notebook 500", label: "Notebook (500 Pages)" },
  ];

  return (
    <div className="min-h-screen px-4 pb-16 bg-gradient-to-b from-white to-gray-100">
      {/* Heading & Filter Box */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center py-8 gap-4">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Notebook Gallery
        </h1>
        <select
          className="px-4 py-3 text-lg border border-gray-300 rounded-xl shadow-md bg-white focus:ring-4 focus:ring-indigo-300 transition duration-300"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          aria-label="Filter products by type"
        >
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {filteredProducts.map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              href={`/${item.type}/${item.id}`}
              className="group"
              passHref
            >
              <div className="bg-white p-4 rounded-2xl shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-2xl h-full flex flex-col">
                <div className="flex-1 flex justify-center items-center">
                  <div className="relative w-full h-[600px]">
                    <Image
                      src={item.gridImage}
                      alt={item.name}
                      fill
                      className="object-contain rounded-xl transition duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={false}
                    />
                  </div>
                </div>
                <h2 className="mt-5 text-xl font-semibold text-gray-800 text-center group-hover:text-indigo-600 transition">
                  {item.name}
                </h2>
                <p className="text-gray-600 text-center mt-1">{item.price}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto text-center py-16">
          <p className="text-xl text-gray-600">
            No products match your filter criteria.
          </p>
        </div>
      )}

      {/* Customize Notebook Section */}
      <section id="customization" className="py-16 px-6">
        <div className="max-w-5xl mx-auto p-8 bg-white shadow-lg rounded-2xl text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Customize Your Notebook
          </h2>
          <p className="text-gray-600 mt-4">
            Create a personalized notebook with your own cover image and
            specifications.
          </p>
          <p className="text-gray-600 mt-2">
            Now available only in Gorakhpur, Uttar Pradesh.
          </p>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contact for customization on WhatsApp"
          >
            <button className="mt-6 px-6 py-3 bg-indigo-600 text-white text-lg font-medium rounded-lg shadow-md hover:bg-indigo-700 transition duration-300">
              Contact for Customizing
            </button>
          </a>
        </div>
      </section>
    </div>
  );
};

export default NotebookGallery;