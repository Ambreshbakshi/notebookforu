"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const CheckoutPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pickupPincode, setPickupPincode] = useState("110001"); // Default Shiprocket warehouse
  const [deliveryPincode, setDeliveryPincode] = useState("");
  const [shippingCost, setShippingCost] = useState(null);
  const [checkingShipping, setCheckingShipping] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleCheckShipping = async () => {
    if (!deliveryPincode) {
      alert("Please enter your pincode.");
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
      } else {
        setShippingCost("No service available");
      }
    } catch (err) {
      console.error("Error checking shipping:", err);
      setShippingCost("Error occurred");
    } finally {
      setCheckingShipping(false);
    }
  };

  const handlePayment = async () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const amountWithShipping = shippingCost && typeof shippingCost === "number"
      ? totalAmount + shippingCost
      : totalAmount;

    setLoading(true);

    try {
      const res = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountWithShipping }),
      });

      const data = await res.json();

      if (!data?.id) {
        alert("Something went wrong with order creation.");
        console.error("Order creation error:", data);
        return;
      }

      if (!window.Razorpay) {
        alert("Razorpay SDK not loaded. Please refresh.");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        name: "Notebookforu Store",
        description: "Notebook Purchase",
        order_id: data.id,
        handler: async function (response) {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            alert("✅ Payment verified successfully!");
            router.push("/success?order_id=" + response.razorpay_order_id);
          } else {
            alert("❌ Payment verification failed!");
            router.push("/failed");
          }
        },
        prefill: {
          name: "John Doe",
          email: "john@example.com",
          contact: "9999999999",
        },
        theme: { color: "#3399cc" },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment Error:", err);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-center mb-10">Checkout</h1>

      <div className="max-w-md mx-auto mb-8 space-y-4">
        <label className="block">
          Your Delivery Pincode:
          <input
            type="text"
            className="mt-1 w-full border px-4 py-2 rounded"
            placeholder="Enter your pincode"
            value={deliveryPincode}
            onChange={(e) => setDeliveryPincode(e.target.value)}
          />
        </label>
        <button
          onClick={handleCheckShipping}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          disabled={checkingShipping}
        >
          {checkingShipping ? "Checking..." : "Check Shipping Cost"}
        </button>
        {shippingCost && (
          <p className="text-green-600 font-medium">
            Shipping Cost: ₹{shippingCost}
          </p>
        )}
      </div>

      <button
        onClick={handlePayment}
        className="block mx-auto bg-green-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-green-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
};

export default CheckoutPage;
