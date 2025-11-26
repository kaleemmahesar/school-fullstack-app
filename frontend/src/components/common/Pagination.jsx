import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  itemsPerPage, 
  totalItems, 
  paginate, 
  onPageChange,
  nextPage, 
  prevPage,
  showItemsInfo = true
}) => {
  // Support both paginate and onPageChange for backward compatibility
  const handlePageChange = paginate || onPageChange;
  // Don't show pagination if there's only one page
  if (totalPages <= 1) return null;

  // Calculate the range of items being displayed
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage + 1;
  const endItem = Math.min(indexOfLastItem, totalItems);
  const startItem = Math.min(indexOfFirstItem, endItem);

  return (
    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
      {showItemsInfo && (
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => typeof prevPage === 'function' ? prevPage() : typeof handlePageChange === 'function' ? handlePageChange(currentPage - 1) : console.error('prevPage and handlePageChange are not functions')}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => typeof nextPage === 'function' ? nextPage() : typeof handlePageChange === 'function' ? handlePageChange(currentPage + 1) : console.error('nextPage and handlePageChange are not functions')}
            disabled={currentPage === totalPages}
            className={`relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
      )}
      
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        {showItemsInfo && (
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{startItem}</span> to{' '}
              <span className="font-medium">{endItem}</span>{' '}
              of <span className="font-medium">{totalItems}</span> results
            </p>
          </div>
        )}
        
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => typeof prevPage === 'function' ? prevPage() : typeof handlePageChange === 'function' ? handlePageChange(currentPage - 1) : console.error('prevPage and handlePageChange are not functions')}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                currentPage === 1 ? 'cursor-not-allowed' : ''
              }`}
            >
              <span className="sr-only">Previous</span>
              <FaChevronLeft className="h-5 w-5" />
            </button>
            
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              // Only show first, last, current, and nearby pages
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => typeof handlePageChange === 'function' ? handlePageChange(pageNumber) : console.error('handlePageChange is not a function')}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      currentPage === pageNumber
                        ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              } else if (
                pageNumber === currentPage - 2 ||
                pageNumber === currentPage + 2
              ) {
                return (
                  <span
                    key={pageNumber}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                  >
                    ...
                  </span>
                );
              }
              return null;
            })}
            
            <button
              onClick={() => typeof nextPage === 'function' ? nextPage() : typeof handlePageChange === 'function' ? handlePageChange(currentPage + 1) : console.error('nextPage and handlePageChange are not functions')}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                currentPage === totalPages ? 'cursor-not-allowed' : ''
              }`}
            >
              <span className="sr-only">Next</span>
              <FaChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;