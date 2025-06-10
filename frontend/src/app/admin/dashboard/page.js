"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase"; // Ensure this exists

const AdminDashboard = () => {
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalNotebooks, setTotalNotebooks] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Optional: Check if user is authenticated
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = "/admin/login"; // redirect to login if unauthenticated
      }
    });

    // Load mock data from localStorage
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const notebooks = JSON.parse(localStorage.getItem("notebooks") || "[]");

    setTotalOrders(orders.length);
    setTotalNotebooks(notebooks.length);

    const revenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    setTotalRevenue(revenue);
    setLoading(false);

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-center py-20 text-lg">Loading Dashboard...</div>;

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
          <p className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
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
