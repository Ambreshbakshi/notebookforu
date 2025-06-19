"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FiTruck, FiCreditCard, FiUser, FiMail, FiPhone, FiMapPin, FiLoader, FiAlertCircle } from "react-icons/fi";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { calculateShippingCost, calculateTotalWeight } from '@/components/DeliveryChargeCalculator';
import { getAuth } from "firebase/auth";

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

  // Calculate order totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalWeight = calculateTotalWeight(cartItems);
  const amountWithShipping = subtotal + (shippingCost || 0);
  const shippingAddress = `${customerDetails.address}, ${customerDetails.city}, ${customerDetails.state} - ${deliveryPincode}`;

  // Load cart and Razorpay script
  useEffect(() => {
    // Load cart with error handling
    try {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      if (!Array.isArray(cart)) throw new Error("Invalid cart data");
      setCartItems(cart);
    } catch (err) {
      console.error("Error loading cart:", err);
      toast.error("Could not load your cart. Please refresh the page.");
      localStorage.setItem("cart", "[]");
    }

    // Load Razorpay script
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

    if (shippingCost === null) {
      errors.shipping = "Please check shipping availability";
      isValid = false;
    }

    if (cartItems.length === 0) {
      errors.cart = "Your cart is empty";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  }, [customerDetails, deliveryPincode, shippingCost, cartItems]);

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

      setShippingCost(shippingInfo.shippingCost);
      setDeliveryEstimate(shippingInfo.deliveryEstimate || "4-7 business days");
      toast.success(`Shipping to ${deliveryPincode} available`);
    } catch (err) {
      console.error("Shipping error:", err);
      toast.error(err.message || "Could not calculate shipping");
      setShippingCost(null);
      setDeliveryEstimate("");
    } finally {
      setCheckingShipping(false);
    }
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
      // 1. Get user token
      const idToken = await user?.getIdToken();
      if (!idToken) throw new Error("Authentication required");

      // 2. Prepare order data
      const orderData = {
        amount: Math.round(amountWithShipping * 100),
        currency: "INR",
        items: cartItems.map(item => ({
          id: item.id,
          name: sanitizeInput(item.name),
          price: item.price,
          quantity: item.quantity,
          weight: item.weight || 0.5
        })),
        customer: {
          name: sanitizeInput(customerDetails.name),
          email: sanitizeInput(customerDetails.email),
          phone: sanitizeInput(customerDetails.phone),
          userId: user?.uid || "guest"
        },
        shipping: {
          cost: shippingCost,
          pincode: deliveryPincode,
          estimate: deliveryEstimate,
          address: sanitizeInput(shippingAddress)
        },
        paymentMethod: "razorpay",
        _metadata: {
          userAgent: navigator.userAgent,
          ip: await fetch('https://api.ipify.org?format=json')
               .then(res => res.json())
               .then(data => data.ip)
               .catch(() => "unknown"),
          device: window.innerWidth < 768 ? "mobile" : "desktop"
        }
      };

      // 3. Create order with timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
          "X-Request-ID": `order_${Date.now()}`
        },
        body: JSON.stringify(orderData),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!orderResponse.ok) {
        const error = await orderResponse.json().catch(() => ({}));
        throw new Error(error.message || "Order creation failed");
      }

      const { order: createdOrder } = await orderResponse.json();
      if (!createdOrder?.orderId) {
        throw new Error("Invalid order response");
      }

      // 4. Create Razorpay payment
      const paymentResponse = await fetch("/api/razorpay", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({
          amount: orderData.amount,
          currency: "INR",
          receipt: createdOrder.orderId,
          notes: {
            orderId: createdOrder.orderId,
            userId: user.uid
          }
        })
      });

      if (!paymentResponse.ok) {
        throw new Error("Payment gateway error");
      }

      const payment = await paymentResponse.json();
      if (!payment?.id) {
        throw new Error("Invalid payment response");
      }

      // 5. Initialize Razorpay
      const rzpOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: payment.amount,
        currency: payment.currency,
        name: "Your Store",
        description: `Order #${createdOrder.orderId}`,
        order_id: payment.id,
        handler: async (response) => {
          try {
            const verification = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderId: createdOrder.orderId
              })
            });

            if (!verification.ok) {
              throw new Error("Verification failed");
            }

            localStorage.removeItem("cart");
            toast.success("Payment successful!");
            router.push(`/order-success?id=${createdOrder.orderId}`);
          } catch (error) {
            console.error("Verification error:", error);
            toast.error("Payment verification failed");
            router.push(`/order-failed?id=${createdOrder.orderId}`);
          }
        },
        prefill: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.phone
        },
        theme: {
          color: "#4f46e5"
        }
      };

      const rzp = new window.Razorpay(rzpOptions);
      rzp.on("payment.failed", (response) => {
        toast.error(`Payment failed: ${response.error.description}`);
        router.push(`/order-failed?id=${createdOrder.orderId}`);
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
                      setDeliveryPincode(e.target.value.replace(/\D/g, '').slice(0, 6));
                      if (formErrors.pincode) setFormErrors(prev => ({ ...prev, pincode: "" }));
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
                    {checkingShipping ? <FiLoader className="animate-spin" /> : <FiTruck />}
                    {checkingShipping ? "Checking..." : "Check"}
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
            
            {shippingCost !== null && (
              <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-3">
                <FiTruck className="text-blue-600 text-xl" />
                <div>
                  <p className="font-medium">Shipping available</p>
                  <p className="text-sm">Estimated delivery: {deliveryEstimate}</p>
                </div>
                <div className="ml-auto font-bold">₹{shippingCost.toFixed(2)}</div>
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
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
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
                  ) : (
                    `₹${shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>
            </div>
            
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{amountWithShipping.toFixed(2)}</span>
              </div>
            </div>
            
            <button
              onClick={handlePayment}
              disabled={loading || !isRazorpayLoaded || shippingCost === null || cartItems.length === 0}
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
                  {!isRazorpayLoaded ? "Loading payment..." : "Pay Now"}
                </>
              )}
            </button>
            
            <p className="text-xs text-gray-500 mt-4 text-center">
              Your personal data will be used to process your order securely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;