import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-secondary text-center px-6">
      
      {/* Big number */}
      <h1 className="text-7xl font-bold text-pink-500">
        404
      </h1>

      {/* Message */}
      <h2 className="mt-4 text-2xl font-semibold text-gray-800">
        Page Not Found
      </h2>

      <p className="mt-2 text-gray-500 max-w-md">
        The page you are looking for doesn’t exist or has been moved.
      </p>

      {/* Button */}
      <Link
        to="/"
        className="mt-6 px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
      >
        Go Back Home
      </Link>
    </div>
  )
}