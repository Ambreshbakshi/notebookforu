'use client';

import { Suspense } from 'react';
import { FiCheck, FiArrowLeft, FiAlertTriangle, FiMail, FiXCircle } from 'react-icons/fi';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

function ResubscribeContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token');
  const [email, setEmail] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [resubscribeStatus, setResubscribeStatus] = useState({
    loading: false,
    success: false,
    error: null,
    message: ''
  });
  const [status, setStatus] = useState({ 
    loading: false, 
    success: false, 
    error: null,
    isTokenValid: false,
    activeTab: token ? 'token' : 'manual'
  });

  // Token verification
  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      try {
        setStatus(prev => ({ ...prev, loading: true, error: null }));
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/verify-resubscribe-token?token=${encodeURIComponent(token)}`, {
          headers: { 'Accept': 'application/json' }
        });
        
        if (!res.ok) throw new Error('Invalid token');
        
        const data = await res.json();
        setEmail(data.email);
        setStatus(prev => ({
          ...prev,
          loading: false,
          isTokenValid: true
        }));
      } catch (err) {
        setStatus(prev => ({
          ...prev,
          loading: false,
          error: err.message || 'Failed to verify token',
          isTokenValid: false
        }));
      }
    };

    verifyToken();
  }, [token]);

  const handleResubscribe = async (emailToResubscribe) => {
    try {
      setResubscribeStatus({
        loading: true,
        success: false,
        error: null,
        message: 'Processing resubscription...'
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscribe`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          token,
          email: token ? undefined : emailToResubscribe 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Resubscription failed');
      }

      setResubscribeStatus({
        loading: false,
        success: true,
        error: null,
        message: 'Welcome back! You have been resubscribed.'
      });
      
      // Update main status to show success
      setStatus(prev => ({
        ...prev,
        success: true
      }));
    } catch (error) {
      setResubscribeStatus({
        loading: false,
        success: false,
        error: error.message,
        message: getFriendlyErrorMessage(error.message)
      });
    }
  };

  const getFriendlyErrorMessage = (error) => {
    if (error.includes('already subscribed')) {
      return 'This email is already subscribed.';
    }
    if (error.includes('not found')) {
      return 'Email not found in our records.';
    }
    return error.replace(/^Error: /, '');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => router.push('/')}
            className="mr-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Return to homepage"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {status.success ? 'Resubscribed!' : 'Resubscribe'}
          </h1>
        </div>

        {status.loading && !status.success ? (
          <div className="flex flex-col items-center py-6" aria-live="polite">
            <div 
              className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"
              aria-label="Loading"
            />
            <p className="text-gray-600">
              {status.isTokenValid ? 'Processing resubscription...' : 'Verifying...'}
            </p>
          </div>
        ) : status.success ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-md">
              <FiCheck className="text-xl" />
              <p>Welcome back! You have been resubscribed.</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Return to Homepage
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex border-b">
              <button
                className={`px-4 py-2 font-medium ${status.activeTab === 'token' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                onClick={() => setStatus(prev => ({ ...prev, activeTab: 'token' }))}
                disabled={!token}
              >
                {token ? 'Email Link' : 'No Token Found'}
              </button>
              <button
                className={`px-4 py-2 font-medium ${status.activeTab === 'manual' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                onClick={() => setStatus(prev => ({ ...prev, activeTab: 'manual' }))}
              >
                Manual Entry
              </button>
            </div>

            {(status.error || resubscribeStatus.error) && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md">
                <FiAlertTriangle className="text-xl" />
                <p>{status.error || resubscribeStatus.error}</p>
              </div>
            )}

            {status.activeTab === 'token' ? (
              status.isTokenValid ? (
                <div className="space-y-4">
                  <p className="text-gray-600">We'd love to have you back!</p>
                  <div className="p-3 bg-blue-50 text-blue-700 rounded-md">
                    <p className="font-medium">Email:</p>
                    <p className="truncate">{email}</p>
                  </div>
                  
                  {/* Resubscribe Button Section */}
                  <div className="space-y-4">
                    {resubscribeStatus.loading ? (
                      <div className="flex flex-col items-center py-2" aria-live="polite">
                        <div 
                          className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mb-2"
                          aria-label="Loading"
                        />
                        <p className="text-gray-600 text-sm">{resubscribeStatus.message}</p>
                      </div>
                    ) : resubscribeStatus.success ? (
                      <div className="flex items-center p-3 bg-green-50 text-green-700 rounded-md">
                        <FiCheck className="mr-2" />
                        <p>{resubscribeStatus.message}</p>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleResubscribe(email)}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                          disabled={resubscribeStatus.loading}
                        >
                          {resubscribeStatus.loading ? 'Processing...' : 'Resubscribe'}
                        </button>
                        {resubscribeStatus.error && (
                          <div className="flex items-center p-2 bg-red-50 text-red-700 rounded-md text-sm">
                            <FiXCircle className="mr-2" />
                            <p>{resubscribeStatus.message}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">
                    {token ? 'This resubscribe link is invalid or expired.' : 'No resubscribe token found.'}
                  </p>
                  <p>Please use the manual entry option or request a new link.</p>
                </div>
              )
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Your Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-3 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                
                {/* Resubscribe Button Section for Manual Entry */}
                <div className="space-y-4">
                  {resubscribeStatus.loading ? (
                    <div className="flex flex-col items-center py-2" aria-live="polite">
                      <div 
                        className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mb-2"
                        aria-label="Loading"
                      />
                      <p className="text-gray-600 text-sm">{resubscribeStatus.message}</p>
                    </div>
                  ) : resubscribeStatus.success ? (
                    <div className="flex items-center p-3 bg-green-50 text-green-700 rounded-md">
                      <FiCheck className="mr-2" />
                      <p>{resubscribeStatus.message}</p>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleResubscribe(manualEmail)}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={resubscribeStatus.loading || !manualEmail.includes('@')}
                      >
                        {resubscribeStatus.loading ? 'Processing...' : 'Resubscribe'}
                      </button>
                      {resubscribeStatus.error && (
                        <div className="flex items-center p-2 bg-red-50 text-red-700 rounded-md text-sm">
                          <FiXCircle className="mr-2" />
                          <p>{resubscribeStatus.message}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    }>
      <ResubscribeContent />
    </Suspense>
  );
}