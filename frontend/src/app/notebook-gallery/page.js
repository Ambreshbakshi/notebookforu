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
    }));
    const diaries = Object.entries(productData.diaries || {}).map(([key, item]) => ({
      ...item,
      key: key,
      type: "diary",
    }));
    const combinations = Object.entries(productData.combinations || {}).map(
      ([key, item]) => ({
        ...item,
        key: key,
        type: "combination",
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

  const getProductRoute = (type, id) => {
    return type === "combination" ? `/combination/${id}` : `/${type}/${id}`;
  };

 const addToCart = (product) => {
  try {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItemIndex = cart.findIndex(
      (item) => item.key === product.key && item.type === product.type
    );

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += 1;
    } else {
      cart.push({
        key: product.key,
        id: product.id,
        type: product.type,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    // **Trigger Custom Event for Cart Update**
    window.dispatchEvent(new Event("cartUpdated"));

    toast.success(`${product.name} added to cart`);
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
    setQuickView(product);
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
                  
                  <div className="flex flex-wrap gap-3 mt-6">
                    <button
                      onClick={() => {
                        addToCart(quickView);
                        closeQuickView();
                      }}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition"
                    >
                      <FaCartPlus /> Add to Cart
                    </button>
                    <button
                      onClick={() => toggleWishlist(quickView)}
                      className="p-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                      aria-label={isInWishlist(quickView) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      {isInWishlist(quickView) ? (
                        <FaHeart className="text-red-500" />
                      ) : (
                        <FaRegHeart />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          {/* Heading & Description Centered */}
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

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
  {filteredProducts.map((item, index) => (
    <div
      key={`${item.type}-${item.id}`}
      className="bg-white p-2 rounded-lg shadow-md hover:shadow-lg transition h-full flex flex-col group relative overflow-hidden border border-gray-100"
    >
      <div className="relative w-full" style={{ paddingBottom: "100%" }}>
        <Link href={getProductRoute(item.type, item.id)} className="block w-full h-full">
          <Image
            src={item.gridImage || item.images?.[0] || "/placeholder.png"}
            alt={item.name}
            fill
            className="object-contain rounded-lg transition group-hover:opacity-90"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
            priority={index < 4}
            loading={index > 3 ? "lazy" : "eager"}
          />
        </Link>

        {item.discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
            -{item.discount}%
          </div>
        )}

        {item.stockStatus === "soldout" && (
          <div className="absolute top-2 left-2 mt-4 bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
            SOLD OUT
          </div>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(item);
          }}
          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-gray-100 transition z-10"
          aria-label={isInWishlist(item) ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isInWishlist(item) ? (
            <FaHeart className="text-red-500 text-sm" />
          ) : (
            <FaRegHeart className="text-sm" />
          )}
        </button>
      </div>

      <div className="mt-2 flex flex-col flex-1">
        <h2 className="text-xs font-semibold text-gray-800 line-clamp-2 mb-1">
          {item.name}
        </h2>

        <div className="flex items-center mb-1">
          <div className="flex text-yellow-400 text-xs">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={i < (item.rating || 4) ? "text-yellow-400" : "text-gray-300"}
              />
            ))}
          </div>
          <span className="text-gray-500 text-[10px] ml-1">({item.reviews || 24})</span>
        </div>

        <div className="flex items-center mb-1">
          <p className="text-sm font-bold text-indigo-600">₹{item.price}</p>
          {item.originalPrice && (
            <p className="text-[10px] text-gray-500 line-through ml-1">₹{item.originalPrice}</p>
          )}
        </div>

        <div className="mt-auto flex gap-1">
          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart(item);
            }}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-1 rounded flex items-center justify-center gap-1 text-xs"
          >
            <FaCartPlus /> Add to Cart
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              openQuickView(item);
            }}
            className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 py-1 px-2 rounded transition text-xs"
          >
            View
          </button>
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

      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Custom Notebook Services
            </h2>
            <p className="text-gray-600 mt-4 max-w-3xl mx-auto">
              Create personalized notebooks with your own designs, sizes, and paper
              types. Currently available for local customers in Gorakhpur, Uttar Pradesh.
            </p>
          </div>
          
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Custom Covers</h3>
              <p className="text-gray-600">
                Upload your own design or choose from our templates to create a unique cover.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Paper Options</h3>
              <p className="text-gray-600">
                Choose from various paper types including ruled, dotted, blank, or custom layouts.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Bulk Orders</h3>
              <p className="text-gray-600">
                Special discounts for bulk orders - perfect for businesses, schools, and events.
              </p>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <button className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-6.29-3.588c.545 1.488 1.573 2.729 2.934 3.152.198.05.396.074.57.074.248 0 .471-.05.669-.149.198-.099.371-.297.52-.644.149-.347.124-.644-.025-.842-.149-.198-.446-.471-.793-.743-.347-.272-.57-.446-.743-.446-.174 0-.347.074-.52.223-.173.148-.669.694-.768.842-.1.149-.199.149-.372.05-.174-.1-.733-.272-1.392-.892-.545-.495-.909-1.102-1.015-1.288-.1-.198-.012-.297.074-.396.086-.1.198-.248.298-.347.1-.1.124-.198.074-.347-.05-.149-.446-1.076-.612-1.474-.167-.397-.334-.347-.446-.347-.1 0-.273-.025-.446-.025-.174 0-.446.05-.669.272-.223.222-.866.86-.866 2.098 0 1.239 1.04 2.433 1.191 2.604.149.171 2.058 3.152 4.99 4.33.669.298 1.192.446 1.637.545.421.095.771.087 1.042.04.406-.07.991-.396 1.14-1.44.149-1.045.744-2.934.744-3.975 0-.198-.024-.347-.074-.446-.05-.099-.198-.149-.446-.248-.248-.1-1.44-.718-1.663-.792-.223-.075-.384-.124-.545.124-.149.248-.594.792-.742.966-.149.174-.298.198-.546.1-.248-.1-1.043-.384-1.985-1.226-.735-.669-1.231-1.488-1.376-1.736-.149-.248-.016-.384.112-.509.116-.112.248-.285.372-.46.123-.173.165-.248.247-.41.083-.16.042-.306-.008-.446-.05-.14-.545-1.31-.763-1.793-.2-.433-.4-.367-.545-.376-.124-.008-.26-.01-.384-.01z"/>
                </svg>
                WhatsApp for Custom Orders
              </button>
            </a>
            <a href="tel:+919876543210" className="inline-block">
              <button className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg shadow-md hover:bg-green-700 transition duration-300 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 10.999h2C22 5.869 18.127 2 12.99 2v2C17.052 4 20 6.943 20 10.999z"/>
                  <path d="M13 8c2.103 0 3 .897 3 3h2c0-3.225-1.775-5-5-5v2zm3.422 5.443a1.001 1.001 0 00-1.391.043l-2.393 2.461c-.576-.11-1.734-.471-2.926-1.66-1.192-1.193-1.553-2.354-1.66-2.926l2.459-2.394a1 1 0 00.043-1.391L6.859 3.513a1 1 0 00-1.391-.087l-2.17 1.861a1 1 0 00-.29.649c-.015.25-.301 6.172 4.291 10.766C11.305 20.707 16.323 21 17.705 21c.202 0 .326-.006.359-.008a.992.992 0 00.648-.291l1.86-2.171a1 1 0 00-.086-1.391l-4.064-3.696z"/>
                </svg>
                Call for Enquiries
              </button>
            </a>
          </div>
        </div>
      </section>
      
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