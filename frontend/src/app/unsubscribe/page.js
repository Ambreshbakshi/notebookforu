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
    isResubscribable: false,
    message: ''
  });

  useEffect(() => {
    const abortController = new AbortController();

    const processUnsubscribe = async () => {
      if (!token && !emailParam) return;

      try {
        setStatus(prev => ({
          ...prev,
          loading: true,
          error: null,
          message: 'Processing unsubscribe request...'
        }));

        const response = await fetch(`${API_BASE_URL}/api/unsubscribe`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ 
            token, 
            email: emailParam 
          }),
          signal: abortController.signal
        });

        const data = await response.json();

        if (!response.ok) {
          // Enhanced error handling with specific cases
          if (response.status === 400) {
            if (data.error === 'Validation failed') {
              const firstError = data.details?.[0]?.message || 'Invalid request';
              throw new Error(firstError);
            }
            if (data.error === 'Already unsubscribed') {
              throw new Error('This unsubscribe link has already been used');
            }
            if (data.error === 'Either token or email is required') {
              throw new Error('Please provide either an unsubscribe token or email address');
            }
            throw new Error(data.error || 'Invalid request. Please try again.');
          } else if (response.status === 404) {
            throw new Error(
              token 
                ? 'This unsubscribe link is invalid or expired. Please enter your email below.'
                : 'No active subscription found for this email.'
            );
          } else if (response.status === 429) {
            throw new Error('Too many attempts. Please try again later.');
          } else {
            throw new Error(
              data.message || 
              data.error || 
              'Unsubscribe failed. Please try again or contact support.'
            );
          }
        }

        // Success case
        setStatus({
          loading: false,
          success: true,
          error: null,
          email: data.email || emailParam,
          isResubscribable: !!data.resubscribeToken,
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
  // First check for specific validation messages from backend
  if (typeof error === 'string') {
    const errorMap = {
      'already unsubscribed': 'This email is already unsubscribed',
      'expired': 'This unsubscribe link has expired. Please enter your email below',
      'Failed to fetch': 'Could not connect to server. Please try again later',
      'Invalid email': 'Please enter a valid email address',
      'Invalid email format': 'Please enter a valid email address',
      'Invalid request': 'Please check your input and try again',
      'Validation failed': 'Please check your input and try again',
      'Not allowed by CORS': 'Request blocked for security reasons',
      'Too many attempts': 'Too many requests. Please wait before trying again',
      'Subscription not found': 'No active subscription found',
      'Invalid or expired unsubscribe link': 'This link is no longer valid. Please enter your email below',
    };

    // Find the first matching error
    for (const [key, message] of Object.entries(errorMap)) {
      if (error.includes(key)) {
        return message;
      }
    }
  }

  // Fallback for unknown errors
  return typeof error === 'string' 
    ? error.replace(/^Error: /, '') 
    : 'An unexpected error occurred. Please try again.';
};

  const handleManualUnsubscribe = async (e) => {
    e.preventDefault();
    const email = formData.email.trim();
    
    if (!EMAIL_REGEX.test(email)) {
      setStatus({
        loading: false,
        success: false,
        error: 'Invalid email',
        message: 'Please enter a valid email address',
        email: null,
        isResubscribable: false
      });
      return;
    }

    try {
      setStatus(prev => ({
        ...prev,
        loading: true,
        message: 'Processing unsubscribe request...'
      }));

      const response = await fetch(`${API_BASE_URL}/api/unsubscribe`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unsubscribe failed');
      }

      setStatus({
        loading: false,
        success: true,
        error: null,
        email: data.email || email,
        isResubscribable: !!data.resubscribeToken,
        message: data.message || 'You have been successfully unsubscribed.'
      });
    } catch (error) {
      setStatus({
        loading: false,
        success: false,
        error: error.message,
        email: email,
        isResubscribable: false,
        message: getFriendlyErrorMessage(error.message)
      });
    }
  };

  const handleResubscribe = async () => {
    try {
      setStatus(prev => ({ 
        ...prev, 
        loading: true,
        message: 'Processing resubscribe request...'
      }));
      
      const response = await fetch(`${API_BASE_URL}/api/subscribe`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
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
        message: getFriendlyErrorMessage(error.message)
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center mb-6">
          <Link 
            href="/" 
            className="mr-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Return to homepage"
          >
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
          <div className="flex flex-col items-center py-6" aria-live="polite">
            <div 
              className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"
              aria-label="Loading"
            />
            <p className="text-gray-600">{status.message}</p>
          </div>
        ) : status.success ? (
          <div className="space-y-4">
            <div 
              className={`flex items-center p-4 rounded-md ${
                status.message.includes('resubscribed') 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-blue-50 text-blue-700'
              }`}
              role="alert"
            >
              <FiCheck className="mr-2 text-xl" aria-hidden="true" />
              <p>{status.message}</p>
            </div>
              {/* ADD THE NEW BLOCK HERE */}
    {status.success && !status.message.includes('resubscribed') && (
      <div className="mt-2 p-4 bg-gray-50 rounded-md text-sm text-gray-600">
        <h3 className="font-medium mb-2">What happens when you unsubscribe:</h3>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>We immediately stop all marketing communications</li>
          <li>We retain your email in our suppression list to prevent accidental emails</li>
          <li>This record contains only your email and unsubscribe timestamp</li>
          <li>We do not use this information for any other purpose</li>
        </ul>
        <p>
          To request complete deletion of your email record, please{' '}
          <Link 
            href="mailto:privacy@yourdomain.com" 
            className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            email us
          </Link>.
        </p>
      </div>
    )}
    {/* END OF NEW BLOCK */}
            
            {status.isResubscribable && (
              <button
                onClick={handleResubscribe}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                disabled={status.loading}
                aria-disabled={status.loading}
              >
                Resubscribe
              </button>
            )}
            
            <Link
              href="/"
              className="block w-full text-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              prefetch={false}
              aria-label="Return to homepage"
            >
              Return to Homepage
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {status.error && (
              <div 
                className="flex items-center p-3 bg-red-50 text-red-700 rounded-md"
                role="alert"
              >
                <FiXCircle className="mr-2 text-xl" aria-hidden="true" />
                <p>{status.message}</p>
              </div>
            )}
            
            <form onSubmit={handleManualUnsubscribe} className="space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3 text-gray-400" aria-hidden="true" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (status.error) {
                        setStatus(prev => ({
                          ...prev,
                          error: null,
                          message: ''
                        }));
                      }
                    }}
                    placeholder="your@email.com"
                    required
                    autoFocus={formData.manualEntry}
                    className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    pattern={EMAIL_REGEX.source}
                    aria-describedby={status.error ? "error-message" : undefined}
                    aria-invalid={!!status.error}
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                disabled={status.loading || !formData.email}
                aria-disabled={status.loading || !formData.email}
              >
                {status.loading ? (
                  <>
                    <span className="inline-block animate-spin mr-2">↻</span>
                    Processing...
                  </>
                ) : 'Unsubscribe'}
              </button>
            </form>
            
            <div className="text-center text-sm text-gray-500">
              <p>
                Need help?{' '}
                <Link 
                  href="/contact-us" 
                  className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  aria-label="Contact us"
                >
                  Contact us
                </Link>
              </p>
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
          aria-label="Loading unsubscribe page"
        />
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}