'use client';
import UserProfile from '@/components/admin/UserProfile';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ProfilePage() {
  const { user, loading } = useAuth(true);
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

  return <UserProfile user={user} />;
}
