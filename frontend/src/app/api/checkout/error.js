'use client'

export default function Error({ error, reset }) {
  return (
    <div className="text-center py-10">
      <h2 className="text-2xl font-bold text-red-600">Checkout Error</h2>
      <p className="my-4">{error.message}</p>
      <button
        onClick={() => reset()}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Try again
      </button>
    </div>
  )
}