"use client";

import { useParams } from "next/navigation";
import productData from "@/data/productData";
import Image from "next/image";

import { useSwipeable } from "react-swipeable";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "react-toastify";
import { FiShoppingCart, FiPlus, FiMinus } from "react-icons/fi";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CombinationDetail = () => {
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState(0);
  const [pageType, setPageType] = useState("Ruled");
const [quantity, setQuantity] = useState(1);
const [isLoggedIn, setIsLoggedIn] = useState(false);
const router = useRouter();

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setIsLoggedIn(!!user);
  });
  return () => unsubscribe();
}, []);

  
  // Access combination directly from productData
  const combination = productData.combinations?.[id];

  if (!combination) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500 text-lg p-4 bg-white rounded-lg shadow-md">
          Combination pack not found.
        </div>
      </div>
    );
  }

  const { name, price, detailImage1, detailImage2, detailImage3, detailImage4, detailImage5, details } = combination;
  const { size, pages, material, binding, gsm, description } = details;

  // Create an array of all detail images
  const detailImages = [
    detailImage1,
    detailImage2,
    detailImage3,
    detailImage4,
    detailImage5
  ].filter(img => img);

  const nextImage = () => {
    setActiveImage((prev) => (prev === detailImages.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setActiveImage((prev) => (prev === 0 ? detailImages.length - 1 : prev - 1));
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: nextImage,
    onSwipedRight: prevImage,
    trackMouse: true,
    delta: 10 // Minimum distance to trigger swipe
  });

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
          <ToastContainer position="bottom-right" autoClose={3000} />
      <div className="max-w-6xl mx-auto">
        <div className="bg-white overflow-hidden shadow-lg rounded-lg flex flex-col md:flex-row">
          {/* Image Gallery Section */}
          <div className="md:w-1/2">
            {/* Swipeable area - Wrapped around the image */}
            <div className="relative aspect-square md:aspect-auto md:h-[500px]" {...swipeHandlers}>
              <Image
                src={detailImages[activeImage]}
                alt={`${name} - Image ${activeImage + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                priority
              />
              
              {/* Navigation Arrows - Hidden on touch devices */}
              <div className="hidden md:block">
                <button 
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-all"
                  aria-label="Previous image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-all"
                  aria-label="Next image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Thumbnail Navigation */}
            {detailImages.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto">
                {detailImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 ${activeImage === index ? 'border-indigo-500' : 'border-transparent'}`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Combination Info */}
          <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              {name} - Combination Pack
            </h1>
            <p className="text-xl sm:text-2xl text-indigo-600 font-semibold mb-5">
              Rs. {price}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <DetailItem label="Size" value={size} />
              <DetailItem label="Pages per book" value={pages} />
              <DetailItem label="Material" value={material} />
              <DetailItem label="Binding" value={binding} />
              {gsm && <DetailItem label="Paper Weight" value={`${gsm} GSM`} />}
            </div>
            
            <div className="border-t border-gray-200 pt-5">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600">{description}</p>
            </div>

            {/* Value Proposition */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800">Why Choose This Pack?</h3>
              <ul className="mt-2 list-disc list-inside text-blue-700">
                <li>Complete set for all your needs</li>
                <li>Special discounted price</li>
                <li>Coordinated designs</li>
              </ul>
            </div>
            {/* Page Type Selection */}
<div className="flex items-center gap-4 mt-6">
  <label className="font-medium">Pages Type:</label>
  <div className="flex gap-2">
    {["Ruled", "Plain"].map((type) => (
      <button
        key={type}
        onClick={() => setPageType(type)}
        className={`px-4 py-2 rounded-lg border ${
          pageType === type
            ? "bg-indigo-600 text-white border-indigo-600"
            : "bg-white text-gray-700 border-gray-300"
        }`}
      >
        {type}
      </button>
    ))}
  </div>
</div>

{/* Quantity Selector */}
<div className="flex items-center space-x-4 mt-4">
  <label className="font-medium">Quantity:</label>
  <div className="flex items-center border rounded">
    <button 
      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
      className="px-3 py-1 text-gray-600 hover:bg-gray-100"
    >
      <FiMinus />
    </button>
    <span className="px-4 py-1 border-x">{quantity}</span>
    <button 
      onClick={() => setQuantity(prev => prev + 1)}
      className="px-3 py-1 text-gray-600 hover:bg-gray-100"
    >
      <FiPlus />
    </button>
  </div>
</div>
<div className="mt-6 flex gap-4">
  <button
    onClick={() => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const itemId = `combination-${combination.id}-${pageType}`;
      const existingIndex = cart.findIndex(item => item.itemId === itemId);

      if (existingIndex >= 0) {
        cart[existingIndex].quantity += quantity;
      } else {
        cart.push({
          ...combination,
          name: `${combination.name} - ${pageType}`,
          itemId,
          quantity,
          type: "combination",
          pageType
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated")); // 🔄 Navbar update trigger
      toast.success(`${quantity} ${combination.name} (${pageType}) added to cart!`, {
        position: "bottom-right"
      });
    }}
    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2"
  >
    <FiShoppingCart /> Add to Cart
  </button>

  <button
    onClick={() => {
      const directItem = {
        id: combination.id,
        type: "combination",
        name: `${combination.name} - ${pageType}`,
        price: combination.price,
        quantity,
        pageType,
        image: combination.gridImage || combination.detailImage1 || "/placeholder.jpg"
      };

      if (!isLoggedIn) {
        sessionStorage.setItem("pendingDirectCheckout", JSON.stringify(directItem));
        router.push(`/admin/login?redirect=/combination/${combination.id}/checkout`);
      } else {
        router.push(`/checkout?directItem=${encodeURIComponent(JSON.stringify(directItem))}`);
      }
    }}
    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
  >
    Buy Now
  </button>
</div>


          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="mt-1 text-base text-gray-900">{value}</p>
  </div>
);

export default CombinationDetail;