'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiUser, FiShoppingBag, FiSettings, FiLogOut, FiHome } from 'react-icons/fi';
import useAuth from '@/hooks/useAuth';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, handleLogout } = useAuth();

  const isAdmin = user?.email === 'ambreshbakshi@gmail.com'; // Apne admin email check karo

  const navItems = [
    isAdmin && { href: '/admin/dashboard', icon: FiHome, label: 'Dashboard' }, // Dashboard only for admin
    { href: '/admin/dashboard/orders', icon: FiShoppingBag, label: 'Orders' },
    { href: '/admin/dashboard/profile', icon: FiUser, label: 'Profile' },
    { href: '/admin/dashboard/settings', icon: FiSettings, label: 'Settings' }
  ].filter(Boolean); // Remove undefined if user is not admin

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

      {/* Mobile Floating Navbar above main bottom navbar */}
      <div className="fixed bottom-16 left-4 right-4 backdrop-blur-md bg-white/80 border border-gray-200 shadow-lg z-40 flex justify-around items-center h-14 md:hidden rounded-t-2xl px-2">
  {navItems.map((item) => (
    <Link
      key={item.href}
      href={item.href}
      className={`flex flex-col items-center justify-center text-xs ${
        pathname === item.href ? 'text-blue-600' : 'text-gray-600 hover:text-blue-500'
      }`}
    >
      <item.icon size={20} />
      <span className="mt-0.5">{item.label}</span>
    </Link>
  ))}
</div>

    </>
  );
}
