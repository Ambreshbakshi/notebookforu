'use client';
import OrderList from '@/components/admin/OrderList';
import { FiShoppingBag } from 'react-icons/fi';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function OrdersPage() {
  const { user, loading } = useAuth(true); // true = requires authentication
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('prevPath', window.location.pathname);
      }
      router.push('/admin/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <FiShoppingBag className="text-2xl text-blue-600" />
        <h1 className="text-2xl font-bold">Your Orders</h1>
      </div>
      <OrderList userId={user.uid} />
    </div>
  );
}
