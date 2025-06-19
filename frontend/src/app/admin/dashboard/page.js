'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Link from 'next/link';

const AdminDashboard = () => {
  const router = useRouter();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com'; // 🔐 safer
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || user.email !== adminEmail) {
        router.push('/');
        return;
      }

      try {
        const ordersRef = collection(db, 'orders');
        const snapshot = await getDocs(ordersRef); // Add query(orderBy('createdAt', 'desc')) if you store timestamps
        const data = snapshot.docs.map((doc) => ({ ...doc.data(), docId: doc.id }));
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {orders.length === 0 ? (
        <p className="text-gray-600">No orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border shadow rounded">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Tracking</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.orderId || order.docId} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium text-blue-900">{order.orderId || 'N/A'}</td>
                  <td className="p-3">{order.customer?.email || 'Unknown'}</td>
                  <td className="p-3">₹{order.amount?.toFixed(2) || '0.00'}</td>
                  <td className="p-3">{order.paymentMethod || 'N/A'}</td>
                  <td className="p-3">
                    {order.trackingId ? (
                      <Link
                        href={`https://www.indiapost.gov.in/VAS/Pages/trackconsignment.aspx?consignment=${order.trackingId}`}
                        target="_blank"
                        className="text-blue-600 underline"
                      >
                        {order.trackingId}
                      </Link>
                    ) : (
                      <span className="text-gray-400 italic">Not Assigned</span>
                    )}
                  </td>
                  <td className="p-3 capitalize">{order.status || 'processing'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
