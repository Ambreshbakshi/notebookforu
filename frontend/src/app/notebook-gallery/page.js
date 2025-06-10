"use client";
import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import productData from "@/data/productData";
import Image from "next/image";

const NotebookGallery = () => {
  const [selectedType, setSelectedType] = useState("all");

  // Memoize product data transformation
  const { notebooks, diaries, combinations, allProducts } = useMemo(() => {
    const notebooks = Object.values(productData.notebooks).map((item) => ({
      ...item,
      type: "notebook",
    }));
    const diaries = Object.values(productData.diaries).map((item) => ({
      ...item,
      type: "diary",
    }));
    const combinations = Object.values(productData.combinations || {}).map((item) => ({
      ...item,
      type: "combination",
    }));
    return {
      notebooks,
      diaries,
      combinations,
      allProducts: [...notebooks, ...diaries, ...combinations]
    };
  }, []);

  // Memoize filtered products
  const filteredProducts = useMemo(() => {
    switch (selectedType) {
      case "notebook": return notebooks;
      case "diary": return diaries;
      case "combination": return combinations;
      case "notebook 200": return notebooks.filter(item => item.details.pages === 200);
      case "notebook 300": return notebooks.filter(item => item.details.pages === 300);
      case "notebook 400": return notebooks.filter(item => item.details.pages === 400);
      default: return allProducts;
    }
  }, [selectedType, notebooks, diaries, combinations, allProducts]);

  // Enhanced filter options
  const filterOptions = [
    { value: "all", label: "All Products" },
    { value: "diary", label: "Diaries" },
    { value: "notebook", label: "Notebooks" },
    { value: "combination", label: "Combination Packs" },
    { value: "notebook 200", label: "Notebooks (200 Pages)" },
    { value: "notebook 300", label: "Notebooks (300 Pages)" },
    { value: "notebook 400", label: "Notebooks (400 Pages)" },
  ];

  // Get proper route based on product type
  const getProductRoute = (type, id) => {
    return type === 'combination' ? `/combination/${id}` : `/${type}/${id}`;
  };

  // Add to Cart function
  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItemIndex = cart.findIndex(item => item.id === product.id && item.type === product.type);

    if (existingItemIndex > -1) {
      // Item already in cart, increment quantity
      cart[existingItemIndex].quantity += 1;
    } else {
      // Item not in cart, add with quantity 1
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    // Optional: Add a visual confirmation (e.g., a toast notification)
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen px-4 pb-16 bg-gradient-to-b from-white to-gray-100">
      {/* Heading & Filter */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center py-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Our Collection
          </h1>
          <p className="text-gray-600 mt-2">
            Premium notebooks, diaries, and combination packs
          </p>
        </div>
        <select
          className="px-4 py-3 text-lg border border-gray-300 rounded-xl shadow-md bg-white focus:ring-4 focus:ring-indigo-300 transition duration-300"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          aria-label="Filter products"
        >
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Product Grid with A4 aspect ratio */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {filteredProducts.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="bg-white p-4 rounded-2xl shadow-lg transform transition duration-300 hover:scale-[1.02] hover:shadow-xl h-full flex flex-col"
            >
              <Link
                href={getProductRoute(item.type, item.id)}
                className="group flex-1 flex justify-center items-center relative"
                passHref
              >
                {/* A4 Aspect Ratio Container (1:√2 or ~1:1.414) */}
                <div className="relative w-full" style={{ paddingBottom: '141.4%' }}> {/* A4 ratio */}
                  <Image
                    src={item.gridImage}
                    alt={item.name}
                    fill
                    className="object-contain rounded-lg transition duration-300 group-hover:opacity-90"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    priority={item.id <= 4}
                    style={{ objectFit: 'contain' }}
                  />
                  {item.type === 'combination' && (
                    <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      COMBO
                    </div>
                  )}
                </div>
              </Link>
              <div className="mt-4">
                <h2 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition line-clamp-2">
                  {item.name}
                </h2>
                <p className="text-indigo-600 font-medium mt-1">
                  {item.price.includes("Rs.") ? item.price : `Rs. ${item.price}`}
                </p>
                {item.type === 'combination' && (
                  <p className="text-green-600 text-sm mt-1">Special Pack Savings</p>
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault(); // Prevent navigating to product detail page
                    addToCart(item);
                  }}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto text-center py-16">
          <p className="text-xl text-gray-600">
            No products found. Try a different filter.
          </p>
        </div>
      )}

      {/* Customization Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Custom Notebook Services
          </h2>
          <p className="text-gray-600 mt-4 max-w-3xl mx-auto">
            Create personalized notebooks with your own designs, sizes, and paper types.
            Currently available for local customers in Gorakhpur, Uttar Pradesh.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">\
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <button className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition duration-300">
                WhatsApp for Custom Orders
              </button>
            </a>
            <a
              href="tel:+919876543210"
              className="inline-block"
            >
              <button className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg shadow-md hover:bg-green-700 transition duration-300">
                Call for Enquiries
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NotebookGallery;
