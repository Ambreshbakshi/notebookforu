// src/components/ui/LoadingSpinner.js
'use client';
import { FiLoader } from 'react-icons/fi';

export default function LoadingSpinner({ fullPage = false }) {
  return (
    <div className={`flex items-center justify-center ${fullPage ? 'min-h-screen' : ''}`}>
      <FiLoader className="animate-spin text-2xl text-blue-600" />
    </div>
  );
}