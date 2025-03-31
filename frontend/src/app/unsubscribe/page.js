// src/app/unsubscribe/page.js
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Email validation regex (more strict than before)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [status, setStatus] = useState({
    loading: true,
    success: false,
    message: 'Processing unsubscribe request...'
  });

  useEffect(() => {
    const abortController = new AbortController();

    const processUnsubscribe = async () => {
      try {
        if (!token && !email) {
          setStatus({
            loading: false,
            success: false,
            message: 'Missing unsubscribe link. Please enter your email below.'
          });
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/unsubscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email }),
          signal: abortController.signal
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || 
                            errorData.message || 
                            (response.status === 404 ? 'Subscription not found' : 
                             `Request failed with status ${response.status}`);
          throw new Error(errorMessage);
        }

        const data = await response.json();
        
        setStatus({
          loading: false,
          success: true,
          message: data.message || 'You have been successfully unsubscribed.'
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          setStatus({
            loading: false,
            success: false,
            message: error.message.includes('Failed to fetch')
              ? 'Could not connect to server. Please try again later.'
              : error.message.replace(/^Error: /, '')
          });
        }
      }
    };

    processUnsubscribe();

    return () => abortController.abort();
  }, [token, email, router]);

  const handleManualUnsubscribe = async (e) => {
    e.preventDefault();
    const formEmail = e.currentTarget.email.value.trim();
    
    if (!EMAIL_REGEX.test(formEmail)) {
      setStatus({
        loading: false,
        success: false,
        message: 'Please enter a valid email address'
      });
      return;
    }

    setStatus({
      loading: true,
      success: false,
      message: 'Processing unsubscribe request...'
    });
    
    router.push(`/unsubscribe?email=${encodeURIComponent(formEmail)}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {status.loading ? 'Processing...' : status.success ? 'Unsubscribed' : 'Error'}
        </h1>
        
        <p className="text-gray-600 mb-6">{status.message}</p>

        {status.loading && (
          <div className="flex justify-center py-4">
            <div 
              className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"
              aria-label="Loading"
            />
          </div>
        )}

        {status.success ? (
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            prefetch={false}
          >
            Return to Homepage
          </Link>
        ) : !status.loading && (
          <div className="space-y-4">
            {!token && !email && (
              <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
                Couldn't process automatic unsubscribe
              </div>
            )}
            
            <form 
              onSubmit={handleManualUnsubscribe}
              className="space-y-3"
            >
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Unsubscribe with email address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="your@email.com"
                  required
                  autoFocus
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  pattern={EMAIL_REGEX.source}
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={status.loading}
                aria-disabled={status.loading}
              >
                {status.loading ? 'Processing...' : 'Unsubscribe Manually'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
          aria-label="Loading"
        />
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}