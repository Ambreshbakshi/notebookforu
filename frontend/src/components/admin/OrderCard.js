"use client";

import {
  FiCalendar,
  FiTruck,
  FiDownload,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiPackage,
  FiXCircle,
  FiDollarSign,
  FiClipboard,
  FiExternalLink,
} from "react-icons/fi";
import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import generateInvoice from "@/utils/invoiceGenerate";
import toast from "react-hot-toast";

function useRazorpay() {
  useEffect(() => {
    if (window.Razorpay) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);
}

export default function OrderCard({ order }) {
  const [authToken, setAuthToken] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useRazorpay();

  const currentOrderId = order?.orderId || order?.id;

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken(true);
        setAuthToken(token);
      } else {
        setAuthToken("");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const check = setInterval(() => {
      if (window.Razorpay) {
        setIsRazorpayLoaded(true);
        clearInterval(check);
      }
    }, 100);
    return () => clearInterval(check);
  }, []);

  const shippingStatusConfig = {
    cancelled: { color: "bg-red-100 text-red-800", icon: FiXCircle },
    in_transit: { color: "bg-blue-100 text-blue-800", icon: FiTruck },
    out_for_delivery: { color: "bg-yellow-100 text-yellow-800", icon: FiClock },
    delivered: { color: "bg-green-100 text-green-800", icon: FiCheckCircle },
    not_dispatched: { color: "bg-gray-100 text-gray-800", icon: FiPackage },
  };

  const paymentStatusConfig = {
    paid: { color: "bg-purple-100 text-purple-800", icon: FiCreditCard },
    refund_initiated: { color: "bg-orange-100 text-orange-800", icon: FiDollarSign },
    refunded: { color: "bg-green-100 text-green-800", icon: FiCheckCircle },
    unpaid: { color: "bg-gray-100 text-gray-800", icon: FiCreditCard },
  };

  const formatDate = (date) => {
    try {
      const dateObj = date?.toDate?.() || (typeof date === "string" ? parseISO(date) : new Date(date));
      return isNaN(dateObj?.getTime()) ? "N/A" : format(dateObj, "PPp");
    } catch {
      return "N/A";
    }
  };

  const itemsTotal = order?.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;
  const shippingCost = order?.shipping?.cost || 0;
  const promoDiscount = order?.promo?.discountAmount || 0;
  const grandTotal = itemsTotal + shippingCost - promoDiscount;

  const shippingStatus = order.shippingStatus || "not_dispatched";
  const paymentStatus = order.paymentStatus || "unpaid";
  const ShippingIcon = shippingStatusConfig[shippingStatus]?.icon || FiPackage;
  const PaymentIcon = paymentStatusConfig[paymentStatus]?.icon || FiCreditCard;
  const canCancel = paymentStatus === "paid" && shippingStatus === "not_dispatched";
  const showTrack = paymentStatus === "paid" && shippingStatus !== "cancelled";
  const showPaymentGateway = paymentStatus === "unpaid" && shippingStatus !== "cancelled";

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order? Refund will be processed within 3–5 business days.")) return;
    setIsCancelling(true);
    setError(null);
    setShowSuccess(false);

    try {
      if (!authToken) throw new Error("Please sign in to cancel orders");

      const response = await fetch("/api/cancelOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ orderId: currentOrderId }),
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

  const handlePaymentGateway = async () => {
    if (!authToken) return toast.error("Please sign in to proceed");
    if (!isRazorpayLoaded) return toast.error("Payment gateway is still loading. Please wait.");

    try {
      setIsProcessingPayment(true);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ orderId: currentOrderId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to initiate payment");
      }

      const data = await res.json();
      if (!data.razorpayOrderId || !data.amount) throw new Error("Invalid payment gateway response");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: data.amount,
        currency: "INR",
        name: "Notebook Foru",
        description: "Order Payment",
        order_id: data.razorpayOrderId,
        handler: async (response) => {
          try {
            const markRes = await fetch("/api/razorpay/markPaid", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
              body: JSON.stringify({ orderId: currentOrderId, razorpayPaymentId: response.razorpay_payment_id }),
            });

            if (!markRes.ok) throw new Error("Failed to update order status");

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
          },
        },
      };

      const razor = new window.Razorpay(options);
      razor.on("payment.failed", (response) => {
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
            {shippingStatus.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center ${paymentStatusConfig[paymentStatus]?.color}`}>
            <PaymentIcon className="mr-1" size={14} />
            {paymentStatus.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {order.items?.map((item) => (
          <div key={item.id} className="flex items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <FiPackage size={20} />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-600">
                Rs.{item.price.toFixed(2)} × {item.quantity}
                {item.pageType && <span className="ml-2 italic text-gray-500">({item.pageType})</span>}
              </p>
            </div>
            <div className="text-right font-medium">Rs.{(item.price * item.quantity).toFixed(2)}</div>
          </div>
        ))}

        <div className="border-t pt-4 space-y-1 text-sm text-gray-700">
          <div className="flex justify-between">
            <p>Items Total</p>
            <p>Rs.{itemsTotal.toFixed(2)}</p>
          </div>
          <div className="flex justify-between">
            <p>Shipping</p>
            <p>Rs.{shippingCost.toFixed(2)}</p>
          </div>
          {promoDiscount > 0 && (
            <div className="flex justify-between text-green-700">
              <p>Promo Applied ({order.promo.code})</p>
              <p>-Rs.{promoDiscount.toFixed(2)}</p>
            </div>
          )}
          <div className="flex justify-between font-semibold border-t pt-1">
            <p>Total</p>
            <p>Rs.{grandTotal.toFixed(2)}</p>
          </div>
        </div>

        {order.shipping?.address && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700">Shipping Address</p>
            <p className="text-sm text-gray-600">{order.shipping.address}</p>
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-200">
          {showTrack && order.trackingId && (
            <>
              <button
                onClick={() => setShowPopup(true)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <FiTruck size={16} />
                Track Order
              </button>

              {showPopup && (
                <div className="absolute mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg space-y-3 z-10">
                  <p className="text-gray-700 text-sm font-medium">
                    Tracking ID: <span className="font-semibold text-gray-900">{order.trackingId}</span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-1.5"
                    >
                      <FiClipboard size={14} />
                      Copy
                    </button>
                    <button
                      onClick={openIndiaPost}
                      className="px-3 py-1.5 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-1.5"
                    >
                      <FiExternalLink size={14} />
                      India Post
                    </button>
                    <button
                      onClick={() => setShowPopup(false)}
                      className="ml-auto px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {showPaymentGateway && (
            <button
              onClick={handlePaymentGateway}
              disabled={!isRazorpayLoaded || isProcessingPayment}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center gap-1.5 ${
                !isRazorpayLoaded || isProcessingPayment
                  ? "bg-indigo-400 text-white cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              <FiCreditCard size={16} />
              {isProcessingPayment ? "Processing..." : "Pay Now"}
            </button>
          )}

          {canCancel && (
            <button
              onClick={handleCancelOrder}
              disabled={isCancelling}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center gap-1.5 ${
                isCancelling
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              <FiXCircle size={16} />
              {isCancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          )}

          <button
            onClick={() => generateInvoice(order)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <FiDownload size={16} />
            Download Invoice
          </button>

          {error && (
            <div className="w-full mt-3 p-2 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>
          )}

          {showSuccess && (
            <div className="w-full mt-3 p-2 text-sm text-green-700 bg-green-50 rounded-md">
              Order cancelled successfully! Refund initiated. Refreshing...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
