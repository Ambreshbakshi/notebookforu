'use client';
import { FiSettings, FiLock, FiCreditCard, FiBell, FiTrash2 } from 'react-icons/fi';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

export default function SettingsPage() {
  const { user, loading, handleLogout } = useAuth(true);
  const router = useRouter();

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('prevPath', window.location.pathname);
    }
    router.push('/admin/login');
    return null;
  }

  const settingsItems = [
    {
      icon: FiLock,
      title: 'Password & Security',
      description: 'Change your password and security settings',
      href: '/admin/dashboard/settings/password'
    },
    {
      icon: FiCreditCard,
      title: 'Payment Methods',
      description: 'Manage your saved payment options',
      href: '/admin/dashboard/settings/payments'
    },
    {
      icon: FiBell,
      title: 'Notifications',
      description: 'Configure your notification preferences',
      href: '/admin/dashboard/settings/notifications'
    }
  ];

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      try {
        // await deleteAccount(user.uid); // Tumhara actual delete logic yaha lagega
        await handleLogout();
        toast.success('Account deleted successfully');
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete account');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <FiSettings className="text-2xl text-blue-600" />
        <h1 className="text-2xl font-bold">Account Settings</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {settingsItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-start gap-4">
              <item.icon className="mt-1 text-gray-500 group-hover:text-blue-600 transition-colors" />
              <div>
                <h3 className="font-medium group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 p-4 border border-red-200 bg-red-50 rounded-lg">
        <h3 className="font-medium text-red-800">Danger Zone</h3>
        <p className="text-sm text-red-700 mb-4">
          These actions are irreversible. Proceed with caution.
        </p>
        <button 
          onClick={handleDeleteAccount}
          className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <FiTrash2 />
          Delete Account
        </button>
      </div>
    </div>
  );
}
