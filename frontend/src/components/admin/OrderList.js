'use client';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import OrderCard from './OrderCard';
import { FiLoader, FiSearch, FiX, FiAlertCircle, FiExternalLink } from 'react-icons/fi';

export default function OrderList({ userId }) {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [indexUrl, setIndexUrl] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!userId) {
          throw new Error('No user ID provided');
        }

        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef,
          where('customer.userId', '==', userId),
          orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          setOrders([]);
          setFilteredOrders([]);
          return;
        }

        const ordersData = snapshot.docs.map(doc => {
          const data = doc.data();
          const totalAmount = data.razorpay?.amount 
            ? (data.razorpay.amount / 100) 
            : data.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

          return {
            id: doc.id,
            ...data,
            totalAmount,
            date: data.createdAt?.toDate?.() || new Date()
          };
        });

        setOrders(ordersData);
        setFilteredOrders(ordersData);
      } catch (err) {
        if (err.message.includes('index') && err.message.includes('http')) {
          const urlStart = err.message.indexOf('https://');
          const url = err.message.slice(urlStart);
          setIndexUrl(url);
          setError('Database query requires an index to be created');
        } else {
          setError(err.message || 'Failed to load orders');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  useEffect(() => {
    let result = [...orders];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.id.toLowerCase().includes(term) ||
        order.orderId?.toLowerCase().includes(term) ||
        (order.items?.some(item => item.name?.toLowerCase().includes(term))) ||
        order.shippingStatus?.toLowerCase().includes(term) ||
        order.paymentStatus?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(order => {
        const shippingStatus = order.shippingStatus;
        const paymentStatus = order.paymentStatus;
        return shippingStatus === statusFilter || paymentStatus === statusFilter;
      });
    }

    setFilteredOrders(result);
  }, [searchTerm, statusFilter, orders]);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FiLoader className="animate-spin text-3xl text-blue-600 mb-2" />
        <p className="text-gray-600">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6 rounded">
        <div className="flex items-center">
          <FiAlertCircle className="text-red-500 mr-2" size={20} />
          <h3 className="text-red-800 font-medium">Error Loading Orders</h3>
        </div>
        <p className="text-red-700 mt-2">{error}</p>
        
        {indexUrl && (
          <a
            href={indexUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            <FiExternalLink className="mr-2" />
            Create Required Index
          </a>
        )}
        
        <button 
          onClick={() => window.location.reload()}
          className="mt-3 ml-3 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders by ID, product, or status..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <FiX />
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <select
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <optgroup label="Shipping Status">
              <option value="not_dispatched">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </optgroup>
            <optgroup label="Payment Status">
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="refunded">Refunded</option>
            </optgroup>
          </select>
          
          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-blue-600 hover:text-blue-800"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FiSearch className="text-gray-400 text-2xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            {orders.length === 0 ? 'No orders yet' : 'No matching orders found'}
          </h3>
          <p className="mt-1 text-gray-500">
            {orders.length === 0 
              ? 'Your orders will appear here once you make a purchase'
              : 'Try adjusting your search or filters'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order}
              totalAmount={order.totalAmount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
