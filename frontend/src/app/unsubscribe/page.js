// src/app/unsubscribe/page.js
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { FiMail, FiCheck, FiXCircle, FiArrowLeft } from 'react-icons/fi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Enhanced email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');
  
  const [formData, setFormData] = useState({
    email: emailParam || '',
    manualEntry: !token && !emailParam
  });
  
  const [status, setStatus] = useState({
    loading: !!token || !!emailParam, // Auto-load if token or email in URL
    success: false,
    error: null,
    email: null,
    isResubscribable: false
  });

  useEffect(() => {
    const abortController = new AbortController();

    const processUnsubscribe = async () => {
      if (!token && !emailParam) return;

      try {
        setStatus(prev => ({
          ...prev,
          loading: true,
          error: null
        }));

        const response = await fetch(`${API_BASE_URL}/api/unsubscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email: emailParam }),
          signal: abortController.signal
        });

        const data = await response.json();

        if (!response.ok) {
          // Handle different error cases
          if (response.status === 400) {
            const errorMsg = data.details?.[0]?.message || 
                           data.error || 
                           'Invalid request';
            throw new Error(errorMsg);
          } else if (response.status === 404) {
            throw new Error(data.suggestion || 'Subscription not found');
          } else {
            throw new Error(data.error || 'Unsubscribe failed');
          }
        }

        // Success case
        setStatus({
          loading: false,
          success: true,
          error: null,
          email: data.email || emailParam,
          isResubscribable: true,
          message: data.message || 'You have been successfully unsubscribed.'
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          setStatus({
            loading: false,
            success: false,
            error: error.message,
            email: emailParam,
            isResubscribable: false,
            message: getFriendlyErrorMessage(error.message)
          });
        }
      }
    };

    processUnsubscribe();

    return () => abortController.abort();
  }, [token, emailParam]);

  const getFriendlyErrorMessage = (error) => {
    if (error.includes('already unsubscribed')) {
      return 'This email is already unsubscribed.';
    }
    if (error.includes('expired')) {
      return 'This unsubscribe link has expired. Please enter your email below.';
    }
    if (error.includes('Failed to fetch')) {
      return 'Could not connect to server. Please try again later.';
    }
    return error.replace(/^Error: /, '');
  };

  const handleManualUnsubscribe = async (e) => {
    e.preventDefault();
    const email = formData.email.trim();
    
    if (!EMAIL_REGEX.test(email)) {
      setStatus({
        loading: false,
        success: false,
        error: 'Please enter a valid email address',
        message: 'Please enter a valid email address'
      });
      return;
    }

    // Update URL to trigger the useEffect
    router.push(`/unsubscribe?email=${encodeURIComponent(email)}`);
    setStatus(prev => ({
      ...prev,
      loading: true,
      message: 'Processing unsubscribe request...'
    }));
  };

  const handleResubscribe = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true }));
      
      const response = await fetch(`${API_BASE_URL}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: status.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Resubscribe failed');
      }

      setStatus({
        loading: false,
        success: true,
        error: null,
        message: data.message || 'You have been successfully resubscribed!',
        isResubscribable: false
      });
    } catch (error) {
      setStatus({
        ...status,
        loading: false,
        error: error.message,
        message: error.message
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center mb-6">
          <Link href="/" className="mr-2 text-gray-500 hover:text-gray-700">
            <FiArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            {status.loading 
              ? 'Processing...' 
              : status.success 
                ? status.message.includes('resubscribed') 
                  ? 'Resubscribed' 
                  : 'Unsubscribed'
                : 'Unsubscribe'}
          </h1>
        </div>
        
        {status.loading ? (
          <div className="flex flex-col items-center py-6">
            <div 
              className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"
              aria-label="Loading"
            />
            <p className="text-gray-600">{status.message}</p>
          </div>
        ) : status.success ? (
          <div className="space-y-4">
            <div className={`flex items-center p-4 rounded-md ${
              status.message.includes('resubscribed') 
                ? 'bg-green-50 text-green-700' 
                : 'bg-blue-50 text-blue-700'
            }`}>
              <FiCheck className="mr-2 text-xl" />
              <p>{status.message}</p>
            </div>
            
            {status.isResubscribable && (
              <button
                onClick={handleResubscribe}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Resubscribe
              </button>
            )}
            
            <Link
              href="/"
              className="block w-full text-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              prefetch={false}
            >
              Return to Homepage
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {status.error && (
              <div className="flex items-center p-3 bg-red-50 text-red-700 rounded-md">
                <FiXCircle className="mr-2 text-xl" />
                <p>{status.message}</p>
              </div>
            )}
            
            <form onSubmit={handleManualUnsubscribe} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                    autoFocus={formData.manualEntry}
                    className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    pattern={EMAIL_REGEX.source}
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={status.loading}
                aria-disabled={status.loading}
              >
                {status.loading ? 'Processing...' : 'Unsubscribe'}
              </button>
            </form>
            
            <div className="text-center text-sm text-gray-500">
              <p>Need help? <Link href="/contact" className="text-blue-600 hover:underline">Contact us</Link></p>
            </div>
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