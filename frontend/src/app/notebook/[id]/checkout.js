"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, auth } from '@/lib/firebase';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiLoader } from 'react-icons/fi';

export default function NotebookCheckout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get product details from URL or localStorage
  const getProductDetails = () => {
    try {
      // First try to get from URL params
      const id = window.location.pathname.split('/')[2];
      const quantity = searchParams.get('quantity') || 1;
      const pageType = searchParams.get('pageType') || 'Ruled';

      // Then check for pending checkout in localStorage
      const pendingCheckout = localStorage.getItem('pendingDirectCheckout');
      if (pendingCheckout) {
        const parsed = JSON.parse(pendingCheckout);
        return {
          id: parsed.id || id,
          quantity: parsed.quantity || quantity,
          pageType: parsed.pageType || pageType,
          name: parsed.name,
          price: parsed.price,
          image: parsed.image
        };
      }

      return { id, quantity, pageType };
    } catch (err) {
      console.error('Error getting product details:', err);
      return null;
    }
  };

  useEffect(() => {
    const productDetails = getProductDetails();
    if (!productDetails?.id) {
      setError('Invalid product details');
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          // Store the current checkout attempt for after login
          localStorage.setItem('pendingDirectCheckout', JSON.stringify(productDetails));
          
          // Redirect to login with return URL
          const loginUrl = `/admin/login?redirect=${encodeURIComponent(window.location.pathname)}&quantity=${productDetails.quantity}&pageType=${productDetails.pageType}`;
          router.push(loginUrl);
          return;
        }

        // User is authenticated - prepare checkout data
        const directItem = {
          id: productDetails.id,
          name: productDetails.name || `Notebook ${productDetails.id}`,
          price: productDetails.price || 0, // You should get actual price from your DB
          quantity: Number(productDetails.quantity),
          pageType: productDetails.pageType,
          image: productDetails.image || '/default-notebook.jpg'
        };

        // Clear any existing cart for direct checkout
        localStorage.setItem('cart', JSON.stringify([]));
        
        // Clear pending checkout if it exists
        localStorage.removeItem('pendingDirectCheckout');

        // Redirect to checkout page with product details
        router.push(`/checkout?directItem=${encodeURIComponent(JSON.stringify(directItem))}`);
      } catch (err) {
        console.error('Checkout preparation error:', err);
        setError('Failed to prepare checkout');
        toast.error('Failed to process your checkout');
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Checkout Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <FiLoader className="animate-spin text-blue-600 text-4xl mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Preparing Your Checkout</h2>
        <p className="text-gray-600 mt-2">
          {isLoading ? 'Processing...' : 'Redirecting to checkout...'}
        </p>
      </div>
    </div>
  );
}