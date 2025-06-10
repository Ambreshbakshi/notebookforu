"use client";
import { useEffect, useState } from "react";
import { FiUser, FiMail, FiEdit2, FiShoppingBag, FiSettings, FiLogOut, FiLock, FiCreditCard } from "react-icons/fi";
import { useRouter } from "next/navigation";

const ProfilePage = () => {
  const [user, setUser] = useState({
    email: '',
    name: '',
    joinedDate: ''
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate fetching user data
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // In a real app, you would fetch from your API
        const email = localStorage.getItem('userEmail') || 'user@example.com';
        const mockUser = {
          email,
          name: 'John Doe',
          joinedDate: new Date().toLocaleDateString(),
          phone: '+1 (555) 123-4567',
          address: '123 Main St, City, Country'
        };
        setUser(mockUser);

        // Simulate fetching orders
        const mockOrders = [
          { id: 'ORD-001', date: '2023-05-15', total: 49.99, status: 'Delivered', items: 2 },
          { id: 'ORD-002', date: '2023-06-20', total: 29.99, status: 'Shipped', items: 1 },
          { id: 'ORD-003', date: '2023-07-10', total: 99.99, status: 'Processing', items: 3 }
        ];
        setOrders(mockOrders);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    router.push('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center p-3 border-b border-gray-100">
                <FiMail className="text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p>{user.email}</p>
                </div>
              </div>
              <div className="flex items-center p-3 border-b border-gray-100">
                <FiUser className="text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p>{user.name}</p>
                </div>
                <button className="ml-auto text-blue-600 hover:text-blue-800">
                  <FiEdit2 />
                </button>
              </div>
              <div className="flex items-center p-3 border-b border-gray-100">
                <FiUser className="text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p>{user.phone}</p>
                </div>
                <button className="ml-auto text-blue-600 hover:text-blue-800">
                  <FiEdit2 />
                </button>
              </div>
              <div className="flex items-center p-3">
                <FiUser className="text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p>{user.address}</p>
                </div>
                <button className="ml-auto text-blue-600 hover:text-blue-800">
                  <FiEdit2 />
                </button>
              </div>
            </div>
          </div>
        );
      case 'orders':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Order #{order.id}</p>
                        <p className="text-sm text-gray-500">{order.date}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <p className="text-sm">{order.items} item{order.items !== 1 ? 's' : ''}</p>
                      <p className="font-medium">${order.total.toFixed(2)}</p>
                    </div>
                    <button className="mt-3 text-sm text-blue-600 hover:text-blue-800">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <FiShoppingBag className="mx-auto text-4xl text-gray-400 mb-3" />
                <p className="text-gray-600">You haven't placed any orders yet.</p>
                <button 
                  onClick={() => router.push('/products')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Browse Products
                </button>
              </div>
            )}
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
            <div className="space-y-4">
              <button className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <FiLock className="text-gray-500 mr-3" />
                <span>Change Password</span>
              </button>
              <button className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <FiCreditCard className="text-gray-500 mr-3" />
                <span>Payment Methods</span>
              </button>
              <button className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <FiSettings className="text-gray-500 mr-3" />
                <span>Notification Preferences</span>
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white p-4 rounded-lg shadow-sm sticky top-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {user.name.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-lg ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <FiUser className="mr-2" />
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-lg ${activeTab === 'orders' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <FiShoppingBag className="mr-2" />
                  Orders
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-lg ${activeTab === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <FiSettings className="mr-2" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 text-left rounded-lg text-red-600 hover:bg-red-50 mt-4"
                >
                  <FiLogOut className="mr-2" />
                  Logout
                </button>
              </nav>
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