'use client';

import { useState } from "react";
import { FiTruck } from "react-icons/fi";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleTrack = () => {
    if (!orderId) return;
    setShowModal(true);
  };

  const trackingUrl = `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/TrackConsignment.aspx`;

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold flex items-center mb-4">
        <FiTruck className="mr-2" /> Track Your Order
      </h1>

      <div className="mb-4">
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Enter your India Post Tracking ID"
          className="border border-gray-300 rounded px-4 py-2 w-full"
        />
      </div>
      <button
        onClick={handleTrack}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Track Order
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow max-w-md w-full text-center">
            <h2 className="text-xl font-semibold mb-4">Track Your Order</h2>
            <p className="mb-4">Click the button below to track your order on the official India Post website:</p>
            <a
              href={trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
            >
              Open Tracking Page
            </a>
            <div className="mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="text-sm text-gray-500 underline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
