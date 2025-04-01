'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { FiMail, FiCheck, FiXCircle, FiArrowLeft } from 'react-icons/fi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');
  
  const [formData, setFormData] = useState({
    email: emailParam || '',
    showManualOption: !token // Show email form if no token
  });
  
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: null,
    email: null,
    isResubscribable: false,
    message: ''
  });

  const handleTokenUnsubscribe = async () => {
    if (!token) return;

    try {
      setStatus({
        loading: true,
        success: false,
        error: null,
        message: 'Processing unsubscribe request...',
        email: null,
        isResubscribable: false
      });

      const response = await fetch(`${API_BASE_URL}/api/unsubscribe`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unsubscribe failed');
      }

      setStatus({
        loading: false,
        success: true,
        error: null,
        email: data.email,
        isResubscribable: !!data.resubscribeToken,
        message: data.message || 'You have been successfully unsubscribed.'
      });
    } catch (error) {
      setStatus({
        loading: false,
        success: false,
        error: error.message,
        email: null,
        isResubscribable: false,
        message: getFriendlyErrorMessage(error.message)
      });
      setFormData(prev => ({ ...prev, showManualOption: true }));
    }
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
      setStatus({
        loading: true,
        success: false,
        error: null,
        message: 'Processing unsubscribe request...',
        email: null,
        isResubscribable: false
      });

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
        email: data.email,
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

  const getFriendlyErrorMessage = (error) => {
    const errorMap = {
      'already unsubscribed': 'This email is already unsubscribed',
      'expired|invalid': 'This unsubscribe link is no longer valid',
      'Failed to fetch': 'Connection problem. Please try again',
      'Invalid email': 'Please enter a valid email address',
      'Validation failed': 'Please check your email address',
      'default': 'Something went wrong. Please try again'
    };

    const matchedError = Object.entries(errorMap).find(([key]) => 
      new RegExp(key, 'i').test(error)
    );
    
    return matchedError?.[1] || errorMap.default;
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
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4" />
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
            
            {status.success && !status.message.includes('resubscribed') && (
              <div className="mt-2 p-4 bg-gray-50 rounded-md text-sm text-gray-600">
                <h3 className="font-medium mb-2">What happens when you unsubscribe:</h3>
                <ul className="list-disc pl-5 space-y-1 mb-3">
                  <li>We immediately stop all marketing communications</li>
                  <li>We retain your email to prevent accidental emails</li>
                  <li>This record contains only your email and unsubscribe timestamp</li>
                </ul>
              </div>
            )}
            
            {status.isResubscribable && (
              <button
                onClick={handleResubscribe}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Resubscribe
              </button>
            )}
            
            <Link href="/" className="block w-full text-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
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
            
            {formData.showManualOption ? (
              <form onSubmit={handleManualUnsubscribe} className="space-y-4">
                <p className="text-gray-600">Please enter your email to unsubscribe:</p>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                      className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Unsubscribe
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">Click the button below to unsubscribe:</p>
                <button
                  onClick={handleTokenUnsubscribe}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Confirm Unsubscribe
                </button>
              </div>
            )}
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}