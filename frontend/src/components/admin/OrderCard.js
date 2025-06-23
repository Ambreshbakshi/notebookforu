'use client';
import { FiCalendar, FiTruck, FiCheckCircle, FiClock, FiCreditCard } from 'react-icons/fi';
import { format, parseISO } from 'date-fns';

export default function OrderCard({ order, totalAmount }) {
  const statusColors = {
    delivered: 'bg-green-100 text-green-800',
    shipped: 'bg-blue-100 text-blue-800',
    processing: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    paid: 'bg-purple-100 text-purple-800'
  };

  const statusIcons = {
    delivered: FiCheckCircle,
    shipped: FiTruck,
    processing: FiClock,
    paid: FiCreditCard
  };

  const StatusIcon = statusIcons[order.status] || FiClock;

  // Safe date formatting function
  const formatDate = (date) => {
    try {
      // Handle both Firestore Timestamp objects and ISO strings
      const dateObj = date?.toDate ? date.toDate() : 
                     typeof date === 'string' ? parseISO(date) : 
                     new Date(date);
      
      if (isNaN(dateObj.getTime())) {
        return 'N/A';
      }
      return format(dateObj, 'PPp');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'N/A';
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
        <div>
          <p className="font-medium">Order #{order.orderId || order.id?.slice(0, 8)}</p>
          <p className="text-sm text-gray-500 flex items-center">
            <FiCalendar className="mr-1" size={14} />
            {formatDate(order.createdAt || order.date)}
          </p>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
          <StatusIcon className="mr-1" size={14} />
          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
        </span>
      </div>

      <div className="p-4">
        <div className="space-y-3">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center">
              <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden mr-3">
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">
                  ₹{item.price?.toFixed(2)} × {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">₹{(item.price * item.quantity)?.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                {order.payment?.paymentMethod === "COD" ? (
                  <span className="text-yellow-600">Cash on Delivery</span>
                ) : (
                  <span className="text-green-600">Paid with {order.payment?.paymentMethod || 'Razorpay'}</span>
                )}
              </p>
              {order.razorpay?.payment_id && (
                <p className="text-xs text-gray-500 mt-1">
                  Payment ID: {order.razorpay.payment_id}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-lg font-bold">
                ₹{totalAmount?.toFixed(2) || 
                  (order.razorpay?.amount ? (order.razorpay.amount / 100).toFixed(2) : 
                  (order.total || 0).toFixed(2))}
              </p>
            </div>
          </div>

          {order.shipping?.address && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium text-gray-700">Shipping Address</p>
              <p className="text-sm text-gray-600 mt-1">{order.shipping.address}</p>
              {order.shipping.estimate && (
                <p className="text-sm text-blue-600 mt-2 flex items-center">
                  <FiClock className="mr-1" size={14} />
                  Estimated delivery: {order.shipping.estimate}
                </p>
              )}
              {order.shipping.cost !== undefined && (
                <p className="text-sm mt-2">
                  Shipping: {order.shipping.cost === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    `₹${order.shipping.cost?.toFixed(2)}`
                  )}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}