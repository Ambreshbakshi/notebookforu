'use client';
import { useEffect, useState, useMemo } from "react";
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowLeft, FiTruck, FiAlertCircle } from "react-icons/fi";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";
import productData from "@/data/productData";
import { calculateShippingCost } from "@/components/DeliveryChargeCalculator";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [shippingCost, setShippingCost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deliveryPincode, setDeliveryPincode] = useState("");
  const [isCheckingShipping, setIsCheckingShipping] = useState(false);
  const [deliveryEstimate, setDeliveryEstimate] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const subtotal = useMemo(() =>
    cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0),
    [cartItems]
  );

  const totalWeight = useMemo(() =>
    cartItems.reduce((sum, item) => sum + (item.product?.weight || 0.5) * item.quantity, 0),
    [cartItems]
  );

  const total = useMemo(() => {
    const finalShippingCost = subtotal > 499 ? 0 : (shippingCost || 0);
    return subtotal + finalShippingCost - discount;
  }, [subtotal, shippingCost, discount]);

  useEffect(() => {
    const loadCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const enrichedCart = cart.map(cartItem => {
          let foundProduct = null;
          for (const category in productData) {
            if (productData[category][cartItem.id]) {
              foundProduct = productData[category][cartItem.id];
              break;
            }
          }
          return {
            ...cartItem,
            product: foundProduct || {
              name: "Unknown Product",
              price: 0,
              weight: 0.5,
              gridImage: "/placeholder-product.jpg"
            }
          };
        });
        setCartItems(enrichedCart);
      } catch (err) {
        console.error("Error loading cart:", err);
        toast.error("Could not load your cart");
      } finally {
        setIsLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      loadCart();
    });

    return () => unsubscribe();
  }, []);

  const calculateShipping = () => {
    if (!deliveryPincode || deliveryPincode.length !== 6) {
      setFormErrors(prev => ({ ...prev, pincode: "Enter valid 6-digit pincode" }));
      return;
    }
    if (cartItems.length === 0) return;

    setIsCheckingShipping(true);
    try {
      const { shippingCost, deliveryEstimate } = calculateShippingCost(deliveryPincode, totalWeight);
      const finalShippingCost = subtotal > 499 ? 0 : shippingCost;
      setShippingCost(finalShippingCost);
      setDeliveryEstimate(deliveryEstimate);
      setFormErrors(prev => ({ ...prev, pincode: "" }));
    } catch (err) {
      console.error("Shipping error:", err);
      toast.error("Error calculating shipping");
      setShippingCost(null);
      setDeliveryEstimate("");
    } finally {
      setIsCheckingShipping(false);
    }
  };

  const handleRemoveItem = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart.map(item => ({
      id: item.id,
      quantity: item.quantity
    }))));
    toast.success("Item removed from cart");
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1 || newQuantity > 99) return;
    const updatedCart = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart.map(item => ({
      id: item.id,
      quantity: item.quantity
    }))));
  };

  const applyPromoCode = () => {
    if (!promoCode) {
      toast.info("Please enter a promo code");
      return;
    }
    const validCodes = {
      "NOTEBOOK10": 0.1,
      "NOTEBOOK20": 0.2,
      "FREESHIP": shippingCost ? shippingCost : 0
    };
    const code = promoCode.toUpperCase();
    if (validCodes[code]) {
      const discountValue = code === "FREESHIP"
        ? validCodes[code]
        : subtotal * validCodes[code];
      setDiscount(discountValue);
      toast.success(`Promo code applied! ${code === "FREESHIP" ? "Free shipping" : `${validCodes[code] * 100}% discount`}`);
    } else {
      setDiscount(0);
      toast.error("Invalid promo code");
    }
  };

  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setDeliveryPincode(value);
    if (value.length !== 6) {
      setShippingCost(null);
      setDeliveryEstimate("");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <ToastContainer position="bottom-right" />

      <Link href="/notebook-gallery" className="flex items-center text-blue-600 mb-4 hover:text-blue-800">
        <FiArrowLeft className="mr-2" /> Continue Shopping
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold mb-6">Your Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <FiShoppingBag className="mx-auto text-gray-400 text-6xl mb-4" />
          <p className="text-lg mb-4">Your cart is empty</p>
          <Link href="/notebook-gallery" className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Browse Notebooks
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Cart Items */}
          <div className="lg:w-2/3 space-y-4">
  {cartItems.map((item) => (
    <div
      key={item.id}
      className="flex flex-col sm:flex-row items-start sm:items-center border p-4 rounded-lg gap-4"
    >
      {/* Left Aligned Image */}
      <div className="w-24 h-24 relative flex-shrink-0">
        <Image
          src={item.product?.gridImage || "/placeholder-product.jpg"}
          alt={item.product?.name || "Product"}
          fill
          className="object-cover rounded-lg"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 w-full">
        <h2 className="font-medium text-lg">{item.product?.name}</h2>
        {item.product?.designation && (
          <p className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded inline-block mt-1">
            {item.product.designation}
          </p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Weight: {(item.product?.weight || 0.5) * item.quantity} kg
        </p>
        <p className="mt-2 text-gray-700 font-medium">
          ₹{(item.product?.price || 0).toFixed(2)}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2 mt-2 sm:mt-0">
        <button
          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
          className="p-2 rounded border"
        >
          <FiMinus />
        </button>
        <input
          type="number"
          min="1"
          max="99"
          value={item.quantity}
          onChange={(e) =>
            handleUpdateQuantity(
              item.id,
              Math.min(99, Math.max(1, parseInt(e.target.value) || 1))
            )
          }
          className="w-12 text-center border rounded"
        />
        <button
          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
          className="p-2 rounded border"
        >
          <FiPlus />
        </button>
        <button
          onClick={() => handleRemoveItem(item.id)}
          className="text-red-500 ml-2"
        >
          <FiTrash2 />
        </button>
      </div>
    </div>
  ))}

  {/* Shipping Section */}
  <div className="mt-6 border p-4 rounded-lg space-y-4">
    <h3 className="font-medium flex items-center gap-2 text-lg">
      <FiTruck /> Shipping Information
    </h3>

    <input
      type="text"
      maxLength={6}
      placeholder="Enter 6-digit pincode"
      value={deliveryPincode}
      onChange={handlePincodeChange}
      className={`w-full p-2 border rounded focus:ring-2 ${
        formErrors.pincode
          ? "border-red-500 focus:ring-red-500"
          : "focus:ring-blue-500"
      }`}
    />
    {formErrors.pincode && (
      <p className="text-red-500 text-sm flex items-center gap-1">
        <FiAlertCircle /> {formErrors.pincode}
      </p>
    )}

    <button
      onClick={calculateShipping}
      disabled={isCheckingShipping || deliveryPincode.length !== 6}
      className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {isCheckingShipping ? "Calculating..." : "Check Shipping"}
    </button>

    {shippingCost !== null && (
      <div className="p-3 bg-blue-50 rounded">
        <p>Shipping Cost: ₹{shippingCost.toFixed(2)}</p>
        <p className="text-sm text-gray-600">Estimated delivery: {deliveryEstimate}</p>
      </div>
    )}
  </div>
</div>


          {/* Order Summary */}
          <div className="lg:w-1/3 space-y-4 border p-4 rounded-lg h-fit sticky top-4">
            <h3 className="text-lg font-bold mb-4">Order Summary</h3>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shippingCost === null ? (
                    <span className="text-red-500">Check Shipping</span>
                  ) : subtotal > 499 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    `₹${shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <input
              type="text"
              placeholder="Promo Code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />
            <button onClick={applyPromoCode} className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700">
              Apply Promo
            </button>

            <Link
              href={isLoggedIn ? "/checkout" : "/admin/login"}
              className={`block text-center py-3 rounded font-medium ${
                shippingCost === null ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700"
              }`}
              onClick={(e) => {
                if (shippingCost === null || cartItems.length === 0) {
                  e.preventDefault();
                  toast.error(shippingCost === null ? "Check shipping first" : "Cart is empty");
                }
              }}
            >
              {isLoggedIn ? "Proceed to Checkout" : "Login to Checkout"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
