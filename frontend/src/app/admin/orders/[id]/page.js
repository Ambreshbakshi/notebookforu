// src/app/admin/orders/[id]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingId, setTrackingId] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;

      try {
        const docRef = doc(db, 'orders', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setOrder(docSnap.data());
          setTrackingId(docSnap.data().trackingId || '');
          setStatus(docSnap.data().status || 'processing');
        } else {
          router.push('/admin/dashboard');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, router]);

  const handleUpdate = async () => {
    try {
      const docRef = doc(db, 'orders', id);
      await updateDoc(docRef, {
        trackingId,
        status,
      });
      alert('Order updated successfully');
    } catch (error) {
      console.error('Failed to update order:', error);
      alert('Failed to update');
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!order) {
    return <div className="p-6 text-red-600">Order not found</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Order Details</h2>

      <div className="mb-6 space-y-2">
        <p><strong>Order ID:</strong> {order.orderId}</p>
        <p><strong>Customer:</strong> {order.customer?.name} ({order.customer?.email})</p>
        <p><strong>Amount:</strong> ₹{order.amount}</p>
        <p><strong>Payment Method:</strong> {order.paymentMethod || 'N/A'}</p>
        <p><strong>Shipping Cost:</strong> ₹{order.shipping?.cost || 0}</p>
        <p><strong>Address:</strong> {order.customer?.address || 'N/A'}</p>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Tracking ID</label>
        <input
          type="text"
          className="border p-2 w-full rounded"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
        />
      </div>

      <div className="mb-6">
        <label className="block mb-1 font-medium">Order Status</label>
        <select
          className="border p-2 w-full rounded"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <button
        onClick={handleUpdate}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Update Order
      </button>
    </div>
  );
};

export default OrderDetailsPage;