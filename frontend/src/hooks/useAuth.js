'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { toast } from 'react-toastify';

export default function useAuth(required = false) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email,
          name: user.displayName || user.email?.split('@')[0],
          photoURL: user.photoURL,
          joinedDate: new Date(user.metadata.creationTime).toLocaleDateString(),
          lastLogin: new Date().toLocaleString()
        });
        
        // If coming from login, handle redirect
        if (pathname === '/admin/login') {
          handlePostLoginRedirect();
        }
      } else {
        setUser(null);
        // If auth is required and no user, redirect to login
        if (required && typeof window !== 'undefined') {
          const protectedRoutes = ['/admin/dashboard/profile', '/cart', '/admin/dashboard/orders'];
          if (protectedRoutes.some(route => pathname.startsWith(route))) {
            localStorage.setItem('prevPath', pathname);
            router.push('/admin/login');
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [required, router, pathname]);

  const handlePostLoginRedirect = () => {
    try {
      const prevPath = localStorage.getItem('prevPath');
      const allowedPaths = ['/admin/dashboard/profile', '/cart', '/admin/dashboard/orders'];
      const isValidPath = prevPath && allowedPaths.some(path => prevPath.startsWith(path));
      
      const redirectUrl = isValidPath ? prevPath : '/admin/dashboard/profile';
      
      localStorage.removeItem('prevPath');
      // Use window.location for full page reload to ensure auth state is updated
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('Redirect error:', error);
      router.push('/admin/dashboard/profile');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      // Clear any previous path to prevent redirect loops
      localStorage.removeItem('prevPath');
      router.push('/admin/login');
    } catch (error) {
      toast.error('Error logging out');
      console.error('Logout error:', error);
    }
  };

  const updateUserProfile = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  return { 
    user, 
    loading, 
    handleLogout, 
    updateUserProfile,
    isAuthenticated: !!user 
  };
}