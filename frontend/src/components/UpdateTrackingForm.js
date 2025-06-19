// src/components/UpdateTrackingForm.js
"use client";
import { useState } from "react";

const UpdateTrackingForm = ({ orderId, onUpdate }) => {
  const [trackingId, setTrackingId] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, trackingId, status })
    });

    const data = await res.json();
    if (data.success) {
      onUpdate();
    } else {
      alert(data.message || "Failed to update order");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="text"
        placeholder="Tracking ID"
        value={trackingId}
        onChange={(e) => setTrackingId(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <input
        type="text"
        placeholder="Status (e.g., shipped)"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Update
      </button>
    </form>
  );
};

export default UpdateTrackingForm;
