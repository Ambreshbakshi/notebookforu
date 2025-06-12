"use client";

import { useParams } from "next/navigation";
import productData from "@/data/productData";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";

const NotebookDetail = () => {
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState("");
  const [autoAddress, setAutoAddress] = useState("");
  const [shippingCost, setShippingCost] = useState(50); // Placeholder
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  const notebook = Array.isArray(productData.notebooks)
    ? productData.notebooks.find(item => item.id.toString() === id)
    : productData.notebooks[id];

  useEffect(() => {
    if (useCurrentLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          setAutoAddress(data.display_name || "Location fetched");
        } catch {
          setAutoAddress("Location access failed.");
        }
      });
    }
  }, [useCurrentLocation]);

  if (!notebook) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500 text-lg p-4 bg-white rounded-lg shadow-md">
          Notebook not found.
        </div>
      </div>
    );
  }

  const detailImages = [
    notebook.detailImage1,
    notebook.detailImage2,
    notebook.detailImage3,
    notebook.detailImage4,
    notebook.detailImage5
  ].filter(Boolean);

  const nextImage = () => setActiveImage((prev) => (prev === detailImages.length - 1 ? 0 : prev + 1));
  const prevImage = () => setActiveImage((prev) => (prev === 0 ? detailImages.length - 1 : prev - 1));

  const swipeHandlers = useSwipeable({
    onSwipedLeft: nextImage,
    onSwipedRight: prevImage,
    trackMouse: true,
    delta: 10
  });

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingIndex = cart.findIndex(item => item.id === notebook.id);
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({ ...notebook, quantity });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Added to cart!");
  };

  const totalPrice = notebook.price * quantity + shippingCost;

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg flex flex-col md:flex-row overflow-hidden">
          {/* Image Section */}
          <div className="md:w-1/2">
            <div className="relative aspect-square md:aspect-auto md:h-[500px]" {...swipeHandlers}>
              <Image
                src={detailImages[activeImage]}
                alt={`${notebook.name} - Image ${activeImage + 1}`}
                fill
                className="object-cover"
                priority
              />
              <div className="hidden md:block">
                <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full">
                  &larr;
                </button>
                <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full">
                  &rarr;
                </button>
              </div>
            </div>
            <div className="flex gap-2 p-4 overflow-x-auto">
              {detailImages.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)} className={`w-16 h-16 border-2 ${activeImage === i ? "border-indigo-500" : "border-gray-200"} rounded overflow-hidden`}>
                  <Image src={img} alt={`Thumb ${i}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-center space-y-4">
            <h1 className="text-3xl font-bold">{notebook.name}</h1>
            <p className="text-2xl text-indigo-600 font-semibold">₹{notebook.price}</p>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Size" value={notebook.details.size} />
              <DetailItem label="Pages" value={notebook.details.pages} />
              <DetailItem label="Material" value={notebook.details.material} />
              <DetailItem label="Binding" value={notebook.details.binding} />
              <DetailItem label="GSM" value={notebook.details.gsm} />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-1">Description</h2>
              <p className="text-gray-700">{notebook.details.description}</p>
            </div>

            {/* Quantity & Address Input */}
            <div className="flex items-center space-x-4 mt-4">
              <label>Quantity:</label>
              <input
                type="number"
                value={quantity}
                min={1}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-20 px-2 py-1 border rounded"
              />
            </div>

            <div className="space-y-2 mt-4">
              <label className="block font-medium">Shipping Address:</label>
              <textarea
                value={useCurrentLocation ? autoAddress : address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={useCurrentLocation}
                placeholder="Enter your address"
                className="w-full px-3 py-2 border rounded resize-none"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={useCurrentLocation}
                  onChange={() => setUseCurrentLocation(!useCurrentLocation)}
                />
                Use Current Location
              </label>
            </div>

            <p className="text-md text-gray-800">Shipping Cost: ₹{shippingCost}</p>
            <p className="text-xl font-semibold">Total: ₹{totalPrice}</p>

            <button
              onClick={handleAddToCart}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-base text-gray-900">{value}</p>
  </div>
);

export default NotebookDetail;
