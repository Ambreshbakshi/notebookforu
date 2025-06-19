'use client';

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-toastify';

const UpdateTrackingForm = ({ orderId, currentTrackingId = '', currentStatus = 'processing', onComplete }) => {
  const [trackingId, setTrackingId] = useState(currentTrackingId);
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!trackingId.trim()) {
      toast.error('Tracking ID cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        trackingId,
        status,
      });
      toast.success('Tracking info updated');
      onComplete?.(); // Optional callback
    } catch (error) {
      console.error(error);
      toast.error('Failed to update tracking info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Update Tracking</h3>

      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Tracking ID</label>
          <input
            type="text"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg"
            placeholder="e.g. EB123456789IN"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Order Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg"
          >
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <button
          onClick={handleUpdate}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Updating...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default UpdateTrackingForm;
