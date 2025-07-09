'use client';
import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import productData from "@/data/productData";
import Image from "next/image";

import { FaHeart, FaRegHeart, FaStar, FaCartPlus, FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(initialValue);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(error);
    }
  }, [key]);

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (isClient) {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

const NotebookGallery = () => {
  const [selectedType, setSelectedType] = useState("all");
  const [wishlist, setWishlist] = useLocalStorage("wishlist", []);
  const [quickView, setQuickView] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("featured");
  const [isClient, setIsClient] = useState(false);
  const [productsWithType, setProductsWithType] = useState([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filterOptions = useMemo(() => [
    { value: "all", label: "All Products" },
    { value: "diary", label: "Diaries" },
    { value: "notebook", label: "Notebooks" },
    { value: "combination", label: "Combination Packs" },
    { value: "notebook 200", label: "Notebooks (200 Pages)" },
    { value: "notebook 300", label: "Notebooks (300 Pages)" },
    { value: "notebook 400", label: "Notebooks (400 Pages)" },
  ], []);

  const sortOptions = useMemo(() => [
    { value: "featured", label: "Featured" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "name-asc", label: "Name: A to Z" },
    { value: "name-desc", label: "Name: Z to A" },
    { value: "newest", label: "Newest Arrivals" },
  ], []);

  const { notebooks, diaries, combinations, allProducts } = useMemo(() => {
    const notebooks = Object.entries(productData.notebooks || {}).map(([key, item]) => ({
      ...item,
      key: key,
      type: "notebook",
      selectedType: "Ruled" // Default to Ruled
    }));
    const diaries = Object.entries(productData.diaries || {}).map(([key, item]) => ({
      ...item,
      key: key,
      type: "diary",
      selectedType: "Ruled" // Default to Ruled
    }));
    const combinations = Object.entries(productData.combinations || {}).map(
      ([key, item]) => ({
        ...item,
        key: key,
        type: "combination",
        selectedType: "Ruled" // Default to Ruled
      })
    );
    return {
      notebooks,
      diaries,
      combinations,
      allProducts: [...notebooks, ...diaries, ...combinations],
    };
  }, []);

  const filteredProducts = useMemo(() => {
    let products;
    switch (selectedType) {
      case "notebook":
        products = notebooks;
        break;
      case "diary":
        products = diaries;
        break;
      case "combination":
        products = combinations;
        break;
      case "notebook 200":
        products = notebooks.filter((item) => item.details?.pages === 200);
        break;
      case "notebook 300":
        products = notebooks.filter((item) => item.details?.pages === 300);
        break;
      case "notebook 400":
        products = notebooks.filter((item) => item.details?.pages === 400);
        break;
      default:
        products = allProducts;
    }

    if (searchQuery) {
      products = products.filter(product =>
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    switch (sortOption) {
      case "price-low":
        products = [...products].sort((a, b) => {
          const priceA = typeof a.price === 'string' 
            ? parseFloat(a.price.replace(/[^0-9.-]+/g, "")) 
            : a.price || 0;
          const priceB = typeof b.price === 'string' 
            ? parseFloat(b.price.replace(/[^0-9.-]+/g, "")) 
            : b.price || 0;
          return priceA - priceB;
        });
        break;
      case "price-high":
        products = [...products].sort((a, b) => {
          const priceA = typeof a.price === 'string' 
            ? parseFloat(a.price.replace(/[^0-9.-]+/g, "")) 
            : a.price || 0;
          const priceB = typeof b.price === 'string' 
            ? parseFloat(b.price.replace(/[^0-9.-]+/g, "")) 
            : b.price || 0;
          return priceB - priceA;
        });
        break;
      case "name-asc":
        products = [...products].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name-desc":
        products = [...products].sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "newest":
        products = [...products].sort((a, b) => 
          new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0)
        );
        break;
      default:
        break;
    }

    return products;
  }, [selectedType, notebooks, diaries, combinations, allProducts, searchQuery, sortOption]);

  useEffect(() => {
    setProductsWithType(filteredProducts);
  }, [filteredProducts]);

  const getProductRoute = (type, id) => {
    return type === "combination" ? `/combination/${id}` : `/${type}/${id}`;
  };

  const addToCart = (product) => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const pageType = product.selectedType || "Ruled";
      const itemId = `${product.key}-${product.type}-${pageType}`;

      const existingItemIndex = cart.findIndex((item) => item.itemId === itemId);

      if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
      } else {
        cart.push({
          itemId,
          key: product.key,
          id: product.id,
          name: product.name,
          type: product.type,
          quantity: 1,
          price: product.price,
          pageType,
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success(`${product.name} - ${pageType} added to cart`);
    } catch (error) {
      toast.error("Failed to add item to cart");
      console.error("Error adding to cart:", error);
    }
  };

  const toggleWishlist = (product) => {
    const productKey = `${product.type}-${product.id}`;
    if (wishlist.includes(productKey)) {
      setWishlist(wishlist.filter(item => item !== productKey));
      toast.info(`${product.name} removed from wishlist`, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      setWishlist([...wishlist, productKey]);
      toast.success(`${product.name} added to wishlist`, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const isInWishlist = (product) => {
    if (!isClient) return false;
    return wishlist.includes(`${product.type}-${product.id}`);
  };

  const openQuickView = (product) => {
    setQuickView({...product});
    setCurrentImageIndex(0);
    document.body.style.overflow = 'hidden';
  };

  const closeQuickView = () => {
    setQuickView(null);
    document.body.style.overflow = 'auto';
  };

  const navigateImage = (direction) => {
    if (!quickView?.images) return;
    
    if (direction === 'prev') {
      setCurrentImageIndex(prev => 
        prev === 0 ? quickView.images.length - 1 : prev - 1
      );
    } else {
      setCurrentImageIndex(prev => 
        prev === quickView.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const updateProductType = (productId, type, newPageType) => {
    setProductsWithType(prevProducts => 
      prevProducts.map(product => 
        product.id === productId && product.type === type 
          ? { ...product, selectedType: newPageType }
          : product
      )
    );

    if (quickView && quickView.id === productId && quickView.type === type) {
      setQuickView(prev => ({ ...prev, selectedType: newPageType }));
    }
  };

  if (!isClient) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen px-4 pb-16 bg-gradient-to-b from-white to-gray-50">
      <ToastContainer />
      
      {quickView && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{quickView.name}</h2>
                <button 
                  onClick={closeQuickView}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                  aria-label="Close quick view"
                >
                  &times;
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2 relative">
                  <div className="relative w-full h-64 md:h-96 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={quickView.images?.[currentImageIndex] || quickView.gridImage}
                      alt={quickView.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  </div>
                  {quickView.images?.length > 1 && (
                    <>
                      <button 
                        onClick={() => navigateImage('prev')}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                        aria-label="Previous image"
                      >
                        <FaChevronLeft />
                      </button>
                      <button 
                        onClick={() => navigateImage('next')}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                        aria-label="Next image"
                      >
                        <FaChevronRight />
                      </button>
                      <div className="flex mt-4 gap-2 justify-center">
                        {quickView.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-3 h-3 rounded-full ${currentImageIndex === index ? 'bg-indigo-600' : 'bg-gray-300'}`}
                            aria-label={`Go to image ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                
                <div className="md:w-1/2">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <FaStar 
                          key={i} 
                          className={i < (quickView.rating || 4) ? "text-yellow-400" : "text-gray-300"} 
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <span className="text-gray-600 ml-2 text-sm">
                      ({quickView.reviews || 24} reviews)
                    </span>
                  </div>
                  
                  <p className="text-2xl font-bold text-indigo-600 mb-4">Rs. {quickView.price}</p>
                  
                  {quickView.discount && (
                    <p className="text-sm text-gray-500 mb-2">
                      <span className="line-through mr-2">Rs. {quickView.originalPrice}</span>
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                        {quickView.discount}% OFF
                      </span>
                    </p>
                  )}
                  
                  <p className="text-gray-700 mb-4">{quickView.description || "Premium quality notebook with durable cover and smooth pages."}</p>
                  
                  {quickView.details && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Product Details:</h3>
                      <ul className="text-gray-600 text-sm space-y-1">
                        {Object.entries(quickView.details).map(([key, value]) => (
                          <li key={key}>
                            <span className="font-medium capitalize">{key}:</span> {value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="space-y-4">
  {/* Page Type Selection */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Page Type
    </label>
    <div className="flex gap-3">
      <button
        onClick={() => {
          const updatedQuickView = { ...quickView, selectedType: "Ruled" };
          setQuickView(updatedQuickView);
          updateProductType(quickView.id, quickView.type, "Ruled");
        }}
        className={`flex-1 py-2 px-4 rounded-md border transition-all ${
          quickView.selectedType === "Ruled"
            ? "bg-indigo-600 text-white border-indigo-700"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
        }`}
      >
        Ruled
      </button>
      <button
        onClick={() => {
          const updatedQuickView = { ...quickView, selectedType: "Plain" };
          setQuickView(updatedQuickView);
          updateProductType(quickView.id, quickView.type, "Plain");
        }}
        className={`flex-1 py-2 px-4 rounded-md border transition-all ${
          quickView.selectedType === "Plain"
            ? "bg-indigo-600 text-white border-indigo-700"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
        }`}
      >
        Plain
      </button>
    </div>
  </div>

  {/* Action Buttons */}
  <div className="flex gap-3">
    <button
      onClick={() => {
        addToCart(quickView);
        closeQuickView();
      }}
      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
    >
      <FaCartPlus className="text-lg" />
      <span>Add to Cart</span>
    </button>
    <button
      onClick={() => toggleWishlist(quickView)}
      className="w-12 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
      aria-label={isInWishlist(quickView) ? "Remove from wishlist" : "Add to wishlist"}
    >
      {isInWishlist(quickView) ? (
        <FaHeart className="text-red-500 text-lg" />
      ) : (
        <FaRegHeart className="text-lg" />
      )}
    </button>
  </div>
</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div className="text-center md:text-left w-full md:w-auto">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Our Collection
            </h1>
            <p className="text-gray-600 mt-2">
              Premium notebooks, diaries, and combination packs
            </p>
          </div>
          
          <div className="sticky top-0 z-40 bg-white shadow-sm py-3 mb-6">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="relative flex-1 w-full md:max-w-xs">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition text-sm"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  {filterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition text-sm"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {productsWithType.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {productsWithType.map((item, index) => (
    <div
      key={`${item.type}-${item.id}`}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex flex-col border border-gray-200 overflow-hidden"
    >
      {/* Product Image */}
      <div className="relative aspect-square">
        <Link href={getProductRoute(item.type, item.id)} className="block w-full h-full">
          <Image
            src={item.gridImage || item.images?.[0] || "/placeholder.png"}
            alt={item.name}
            fill
            className="object-contain w-full h-full transition-opacity hover:opacity-90"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={index < 4}
            loading={index > 3 ? "lazy" : "eager"}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 space-y-1">
          {item.discount && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -{item.discount}%
            </span>
          )}
          {item.stockStatus === "soldout" && (
            <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
              SOLD OUT
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(item);
          }}
          className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow hover:bg-white transition z-10"
          aria-label={isInWishlist(item) ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isInWishlist(item) ? (
            <FaHeart className="text-red-500 text-sm" />
          ) : (
            <FaRegHeart className="text-sm" />
          )}
        </button>
      </div>

      {/* Product Info */}
      <div className="p-3 flex flex-col flex-1">
        <h2 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">
          {item.name}
        </h2>

        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400 text-xs">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={i < (item.rating || 4) ? "text-yellow-400" : "text-gray-300"}
              />
            ))}
          </div>
          <span className="text-gray-500 text-xs ml-1">({item.reviews || 24})</span>
        </div>

        {/* Price */}
        <div className="mb-3">
          {item.maxPrice && item.maxPrice > item.price && (
            <span className="line-through text-gray-400 text-xs mr-1">₹{item.maxPrice}</span>
          )}
          <span className="text-base font-bold text-indigo-600">₹{item.price}</span>
          {item.originalPrice && (
            <span className="line-through text-gray-500 text-xs ml-1">₹{item.originalPrice}</span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto space-y-2">
          <select
            className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:ring-indigo-500 focus:border-indigo-500"
            value={item.selectedType}
            onChange={(e) => {
              updateProductType(item.id, item.type, e.target.value);
            }}
          >
            <option value="Ruled">Ruled</option>
            <option value="Plain">Plain</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                addToCart(item);
              }}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md flex items-center justify-center gap-1 text-sm"
            >
              <FaCartPlus /> Cart
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                openQuickView(item);
              }}
              className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded-md text-sm"
            >
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>
        ) : (
          <div className="max-w-7xl mx-auto text-center py-16">
            <p className="text-xl text-gray-600">
              No products found. Try a different filter or search term.
            </p>
          </div>
        )}
      </div>
      
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Choose Our Notebooks?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-4">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Premium Quality</h3>
              <p className="text-gray-600 text-sm">Durable covers and smooth, bleed-resistant paper</p>
            </div>
            <div className="text-center p-4">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Eco-Friendly</h3>
              <p className="text-gray-600 text-sm">Sustainable materials and responsible manufacturing</p>
            </div>
            <div className="text-center p-4">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Best Value</h3>
              <p className="text-gray-600 text-sm">High-quality at competitive prices with regular discounts</p>
            </div>
            <div className="text-center p-4">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">Same-day dispatch for orders before 3pm</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NotebookGallery;