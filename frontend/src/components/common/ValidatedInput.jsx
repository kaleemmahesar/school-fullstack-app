import React from 'react';

/**
 * Enhanced form input component with real-time validation feedback
 * @param {Object} props - Component props
 * @param {string} props.name - Field name
 * @param {string} props.label - Field label
 * @param {string} props.type - Input type
 * @param {any} props.value - Field value
 * @param {Function} props.onChange - Change handler
 * @param {Function} props.onBlur - Blur handler
 * @param {string} props.error - Error message
 * @param {boolean} props.touched - Whether field has been touched
 * @param {Object} props.validationRules - Validation rules for the field
 * @param {Object} props.containerClassName - Additional classes for container
 * @param {Object} props.inputClassName - Additional classes for input
 * @param {Object} props.props - Other props to pass to input element
 */
const ValidatedInput = ({
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  touched,
  validationRules,
  containerClassName = '',
  inputClassName = '',
  ...props
}) => {
  const hasError = touched && error;
  
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {validationRules && validationRules.some(rule => rule.type === 'required') && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      )}
      
      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          value={value || ''}
          onChange={(e) => onChange(name, e.target.value)}
          onBlur={() => onBlur(name)}
          className={`block w-full px-3 py-2 border ${
            hasError 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          } rounded-md shadow-sm focus:outline-none focus:ring-2 ${
            inputClassName || ''
          }`}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${name}-error` : undefined}
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
      
      {hasError && (
        <p 
          id={`${name}-error`} 
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default ValidatedInput;