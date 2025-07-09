"use client";
import { Suspense } from 'react';
import { FiLoader } from 'react-icons/fi';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <FiLoader className="animate-spin text-blue-600 text-4xl" />
        <span className="sr-only">Loading...</span>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-blue-100 mt-1">Login to access your account</p>
        </div>
        <div className="p-6 sm:p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}