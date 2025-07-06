'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FiUser, FiShoppingBag, FiSettings, FiLogOut, FiHome } from 'react-icons/fi';
import useAuth from '@/hooks/useAuth';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, handleLogout } = useAuth();

  const navItems = [
    { href: '/admin/dashboard', icon: FiHome, label: 'Home' },
    { href: '/admin/dashboard/orders', icon: FiShoppingBag, label: 'Orders' },
    { href: '/admin/dashboard/profile', icon: FiUser, label: 'Account' },
    { href: '/admin/dashboard/settings', icon: FiSettings, label: 'Settings' }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 flex-shrink-0">
        <div className="bg-white p-6 rounded-lg shadow-sm sticky top-8 h-[calc(100vh-64px)] overflow-y-auto">
          {user && (
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold uppercase">
                {user.name?.charAt(0)}
              </div>
              <div className="ml-3">
                <p className="font-medium truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          )}

          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm transition ${
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="mr-3" size={18} />
                {item.label}
              </Link>
            ))}

            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 mt-4"
            >
              <FiLogOut className="mr-3" size={18} />
              Logout
            </button>
          </nav>
        </div>
      </div>

      {/* Mobile Bottom Navbar - Amazon Style */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow z-50 flex justify-around items-center h-16 md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center text-xs ${
              pathname === item.href ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'
            }`}
          >
            <item.icon size={22} />
            <span className="mt-1">{item.label}</span>
          </Link>
        ))}

        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center text-xs text-gray-500 hover:text-red-600"
        >
          <FiLogOut size={22} />
          <span className="mt-1">Logout</span>
        </button>
      </div>
    </>
  );
}
