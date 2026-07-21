// frontend/src/components/ErrorBoundary.jsx
import { Component } from 'react';
 
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
 
  static getDerivedStateFromError() {
    return { hasError: true };
  }
 
  componentDidCatch(error, info) {
    // Log for debugging; swap for a real error-reporting service later if needed.
    console.error('Admin panel render error:', error, info);
  }
 
  componentDidUpdate(prevProps) {
    // If the route changed after an error, try re-rendering the children again
    // instead of staying stuck on the fallback screen.
    if (this.state.hasError && prevProps.locationKey !== this.props.locationKey) {
      this.setState({ hasError: false });
    }
  }
 
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-500 mb-4">
              This page hit an unexpected error. Try again, or reload the page.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition mr-2"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
 
export default ErrorBoundary;