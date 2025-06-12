"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const CheckoutPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handlePayment = async () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setLoading(true);

    try {
      const res = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount }),
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
            router.push("/success");
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
