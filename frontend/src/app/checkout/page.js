"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FiTruck, FiCreditCard, FiUser, FiMail, FiPhone, FiMapPin, FiLoader, FiAlertCircle, FiCheck } from "react-icons/fi";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { calculateShippingCost, calculateTotalWeight } from '@/components/DeliveryChargeCalculator';
import { getAuth } from "firebase/auth";
import productData from "@/data/productData";

const CheckoutPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deliveryPincode, setDeliveryPincode] = useState("");
  const [shippingCost, setShippingCost] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState("razorpay");
  const [checkingShipping, setCheckingShipping] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [deliveryEstimate, setDeliveryEstimate] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [shippingChecked, setShippingChecked] = useState(false);
const [promoCode, setPromoCode] = useState("");
const [promoDiscount, setPromoDiscount] = useState(0);
const [promoError, setPromoError] = useState("");
const [lastCheckedPincode, setLastCheckedPincode] = useState("");

  const auth = getAuth();
  const user = auth.currentUser;

  const [customerDetails, setCustomerDetails] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: ""
  });

  // Enrich cart items with product data
const enrichCartItems = (cart) => {
  const urlParams = new URLSearchParams(window.location.search);
  const directItemParam = urlParams.get("directItem");

  if (directItemParam) {
    try {
      const directItem = JSON.parse(decodeURIComponent(directItemParam));
      cart = [directItem];
    } catch (err) {
      console.error("Invalid directItem param:", err);
    }
  }

  const findProductById = (type, id) => {
    const productTypeMap = {
      notebook: "notebooks",
      diary: "diaries",
      combination: "combinations"
    };

    const category = productTypeMap[type];
    if (category && productData[category]) {
      return productData[category][id] || productData[category][String(id)];
    }

    // fallback in case type is missing
    for (const cat in productData) {
      const product = productData[cat][id] || productData[cat][String(id)];
      if (product) return product;
    }

    return null;
  };

  return cart.map((cartItem) => {
    const foundProduct = findProductById(cartItem.type, cartItem.id); // ✅ Corrected

    return {
      ...cartItem,
      itemId: cartItem.itemId,
      name: foundProduct?.name || cartItem.name || "Unknown Product",
      price: foundProduct?.price ?? cartItem.price ?? 0,
      weight: foundProduct?.weight ?? cartItem.weight ?? 0.5,
      gridImage: foundProduct?.gridImage || cartItem.gridImage || "/placeholder-product.jpg",
      product: foundProduct,
      pageType: cartItem.pageType || "Ruled"
    };
  });
};





  // Calculate order totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalWeight = calculateTotalWeight(cartItems);
  const finalShippingCost = subtotal > 499 ? 0 : (shippingCost || 0);
  const amountWithShipping = subtotal + finalShippingCost - promoDiscount;

  const shippingAddress = `${customerDetails.address}, ${customerDetails.city}, ${customerDetails.state} - ${deliveryPincode}`;


  // Load cart and Razorpay script
  useEffect(() => {
    const loadCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        if (!Array.isArray(cart)) throw new Error("Invalid cart data");
        
        const enrichedCart = enrichCartItems(cart);
        setCartItems(enrichedCart);
      } catch (err) {
        console.error("Error loading cart:", err);
        toast.error("Could not load your cart. Please refresh the page.");
        localStorage.setItem("cart", "[]");
        setCartItems([]);
      }
    };
