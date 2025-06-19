'use client'
import { FiAlertTriangle, FiRefreshCw, FiShoppingCart, FiHome } from 'react-icons/fi'
import { useRouter } from 'next/navigation'

export default function CheckoutError({ error, reset }) {
  const router = useRouter()

  const getErrorDetails = () => {
    if (error.message.includes('network')) return 'Network error - please check your connection'
    if (error.message.includes('payment')) return 'Payment processing failed'
    if (error.message.includes('cart')) return 'Your cart has issues'
    return error.message || 'An unexpected error occurred'
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10 text-center">
      <div className="text-red-500 flex justify-center mb-4">
        <FiAlertTriangle size={48} />
      </div>
      
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Checkout Failed</h1>
      <p className="text-red-600 mb-6">{getErrorDetails()}</p>
      
      <div className="space-y-3">
        <button
          onClick={() => reset()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-center gap-2"
        >
          <FiRefreshCw /> Retry Checkout
        </button>

        <button
          onClick={() => router.push('/cart')}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded flex items-center justify-center gap-2"
        >
          <FiShoppingCart /> Review Cart
        </button>

        <button
          onClick={() => router.push('/')}
          className="w-full text-blue-600 hover:text-blue-800 py-2 flex items-center justify-center gap-2"
        >
          <FiHome /> Return Home
        </button>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded text-left text-sm">
          <h3 className="font-bold mb-2">Debug Information:</h3>
          <pre className="whitespace-pre-wrap">{error.stack || JSON.stringify(error, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
