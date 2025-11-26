import React from 'react';

/**
 * Loading skeleton component for better perceived performance
 * @param {Object} props - Component props
 * @param {string} props.type - Type of skeleton (card, list, table, etc.)
 * @param {number} props.count - Number of skeleton items to render
 * @param {string} props.className - Additional CSS classes
 */
const LoadingSkeleton = ({ type = 'card', count = 1, className = '' }) => {
  // Card skeleton
  const CardSkeleton = () => (
    <div className={`bg-white rounded-lg shadow p-6 animate-pulse ${className}`}>
      <div className="flex items-center">
        <div className="rounded-full bg-gray-200 h-12 w-12"></div>
        <div className="ml-4 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </div>
  );

  // List item skeleton
  const ListSkeleton = () => (
    <div className={`bg-white rounded-lg shadow p-4 animate-pulse ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="ml-3 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  );

  // Table row skeleton
  const TableRowSkeleton = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="rounded-full bg-gray-200 h-8 w-8"></div>
          <div className="ml-4">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-6 bg-gray-200 rounded-full w-24"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </td>
    </tr>
  );

  // Dashboard stat skeleton
  const StatSkeleton = () => (
    <div className={`bg-white rounded-lg shadow p-6 animate-pulse ${className}`}>
      <div className="flex items-center">
        <div className="rounded-full bg-gray-200 h-12 w-12"></div>
        <div className="ml-4 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  );

  // Render skeletons based on type
  const renderSkeletons = () => {
    const skeletons = [];
    
    for (let i = 0; i < count; i++) {
      switch (type) {
        case 'card':
          skeletons.push(<CardSkeleton key={i} />);
          break;
        case 'list':
          skeletons.push(<ListSkeleton key={i} />);
          break;
        case 'table-row':
          skeletons.push(<TableRowSkeleton key={i} />);
          break;
        case 'stat':
          skeletons.push(<StatSkeleton key={i} />);
          break;
        default:
          skeletons.push(<CardSkeleton key={i} />);
      }
    }
    
    return skeletons;
  };

  return <>{renderSkeletons()}</>;
};

export default LoadingSkeleton;