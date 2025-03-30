"use client";

import { useParams } from "next/navigation";
import productData from "@/data/productData";
import Image from "next/image";
import { useState } from "react";
import { useSwipeable } from "react-swipeable";

const CombinationDetail = () => {
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState(0);
  
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