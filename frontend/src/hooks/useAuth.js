'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { toast } from 'react-toastify';

// Auth configuration constants
const AUTH_CONFIG = {
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
    '/'
  ],
  storageKeys: {
    user: 'firebase:auth:user',
    prevPath: 'firebase:auth:prevPath'
  }
};

export default function useAuth(required = false) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Enhanced localStorage operations with namespace
  const storage = {
    set: (key, value) => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`${AUTH_CONFIG.storageKeys[key]}`, JSON.stringify(value));
          // Verify immediately after setting
          const stored = storage.get(key);
          if (JSON.stringify(stored) !== JSON.stringify(value)) {
            console.error('Storage verification failed for key:', key);
          }
        }
      } catch (error) {
        console.error('Storage set error:', error);
        // Fallback to memory storage if localStorage fails
        sessionStorage.setItem(key, JSON.stringify(value));
      }
    },
    get: (key) => {
      try {
        if (typeof window !== 'undefined') {
          const item = localStorage.getItem(`${AUTH_CONFIG.storageKeys[key]}`) || 
                       sessionStorage.getItem(key);
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
          sessionStorage.removeItem(key);
        }
      } catch (error) {
        console.error('Storage remove error:', error);
      }
    }
  };

  // Check if route is protected
  const isProtectedRoute = (route) => {
    if (!route) return false;
    return AUTH_CONFIG.protectedRoutes.some(protectedRoute => 
      route === protectedRoute || route.startsWith(`${protectedRoute}/`)
    );
  };

  // Clean up auth storage
  const cleanAuthStorage = () => {
    storage.remove('user');
    storage.remove('prevPath');
  };

  // Handle post-login redirect with enhanced validation
  const handlePostLoginRedirect = () => {
    const executeRedirect = () => {
      try {
        const prevPath = storage.get('prevPath');
        console.group('Redirect Processing');
        console.log('Retrieved prevPath:', prevPath);
        
        if (!prevPath) {
          console.warn('No previous path found, using default route');
          console.groupEnd();
          window.location.href = AUTH_CONFIG.defaultRoute;
          return;
        }

        // Validate path structure
        if (typeof prevPath !== 'string' || !prevPath.startsWith('/')) {
          console.error('Invalid path format:', prevPath);
          console.groupEnd();
          window.location.href = AUTH_CONFIG.defaultRoute;
          return;
        }

        // Check against allowed redirects
        const isValidRedirect = AUTH_CONFIG.allowedRedirects.some(allowedPath => {
          const isAllowed = prevPath === allowedPath || 
                          (prevPath.startsWith(allowedPath) && 
                          (prevPath === allowedPath || prevPath.charAt(allowedPath.length) === '/'));
          console.log(`Checking ${prevPath} against ${allowedPath}:`, isAllowed);
          return isAllowed;
        });

        const redirectUrl = isValidRedirect ? prevPath : AUTH_CONFIG.defaultRoute;
        console.log('Final redirect destination:', redirectUrl);
        
        storage.remove('prevPath');
        console.groupEnd();
        
        // Ensure we don't redirect to the same page
        if (window.location.pathname !== redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          console.log('Already on target page, skipping redirect');
        }
      } catch (error) {
        console.error('Redirect processing failed:', error);
        console.groupEnd();
        window.location.href = AUTH_CONFIG.defaultRoute;
      }
    };

    // Delay to ensure all auth state is settled
    setTimeout(executeRedirect, 100);
  };

  // Main auth state listener with enhanced protection
  useEffect(() => {
    let isMounted = true;
    console.log('Auth state listener initialized');

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;

      if (user) {
        console.log('User detected:', user.email);
        const userData = {
          uid: user.uid,
          email: user.email,
          name: user.displayName || user.email?.split('@')[0],
          photoURL: user.photoURL,
          createdAt: new Date(user.metadata.creationTime).toISOString(),
          lastLogin: new Date().toISOString(),
          emailVerified: user.emailVerified
        };
        
        if (isMounted) {
          setUser(userData);
          storage.set('user', userData);
        }

        // Handle redirect if coming from login page
        if (pathname === AUTH_CONFIG.loginPath) {
          console.log('Initiating post-login redirect sequence');
          handlePostLoginRedirect();
        }
      } else {
        console.log('No user detected');
        if (isMounted) {
          setUser(null);
          storage.remove('user');
        }

        // Handle protected route access
        if (required && isProtectedRoute(pathname)) {
          console.group('Protected Route Handling');
          console.log('Attempting to access protected route:', pathname);
          
          // Store previous path if not already set
          const existingPrevPath = storage.get('prevPath');
          if (!existingPrevPath || !isProtectedRoute(existingPrevPath)) {
            console.log('Storing current path as prevPath:', pathname);
            storage.set('prevPath', pathname);
          } else {
            console.log('Existing prevPath retained:', existingPrevPath);
          }

          // Redirect to login if not already there
          if (pathname !== AUTH_CONFIG.loginPath) {
            console.log('Redirecting to login page');
            router.push(AUTH_CONFIG.loginPath);
          } else {
            console.log('Already on login page');
          }
          console.groupEnd();
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      console.log('Cleaning up auth listener');
      isMounted = false;
      unsubscribe();
    };
  }, [required, router, pathname]);

  // Handle logout with cleanup
  const handleLogout = async () => {
    try {
      console.log('Initiating logout');
      await signOut(auth);
      toast.success('Logged out successfully');
      cleanAuthStorage();
      console.log('Logout completed, redirecting to login');
      router.replace(AUTH_CONFIG.loginPath);
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Error logging out');
    }
  };

  // Update user profile
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