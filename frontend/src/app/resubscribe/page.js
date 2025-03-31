'use client';

import { Suspense, useCallback } from 'react';
import { FiCheck, FiMail, FiAlertCircle } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const ResubscribeContent = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'resubscribed' | 'already_subscribed' | 'error'
  const [error, setError] = useState(null);
  const router = useRouter();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Clear success messages after 5 seconds
  useEffect(() => {
    if (['success', 'resubscribed', 'already_subscribed'].includes(status)) {
      const timer = setTimeout(() => {
        setStatus('idle');
        router.refresh();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!email) {
      setStatus('error');
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setStatus('error');
      setError('Please enter a valid email address');
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          const firstError = data.details?.[0]?.msg || 'Invalid email format';
          throw new Error(firstError);
        }
        throw new Error(data.error || 'Subscription failed');
      }

      // Handle different success cases
      if (response.status === 201) {
        setStatus('success');
        setEmail('');
      } else if (data.message?.includes('Welcome back')) {
        setStatus('resubscribed');
      } else if (data.message?.includes('already subscribed')) {
        setStatus('already_subscribed');
      }
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Subscription failed. Please try again.');
    }
  }, [email]);

  const getStatusMessage = () => {
    switch (status) {
      case 'success':
        return {
          message: 'Thank you for subscribing! Please check your email.',
          icon: <FiCheck className="text-green-500" />,
          color: 'text-green-400 bg-green-900/20',
        };
      case 'resubscribed':
        return {
          message: 'Welcome back! You have been resubscribed.',
          icon: <FiCheck className="text-blue-500" />,
          color: 'text-blue-400 bg-blue-900/20',
        };
      case 'already_subscribed':
        return {
          message: 'You are already subscribed!',
          icon: <FiCheck className="text-yellow-500" />,
          color: 'text-yellow-400 bg-yellow-900/20',
        };
      case 'error':
        return {
          message: error,
          icon: <FiAlertCircle className="text-red-500" />,
          color: 'text-red-400 bg-red-900/20',
        };
      default:
        return null;
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Resubscribe</h1>
            <p className="text-gray-400">
              Stay updated with our latest news and offers
            </p>
          </div>

          {statusMessage && (
            <div
              className={`mb-6 p-4 rounded-md flex items-start gap-3 ${statusMessage.color} border ${
                status === 'error' ? 'border-red-900' : 'border-transparent'
              }`}
              role="alert"
            >
              <span className="mt-0.5">{statusMessage.icon}</span>
              <p>{statusMessage.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder-gray-400 disabled:opacity-70"
                  disabled={status === 'loading'}
                  required
                  aria-required="true"
                  aria-invalid={status === 'error'}
                  aria-describedby={status === 'error' ? "error-message" : undefined}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                status === 'loading'
                  ? 'bg-blue-700 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {status === 'loading' ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Resubscribe'
              )}
            </button>
          </form>
        </div>
        <div className="px-8 py-4 bg-gray-700/50 text-center text-sm text-gray-400">
          <p>You can unsubscribe at any time</p>
        </div>
      </div>
    </div>
  );
};

export default function ResubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    }>
      <ResubscribeContent />
    </Suspense>
  );
}