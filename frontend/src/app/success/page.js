'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const order = searchParams.get("order_id");
    if (order) {
      setOrderId(order);
    }
    const timeout = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timeout);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-medium text-green-600">
        Processing your payment...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="text-4xl font-bold text-green-600 mb-4">✅ Payment Successful!</div>
      <p className="text-lg mb-4">Thank you for your purchase.</p>
      {orderId && (
        <p className="text-sm text-gray-600 mb-6">Order ID: <span className="font-mono">{orderId}</span></p>
      )}
      <div className="space-x-4">
        <button
          onClick={() => router.push("/")}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Go to Home
        </button>
        <button
          onClick={() => router.push(`/track-order?order_id=${orderId || ""}`)}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Track Order
        </button>
      </div>
    </div>
  );
}

export default function SuccessPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
