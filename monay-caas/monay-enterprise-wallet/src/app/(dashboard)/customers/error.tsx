'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center p-8 bg-red-50 rounded-lg max-w-md">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
        <p className="text-gray-600 mb-6">{error.message || 'An error occurred while loading customers'}</p>
        <button
          onClick={reset}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Try again
        </button>
      </div>
    </div>
  )
}