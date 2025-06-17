"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiTruck, FiCreditCard, FiUser, FiMail, FiPhone, FiMapPin, FiLoader } from "react-icons/fi";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CheckoutPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pickupPincode] = useState("110001"); // Default Shiprocket warehouse
  const [deliveryPincode, setDeliveryPincode] = useState("");
  const [shippingCost, setShippingCost] = useState(null);
  const [checkingShipping, setCheckingShipping] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    // Load cart items
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(cart);

    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCheckShipping = async () => {
    if (!deliveryPincode) {
      toast.error("Please enter your pincode");
      return;
    }

    if (!/^\d{6}$/.test(deliveryPincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }

    setCheckingShipping(true);
    try {
      const res = await fetch("/api/shiprocket/shipping-cost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup_pincode: pickupPincode,
          delivery_pincode: deliveryPincode,
          weight: 0.5, // in KG
        }),
      });

      const data = await res.json();
      const bestRate = data?.data?.available_courier_companies?.[0]?.rate;

      if (bestRate !== undefined) {
        setShippingCost(bestRate);
        toast.success(`Shipping available for ₹${bestRate}`);
      } else {
        setShippingCost(null);
        toast.error("No shipping service available for this pincode");
      }
    } catch (err) {
      console.error("Error checking shipping:", err);
      toast.error("Error checking shipping availability");
      setShippingCost(null);
    } finally {
      setCheckingShipping(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!customerDetails.name) {
      toast.error("Please enter your name");
      return false;
    }
    if (!customerDetails.email || !/^\S+@\S+\.\S+$/.test(customerDetails.email)) {
      toast.error("Please enter a valid email");
      return false;
    }
    if (!customerDetails.phone || !/^\d{10}$/.test(customerDetails.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }
    if (!customerDetails.address) {
      toast.error("Please enter your address");
      return false;
    }
    if (!deliveryPincode) {
      toast.error("Please enter your pincode");
      return false;
    }
    if (shippingCost === null || typeof shippingCost !== 'number') {
      toast.error("Please check shipping availability");
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const amountWithShipping = subtotal + shippingCost;

    setLoading(true);

    try {
      // First create an order in your database
      const orderRes = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountWithShipping,
          items: cartItems,
          customer: customerDetails,
          shipping: {
            cost: shippingCost,
            pincode: deliveryPincode
          }
        }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        throw new Error("Order creation failed");
      }

      // Then create Razorpay order
      const paymentRes = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: amountWithShipping * 100, // Convert to paise
          orderId: orderData.orderId
        }),
      });

      const paymentData = await paymentRes.json();

      if (!paymentData?.id) {
        throw new Error("Payment order creation failed");
      }

      if (!window.Razorpay) {
        toast.error("Payment service not available. Please refresh.");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: paymentData.amount,
        currency: "INR",
        name: "Notebookforu",
        description: "Purchase of Notebooks",
        order_id: paymentData.id,
        handler: async function (response) {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderData.orderId
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              // Clear cart on successful payment
              localStorage.removeItem("cart");
              toast.success("Payment successful! Order confirmed.");
              router.push(`/success?order_id=${orderData.orderId}`);
            } else {
              toast.error("Payment verification failed");
              router.push(`/failed?order_id=${orderData.orderId}`);
            }
          } catch (err) {
            console.error("Verification error:", err);
            toast.error("Error verifying payment");
            router.push(`/failed?order_id=${orderData.orderId}`);
          }
        },
        prefill: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.phone,
        },
        notes: {
          address: customerDetails.address,
          pincode: deliveryPincode,
        },
        theme: {
          color: "#4f46e5",
        },
        modal: {
          ondismiss: function() {
            toast.info("Payment window closed");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Checkout Error:", err);
      toast.error("An error occurred during checkout");
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <ToastContainer position="bottom-right" />
      
      <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>

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
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email*</label>
                <input
                  type="email"
                  name="email"
                  value={customerDetails.email}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number*</label>
                <input
                  type="tel"
                  name="phone"
                  value={customerDetails.phone}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  maxLength="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Delivery Pincode*</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={deliveryPincode}
                    onChange={(e) => setDeliveryPincode(e.target.value)}
                    className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="6-digit pincode"
                    maxLength="6"
                    required
                  />
                  <button
                    onClick={handleCheckShipping}
                    disabled={checkingShipping}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {checkingShipping ? <FiLoader className="animate-spin" /> : <FiTruck />}
                    {checkingShipping ? "Checking..." : "Check"}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Complete Address*</label>
              <textarea
                name="address"
                value={customerDetails.address}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-4 py-2 h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="House no, Building, Street, Area"
              />
            </div>
            
            {shippingCost !== null && typeof shippingCost === 'number' && (
              <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-3">
                <FiTruck className="text-blue-600 text-xl" />
                <div>
                  <p className="font-medium">Shipping available to your location</p>
                  <p className="text-sm">Estimated delivery: 3-5 business days</p>
                </div>
                <div className="ml-auto font-bold">₹{shippingCost}</div>
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
                  <input type="radio" id="razorpay" name="payment" checked className="accent-blue-600" />
                  <label htmlFor="razorpay" className="font-medium">Pay with Razorpay</label>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600">
                  You'll be redirected to Razorpay's secure payment gateway to complete your purchase.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4">
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
            </div>
            
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>
                  ₹{(
                    calculateSubtotal() + 
                    (shippingCost && typeof shippingCost === 'number' ? shippingCost : 0)
                  ).toFixed(2)}
                </span>
              </div>
            </div>
            
            <button
              onClick={handlePayment}
              disabled={loading || shippingCost === null}
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
                  Pay Now
                </>
              )}
            </button>
            
            <p className="text-xs text-gray-500 mt-4 text-center">
              Your personal data will be used to process your order and for other purposes described in our privacy policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;