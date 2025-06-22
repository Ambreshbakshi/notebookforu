"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Simulate fetching orders from the database or localStorage
    const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];
    setOrders(storedOrders);
  }, []);

  const handleStatusChange = (id, status) => {
    const updatedOrders = orders.map((order) =>
      order.id === id ? { ...order, status: status } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="flex justify-between items-center p-4 border rounded-md shadow-md">
            <div className="flex items-center">
              <p className="text-xl font-semibold">{order.name}</p>
              <p className="text-lg text-gray-600 ml-4">{order.email}</p>
            </div>
            <div className="text-lg font-semibold">${order.totalAmount.toFixed(2)}</div>
            <div>
              <span className={`p-2 rounded-lg ${order.status === "Pending" ? "bg-yellow-300" : "bg-green-300"}`}>
                {order.status}
              </span>
              <button
                onClick={() => handleStatusChange(order.id, "Processed")}
                className="ml-4 text-blue-600 hover:underline"
              >
                Mark as Processed
              </button>
              <button
                onClick={() => handleStatusChange(order.id, "Completed")}
                className="ml-4 text-green-600 hover:underline"
              >
                Mark as Completed
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageOrders;
