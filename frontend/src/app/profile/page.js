"use client";

import { useEffect, useState } from "react";
import {
  FiUser,
  FiMail,
  FiEdit2,
  FiShoppingBag,
  FiSettings,
  FiLogOut,
  FiLock,
  FiCreditCard,
  FiMapPin,
  FiPhone,
  FiCalendar,
  FiLoader,
  FiCheckCircle,
  FiTruck,
  FiPackage,
  FiClock
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editField, setEditField] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login");
        return;
      }

      const userEmail = u.email;
      const userName = u.displayName || "John Doe";
      const joinDate = new Date(u.metadata.creationTime).toLocaleDateString();

      setUser({
        email: userEmail,
        name: userName,
        joinedDate: joinDate,
        phone: "",
        address: "",
        lastLogin: new Date().toLocaleString()
      });

      setFormData({
        name: userName,
        email: userEmail,
        phone: "",
        address: ""
      });

      try {
        const q = query(
  collection(db, "orders"),
  where("customer.userId", "==", user.uid)  // Use UID instead of email for security
);
        );
        const snapshot = await getDocs(q);
        const myOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(myOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ...rest of your ProfilePage remains unchanged

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Error logging out");
      console.error("Logout error:", error);
    }
  };

  const handleEditField = (field) => {
    setIsEditing(true);
    setEditField(field);
  };

  const handleSaveField = () => {
    // In a real app, you would update the user's data in your database here
    toast.success("Profile updated successfully");
    setIsEditing(false);
    setEditField(null);
    setUser(prev => ({ ...prev, ...formData }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      delivered: { color: "bg-green-100 text-green-800", icon: FiCheckCircle },
      shipped: { color: "bg-blue-100 text-blue-800", icon: FiTruck },
      processing: { color: "bg-yellow-100 text-yellow-800", icon: FiPackage },
      cancelled: { color: "bg-red-100 text-red-800", icon: FiClock }
    };
    
    const { color, icon: Icon } = statusMap[status] || { color: "bg-gray-100 text-gray-800", icon: FiClock };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        <Icon className="mr-1" size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const renderContent = () => {
    if (!user) return null;

    switch (activeTab) {
      case "profile":
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Member since {user.joinedDate}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { label: "Email", icon: FiMail, field: "email", value: user.email },
                { label: "Full Name", icon: FiUser, field: "name", value: user.name },
                { label: "Phone", icon: FiPhone, field: "phone", value: user.phone },
                { label: "Address", icon: FiMapPin, field: "address", value: user.address }
              ].map((item) => (
                <div key={item.label} className="flex items-start p-3 border-b border-gray-100">
                  <item.icon className="text-gray-500 mt-1 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">{item.label}</p>
                    {isEditing && editField === item.field ? (
                      <input
                        type={item.field === "email" ? "email" : "text"}
                        name={item.field}
                        value={formData[item.field]}
                        onChange={handleInputChange}
                        className="w-full border rounded px-3 py-1 mt-1"
                      />
                    ) : (
                      <p>{item.value}</p>
                    )}
                  </div>
                  <button
                    onClick={() => isEditing && editField === item.field ? handleSaveField() : handleEditField(item.field)}
                    className="ml-auto text-blue-600 hover:text-blue-800"
                  >
                    {isEditing && editField === item.field ? "Save" : <FiEdit2 />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case "orders":
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-6">Order History</h3>
            
            {orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                      <div>
                        <p className="font-medium">Order #{order.id}</p>
                        <p className="text-sm text-gray-500">
                          <FiCalendar className="inline mr-1" size={14} />
                          Placed on {new Date(order.date).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                    
                    <div className="p-4">
                      <div className="space-y-3">
                        {order.items.map(item => (
                          <div key={item.id} className="flex items-center">
                            <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden mr-4">
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-600">
                                ₹{item.price.toFixed(2)} × {item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-600">
                              {order.paymentMethod === "Cash on Delivery" ? (
                                <span className="text-yellow-600">Cash on Delivery</span>
                              ) : (
                                <span className="text-green-600">Paid with {order.paymentMethod}</span>
                              )}
                            </p>
                            {order.trackingId && (
                              <p className="text-sm text-gray-600 mt-1">
                                <FiTruck className="inline mr-1" size={14} />
                                Tracking ID: {order.trackingId}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Total</p>
                            <p className="text-lg font-bold">₹{(order.total || order.amount || 0).toFixed(2)}</p>

                          </div>
                        </div>
                        
                        {order.status === 'shipped' && order.estimatedDelivery && (
                          <p className="text-sm text-blue-600 mt-2">
                            <FiClock className="inline mr-1" size={14} />
                            Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-IN')}
                          </p>
                        )}
                        
                        {order.status === 'delivered' && order.deliveryDate && (
                          <p className="text-sm text-green-600 mt-2">
                            <FiCheckCircle className="inline mr-1" size={14} />
                            Delivered on {new Date(order.deliveryDate).toLocaleDateString('en-IN')}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 border-t flex justify-end space-x-3">
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                        View Invoice
                      </button>
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                          Cancel Order
                        </button>
                      )}
                      {order.status === 'delivered' && (
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Buy Again
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <FiShoppingBag className="mx-auto text-4xl text-gray-400 mb-3" />
                <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
                <button
                  onClick={() => router.push("/notebook-gallery")}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Browse Notebooks
                </button>
              </div>
            )}
          </div>
        );

      case "settings":
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-6">Account Settings</h3>
            
            <div className="space-y-4">
              <button
                onClick={() => router.push("/profile/change-password")}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <FiLock className="text-gray-500 mr-3" />
                  <span>Change Password</span>
                </div>
                <FiEdit2 className="text-gray-400" />
              </button>
              
              <button
                onClick={() => router.push("/profile/payment-methods")}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <FiCreditCard className="text-gray-500 mr-3" />
                  <span>Payment Methods</span>
                </div>
                <FiEdit2 className="text-gray-400" />
              </button>
              
              <button
                onClick={() => router.push("/profile/notifications")}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <FiSettings className="text-gray-500 mr-3" />
                  <span>Notification Preferences</span>
                </div>
                <FiEdit2 className="text-gray-400" />
              </button>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Danger Zone</h4>
                <p className="text-sm text-yellow-700 mb-3">
                  These actions are irreversible. Proceed with caution.
                </p>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                  Delete My Account
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <ToastContainer position="bottom-right" />
      
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                {[
                  { id: "profile", label: "Profile", icon: FiUser },
                  { id: "orders", label: "My Orders", icon: FiShoppingBag },
                  { id: "settings", label: "Settings", icon: FiSettings }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <tab.icon className="mr-3" />
                    {tab.label}
                  </button>
                ))}
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 text-left rounded-lg text-red-600 hover:bg-red-50 mt-4"
                >
                  <FiLogOut className="mr-3" />
                  Logout
                </button>
              </nav>
              
              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-gray-500">
                  <FiClock className="inline mr-1" />
                  Last login: {user.lastLogin}
                </p>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
