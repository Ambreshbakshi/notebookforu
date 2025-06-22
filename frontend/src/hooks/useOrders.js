'use client';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-toastify';

export default function useOrders(userId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) return;

      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', userId)
        );
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore Timestamp to Date
          date: doc.data().date?.toDate()
        }));
        setOrders(ordersData.sort((a, b) => b.date - a.date));
      } catch (err) {
        setError('Failed to fetch orders');
        toast.error('Failed to load orders');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const refetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate()
      }));
      setOrders(ordersData.sort((a, b) => b.date - a.date));
    } catch (err) {
      setError('Failed to refetch orders');
      console.error('Error refetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  return { 
    orders, 
    loading, 
    error, 
    refetchOrders,
    isEmpty: !loading && orders.length === 0 
  };
}