const appliedPromo = localStorage.getItem("promoCode");
if (appliedPromo) {
  setPromoCode(appliedPromo);
  handleApplyPromo(); // try apply
}

    const loadRazorpay = () => {
      if (window.Razorpay) {
        setIsRazorpayLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.id = "razorpay-script";
      
      script.onload = () => {
        if (window.Razorpay) {
          setIsRazorpayLoaded(true);
        } else {
          console.error("Razorpay object not available after script load");
          setTimeout(loadRazorpay, 2000);
        }
      };
      
      script.onerror = () => {
        console.error("Failed to load Razorpay script");
        setTimeout(loadRazorpay, 2000);
      };

      document.body.appendChild(script);
    };

    loadCart();
    loadRazorpay();

    return () => {
      const script = document.getElementById("razorpay-script");
      if (script) document.body.removeChild(script);
    };
  }, []);

  // Validate form fields
  const validateForm = useCallback(() => {
    const errors = {};
    let isValid = true;

    if (!customerDetails.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }

    if (!/^\S+@\S+\.\S+$/.test(customerDetails.email)) {
      errors.email = "Valid email is required";
      isValid = false;
    }

    if (!/^\d{10}$/.test(customerDetails.phone)) {
      errors.phone = "10-digit phone number required";
      isValid = false;
    }

    if (!customerDetails.address.trim()) {
      errors.address = "Address is required";
      isValid = false;
    }

    if (!customerDetails.city.trim()) {
      errors.city = "City is required";
      isValid = false;
    }

    if (!customerDetails.state.trim()) {
      errors.state = "State is required";
      isValid = false;
    }

    if (!/^\d{6}$/.test(deliveryPincode)) {
      errors.pincode = "Valid 6-digit pincode required";
      isValid = false;
    }

    if (!shippingChecked) {
      errors.shipping = "Please check shipping availability";
      isValid = false;
    }

    if (cartItems.length === 0) {
      errors.cart = "Your cart is empty";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  }, [customerDetails, deliveryPincode, shippingChecked, cartItems]);

  // Check shipping availability
  const handleCheckShipping = async () => {
    if (!/^\d{6}$/.test(deliveryPincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }

    setCheckingShipping(true);
    try {
      const shippingInfo = await calculateShippingCost(deliveryPincode, totalWeight);
      
      if (!shippingInfo || typeof shippingInfo.shippingCost !== "number") {
        throw new Error("Invalid shipping response");
      }
setLastCheckedPincode(deliveryPincode); 
      // Apply free shipping if subtotal > 499
      const finalShippingCost = subtotal > 499 ? 0 : shippingInfo.shippingCost;
      
      setShippingCost(finalShippingCost);
      setDeliveryEstimate(shippingInfo.deliveryEstimate || "4-7 business days");
      setShippingChecked(true);
      toast.success(`Shipping to ${deliveryPincode} available`);
    } catch (err) {
      console.error("Shipping error:", err);
      toast.error(err.message || "Could not calculate shipping");
      setShippingCost(null);
      setDeliveryEstimate("");
      setShippingChecked(false);
    } finally {
      setCheckingShipping(false);
    }
  };
const handleApplyPromo = () => {
  const code = promoCode.trim().toUpperCase();

  if (!code) {
    toast.info("Please enter a promo code");
    return;
  }

  if (shippingCost === null) {
    toast.error("Please check shipping before applying promo");
    return;
  }

  const fullAmount = subtotal + (subtotal > 499 ? 0 : shippingCost || 0);

  const promoMap = {
    WELCOME10: {
      type: "percent",
      value: 0.10,
      condition: subtotal >= 200,
      error: "Minimum ₹200 subtotal required for WELCOME10",
    },
    NOTEBOOK10: {
      type: "percent",
      value: 0.10,
      condition: true,
    },
    NOTEBOOK20: {
      type: "percent",
      value: 0.20,
      condition: true,
    },
    FREESHIP: {
      type: "shipping",
      value: shippingCost || 0,
      condition: true,
    },
  };

  const promo = promoMap[code];

  if (!promo || !promo.condition) {
    setPromoDiscount(0);
    setPromoError(promo?.error || "Invalid promo or conditions not met");
    toast.error(promo?.error || "Invalid promo code");
    return;
  }

  let discount = 0;

  if (promo.type === "percent") {
    discount = Math.min(fullAmount * promo.value, 100); // Optional: cap max discount
    toast.success(`Promo applied! ${promo.value * 100}% off`);
  } else if (promo.type === "shipping") {
    discount = promo.value;
    toast.success("Promo applied! Free shipping");
  }

  setPromoDiscount(discount);
  setPromoError("");
  localStorage.setItem("promoCode", code); // sync for later page load
};


  // Sanitize input data
  const sanitizeInput = (input) => {
    if (typeof input !== "string") return "";
    return input
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .trim();
  };

  // Process payment
 const handlePayment = async () => {
  if (!validateForm()) {
    toast.error("Please fix all form errors before proceeding");
    return;
  }

  if (!isRazorpayLoaded) {
    toast.error("Payment system is still loading. Please wait...");
    return;
  }

  setLoading(true);
  const toastId = toast.loading("Processing your order...");

  try {
    const idToken = await user?.getIdToken();
    if (!idToken) throw new Error("Authentication required");

    const finalAmount = subtotal > 499 ? subtotal : subtotal + (shippingCost || 0) - promoDiscount;

    const orderData = {
      amount: Math.round(finalAmount * 100), // in paise
      currency: "INR",
      items: cartItems.map(item => ({
        id: item.id,
        name: sanitizeInput(item.name),
        price: item.price,
        quantity: item.quantity,
        weight: item.weight || 0.5,
        pageType: sanitizeInput(item.pageType || "Ruled")
      })),
      customer: {
        name: sanitizeInput(customerDetails.name),
        email: sanitizeInput(customerDetails.email),
        phone: sanitizeInput(customerDetails.phone),
        userId: user?.uid || "guest"
      },
      shipping: {
        cost: subtotal > 499 ? 0 : shippingCost,
        pincode: deliveryPincode,
        estimate: deliveryEstimate,
        address: sanitizeInput(shippingAddress)
      },
      paymentMethod: "razorpay",

      // ✅ Include promo info
      promo: {
        code: promoCode || null,
        discount: promoDiscount || 0
      },

      _metadata: {
        userAgent: navigator.userAgent,
        ip: await fetch('https://api.ipify.org?format=json')
             .then(res => res.json())
             .then(data => data.ip)
             .catch(() => "unknown"),
        device: window.innerWidth < 768 ? "mobile" : "desktop",
        freeShippingApplied: subtotal > 499
      }
    };

    const orderResponse = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`,
        "X-Request-ID": `order_${Date.now()}`
      },
      body: JSON.stringify(orderData),
    });

    if (!orderResponse.ok) {
      const error = await orderResponse.json().catch(() => ({}));
      throw new Error(error.error || "Order creation failed");
    }

    const orderResult = await orderResponse.json();
    if (!orderResult?.data?.orderId) {
      console.error('Invalid order response:', orderResult);
      throw new Error("Invalid order response - Missing orderId");
    }

    const { orderId } = orderResult.data;

    const paymentResponse = await fetch("/api/razorpay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`
      },
      body: JSON.stringify({
        amount: orderData.amount,
        orderId
      })
    });

    if (!paymentResponse.ok) {
      throw new Error("Payment gateway error");
    }

    const paymentData = await paymentResponse.json();
    if (!paymentData?.data?.id) {
      throw new Error(
        paymentData.error ||
        `Payment failed (Status: ${paymentResponse.status})`
      );
    }

    const rzpOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: paymentData.data.amount,
      currency: paymentData.data.currency,
      name: "Notebook ForU",
      description: `Order #${orderId}`,
      order_id: paymentData.data.id,
      handler: async (response) => {
        try {
          const verificationToast = toast.loading("Verifying payment...");

          const verificationData = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            orderId,
            _metadata: {
              userAgent: navigator.userAgent,
              timestamp: new Date().toISOString(),
              ip: await fetch('https://api.ipify.org?format=json')
                   .then(res => res.json())
                   .then(data => data.ip)
                   .catch(() => "unknown")
            }
          };

          const verification = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${idToken}`,
              "X-Request-ID": `verify_${Date.now()}`
            },
            body: JSON.stringify(verificationData),
            signal: AbortSignal.timeout(10000)
          });

          const verificationResult = await verification.json();

          if (!verification.ok || !verificationResult.success) {
            throw new Error(verificationResult.error || "Payment verification failed");
          }

          localStorage.removeItem("cart");
          localStorage.removeItem("promoCode");
          toast.dismiss(verificationToast);
          toast.success("Payment successful!");
         router.push(`/success?order_id=${orderId}&promo=${promoCode}&discount=${promoDiscount}`);

        } catch (error) {
          console.error("Payment verification error:", error);
          toast.dismiss();
          toast.error(error.message || "Payment verification failed");
          router.push(`/order-failed?id=${orderId}&error=${encodeURIComponent(error.message)}`);
        }
      },
      prefill: {
        name: customerDetails.name,
        email: customerDetails.email,
        contact: customerDetails.phone
      },
      theme: { color: "#4f46e5" },
      modal: {
        ondismiss: () => toast.info("Payment window closed - payment not completed")
      },
      notes: {
        orderId,
        userId: user?.uid || "guest",
        source: "web-checkout",
        freeShipping: subtotal > 499,
        promoCode: promoCode || "",
        promoDiscount: promoDiscount || 0
      }
    };

    const rzp = new window.Razorpay(rzpOptions);
    rzp.on("payment.failed", (response) => {
      console.error("Payment failed:", response.error);
      toast.error(`Payment failed: ${response.error.description}`);
      router.push(`/order-failed?id=${orderId}`);
    });
    rzp.open();

  } catch (error) {
    console.error("Payment error:", error);
    toast.error(error.message || "Payment processing failed");
  } finally {
    toast.dismiss(toastId);
    setLoading(false);
  }
};


  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <ToastContainer position="bottom-right" autoClose={5000} />
      <h1 className="text-3xl font-bold text-center mb-8">Secure Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Customer Information */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FiUser className="text-blue-600" /> Customer Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name*</label>
                <input
                  type="text"
                  name="name"
                  value={customerDetails.name}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg px-4 py-2 focus:ring-2 ${
                    formErrors.name ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                  }`}
                  required
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <FiAlertCircle /> {formErrors.name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email*</label>
                <input
                  type="email"
                  name="email"
                  value={customerDetails.email}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg px-4 py-2 focus:ring-2 ${
                    formErrors.email ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                  }`}
                  required
                />
                {formErrors.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <FiAlertCircle /> {formErrors.email}
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Phone*</label>
                <input
                  type="tel"
                  name="phone"
                  value={customerDetails.phone}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg px-4 py-2 focus:ring-2 ${
                    formErrors.phone ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                  }`}
                  required
                  maxLength="10"
                />
                {formErrors.phone && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <FiAlertCircle /> {formErrors.phone}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pincode*</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={deliveryPincode}
          onChange={(e) => {
  const newPincode = e.target.value.replace(/\D/g, '').slice(0, 6);
  const wasSamePincode = newPincode === lastCheckedPincode;

  setDeliveryPincode(newPincode);
  setShippingChecked(false);
  setShippingCost(null);
  setDeliveryEstimate("");

  if (!wasSamePincode) {
    // New pincode: reset promo
    setPromoCode("");
    setPromoDiscount(0);
    setPromoError("");
    localStorage.removeItem("promoCode");
  } else {
    // Same pincode again: try auto-reapply promo
    const saved = localStorage.getItem("promoCode");
    if (saved) {
      setPromoCode(saved);
      setTimeout(() => {
        handleApplyPromo();
      }, 100); // slight delay to ensure state update
    }
  }

  // Clear error if any
  if (formErrors.pincode) {
    setFormErrors(prev => ({ ...prev, pincode: "" }));
  }
}}

                    className={`flex-1 border rounded-lg px-4 py-2 focus:ring-2 ${
                      formErrors.pincode ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                    }`}
                    placeholder="6-digit pincode"
                    maxLength="6"
                    required
                  />
                  <button
                    onClick={handleCheckShipping}
                    disabled={checkingShipping || deliveryPincode.length !== 6}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {checkingShipping ? (
                      <FiLoader className="animate-spin" />
                    ) : shippingChecked ? (
                      <FiCheck />
                    ) : (
                      <FiTruck />
                    )}
                    {checkingShipping ? "Checking..." : shippingChecked ? "Verified" : "Check"}
                  </button>
                </div>
                {formErrors.pincode && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <FiAlertCircle /> {formErrors.pincode}
                  </p>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Address*</label>
              <textarea
                name="address"
                value={customerDetails.address}
                onChange={handleInputChange}
                className={`w-full border rounded-lg px-4 py-2 h-24 focus:ring-2 ${
                  formErrors.address ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                }`}
                required
                placeholder="House no, Building, Street, Area"
              />
              {formErrors.address && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <FiAlertCircle /> {formErrors.address}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">City*</label>
                <input
                  type="text"
                  name="city"
                  value={customerDetails.city}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg px-4 py-2 focus:ring-2 ${
                    formErrors.city ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                  }`}
                  required
                />
                {formErrors.city && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <FiAlertCircle /> {formErrors.city}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State*</label>
                <input
                  type="text"
                  name="state"
                  value={customerDetails.state}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg px-4 py-2 focus:ring-2 ${
                    formErrors.state ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                  }`}
                  required
                />
                {formErrors.state && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <FiAlertCircle /> {formErrors.state}
                  </p>
                )}
              </div>
            </div>
            
            {formErrors.shipping && (
              <p className="text-red-500 text-xs mb-2 flex items-center gap-1">
                <FiAlertCircle /> {formErrors.shipping}
              </p>
            )}
            
            {shippingChecked && (
              <div className={`p-3 rounded-lg flex items-center gap-3 ${
                shippingCost === null ? "bg-red-50" : "bg-blue-50"
              }`}>
                {shippingCost === null ? (
                  <FiAlertCircle className="text-red-600 text-xl" />
                ) : (
                  <FiTruck className="text-blue-600 text-xl" />
                )}
                <div>
                  <p className="font-medium">
                    {shippingCost === null ? "Shipping unavailable" : 
                     subtotal > 499 ? "Free shipping applied!" : "Shipping available"}
                  </p>
                  {shippingCost !== null && (
                    <p className="text-sm">Estimated delivery: {deliveryEstimate}</p>
                  )}
                </div>
                {shippingCost !== null && (
                  <div className="ml-auto font-bold">
                    {subtotal > 499 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${shippingCost.toFixed(2)}`
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FiCreditCard className="text-blue-600" /> Payment Method
            </h2>
            <div className="border rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="razorpay"
                    name="payment"
                    value="razorpay"
                    checked={selectedPayment === "razorpay"}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                    className="accent-blue-600"
                  />
                  <label htmlFor="razorpay" className="font-medium">Pay with Razorpay</label>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600">
                  Secure payment via Razorpay. We support UPI, Credit/Debit Cards, Net Banking.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            {formErrors.cart && (
              <p className="text-red-500 text-xs mb-2 flex items-center gap-1">
                <FiAlertCircle /> {formErrors.cart}
              </p>
            )}
            
            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between border-b pb-3">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">
  Qty: {item.quantity} • {item.pageType}
</p>

                  </div>
                  <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shippingCost === null ? (
                    <span className="text-red-500">Not calculated</span>
                  ) : subtotal > 499 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    `₹${shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="mb-4">
  <label className="block text-sm font-medium mb-1">Promo Code</label>
  <div className="flex gap-2">
    <input
      type="text"
      value={promoCode}
      onChange={(e) => setPromoCode(e.target.value)}
      placeholder="Enter promo code"
      className="flex-1 border rounded-lg px-4 py-2 focus:ring-blue-500"
    />
    <button
      onClick={handleApplyPromo}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
    >
      Apply
    </button>
  </div>
  {promoError && <p className="text-red-500 text-xs mt-1">{promoError}</p>}
  {promoDiscount > 0 && (
    <p className="text-green-600 text-sm mt-1">
      Promo applied: -₹{promoDiscount.toFixed(2)}
    </p>
  )}
</div>

            </div>
            
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{(subtotal > 499 ? subtotal : amountWithShipping).toFixed(2)}</span>
              </div>
            </div>
            
            <button
              onClick={handlePayment}
              disabled={loading || !isRazorpayLoaded || !shippingChecked || cartItems.length === 0}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FiCreditCard />
                  {!isRazorpayLoaded ? "Loading payment..." : `Pay ₹${(subtotal > 499 ? subtotal : amountWithShipping).toFixed(2)}`}
                </>
              )}
            </button>
            
            <p className="text-xs text-gray-500 mt-4 text-center">
              {subtotal > 499 ? (
                <span className="text-green-600">Free shipping applied!</span>
              ) : (
                `Add ₹${(499 - subtotal).toFixed(2)} more for free shipping`
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;