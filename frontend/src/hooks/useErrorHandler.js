import { useState, useCallback } from 'react';

/**
 * Custom hook for handling errors with user-friendly messages
 * @returns {Object} Error handling functions and state
 */
export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [isErrorVisible, setIsErrorVisible] = useState(false);

  /**
   * Handle an error with a user-friendly message
   * @param {Error|string} error - The error object or message
   * @param {string} userMessage - User-friendly message to display
   */
  const handleError = useCallback((error, userMessage = 'An unexpected error occurred. Please try again.') => {
    console.error('Error caught:', error);
    
    // Set error state
    setError({
      message: userMessage,
      originalError: error,
      timestamp: new Date().toISOString()
    });
    
    // Show error to user
    setIsErrorVisible(true);
    
    // Hide error after 5 seconds
    setTimeout(() => {
      setIsErrorVisible(false);
    }, 5000);
  }, []);

  /**
   * Clear the current error
   */
  const clearError = useCallback(() => {
    setError(null);
    setIsErrorVisible(false);
  }, []);

  /**
   * Render error message component
   * @param {Function} onDismiss - Callback when error is dismissed
   */
  const renderError = useCallback((onDismiss) => {
    if (!isErrorVisible || !error) return null;

    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-lg max-w-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error.message}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => {
                    clearError();
                    if (onDismiss) onDismiss();
                  }}
                  className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }, [error, isErrorVisible, clearError]);

  return {
    error,
    isErrorVisible,
    handleError,
    clearError,
    renderError
  };
};

export default useErrorHandler;