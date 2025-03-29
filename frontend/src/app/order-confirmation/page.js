"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const OrderConfirmation = () => {
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem("cart");
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
      <h1 className="text-4xl font-bold text-green-600">Order Placed Successfully! 🎉</h1>
      <p className="text-lg text-gray-700 mt-4">
        Thank you for your purchase. Your order is being processed.
      </p>
      <button
        onClick={() => router.push("/")}
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700"
      >
        Continue Shopping
      </button>
    </div>
  );
};

export default OrderConfirmation;
