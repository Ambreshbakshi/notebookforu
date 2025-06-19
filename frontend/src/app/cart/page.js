"use client";
import { useEffect, useState } from "react";
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowLeft, FiTruck } from "react-icons/fi";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";
import productData from "@/data/productData";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [shippingCost, setShippingCost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deliveryPincode, setDeliveryPincode] = useState("");
  const [isCheckingShipping, setIsCheckingShipping] = useState(false);
  const [deliveryEstimate, setDeliveryEstimate] = useState("");
  

  // Shipping rates from the provided image
  const shippingRates = {
    local: { base: 45, perKg3to5: 12, perKgAbove5: 14 },
    withinState: { base: 80, perKg3to5: 20, perKgAbove5: 22 },
    neighbouringState: { base: 100, perKg3to5: 25, perKgAbove5: 28 },
    otherStates: { base: 115, perKg3to5: 30, perKgAbove5: 32 },
    metroToCapital: { base: 105, perKg3to5: 25, perKgAbove5: 28 },
    ncr: { base: 70, perKg3to5: 15, perKgAbove5: 18 },
  };

  // Delivery time estimates from the provided image
  const deliveryTimes = {
    local: "3 Days",
    metroToCapital: "4-5 Days",
    withinState: "3-6 Days",
    neighbouringState: "4-6 Days",
    otherStates: "6-7 Days"
  };

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    // Enrich cart items with product data including weight
    const enrichedCart = cart.map(item => {
      let product;
      // Search through all product categories
      for (const category in productData) {
        if (productData[category][item.id]) {
          product = productData[category][item.id];
          break;
        }
      }
      return { ...item, ...product };
    });
    setCartItems(enrichedCart);
    setIsLoading(false);
  }, []);
