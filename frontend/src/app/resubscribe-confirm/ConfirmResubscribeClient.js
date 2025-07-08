'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiCheckCircle, FiAlertCircle, FiLoader, FiHome, FiMail } from 'react-icons/fi';
import { confirmResubscribe } from '@/utils/api';

export default function ConfirmResubscribePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const confirmResub = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid or missing confirmation link');
        return;
      }

      try {
        setStatus('loading');
        setMessage('Confirming your resubscription...');
        
        const data = await confirmResubscribe(token);
        
        if (data.success) {
          // Extract email from response if available
          if (data.email) setEmail(data.email);
          
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
        let errorMessage = 'Something went wrong while processing your request';
        
        // Enhanced error mapping
        if (err.message.includes('Not found') || err.message.includes('Invalid')) {
          errorMessage = 'This confirmation link is invalid or has expired.';
        } else if (err.message.includes('CORS') || err.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (err.message.includes('already subscribed')) {
          errorMessage = 'You are already subscribed to our newsletter!';
          setStatus('info');
        } else {
          errorMessage = err.message || errorMessage;
        }
        
        setMessage(errorMessage);
      }
    };

    // Add a small delay for better UX
    const timer = setTimeout(confirmResub, 500);
    return () => clearTimeout(timer);
  }, [token, router]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <FiLoader className="animate-spin text-blue-500" size={32} />;
      case 'success':
        return <FiCheckCircle className="text-green-500" size={32} />;
      case 'info':
        return <FiMail className="text-blue-400" size={32} />;
      default:
        return <FiAlertCircle className="text-red-500" size={32} />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'loading':
        return 'Processing...';
      case 'success':
        return 'Successfully Resubscribed!';
      case 'info':
        return 'Already Subscribed';
      default:
        return 'Something Went Wrong';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center">
        <div className="mb-4 flex justify-center">{getStatusIcon()}</div>
        <h1 className="text-2xl font-bold mb-2">
          {getStatusTitle()}
        </h1>
        
        {email && (
          <p className="text-blue-300 mb-2">
            <span className="font-semibold">{email}</span>
          </p>
        )}
        
        <p className="text-gray-300 mb-4">{message}</p>

        {status === 'success' && (
          <p className="text-sm text-gray-400 mb-6">
            Redirecting in {countdown} seconds...
          </p>
        )}

        {status !== 'loading' && (
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition flex items-center justify-center gap-2 w-full"
            aria-label="Go to homepage"
          >
            <FiHome />
            Go to Homepage
          </button>
        )}

        {status === 'error' && (
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white transition flex items-center justify-center gap-2 w-full"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}