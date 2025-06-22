'use client';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import OrderCard from './OrderCard';
import { FiLoader } from 'react-icons/fi';

export default function OrderList({ userId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);
        const ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate()
        }));
        setOrders(ordersData.sort((a, b) => b.date - a.date));
      } catch (err) {
        setError('Failed to load orders');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchOrders();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <FiLoader className="animate-spin text-2xl text-blue-600" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 py-4 text-center">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No orders found
        </div>
      ) : (
        orders.map(order => (
          <OrderCard key={order.id} order={order} />
        ))
      )}
    </div>
  );
}