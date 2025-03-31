'use client';

import { Suspense } from 'react';
import { FiCheck, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

function ResubscribeContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ 
    loading: false, 
    success: false, 
    error: null,
    isTokenValid: false
  });

  useEffect(() => {
    if (!token) {
      setStatus(prev => ({
        ...prev,
        error: 'Missing or invalid resubscribe link',
        isTokenValid: false
      }));
      return;
    }

    const verifyToken = async () => {
      try {
        setStatus(prev => ({ 
          ...prev, 
          loading: true,
          error: null 
        }));
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/verify-resubscribe-token?token=${encodeURIComponent(token)}`, {
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Invalid token');
        }
        
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

  const handleResubscribe = async () => {
    if (!token || !status.isTokenValid) return;
    
    setStatus(prev => ({ 
      ...prev, 
      loading: true, 
      error: null 
    }));
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/resubscribe`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ token }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Resubscription failed');
      }

      const data = await res.json();
      setStatus({
        loading: false,
        success: true,
        error: null,
        isTokenValid: false
      });
      
    } catch (err) {
      setStatus({
        loading: false,
        success: false,
        error: err.message || 'An unexpected error occurred',
        isTokenValid: status.isTokenValid // Preserve token validity state
      });
    }
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
              {status.isTokenValid ? 'Processing resubscription...' : 'Verifying your resubscribe link...'}
            </p>
          </div>
        ) : status.success ? (
          <div className="space-y-4">
            <div 
              className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-md"
              role="alert"
            >
              <FiCheck className="text-xl" aria-hidden="true" />
              <p>You've been successfully resubscribed!</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label="Return to homepage"
            >
              Return to Homepage
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {status.error && (
              <div 
                className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md"
                role="alert"
              >
                <FiAlertTriangle className="text-xl" aria-hidden="true" />
                <p>{status.error}</p>
              </div>
            )}

            {status.isTokenValid ? (
              <>
                <p className="text-gray-600">We'd love to have you back! Resubscribe to continue receiving updates.</p>
                <div className="p-3 bg-blue-50 text-blue-700 rounded-md">
                  <p className="font-medium">Email:</p>
                  <p className="truncate" title={email}>{email}</p>
                </div>
                <button
                  onClick={handleResubscribe}
                  disabled={status.loading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Confirm resubscription"
                >
                  {status.loading ? (
                    <>
                      <span className="inline-block animate-spin mr-2">↻</span>
                      Processing...
                    </>
                  ) : 'Confirm Resubscribe'}
                </button>
              </>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  {status.error 
                    ? 'Please request a new resubscribe link.'
                    : 'Validating your resubscribe link...'}
                </p>
                <Link 
                  href="/contact" 
                  className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  aria-label="Contact support"
                >
                  Need help? Contact support
                </Link>
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
        <div 
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
          aria-label="Loading page"
        />
      </div>
    }>
      <ResubscribeContent />
    </Suspense>
  );
}