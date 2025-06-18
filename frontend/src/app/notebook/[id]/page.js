"use client";

import { useParams } from "next/navigation";
import productData from "@/data/productData";
import DeliveryChargeCalculator from "@/components/DeliveryChargeCalculator";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import { 
  FiShoppingCart, 
  FiHeart, 
  FiShare2, 
  FiChevronLeft, 
  FiChevronRight, 
  FiPlus, 
  FiMinus, 
  FiMapPin, 
  FiCheck,
  FiX,
  FiStar
} from "react-icons/fi";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NotebookDetail = () => {
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState("");
  const [autoAddress, setAutoAddress] = useState("");
  const [shippingCost, setShippingCost] = useState(50);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showZoomedImage, setShowZoomedImage] = useState(false);

  // Find notebook by matching the id parameter with the inner id property
  const notebook = Object.values(productData.notebooks).find(
    notebook => notebook.id.toString() === id
  );

  // Check if product is in wishlist
  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setIsWishlisted(wishlist.includes(id));
  }, [id]);

  // Get current location
  useEffect(() => {
    if (useCurrentLocation && navigator.geolocation) {
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await res.json();
            setAutoAddress(data.display_name || "Location fetched");
          } catch {
            setAutoAddress("Could not fetch address details");
          } finally {
            setLoadingLocation(false);
          }
        },
        () => {
          setAutoAddress("Location access denied");
          setLoadingLocation(false);
        }
      );
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
    toast.success(`${quantity} ${notebook.name} added to cart!`, {
      position: "bottom-right",
      autoClose: 3000,
    });
  };

  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    if (isWishlisted) {
      const updatedWishlist = wishlist.filter(item => item !== id);
      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
      setIsWishlisted(false);
      toast.info("Removed from wishlist", { position: "bottom-right" });
    } else {
      wishlist.push(id);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      setIsWishlisted(true);
      toast.success("Added to wishlist!", { position: "bottom-right" });
    }
  };

  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: notebook.name,
        text: 'Check out this notebook from Notebook Foru',
        url: window.location.href,
      }).catch(() => {
        setShowShareModal(true);
      });
    } else {
      setShowShareModal(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!", { position: "bottom-right" });
    setShowShareModal(false);
  };

  const totalPrice = notebook.price * quantity;

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      
      {/* Back button */}
      <div className="max-w-6xl mx-auto mb-4">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FiChevronLeft className="mr-1" /> Back to Products
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg flex flex-col md:flex-row overflow-hidden">
          {/* Image Section */}
          <div className="md:w-1/2 relative">
            <div 
              className="relative aspect-square md:aspect-auto md:h-[500px] cursor-zoom-in" 
              {...swipeHandlers}
              onClick={() => setShowZoomedImage(true)}
            >
              <Image
                src={detailImages[activeImage]}
                alt={`${notebook.name} - Image ${activeImage + 1}`}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist();
                  }}
                  className={`p-2 rounded-full ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-800'} shadow-md hover:bg-red-100`}
                >
                  <FiHeart className={isWishlisted ? "fill-current" : ""} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    shareProduct();
                  }}
                  className="p-2 rounded-full bg-white/80 text-gray-800 shadow-md hover:bg-blue-100"
                >
                  <FiShare2 />
                </button>
              </div>
              <div className="hidden md:block">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }} 
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50"
                >
                  <FiChevronLeft size={20} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50"
                >
                  <FiChevronRight size={20} />
                </button>
              </div>
            </div>
            <div className="flex gap-2 p-4 overflow-x-auto">
              {detailImages.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(i)} 
                  className={`flex-shrink-0 w-16 h-16 border-2 ${activeImage === i ? "border-indigo-500" : "border-gray-200"} rounded overflow-hidden`}
                >
                  <Image 
                    src={img} 
                    alt={`Thumb ${i}`} 
                    width={64} 
                    height={64} 
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">{notebook.name}</h1>
            
            {notebook.designation && (
              <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                {notebook.designation}
              </span>
            )}
            
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className={i < (notebook.rating || 4) ? "fill-current" : ""} />
                ))}
              </div>
              <span className="text-gray-600 text-sm">({notebook.reviews || 24} reviews)</span>
              {notebook.stock && (
                <span className={`ml-2 text-sm px-2 py-1 rounded ${notebook.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                  {notebook.stock > 10 ? 'In Stock' : `Only ${notebook.stock} left`}
                </span>
              )}
            </div>
            
            <div className="flex items-baseline gap-3">
              <p className="text-2xl text-indigo-600 font-semibold">₹{notebook.price}</p>
              {notebook.originalPrice && (
                <p className="text-lg text-gray-500 line-through">₹{notebook.originalPrice}</p>
              )}
              {notebook.discount && (
                <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                  {notebook.discount}% OFF
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Size" value={notebook.details.size} />
              <DetailItem label="Pages" value={notebook.details.pages} />
              <DetailItem label="Material" value={notebook.details.material} />
              <DetailItem label="Binding" value={notebook.details.binding} />
              <DetailItem label="GSM" value={notebook.details.gsm} />
            </div>
            
            <button 
              onClick={() => setShowSizeGuide(true)}
              className="text-sm text-blue-600 hover:underline self-start"
            >
              View Size Guide
            </button>

            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-1">Description</h2>
              <p className="text-gray-700">{notebook.details.description}</p>
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

          {/* Shipping Section */}
<div className="space-y-2 mt-4">
  <div className="flex items-center justify-between">
    <label className="block font-medium">Shipping Address:</label>
    <button 
      onClick={() => setUseCurrentLocation(!useCurrentLocation)}
      className="flex items-center text-sm text-blue-600 hover:text-blue-800"
    >
      <FiMapPin className="mr-1" />
      {useCurrentLocation ? 'Using Current Location' : 'Use Current Location'}
    </button>
  </div>
  <textarea
    value={useCurrentLocation ? (loadingLocation ? "Fetching location..." : autoAddress) : address}
    onChange={(e) => setAddress(e.target.value)}
    disabled={useCurrentLocation}
    placeholder={useCurrentLocation ? "Fetching your location..." : "Enter your full address"}
    className="w-full px-3 py-2 border rounded resize-none min-h-[80px]"
  />
</div>

<div className="bg-gray-50 p-4 rounded-lg">
  <div className="flex justify-between py-1">
    <span className="text-gray-600">Price ({quantity} items)</span>
    <span>₹{(notebook.price * quantity).toFixed(2)}</span>
  </div>

  {/* Removed Shipping Row */}

  <div className="border-t my-2"></div>
  <div className="flex justify-between font-semibold text-lg">
    <span>Total</span>
    <span>₹{(notebook.price * quantity).toFixed(2)}</span>
  </div>
</div>


            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <FiShoppingCart /> Add to Cart
              </button>
              <button
                onClick={() => setShowCheckoutModal(true)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {showZoomedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={() => setShowZoomedImage(false)}>
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <Image
              src={detailImages[activeImage]}
              alt={`Zoomed ${notebook.name}`}
              width={800}
              height={800}
              className="object-contain w-full h-full"
            />
            <button 
              className="absolute top-4 right-4 bg-white/20 text-white p-2 rounded-full hover:bg-white/30"
              onClick={(e) => {
                e.stopPropagation();
                setShowZoomedImage(false);
              }}
            >
              <FiX size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowSizeGuide(false)}>
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Size Guide</h3>
                <button onClick={() => setShowSizeGuide(false)} className="text-gray-500 hover:text-gray-700">
                  <FiX size={24} />
                </button>
              </div>
              <div className="prose">
                <p>Our notebooks come in standard sizes:</p>
                <ul className="list-disc pl-5">
                  <li>A5: 148 × 210 mm (5.8 × 8.3 in)</li>
                  <li>A4: 210 × 297 mm (8.3 × 11.7 in)</li>
                  <li>B5: 176 × 250 mm (6.9 × 9.8 in)</li>
                </ul>
                <p className="mt-4">The {notebook.name} is {notebook.details.size}.</p>
                <img 
                  src="/size-guide.jpg" 
                  alt="Notebook size comparison" 
                  className="mt-4 w-full rounded border"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-lg max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Share this product</h3>
                <button onClick={() => setShowShareModal(false)} className="text-gray-500 hover:text-gray-700">
                  <FiX size={24} />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <span>Copy link</span>
                  <FiCheck className="text-green-500" />
                </button>
                {/* Add more share options here (WhatsApp, Facebook, etc.) */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowCheckoutModal(false)}>
          <div className="bg-white rounded-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Proceed to Checkout</h3>
                <button onClick={() => setShowCheckoutModal(false)} className="text-gray-500 hover:text-gray-700">
                  <FiX size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product:</span>
                  <span>{notebook.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span>{quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-semibold">₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="border-t my-2"></div>
                <button
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg"
                  onClick={() => {
                    handleAddToCart();
                    // In a real app, you would redirect to checkout
                    toast.success("Redirecting to checkout...");
                    setShowCheckoutModal(false);
                  }}
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="bg-gray-50 p-3 rounded-lg">
    <p className="text-sm text-gray-500 font-medium">{label}</p>
    <p className="text-base text-gray-900">{value}</p>
  </div>
);

export default NotebookDetail;