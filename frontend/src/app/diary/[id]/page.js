"use client";

import { useParams, useRouter } from "next/navigation";
import productData from "@/data/productData";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { FiShoppingCart, FiPlus, FiMinus } from "react-icons/fi";

export default function DiaryDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);
  const [pageType, setPageType] = useState("Ruled");
  const [quantity, setQuantity] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const diary = productData.diaries?.[id];

  if (!diary) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500 text-lg p-4 bg-white rounded-lg shadow-md">
          Diary not found.
        </div>
      </div>
    );
  }

  const { name, price, gridImage, detailImage1, detailImage2, detailImage3, detailImage4, detailImage5, details } = diary;
  const { size, pages, material, binding, gsm, description } = details;

  const detailImages = [detailImage1, detailImage2, detailImage3, detailImage4, detailImage5].filter(Boolean);

  const nextImage = () => setActiveImage((prev) => (prev === detailImages.length - 1 ? 0 : prev + 1));
  const prevImage = () => setActiveImage((prev) => (prev === 0 ? detailImages.length - 1 : prev - 1));

  const swipeHandlers = useSwipeable({
    onSwipedLeft: nextImage,
    onSwipedRight: prevImage,
    trackMouse: true,
    delta: 10,
  });

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const itemId = `diary-${diary.id}-${pageType}`;
    const existingIndex = cart.findIndex(item => item.itemId === itemId);

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        ...diary,
        name: `${diary.name} - ${pageType}`,
        itemId,
        quantity,
        type: "diary",
        pageType
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    toast.success(`${quantity} ${diary.name} (${pageType}) added to cart!`, {
      position: "bottom-right"
    });
  };

  const handleBuyNow = () => {
    const directItem = {
      id: diary.id,
      type: "diary",
      name: `${diary.name} - ${pageType}`,
      price: diary.price,
      quantity,
      pageType,
      image: gridImage || detailImage1 || "/placeholder.jpg"
    };

    if (!isLoggedIn) {
      sessionStorage.setItem("pendingDirectCheckout", JSON.stringify(directItem));
      router.push(`/admin/login?redirect=/diary/${diary.id}/checkout`);
    } else {
      router.push(`/checkout?directItem=${encodeURIComponent(JSON.stringify(directItem))}`);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="bottom-right" autoClose={3000} />
      <div className="max-w-6xl mx-auto">
        <div className="bg-white overflow-hidden shadow-lg rounded-lg flex flex-col md:flex-row">
          {/* Diary Image Gallery */}
          <div className="md:w-1/2">
            <div className="relative aspect-square md:aspect-auto md:h-[500px]" {...swipeHandlers}>
              <Image
                src={detailImages[activeImage]}
                alt={`${name} - Image ${activeImage + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                priority
              />
              {detailImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-all"
                    aria-label="Previous image"
                  >
                    &lt;
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-all"
                    aria-label="Next image"
                  >
                    &gt;
                  </button>
                </>
              )}
            </div>
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

          {/* Diary Info */}
          <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{name}</h1>
            <p className="text-xl sm:text-2xl text-indigo-600 font-semibold mb-5">₹{price}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <DetailItem label="Size" value={size} />
              <DetailItem label="Pages" value={pages} />
              <DetailItem label="Material" value={material} />
              <DetailItem label="Binding" value={binding} />
              <DetailItem label="GSM" value={gsm} />
            </div>

            <div className="border-t border-gray-200 pt-5 mb-4">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600">{description}</p>
            </div>

            {/* Page Type Selection */}
            <div className="flex items-center gap-4 mt-4">
              <label className="font-medium">Pages Type:</label>
              <div className="flex gap-2">
                {["Ruled", "Plain"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setPageType(type)}
                    className={`px-4 py-2 rounded-lg border ${pageType === type ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-700 border-gray-300"}`}
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
                <button onClick={() => setQuantity(prev => Math.max(1, prev - 1))} className="px-3 py-1 text-gray-600 hover:bg-gray-100"><FiMinus /></button>
                <span className="px-4 py-1 border-x">{quantity}</span>
                <button onClick={() => setQuantity(prev => prev + 1)} className="px-3 py-1 text-gray-600 hover:bg-gray-100"><FiPlus /></button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-4">
              <button onClick={handleAddToCart} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2">
                <FiShoppingCart /> Add to Cart
              </button>
              <button onClick={handleBuyNow} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg">
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable detail component
function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-base text-gray-900">{value}</p>
    </div>
  );
}
