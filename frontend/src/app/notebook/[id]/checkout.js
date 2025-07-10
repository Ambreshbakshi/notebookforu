"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, auth } from '@/lib/firebase';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiLoader, FiCheck, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import productData from '@/data/productData';

export default function NotebookCheckout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Preparing your checkout...');
  const [productDetails, setProductDetails] = useState(null);

  useEffect(() => {
    const handleCheckoutFlow = async () => {
      try {
        setIsLoading(true);
        setStatusMessage('Loading product details...');

        // 1. Get product details from multiple possible sources
        let details = {
          // From URL params
          id: window.location.pathname.split('/')[2],
          quantity: parseInt(searchParams.get('quantity')) || 1,
          pageType: searchParams.get('pageType') || 'Ruled',
          
          // From session storage (if coming from login redirect)
          ...(JSON.parse(sessionStorage.getItem('pendingDirectCheckout') || '{}')),
          
          // From direct URL parameter
          ...(searchParams.get('directItem') ? 
              JSON.parse(decodeURIComponent(searchParams.get('directItem'))) : {}
  )};

        // Validate product ID
        if (!details.id) {
          throw new Error('Invalid product details - missing ID');
        }

        // Find product in database to get complete details
        let product = null;
        for (const category in productData) {
          if (productData[category][details.id]) {
            product = productData[category][details.id];
            break;
          }
        }

        if (!product) {
          throw new Error('Product not found in database');
        }

        // Complete the product details
        const completeDetails = {
          ...details,
          name: product.name,
          price: product.price,
          image: product.gridImage || product.detailImage1,
          maxPrice: product.maxPrice,
          discount: product.discount
        };

        setProductDetails(completeDetails);

        // 2. Handle authentication state
        return new Promise((resolve) => {
          const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
              setStatusMessage('Redirecting to login...');
              
              // Store complete details for after login
              sessionStorage.setItem('pendingDirectCheckout', JSON.stringify(completeDetails));

              // Redirect to login with all context
              router.push(
                `/admin/login?redirect=${encodeURIComponent(window.location.pathname)}` +
                `&quantity=${completeDetails.quantity}` +
                `&pageType=${completeDetails.pageType}` +
                `&checkoutType=notebook`
              );
              return resolve();
            }

            // User is authenticated - prepare checkout
            setStatusMessage('Finalizing your order...');
            
            // Prepare cart data with all product information
            const cartItem = {
              id: completeDetails.id,
              name: `${completeDetails.name} - ${completeDetails.pageType}`,
              price: completeDetails.price,
              maxPrice: completeDetails.maxPrice,
              discount: completeDetails.discount,
              quantity: Number(completeDetails.quantity),
              pageType: completeDetails.pageType,
              image: completeDetails.image,
              weight: 0.5 // Default weight, can be fetched from product data
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
        toast.error(err.message || 'Checkout processing failed');
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
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <FiArrowLeft /> Back to Notebooks
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              Try Again
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
        
        {productDetails && !isLoading && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg text-left">
            <p className="font-medium">{productDetails.name}</p>
            <div className="flex justify-between mt-2">
              <span>Quantity: {productDetails.quantity}</span>
              <span>Page Type: {productDetails.pageType}</span>
            </div>
            <div className="mt-2 flex justify-between items-center">
              <span className="font-semibold">
                ₹{(productDetails.price * productDetails.quantity).toFixed(2)}
              </span>
            </div>
          </div>
        )}
        
        <p className="text-gray-600 mb-6">{statusMessage}</p>
        
        {!isLoading && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              You'll be redirected to complete your purchase
            </p>
            <button 
              onClick={() => router.push('/checkout')} 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Proceed to Checkout Now
            </button>
          </>
        )}
      </div>
    </div>
  );
}