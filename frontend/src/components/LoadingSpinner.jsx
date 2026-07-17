// frontend/src/components/LoadingSpinner.jsx
const LoadingSpinner = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" />
      <p className="text-gray-500 mt-4 text-sm">Loading...</p>
    </div>
  </div>
);

export default LoadingSpinner;