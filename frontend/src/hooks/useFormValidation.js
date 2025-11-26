import { useState, useCallback } from 'react';
import { validateField, validateForm } from '../utils/validation';

/**
 * Custom hook for form validation with real-time feedback
 * @param {Object} initialValues - Initial form values
 * @param {Object} validationRules - Validation rules for the form
 * @returns {Object} Form state and validation functions
 */
export const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues || {});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  /**
   * Handle input change with real-time validation
   * @param {string} name - Field name
   * @param {any} value - Field value
   */
  const handleChange = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate the field if it has validation rules
    if (validationRules[name]) {
      const fieldLabel = name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1');
      const error = validateField(value, validationRules[name], fieldLabel);
      
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [validationRules]);

  /**
   * Handle input blur
   * @param {string} name - Field name
   */
  const handleBlur = useCallback((name) => {
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  }, []);

  /**
   * Validate the entire form
   * @returns {boolean} True if form is valid
   */
  const validate = useCallback(() => {
    const formErrors = validateForm(values, validationRules);
    setErrors(formErrors);
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(values).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    return Object.keys(formErrors).length === 0;
  }, [values, validationRules]);

  /**
   * Reset the form
   */
  const reset = useCallback(() => {
    setValues(initialValues || {});
    setErrors({});
    setTouched({});
  }, [initialValues]);

  /**
   * Set field value without validation
   * @param {string} name - Field name
   * @param {any} value - Field value
   */
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  /**
   * Set multiple field values without validation
   * @param {Object} newValues - Object with field names and values
   */
  const setFieldValues = useCallback((newValues) => {
    setValues(prev => ({
      ...prev,
      ...newValues
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    reset,
    setFieldValue,
    setFieldValues,
    setValues,
    setErrors
  };
};

export default useFormValidation;