'use client';
import { useEffect, useState } from 'react';
import { FiShoppingBag, FiTruck, FiUser, FiSettings } from 'react-icons/fi';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import useAuth from '@/hooks/useAuth';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const usersSnap = await getDocs(collection(db, 'users'));

        let totalOrders = 0;
        let pendingOrders = 0;
        let revenue = 0;

        ordersSnap.forEach(doc => {
          totalOrders++;
          const data = doc.data();
          if (data.shipping?.status !== 'delivered') pendingOrders++;
          if (data.razorpay?.amount) revenue += data.razorpay.amount / 100;
        });

        setStats({
          totalOrders,
          pendingOrders,
          revenue,
          totalUsers: usersSnap.size,
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="p-4 bg-white rounded-xl shadow flex flex-col items-center text-center">
          <FiShoppingBag className="text-2xl text-blue-600 mb-2" />
          <p className="text-gray-600 text-sm">Total Orders</p>
          <p className="text-lg font-bold">{stats.totalOrders}</p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow flex flex-col items-center text-center">
          <FiTruck className="text-2xl text-yellow-500 mb-2" />
          <p className="text-gray-600 text-sm">Pending Orders</p>
          <p className="text-lg font-bold">{stats.pendingOrders}</p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow flex flex-col items-center text-center">
          <span className="text-2xl text-green-600 mb-2">₹</span>
          <p className="text-gray-600 text-sm">Total Revenue</p>
          <p className="text-lg font-bold">₹{stats.revenue}</p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow flex flex-col items-center text-center">
          <FiUser className="text-2xl text-purple-600 mb-2" />
          <p className="text-gray-600 text-sm">Total Users</p>
          <p className="text-lg font-bold">{stats.totalUsers}</p>
        </div>

      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/admin/dashboard/orders" className="p-4 bg-blue-600 text-white rounded-xl flex items-center justify-between hover:bg-blue-700 transition">
          <div>
            <p className="font-medium">Manage Orders</p>
            <p className="text-sm opacity-80">View and update orders</p>
          </div>
          <FiShoppingBag size={24} />
        </Link>

        <Link href="/admin/dashboard/profile" className="p-4 bg-purple-600 text-white rounded-xl flex items-center justify-between hover:bg-purple-700 transition">
          <div>
            <p className="font-medium">Your Profile</p>
            <p className="text-sm opacity-80">Manage your details</p>
          </div>
          <FiUser size={24} />
        </Link>

        <Link href="/admin/dashboard/settings" className="p-4 bg-gray-800 text-white rounded-xl flex items-center justify-between hover:bg-gray-900 transition">
          <div>
            <p className="font-medium">Settings</p>
            <p className="text-sm opacity-80">Platform configurations</p>
          </div>
          <FiSettings size={24} />
        </Link>
      </div>
    </div>
  );
}
