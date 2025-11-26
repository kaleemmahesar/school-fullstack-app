import React from 'react';

/**
 * Loading overlay component for better perceived performance
 * @param {Object} props - Component props
 * @param {boolean} props.isLoading - Whether to show the loading overlay
 * @param {string} props.message - Loading message to display
 * @param {boolean} props.fullScreen - Whether to cover the full screen
 * @param {string} props.className - Additional CSS classes
 */
const LoadingOverlay = ({ 
  isLoading = false, 
  message = 'Loading...', 
  fullScreen = false,
  className = '' 
}) => {
  if (!isLoading) return null;

  const overlayClasses = `
    fixed inset-0 flex items-center justify-center z-50
    bg-black bg-opacity-50 backdrop-blur-sm
    ${fullScreen ? '' : 'absolute inset-0'}
    ${className}
  `;

  return (
    <div className={overlayClasses}>
      <div className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-700 text-center">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;