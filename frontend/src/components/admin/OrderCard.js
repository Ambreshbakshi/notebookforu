'use client';
import { FiCalendar, FiTruck, FiCheckCircle, FiClock, FiCreditCard, FiPackage, FiXCircle, FiDollarSign, FiClipboard, FiExternalLink } from 'react-icons/fi';
import { format, parseISO } from 'date-fns';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import toast from 'react-hot-toast';

// Custom hook for loading Razorpay script
function useRazorpay() {
  useEffect(() => {
    // Check if script is already loaded
    if (window.Razorpay) return;

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
}

export default function OrderCard({ order, totalAmount }) {
  const [authToken, setAuthToken] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

  // Load Razorpay script
  useRazorpay();

  const currentOrderId = order?.orderId || order?.id;

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          const token = await user.getIdToken(true);
          setAuthToken(token);
        } else {
          setAuthToken("");
        }
      } catch (err) {
        console.error("Token refresh error:", err);
        setError("Session expired. Please refresh the page.");
      }
    });
    return () => unsubscribe();
  }, []);

  // Check if Razorpay is loaded
  useEffect(() => {
    const checkRazorpay = setInterval(() => {
      if (window.Razorpay) {
        setIsRazorpayLoaded(true);
        clearInterval(checkRazorpay);
      }
    }, 100);

    return () => clearInterval(checkRazorpay);
  }, []);

  const shippingStatusConfig = {
    cancelled: { color: 'bg-red-100 text-red-800', icon: FiXCircle },
    in_transit: { color: 'bg-blue-100 text-blue-800', icon: FiTruck },
    out_for_delivery: { color: 'bg-yellow-100 text-yellow-800', icon: FiClock },
    delivered: { color: 'bg-green-100 text-green-800', icon: FiCheckCircle },
    not_dispatched: { color: 'bg-gray-100 text-gray-800', icon: FiPackage }
  };

  const paymentStatusConfig = {
    paid: { color: 'bg-purple-100 text-purple-800', icon: FiCreditCard },
    refund_initiated: { color: 'bg-orange-100 text-orange-800', icon: FiDollarSign },
    refunded: { color: 'bg-green-100 text-green-800', icon: FiCheckCircle },
    unpaid: { color: 'bg-gray-100 text-gray-800', icon: FiCreditCard }
  };

  const formatDate = (date) => {
    try {
      const dateObj = date?.toDate?.() || (typeof date === 'string' ? parseISO(date) : new Date(date));
      return isNaN(dateObj?.getTime()) ? 'N/A' : format(dateObj, 'PPp');
    } catch {
      return 'N/A';
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?\nRefund will be processed within 3-5 business days.")) return;

    setIsCancelling(true);
    setError(null);
    setShowSuccess(false);

    try {
      if (!authToken) throw new Error("Please sign in to cancel orders");

      const response = await fetch('/api/cancelOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ orderId: currentOrderId })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to cancel order. Please try again.");

      setShowSuccess(true);
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(order.trackingId);
    toast.success("Tracking ID copied!");
  };

  const openIndiaPost = () => {
    window.open("https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx", "_blank");
  };

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const handlePaymentGateway = async () => {
  if (!authToken) return toast.error("Please sign in to proceed");
  if (!isRazorpayLoaded) return toast.error("Payment gateway is still loading. Please wait a moment and try again.");

  try {
    setIsProcessingPayment(true);

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
      body: JSON.stringify({ orderId: currentOrderId })
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to initiate payment");
    }

    const data = await res.json();
    
    if (!data.razorpayOrderId || !data.amount) {
      throw new Error("Invalid payment gateway response");
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
      amount: data.amount,
      currency: "INR",
      name: "Notebook Foru",
      description: "Order Payment",
      order_id: data.razorpayOrderId,
      handler: async (response) => {
        try {
          const markRes = await fetch('/api/razorpay/markPaid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
            body: JSON.stringify({ orderId: currentOrderId, razorpayPaymentId: response.razorpay_payment_id })
          });

          if (!markRes.ok) {
            const errorData = await markRes.json();
            throw new Error(errorData.error || "Failed to update order status");
          }

          toast.success("Payment successful!");
          window.location.reload();
        } catch (err) {
          console.error(err);
          toast.error(err.message || "Payment verification failed");
        }
      },
      prefill: { email: order.customer?.email, contact: order.customer?.phone },
      theme: { color: "#6366f1" },
      modal: {
        ondismiss: () => {
          toast.error("Payment was cancelled or failed");
          setIsProcessingPayment(false);
        }
      }
    };

    const razor = new window.Razorpay(options);
    razor.on('payment.failed', (response) => {
      toast.error(`Payment failed: ${response.error.description}`);
      setIsProcessingPayment(false);
    });
    razor.open();
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Payment failed");
    setIsProcessingPayment(false);
  }
};

  if (!order) {
    return <div className="border rounded-2xl p-4 bg-white"><p className="text-red-500">Order data not available</p></div>;
  }

  const shippingStatus = order.shippingStatus || 'not_dispatched';
  const paymentStatus = order.paymentStatus || 'unpaid';
  const ShippingIcon = shippingStatusConfig[shippingStatus]?.icon || FiPackage;
  const PaymentIcon = paymentStatusConfig[paymentStatus]?.icon || FiCreditCard;
  const canCancel = paymentStatus === 'paid' && shippingStatus === 'not_dispatched';
  const showTrack = paymentStatus === 'paid' && shippingStatus !== 'cancelled';
  const showPaymentGateway = paymentStatus === 'unpaid' && shippingStatus !== 'cancelled';

  return (
    <div className="border rounded-2xl overflow-hidden hover:shadow-lg transition-all bg-white">
      <div className="p-4 bg-gray-50 border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <p className="font-medium text-lg">Order #{currentOrderId}</p>
          <p className="text-sm text-gray-500 flex items-center mt-1">
            <FiCalendar className="mr-1" size={14} />
            {formatDate(order.createdAt || order.date)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center ${shippingStatusConfig[shippingStatus]?.color}`}>
            <ShippingIcon className="mr-1" size={14} />
            {shippingStatus.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center ${paymentStatusConfig[paymentStatus]?.color}`}>
            <PaymentIcon className="mr-1" size={14} />
            {paymentStatus.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {order.items?.map((item) => (
          <div key={item.id} className="flex items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
              {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" /> :
                <div className="w-full h-full flex items-center justify-center text-gray-400"><FiPackage size={20} /></div>}
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-600">₹{item.price?.toFixed(2)} × {item.quantity}</p>
            </div>
            <div className="text-right font-medium">₹{(item.price * item.quantity)?.toFixed(2)}</div>
          </div>
        ))}

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {order.payment?.paymentMethod === "COD" ? <span className="text-yellow-600">Cash on Delivery</span> :
                <span className="text-green-600">Paid with {order.payment?.paymentMethod || 'Razorpay'}</span>}
            </p>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-lg font-bold">₹{totalAmount?.toFixed(2) || (order.amount || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {order.shipping?.address && (
          <div className="border-t pt-4 space-y-1">
            <p className="text-sm font-medium text-gray-700">Shipping Address</p>
            <p className="text-sm text-gray-600">{order.shipping.address}</p>
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2 pt-2 border-t mt-4">
          {showTrack && order.trackingId && (
            <>
              <button onClick={() => setShowPopup(true)} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center">Track Order</button>
              {showPopup && (
                <div className="mt-2 p-3 bg-white border rounded-lg shadow flex flex-col gap-2">
                  <p className="text-gray-700 text-sm">Tracking ID: <strong>{order.trackingId}</strong></p>
                  <div className="flex gap-2">
                    <button onClick={handleCopy} className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 flex items-center"><FiClipboard size={14} className="mr-1" /> Copy</button>
                    <button onClick={openIndiaPost} className="px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center"><FiExternalLink size={14} className="mr-1" /> Open India Post</button>
                    <button onClick={() => setShowPopup(false)} className="ml-auto text-sm text-red-500 hover:underline">Close</button>
                  </div>
                </div>
              )}
            </>
          )}

     {showPaymentGateway && (
  <button 
    onClick={handlePaymentGateway} 
    disabled={!isRazorpayLoaded || isProcessingPayment}
    className={`px-4 py-1.5 text-sm text-white rounded-lg transition-all transform active:scale-95 flex items-center justify-center ${
      !isRazorpayLoaded || isProcessingPayment ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 hover:scale-105'
    }`}
  >
    {isProcessingPayment ? (
      <>
        <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Processing...
      </>
    ) : (
      <>
        Pay Now
      </>
    )}
  </button>
)}



          {canCancel && (
            <button onClick={handleCancelOrder} disabled={isCancelling} className={`px-4 py-1.5 text-sm text-white rounded-lg transition-all flex items-center ${isCancelling ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}>
              {isCancelling ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : 'Cancel Order'}
            </button>
          )}

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {showSuccess && <p className="text-green-600 text-sm mt-2">Order cancelled successfully! Refund initiated. Page will refresh...</p>}
        </div>
      </div>
    </div>
  );
}