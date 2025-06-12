'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = searchParams.get("order_id");
    if (id) setOrderId(id);

    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-blue-600">
        Fetching your order details...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="text-3xl font-semibold mb-4">📦 Track Your Order</div>
      {orderId ? (
        <div className="bg-gray-100 p-6 rounded shadow-md">
          <p className="text-lg mb-2">Your Order ID:</p>
          <p className="text-green-700 font-mono text-lg">{orderId}</p>
          <p className="mt-4 text-gray-600">Tracking data will appear here soon.</p>
        </div>
      ) : (
        <p className="text-red-600">❌ No order ID provided.</p>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
