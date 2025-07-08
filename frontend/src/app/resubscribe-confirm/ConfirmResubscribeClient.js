'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiCheckCircle, FiAlertCircle, FiLoader, FiHome } from 'react-icons/fi';
import { confirmResubscribe } from '@/utils/api';

export default function ConfirmResubscribePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const confirmResub = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid or missing token');
        return;
      }

      try {
        const data = await confirmResubscribe(token);
        
        if (data.success) {
          setStatus('success');
          setMessage(data.message || 'You have been successfully resubscribed! 🎉');
          
          // Start countdown for automatic redirect
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                router.push('/');
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          return () => clearInterval(timer);
        } else {
          throw new Error(data.error || 'Failed to confirm resubscription');
        }
      } catch (err) {
        setStatus('error');
        let errorMessage = 'Something went wrong';
        
        if (err.message.includes('Not found') || err.message.includes('Invalid')) {
          errorMessage = 'Invalid or expired link. Please try unsubscribing and subscribing again.';
        } else if (err.message.includes('CORS') || err.message.includes('Failed to fetch')) {
          errorMessage = 'Connection error. Please try again.';
        } else {
          errorMessage = err.message || errorMessage;
        }
        
        setMessage(errorMessage);
      }
    };

    confirmResub();
  }, [token, router]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <FiLoader className="animate-spin text-blue-500" size={32} />;
      case 'success':
        return <FiCheckCircle className="text-green-500" size={32} />;
      default:
        return <FiAlertCircle className="text-red-500" size={32} />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'loading':
        return 'Confirming...';
      case 'success':
        return 'Resubscribed!';
      default:
        return 'Oops!';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center">
        <div className="mb-4 flex justify-center">{getStatusIcon()}</div>
        <h1 className="text-2xl font-bold mb-2">
          {getStatusTitle()}
        </h1>
        <p className="text-gray-300 mb-4">{message}</p>

        {status === 'success' && (
          <p className="text-sm text-gray-400 mb-6">
            Redirecting to homepage in {countdown} seconds...
          </p>
        )}

        {status !== 'loading' && (
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition flex items-center justify-center gap-2 w-full"
          >
            <FiHome />
            Go to Homepage
          </button>
        )}
      </div>
    </div>
  );
}