const [isLoggedIn, setIsLoggedIn] = useState(false);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setIsLoggedIn(!!user);
  });
  return () => unsubscribe();
}, []);

  // Recalculate shipping when cart items or pincode changes
  useEffect(() => {
    if (deliveryPincode.length === 6 && cartItems.length > 0) {
      calculateShipping();
    }
  }, [cartItems, deliveryPincode]);

  const handleRemoveItem = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    toast.success("Item removed from cart");
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === "NOTEBOOK10") {
      setDiscount(total * 0.1);
      toast.success("Promo code applied! 10% discount added");
    } else if (promoCode) {
      toast.error("Invalid promo code");
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.18;
  };

  const calculateTotalWeight = () => {
    return cartItems.reduce((sum, item) => sum + (item.weight || 0.5) * item.quantity, 0);
  };

  const getZoneFromPIN = (pin) => {
  const first3 = pin.substring(0, 3);
  
  const localPINs = [
    "273001", "273002", "273003", "273004", "273005", "273006", "273007",
    "273008", "273009", "273010", "273012", "273013", "273014", "273015",
    "273016", "273017", "273158", "273165", "273202", "273203", "273209",
    "273212", "273213", "273306", "273307"
  ];

  const UP3s = ["273", "226", "201", "247", "250", "284"]; // UP regions
  const ncr = ["110", "201", "122"]; // Delhi NCR
  const metro = ["400", "700", "560", "600"]; // Metro cities

  if (localPINs.includes(pin)) return "local";
  if (ncr.includes(first3)) return "ncr";
  if (metro.includes(first3)) return "metroToCapital";
  if (UP3s.includes(first3)) return "withinState";
  return "otherStates";
};


  const calculateShipping = async () => {
    if (!deliveryPincode || deliveryPincode.length !== 6) return;
    if (cartItems.length === 0) return;

    setIsCheckingShipping(true);
    try {
      const totalWeight = calculateTotalWeight();
      const zone = getZoneFromPIN(deliveryPincode);
      
      // Get rates for the zone
      const { base, perKg3to5, perKgAbove5 } = shippingRates[zone];
      let charge = base;

    // Calculate additional weight charges using ceil logic
if (totalWeight > 2 && totalWeight <= 5) {
  const extraWeight = Math.ceil(totalWeight - 2);
  charge += extraWeight * perKg3to5;
} else if (totalWeight > 5) {
  const extraBetween3to5 = 3; // from 2kg to 5kg, always 3kg range
  const extraAbove5 = Math.ceil(totalWeight - 5);
  charge += extraBetween3to5 * perKg3to5 + extraAbove5 * perKgAbove5;
}


      setShippingCost(charge);
      setDeliveryEstimate(deliveryTimes[zone]);
      toast.success(`Shipping calculated for ${zone.replace(/([A-Z])/g, ' $1').trim()}`);
    } catch (err) {
      console.error("Error calculating shipping:", err);
      toast.error("Error calculating shipping");
      setShippingCost(null);
      setDeliveryEstimate("");
    } finally {
      setIsCheckingShipping(false);
    }
  };

  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setDeliveryPincode(value);
    // Reset shipping when pincode changes
    if (value.length !== 6) {
      setShippingCost(null);
      setDeliveryEstimate("");
    }
  };

  const handleCheckShipping = () => {
    if (!deliveryPincode) {
      toast.error("Please enter your pincode");
      return;
    }

    if (!/^\d{6}$/.test(deliveryPincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }

    calculateShipping();
  };

  const total = calculateSubtotal() + (shippingCost || 0) + calculateTax() - discount;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 min-h-screen">
      <ToastContainer position="bottom-right" />
      
      <div className="mb-6">
        <Link href="/notebook-gallery" className="flex items-center text-blue-600 hover:text-blue-800">
          <FiArrowLeft className="mr-2" /> Continue Shopping
        </Link>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold mb-8">Your Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-20">
          <FiShoppingBag className="mx-auto text-gray-400 text-5xl mb-4" />
          <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
          <Link href="/notebook-gallery" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Browse Notebooks
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="hidden md:grid grid-cols-12 gap-4 border-b pb-2 mb-4">
              <div className="col-span-5 font-medium">Product</div>
              <div className="col-span-2 font-medium text-center">Price</div>
              <div className="col-span-3 font-medium text-center">Quantity</div>
              <div className="col-span-2 font-medium text-right">Total</div>
            </div>

            {cartItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-4 items-center border-b py-4"
              >
                <div className="col-span-5 flex items-center">
                  <div className="relative w-20 h-20 mr-4">
                    <Image
                      src={item.gridImage || "/placeholder-product.jpg"}
                      alt={item.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div>
                    <h2 className="font-medium">{item.name}</h2>
                    {item.designation && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {item.designation}
                      </span>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Weight: {(item.weight || 0.5) * item.quantity} kg
                    </p>
                  </div>
                </div>

                <div className="col-span-2 text-center">
                  <span className="md:hidden text-sm text-gray-500 mr-2">Price:</span>
                  ₹{item.price.toFixed(2)}
                </div>

                <div className="col-span-3 flex items-center justify-center">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <FiMinus size={16} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)
                    }
                    className="w-12 text-center border rounded mx-2 py-1"
                  />
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <FiPlus size={16} />
                  </button>
                </div>

                <div className="col-span-2 text-right">
                  <span className="md:hidden text-sm text-gray-500 mr-2">Total:</span>
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}

            {/* Shipping Calculator */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiTruck className="text-blue-600" />
                Shipping Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Delivery Pincode</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={deliveryPincode}
                    onChange={handlePincodeChange}
                    placeholder="Enter 6-digit pincode"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleCheckShipping}
                    disabled={isCheckingShipping || deliveryPincode.length !== 6}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isCheckingShipping ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Calculating...
                      </>
                    ) : (
                      <>
                        <FiTruck />
                        Check Availability
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Total package weight: {calculateTotalWeight().toFixed(2)} kg
              </div>
              {shippingCost !== null && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="font-medium">
                    Shipping to {deliveryPincode}: ₹{shippingCost.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Estimated delivery: {deliveryEstimate}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3 bg-gray-50 p-6 rounded-lg shadow-sm h-fit sticky top-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="mb-6">
              <label htmlFor="promo-code" className="block text-sm font-medium mb-2">
                Promo Code
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="promo-code"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={applyPromoCode}
                  className="px-4 py-2 bg-gray-800 text-white rounded-r hover:bg-gray-700"
                >
                  Apply
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shippingCost === null ? (
                    <span className="text-red-500">Check availability</span>
                  ) : (
                    `₹${shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax (18%)</span>
                <span>₹{calculateTax().toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

       <Link
  href={isLoggedIn ? "/checkout" : "/login"}
  className={`block w-full text-center py-3 px-4 rounded-lg font-medium transition ${
    shippingCost === null 
      ? "bg-gray-400 cursor-not-allowed" 
      : "bg-green-600 hover:bg-green-700 text-white"
  }`}
  onClick={(e) => {
    if (shippingCost === null) {
      e.preventDefault();
      toast.error("Please check shipping availability first");
    }
  }}
>
  {isLoggedIn ? "Buy Now" : "Login to Buy"}
</Link>



            <p className="text-xs text-gray-500 mt-4 text-center">
              {calculateSubtotal() > 500 ? (
                <span className="text-green-600">Free shipping applied!</span>
              ) : (
                `Add ₹${(500 - calculateSubtotal()).toFixed(2)} more for free shipping`
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;