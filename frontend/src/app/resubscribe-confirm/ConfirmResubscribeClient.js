'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';

export default function ConfirmResubscribePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmResubscribe = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid or missing token');
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/confirm-resubscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to confirm resubscription');
        }

        setStatus('success');
        setMessage('You have been successfully resubscribed! 🎉');
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Something went wrong');
      }
    };

    confirmResubscribe();
  }, [token]);

  const getStatusIcon = () => {
    if (status === 'loading') return <FiLoader className="animate-spin text-blue-500" size={32} />;
    if (status === 'success') return <FiCheckCircle className="text-green-500" size={32} />;
    return <FiAlertCircle className="text-red-500" size={32} />;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center">
        <div className="mb-4 flex justify-center">{getStatusIcon()}</div>
        <h1 className="text-2xl font-bold mb-2">
          {status === 'loading'
            ? 'Confirming...'
            : status === 'success'
            ? 'Resubscribed!'
            : 'Oops!'}
        </h1>
        <p className="text-gray-300">{message}</p>

        {status !== 'loading' && (
          <button
            onClick={() => router.push('/')}
            className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition"
          >
            Go to Homepage
          </button>
        )}
      </div>
    </div>
  );
                          }
