'use client';
import { useEffect, useState, useMemo } from "react";
import {
  FiTrash2,
  FiPlus,
  FiMinus,
  FiShoppingBag,
  FiArrowLeft,
  FiTruck,
  FiAlertCircle,
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

  const subtotal = useMemo(
    () =>
      cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0),
    [cartItems]
  );

  const totalWeight = useMemo(
    () =>
      cartItems.reduce((sum, item) => sum + (item.weight || 0.5) * item.quantity, 0),
    [cartItems]
  );

  const total = useMemo(() => {
    const finalShippingCost = subtotal > 499 ? 0 : shippingCost || 0;
    return subtotal + finalShippingCost - discount;
  }, [subtotal, shippingCost, discount]);

  useEffect(() => {
    const loadCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const enrichedCart = cart.map((cartItem) => {
  let foundProduct = null;

  const matchId = (obj, id) =>
    obj[id] || obj[String(id)] || obj[Number(id)];

  // Step 1: Use mapping from 'notebook' → 'notebooks'
  const productTypeMap = {
    notebook: "notebooks",
    diary: "diaries",
    combination: "combinations",
  };
  const dataKey = productTypeMap[cartItem.type];

  if (dataKey && productData[dataKey]) {
    foundProduct = matchId(productData[dataKey], cartItem.id);
  }

  // Step 2: Fallback search if not found
  if (!foundProduct) {
    for (const category in productData) {
      foundProduct = matchId(productData[category], cartItem.id);
      if (foundProduct) break;
    }
  }

  // Step 3: Merge and return
  return {
    ...cartItem,
    product: foundProduct || {
      name: cartItem.name || "Unknown Product",
      price: cartItem.price || 0,
      weight: cartItem.weight || 0.5,
      gridImage: cartItem.gridImage || "/placeholder-product.jpg",
      designation: cartItem.designation,
    },
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
      setFormErrors((prev) => ({
        ...prev,
        pincode: "Enter valid 6-digit pincode",
      }));
      return;
    }
    if (cartItems.length === 0) return;

    setIsCheckingShipping(true);
    try {
      const { shippingCost, deliveryEstimate } = calculateShippingCost(
        deliveryPincode,
        totalWeight
      );
      const finalShippingCost = subtotal > 499 ? 0 : shippingCost;
      setShippingCost(finalShippingCost);
      setDeliveryEstimate(deliveryEstimate);
      setFormErrors((prev) => ({ ...prev, pincode: "" }));
    } catch (err) {
      console.error("Shipping error:", err);
      toast.error("Error calculating shipping");
      setShippingCost(null);
      setDeliveryEstimate("");
    } finally {
      setIsCheckingShipping(false);
    }
  };

  const handleRemoveItem = (itemIdToRemove) => {
    const updatedCart = cartItems.filter((item) => item.itemId !== itemIdToRemove);
    setCartItems(updatedCart);
    localStorage.setItem(
      "cart",
      JSON.stringify(
        updatedCart.map((item) => ({
          itemId: item.itemId,
          id: item.id,
          type: item.type,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          weight: item.weight,
          pageType: item.pageType,
          gridImage: item.product?.gridImage,
        }))
      )
    );
    toast.success("Item removed from cart");
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1 || newQuantity > 99) return;

    const updatedCart = cartItems.map((item) =>
      item.itemId === itemId ? { ...item, quantity: newQuantity } : item
    );

    setCartItems(updatedCart);
    localStorage.setItem(
      "cart",
      JSON.stringify(
        updatedCart.map((item) => ({
          itemId: item.itemId,
          id: item.id,
          type: item.type,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          weight: item.weight,
          pageType: item.pageType,
          gridImage: item.product?.gridImage,
        }))
      )
    );
  };

 const applyPromoCode = () => {
  if (!promoCode) {
    toast.info("Please enter a promo code");
    return;
  }

  if (shippingCost === null) {
    toast.error("Please check shipping before applying promo");
    return;
  }

  const code = promoCode.toUpperCase();
  const validCodes = {
    NOTEBOOK10: 0.1,
    NOTEBOOK20: 0.2,
    FREESHIP: shippingCost || 0,
  };

  if (validCodes[code]) {
    const fullAmount = subtotal + (subtotal > 499 ? 0 : shippingCost || 0);
    const discountValue =
      code === "FREESHIP" ? validCodes[code] : fullAmount * validCodes[code];

    setDiscount(discountValue);
    toast.success(
      `Promo code applied! ${
        code === "FREESHIP"
          ? "Free shipping"
          : `${validCodes[code] * 100}% discount`
      }`
    );
  } else {
    setDiscount(0);
    toast.error("Invalid promo code");
  }
};


  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
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
      <Link
        href="/notebook-gallery"
        className="flex items-center text-blue-600 mb-4 hover:text-blue-800"
      >
        <FiArrowLeft className="mr-2" /> Continue Shopping
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold mb-6">Your Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <FiShoppingBag className="mx-auto text-gray-400 text-6xl mb-4" />
          <p className="text-lg mb-4">Your cart is empty</p>
          <Link
            href="/notebook-gallery"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Browse Notebooks
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items */}
          <div className="lg:w-2/3 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.itemId}
                className="flex flex-col sm:flex-row items-start sm:items-center border p-4 rounded-lg gap-4"
              >
                {/* Image */}
                <div className="w-24 h-24 relative flex-shrink-0">
                  <Image
                    src={item.product?.gridImage || "/placeholder-product.jpg"}
                    alt={item.product?.name || "Product"}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 w-full">
                  <h2 className="font-medium text-lg">
                    {item.product?.name}{" "}
                    <span className="text-sm font-normal text-gray-500">
                      ({item.pageType})
                    </span>
                  </h2>
                  <p className="text-xs text-gray-500 mb-1">
                    {item.type === "notebook"
                      ? "Notebook"
                      : item.type === "diary"
                      ? "Diary"
                      : item.type === "combination"
                      ? "Combo Pack"
                      : "Product"}
                  </p>
                  {item.product?.designation && (
                    <p className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded inline-block mt-1">
                      {item.product.designation}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Weight: {(item.product?.weight || 0.5) * item.quantity} kg
                  </p>
                  <p className="mt-2 text-gray-700 font-medium">
                    ₹{(item.price || 0).toFixed(2)}
                  </p>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <button
                    onClick={() =>
                      handleUpdateQuantity(item.itemId, item.quantity - 1)
                    }
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
                        item.itemId,
                        Math.min(99, Math.max(1, parseInt(e.target.value) || 1))
                      )
                    }
                    className="w-12 text-center border rounded"
                  />
                  <button
                    onClick={() =>
                      handleUpdateQuantity(item.itemId, item.quantity + 1)
                    }
                    className="p-2 rounded border"
                  >
                    <FiPlus />
                  </button>
                  <button
                    onClick={() => handleRemoveItem(item.itemId)}
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
                  <p className="text-sm text-gray-600">
                    Estimated delivery: {deliveryEstimate}
                  </p>
                  {subtotal > 499 && (
                    <p className="text-sm text-green-600 mt-1">
                      Free shipping will be applied at checkout!
                    </p>
                  )}
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
            <button
              onClick={applyPromoCode}
              className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700"
            >
              Apply Promo
            </button>
            <Link
              href={isLoggedIn ? "/checkout" : "/admin/login"}
              className={`block text-center py-3 rounded font-medium ${
                shippingCost === null
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
              onClick={(e) => {
  if (shippingCost === null || cartItems.length === 0) {
    e.preventDefault();
    toast.error(
      shippingCost === null ? "Check shipping first" : "Cart is empty"
    );
    return;
  }

  // Save total, discount, shipping, etc. for checkout
  localStorage.setItem(
    "checkoutSummary",
    JSON.stringify({
      subtotal,
      shippingCost: subtotal > 499 ? 0 : shippingCost,
      discount,
      total,
      deliveryPincode,
      deliveryEstimate,
    })
  );
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
