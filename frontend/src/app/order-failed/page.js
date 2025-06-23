'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function FailureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const order = searchParams.get("order_id");
    if (order) {
      setOrderId(order);
    }

    // Simulate loading state
    const timeout = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timeout);
  }, [searchParams]);

  useEffect(() => {
    if (!loading) {
      // Show message for 3 seconds, then redirect
      setRedirecting(true);
      const redirectTimeout = setTimeout(() => {
        router.push("/cart");
      }, 3000);

      return () => clearTimeout(redirectTimeout);
    }
  }, [loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-medium text-red-600">
        Processing your payment...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="text-4xl font-bold text-red-600 mb-4">❌ Payment Failed!</div>
      <p className="text-lg mb-4">Unfortunately, your payment could not be processed.</p>
      {orderId && (
        <p className="text-sm text-gray-600 mb-6">Order ID (if generated): <span className="font-mono">{orderId}</span></p>
      )}
      <div className="space-x-4 mb-6">
        <button
          onClick={() => router.push("/")}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Go to Home
        </button>
        <button
          onClick={() => router.push("/cart")}
          className="bg-yellow-600 text-white px-6 py-2 rounded hover:bg-yellow-700"
        >
          Try Again
        </button>
      </div>

      {redirecting && (
        <p className="text-sm text-gray-500">Redirecting to Cart...</p>
      )}
    </div>
  );
}

export default function FailurePageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <FailureContent />
    </Suspense>
  );
}
