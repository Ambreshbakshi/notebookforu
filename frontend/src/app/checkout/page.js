"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const CheckoutPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handlePayment = async () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const res = await fetch("/api/razorpay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: totalAmount }),
    });

    const data = await res.json();

    if (!data || !data.id) {
      alert("Something went wrong with the order creation.");
      return;
    }

    if (!window.Razorpay) {
      alert("Razorpay SDK failed to load. Please refresh the page.");
      return;
    }

    const options = {
  key: 'rzp_test_xxxxxxxx',
  amount: 50000, // in paise = ₹500
  currency: 'INR',
  name: 'Your Store Name',
  description: 'Notebook Purchase',
  order_id: 'order_xyzabc123',
  handler: function (response) {
    // handle payment success
  },
  prefill: {
    name: 'John Doe',
    email: 'john@example.com',
    contact: '9999999999'
  },
  theme: {
    color: '#3399cc'
  },
  // ✅ Add this to show UPI:
  method: {
    upi: true,
    card: true,
    netbanking: true,
    wallet: true
  }
};


    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-center mb-10">Checkout</h1>
      <button
        onClick={handlePayment}
        className="block mx-auto bg-green-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-green-700"
      >
        Pay Now
      </button>
    </div>
  );
};

export default CheckoutPage;
