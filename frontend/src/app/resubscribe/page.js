'use client';

import { Suspense, useCallback } from 'react';
import { FiCheck, FiMail, FiAlertCircle } from 'react-icons/fi';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const ConfirmResubscribeContent = () => {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const confirmResubscribe = async () => {
      if (!token) {
        setStatus('error');
        setError('Missing token in URL');
        return;
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/confirm-resubscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || 'Confirmation failed');
        }

        setStatus('success');
        setMessage(data.message || 'You have been resubscribed successfully!');
      } catch (err) {
        setStatus('error');
        setError(err.message);
      }
    };

    confirmResubscribe();
  }, [token]);

  const renderStatus = () => {
    if (status === 'loading') {
      return (
        <div className="text-center text-white">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-4" />
          <p>Verifying your request...</p>
        </div>
      );
    }

    if (status === 'success') {
      return (
        <div className="text-green-400 bg-green-900/20 border border-green-700 rounded p-4">
          <FiCheck className="inline-block text-green-500 mr-2" />
          {message}
        </div>
      );
    }

    if (status === 'error') {
      return (
        <div className="text-red-400 bg-red-900/20 border border-red-700 rounded p-4">
          <FiAlertCircle className="inline-block text-red-500 mr-2" />
          {error}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-4">Resubscribe Confirmation</h1>
        {renderStatus()}
        {status === 'success' && (
          <p className="text-center text-sm text-gray-400 mt-4">
            You can now continue enjoying our newsletter. ❤️
          </p>
        )}
      </div>
    </div>
  );
};

export default function ConfirmResubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>}>
      <ConfirmResubscribeContent />
    </Suspense>
  );
}
