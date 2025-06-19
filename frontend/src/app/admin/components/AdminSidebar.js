'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiHome,
  FiPackage,
  FiSettings,
  FiLogOut,
} from 'react-icons/fi';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

const sidebarItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: FiHome },
  { label: 'Orders', href: '/admin/orders', icon: FiPackage },
  { label: 'Settings', href: '/admin/settings', icon: FiSettings },
];

const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out');
      router.push('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <aside className="w-full md:w-64 bg-white shadow-md p-4 rounded-lg sticky top-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-blue-600">Admin Panel</h2>
        <p className="text-sm text-gray-500">Notebook Foru</p>
      </div>

      <nav className="space-y-2">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg transition ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className="mr-3" />
              {item.label}
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="w-full text-left flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg mt-4"
        >
          <FiLogOut className="mr-3" />
          Logout
        </button>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
