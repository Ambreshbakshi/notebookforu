"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const CheckoutPage = () => {
  const router = useRouter();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handlePayment = async () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 1. Create order on backend
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

    // 2. Razorpay Checkout Options
    const options = {
      key: "rzp_test_xxxxxxxx", // 🔁 Replace with your Razorpay key_id
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
      theme: {
        color: "#3399cc",
      },
      method: {
        upi: true,
        card: true,
        netbanking: true,
        wallet: true,
      },
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
