'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import UpdateTrackingForm from "@/components/UpdateTrackingForm";
import { FiSearch, FiRefreshCcw } from 'react-icons/fi';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const adminEmail = 'youremail@gmail.com'; // change to your admin

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || user.email !== adminEmail) {
        router.push('/');
        return;
      }

      await fetchOrders();
    });

    return () => unsubscribe();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'orders'));
      const list = snap.docs.map((doc) => ({ ...doc.data(), docId: doc.id }));
      setOrders(list);
      setFilteredOrders(list);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (val) => {
    setSearch(val);
    filterOrders(val, statusFilter);
  };

  const handleStatusFilter = (val) => {
    setStatusFilter(val);
    filterOrders(search, val);
  };

  const filterOrders = (keyword, status) => {
    const kw = keyword.toLowerCase();
    const filtered = orders.filter((o) => {
      const matchesSearch =
        o.orderId?.toLowerCase().includes(kw) ||
        o.customer?.email?.toLowerCase().includes(kw);

      const matchesStatus =
        status === 'all' || o.status?.toLowerCase() === status;

      return matchesSearch && matchesStatus;
    });

    setFilteredOrders(filtered);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex items-center border px-3 py-2 rounded-lg w-full sm:w-72">
          <FiSearch className="mr-2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by order ID or email"
            className="flex-1 outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="all">All Statuses</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <button
          onClick={fetchOrders}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FiRefreshCcw /> Refresh
        </button>
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.orderId}
              className="bg-white border rounded-lg p-4 shadow-sm"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-semibold text-lg">#{order.orderId}</h2>
                  <p className="text-sm text-gray-500">
                    {order.customer?.email || 'No Email'}
                  </p>
                </div>

                <div className="mt-2 md:mt-0 flex flex-wrap items-center gap-3">
                  <span className="text-sm text-gray-600">
                    ₹{order.amount?.toFixed(2) || '0.00'}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full capitalize">
                    {order.status || 'processing'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {order.paymentMethod || 'Unpaid'}
                  </span>
                  {order.trackingId && (
                    <a
                      href={`https://www.indiapost.gov.in/VAS/Pages/trackconsignment.aspx?consignment=${order.trackingId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-xs"
                    >
                      Track: {order.trackingId}
                    </a>
                  )}
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Edit Tracking
                  </button>
                </div>
              </div>
              {selectedOrder?.orderId === order.orderId && (
                <div className="mt-4">
                  <UpdateTrackingForm
                    orderId={order.docId}
                    currentTrackingId={order.trackingId}
                    currentStatus={order.status}
                    onComplete={() => {
                      setSelectedOrder(null);
                      fetchOrders();
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
