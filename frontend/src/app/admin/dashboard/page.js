"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalNotebooks, setTotalNotebooks] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    // Simulate fetching data from a backend (or localStorage for now)
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    const notebooks = JSON.parse(localStorage.getItem("notebooks")) || [];

    setTotalOrders(orders.length);
    setTotalNotebooks(notebooks.length);

    const revenue = orders.reduce((total, order) => total + order.totalAmount, 0);
    setTotalRevenue(revenue);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6 text-center">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Total Orders</h2>
          <p className="text-2xl font-bold">{totalOrders}</p>
        </div>
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Total Notebooks</h2>
          <p className="text-2xl font-bold">{totalNotebooks}</p>
        </div>
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Total Revenue</h2>
          <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex justify-around">
        <Link href="/admin/manage-products" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Manage Products
        </Link>
        <Link href="/admin/manage-orders" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Manage Orders
        </Link>
        <Link href="/admin/manage-users" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Manage Users
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
