'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { toast } from 'react-toastify';

export const AUTH_CONFIG = {
  protectedRoutes: [
    '/admin/dashboard/profile',
    '/cart',
    '/admin/dashboard/orders',
    '/checkout'
  ],
  loginPath: '/admin/login',
  defaultRoute: '/admin/dashboard/profile',
  allowedRedirects: [
    '/admin/dashboard/profile',
    '/cart',
    '/admin/dashboard/orders',
    '/checkout',
    '/',
    '/notebook/[id]/checkout'
  ],
  storageKeys: {
    user: 'firebase:auth:user',
    prevPath: 'firebase:auth:prevPath'
  }
};

const storage = {
  set: (key, value) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${AUTH_CONFIG.storageKeys[key]}`, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },
  get: (key) => {
    try {
      if (typeof window !== 'undefined') {
        const item = localStorage.getItem(`${AUTH_CONFIG.storageKeys[key]}`);
        return item ? JSON.parse(item) : null;
      }
    } catch (error) {
      console.error('Storage get error:', error);
    }
    return null;
  },
  remove: (key) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`${AUTH_CONFIG.storageKeys[key]}`);
      }
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  }
};

// ✅ Reusable exported function for redirect after login
export const handlePostLoginRedirect = () => {
  const executeRedirect = () => {
    try {
      const pendingCheckout = sessionStorage.getItem('pendingCheckout');
      if (pendingCheckout) {
        console.log('Processing pending notebook checkout');
        const checkoutData = JSON.parse(pendingCheckout);

        sessionStorage.setItem('directCheckout', JSON.stringify(checkoutData.data));
        sessionStorage.removeItem('pendingCheckout');

        window.location.href = '/checkout';
        return;
      }

      const prevPath = storage.get('prevPath');
      console.log('No pending checkout, checking prevPath:', prevPath);

      if (!prevPath) {
        console.log('No previous path, using default route');
        window.location.href = AUTH_CONFIG.defaultRoute;
        return;
      }

      const isValidRedirect = AUTH_CONFIG.allowedRedirects.some(allowedPath => {
        const pattern = allowedPath
          .replace(/\[.*?\]/g, '[^/]+')
          .replace(/\//g, '\\/');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(prevPath) || prevPath.startsWith(`${allowedPath}/`);
      });

      const redirectUrl = isValidRedirect ? prevPath : AUTH_CONFIG.defaultRoute;
      console.log('Final redirect destination:', redirectUrl);

      storage.remove('prevPath');

      if (window.location.pathname !== redirectUrl) {
        window.location.href = redirectUrl;
      }
    } catch (error) {
      console.error('Redirect error:', error);
      window.location.href = AUTH_CONFIG.defaultRoute;
    }
  };

  setTimeout(executeRedirect, 50);
};

// ✅ Main useAuth hook
export default function useAuth(required = false) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isProtectedRoute = (route) => {
    if (!route) return false;
    return AUTH_CONFIG.protectedRoutes.some(protectedRoute =>
      route === protectedRoute || route.startsWith(`${protectedRoute}/`)
    );
  };

  const cleanAuthStorage = () => {
    storage.remove('user');
    storage.remove('prevPath');
  };

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;

      if (user) {
        console.log('User authenticated:', user.email);
        const userData = {
          uid: user.uid,
          email: user.email,
          name: user.displayName || user.email?.split('@')[0],
          photoURL: user.photoURL,
          emailVerified: user.emailVerified
        };

        if (isMounted) {
          setUser(userData);
          storage.set('user', userData);
        }

        if (pathname === AUTH_CONFIG.loginPath) {
          console.log('Handling post-login redirect');
          handlePostLoginRedirect();
        }
      } else {
        console.log('No user authenticated');
        if (isMounted) {
          setUser(null);
          storage.remove('user');
        }

        if (required && isProtectedRoute(pathname)) {
          console.log('Protected route access - storing path:', pathname);
          storage.set('prevPath', pathname);

          if (pathname !== AUTH_CONFIG.loginPath) {
            router.push(AUTH_CONFIG.loginPath);
          }
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [required, router, pathname]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      cleanAuthStorage();
      router.replace(AUTH_CONFIG.loginPath);
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Error logging out');
    }
  };

  const updateUserProfile = (updates) => {
    setUser(prev => {
      if (!prev) return null;
      const updatedUser = { ...prev, ...updates };
      storage.set('user', updatedUser);
      return updatedUser;
    });
  };

  return {
    user,
    loading,
    handleLogout,
    updateUserProfile,
    isAuthenticated: !!user,
    isProtectedRoute
  };
}
