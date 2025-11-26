import React from 'react';

/**
 * Accessible form component with proper labels and ARIA attributes
 * @param {Object} props - Component props
 * @param {string} props.id - Form ID
 * @param {string} props.title - Form title
 * @param {Object} props.children - Form content
 * @param {Function} props.onSubmit - Form submit handler
 * @param {string} props.className - Additional CSS classes
 */
const AccessibleForm = ({ id, title, children, onSubmit, className = '' }) => {
  return (
    <form 
      id={id}
      onSubmit={onSubmit}
      className={className}
      aria-labelledby={title ? `${id}-title` : undefined}
    >
      {title && (
        <h2 id={`${id}-title`} className="sr-only">
          {title}
        </h2>
      )}
      {children}
    </form>
  );
};

/**
 * Accessible form field component
 * @param {Object} props - Component props
 * @param {string} props.id - Field ID
 * @param {string} props.label - Field label
 * @param {string} props.type - Field type
 * @param {any} props.value - Field value
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.required - Whether field is required
 * @param {string} props.error - Error message
 * @param {string} props.helpText - Help text
 * @param {Object} props.props - Other props to pass to input
 */
const AccessibleField = ({ 
  id, 
  label, 
  type = 'text', 
  value, 
  onChange, 
  required = false, 
  error, 
  helpText,
  ...props 
}) => {
  const hasError = !!error;
  const describedByIds = [];
  
  if (helpText) describedByIds.push(`${id}-help`);
  if (hasError) describedByIds.push(`${id}-error`);
  
  const describedBy = describedByIds.length > 0 ? describedByIds.join(' ') : undefined;

  return (
    <div className="mb-4">
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">*</span>
        )}
      </label>
      
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          aria-required={required}
          aria-invalid={hasError}
          aria-describedby={describedBy}
          className={`block w-full px-3 py-2 border ${
            hasError 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          } rounded-md shadow-sm focus:outline-none focus:ring-2`}
          {...props}
        />
        
        {hasError && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      {helpText && (
        <p id={`${id}-help`} className="mt-1 text-sm text-gray-500">
          {helpText}
        </p>
      )}
      
      {hasError && (
        <p 
          id={`${id}-error`} 
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * Accessible select field component
 * @param {Object} props - Component props
 * @param {string} props.id - Field ID
 * @param {string} props.label - Field label
 * @param {any} props.value - Field value
 * @param {Function} props.onChange - Change handler
 * @param {Array} props.options - Select options
 * @param {boolean} props.required - Whether field is required
 * @param {string} props.error - Error message
 * @param {string} props.helpText - Help text
 * @param {Object} props.props - Other props to pass to select
 */
const AccessibleSelect = ({ 
  id, 
  label, 
  value, 
  onChange, 
  options = [], 
  required = false, 
  error, 
  helpText,
  ...props 
}) => {
  const hasError = !!error;
  const describedByIds = [];
  
  if (helpText) describedByIds.push(`${id}-help`);
  if (hasError) describedByIds.push(`${id}-error`);
  
  const describedBy = describedByIds.length > 0 ? describedByIds.join(' ') : undefined;

  return (
    <div className="mb-4">
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">*</span>
        )}
      </label>
      
      <div className="relative">
        <select
          id={id}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          aria-required={required}
          aria-invalid={hasError}
          aria-describedby={describedBy}
          className={`block w-full px-3 py-2 border ${
            hasError 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          } rounded-md shadow-sm focus:outline-none focus:ring-2`}
          {...props}
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {hasError && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      {helpText && (
        <p id={`${id}-help`} className="mt-1 text-sm text-gray-500">
          {helpText}
        </p>
      )}
      
      {hasError && (
        <p 
          id={`${id}-error`} 
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export { AccessibleForm, AccessibleField, AccessibleSelect };