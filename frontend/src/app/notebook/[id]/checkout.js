"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, auth } from '@/lib/firebase';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiLoader, FiCheck, FiAlertCircle } from 'react-icons/fi';

export default function NotebookCheckout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Preparing your checkout...');

  useEffect(() => {
    const handleCheckoutFlow = async () => {
      try {
        // 1. Get product details from URL or session storage
        const productDetails = {
          id: window.location.pathname.split('/')[2],
          quantity: searchParams.get('quantity') || 1,
          pageType: searchParams.get('pageType') || 'Ruled',
          ...(JSON.parse(sessionStorage.getItem('pendingDirectCheckout') || '{}'))
        };

        if (!productDetails.id) {
          throw new Error('Invalid product details');
        }

        // 2. Handle authentication state
        return new Promise((resolve) => {
          const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
              setStatusMessage('Redirecting to login...');
              
              // Store for after login
              sessionStorage.setItem('pendingDirectCheckout', JSON.stringify({
                id: productDetails.id,
                quantity: productDetails.quantity,
                pageType: productDetails.pageType
              }));

              // In the handleCheckoutFlow function, update the login redirect:
router.push(`/admin/login?redirect=/checkout&checkoutType=notebook`);
              return resolve();
            }

            // User is authenticated - prepare checkout
            setStatusMessage('Finalizing your order...');
            
            // Prepare cart data
            const cartItem = {
              id: productDetails.id,
              name: `Notebook | Sunny Sky - ${productDetails.pageType}`,
              price: 115, // Should fetch actual price from your database
              quantity: Number(productDetails.quantity),
              pageType: productDetails.pageType,
              image: 'https://ik.imagekit.io/h5by6dwco/public/products/notebook/notebook2/notebook2-cover.png'
            };

            // Set cart and special checkout flag
            localStorage.setItem('cart', JSON.stringify([cartItem]));
            sessionStorage.setItem('isDirectCheckout', 'true');
            sessionStorage.removeItem('pendingDirectCheckout');

            // Final redirect to checkout
            router.push('/checkout');
            resolve();
          });

          // Cleanup
          return () => unsubscribe();
        });
      } catch (err) {
        console.error('Checkout error:', err);
        setError(err.message || 'Failed to process checkout');
        toast.error('Checkout processing failed');
      } finally {
        setIsLoading(false);
      }
    };

    handleCheckoutFlow();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md w-full">
          <FiAlertCircle className="text-red-500 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Checkout Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/notebook-gallery')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Back to Notebooks
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
        <div className="mb-4">
          {isLoading ? (
            <FiLoader className="animate-spin text-blue-600 text-4xl mx-auto" />
          ) : (
            <FiCheck className="text-green-500 text-4xl mx-auto" />
          )}
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {isLoading ? 'Processing Your Order' : 'Ready to Checkout'}
        </h2>
        <p className="text-gray-600 mb-6">{statusMessage}</p>
        {!isLoading && (
          <p className="text-sm text-gray-500">
            If not redirected automatically,{' '}
            <button 
              onClick={() => router.push('/checkout')} 
              className="text-blue-600 hover:underline"
            >
              click here
            </button>
          </p>
        )}
      </div>
    </div>
  );
}