// src/app/unsubscribe/page.js
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [status, setStatus] = useState({
    loading: true,
    success: false,
    message: 'Processing unsubscribe request...'
  });

  useEffect(() => {
    const processUnsubscribe = async () => {
      try {
        if (!token && !email) {
          throw new Error('Missing unsubscribe token or email');
        }

        // Use absolute URL in production, relative in development
        const apiUrl = process.env.NODE_ENV === 'production'
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/unsubscribe`
          : '/api/unsubscribe'; // Changed to relative path for consistency

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email })
        });

        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          throw new Error(text || 'Invalid server response');
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Unsubscribe failed (HTTP ${response.status})`);
        }

        setStatus({
          loading: false,
          success: true,
          message: data.message || 'You have been successfully unsubscribed.'
        });
      } catch (error) {
        let errorMessage = error.message;
        
        // Clean HTML error responses
        if (errorMessage.startsWith('<!DOCTYPE')) {
          errorMessage = 'Server error: Please try again later';
        }

        setStatus({
          loading: false,
          success: false,
          message: errorMessage || 'Failed to process unsubscribe request'
        });
      }
    };

    processUnsubscribe();
  }, [token, email]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {status.loading ? 'Processing...' : status.success ? 'Unsubscribed' : 'Error'}
        </h1>
        
        <p className="text-gray-600 mb-6">{status.message}</p>

        {status.loading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {status.success ? (
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Return to Homepage
          </Link>
        ) : !status.loading && (
          <div className="space-y-4">
            <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
              Couldn't process automatic unsubscribe
            </div>
            
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const formEmail = e.currentTarget.email.value.trim();
                if (!formEmail.includes('@')) {
                  setStatus({
                    loading: false,
                    success: false,
                    message: 'Please enter a valid email address'
                  });
                  return;
                }
                window.location.href = `/unsubscribe?email=${encodeURIComponent(formEmail)}`;
              }}
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
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Unsubscribe Manually
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}