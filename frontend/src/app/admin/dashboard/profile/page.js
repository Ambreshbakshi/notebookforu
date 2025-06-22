'use client';
import UserProfile from '@/components/admin/UserProfile';
import useAuth from '@/hooks/useAuth';
import { redirect } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ProfilePage() {
  const { user, loading } = useAuth(true);

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('prevPath', window.location.pathname);
    }
    redirect('/admin/login');
    return null;
  }

  return <UserProfile user={user} />;
}