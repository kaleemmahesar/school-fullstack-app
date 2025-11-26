// Generic validation utility functions

export const validateRequired = (value, fieldName) => {
  if (!value || value.toString().trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateEmail = (email) => {
  if (!email) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return null;
  // Simple phone validation - at least 10 digits
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  if (!phoneRegex.test(phone)) {
    return 'Please enter a valid phone number';
  }
  return null;
};

export const validateDate = (date, fieldName) => {
  if (!date) return null;
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return `Please enter a valid ${fieldName}`;
  }
  return null;
};

// New: Validate date is not in the future
export const validateDateNotInFuture = (date, fieldName) => {
  if (!date) return null;
  const dateObj = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time part for comparison
  
  if (isNaN(dateObj.getTime())) {
    return `Please enter a valid ${fieldName}`;
  }
  
  if (dateObj > today) {
    return `${fieldName} cannot be in the future`;
  }
  return null;
};

// New: Validate date range
export const validateDateRange = (startDate, endDate, startFieldName, endFieldName) => {
  if (!startDate || !endDate) return null;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 'Please enter valid dates';
  }
  
  if (start > end) {
    return `${startFieldName} must be before ${endFieldName}`;
  }
  return null;
};

// New: Validate admission date is not before date of birth
export const validateAdmissionAfterBirth = (dateOfBirth, admissionDate) => {
  if (!dateOfBirth || !admissionDate) return null;
  
  const birth = new Date(dateOfBirth);
  const admission = new Date(admissionDate);
  
  if (isNaN(birth.getTime()) || isNaN(admission.getTime())) {
    return 'Please enter valid dates';
  }
  
  if (admission < birth) {
    return 'Admission date cannot be before date of birth';
  }
  return null;
};

export const validateNumber = (value, fieldName, min = 0, max = null) => {
  if (value === '' || value === undefined || value === null) return null;
  const num = parseFloat(value);
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }
  if (num < min) {
    return `${fieldName} must be at least ${min}`;
  }
  if (max !== null && num > max) {
    return `${fieldName} must be no more than ${max}`;
  }
  return null;
};

export const validateLength = (value, fieldName, minLength, maxLength) => {
  if (!value) return null;
  const length = value.toString().length;
  if (length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  if (maxLength && length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters`;
  }
  return null;
};

// New: Validate CNIC format (Pakistan CNIC: 13 digits)
export const validateCNIC = (cnic, fieldName) => {
  if (!cnic) return null;
  // Remove any spaces or dashes for validation
  const cleanCNIC = cnic.replace(/[\s\-]/g, '');
  const cnicRegex = /^\d{13}$/;
  if (!cnicRegex.test(cleanCNIC)) {
    return `${fieldName} must be a valid 13-digit CNIC number`;
  }
  return null;
};

// New: Validate URL
export const validateURL = (url) => {
  if (!url) return null;
  try {
    new URL(url);
    return null;
  } catch (e) {
    return 'Please enter a valid URL';
  }
  return null;
};

// New: Validate that value matches a pattern
export const validatePattern = (value, pattern, fieldName, errorMessage) => {
  if (!value) return null;
  if (!pattern.test(value)) {
    return errorMessage || `${fieldName} format is invalid`;
  }
  return null;
};

// New: Conditional validation - only validate if condition is met
export const validateConditional = (value, condition, validator, ...validatorArgs) => {
  if (!condition) return null;
  return validator(value, ...validatorArgs);
  return null;
};

// New: Validate that two fields match (e.g., password confirmation)
export const validateMatch = (value1, value2, fieldName1, fieldName2) => {
  if (value1 !== value2) {
    return `${fieldName1} and ${fieldName2} must match`;
  }
  return null;
};

// New: Validate array minimum length
export const validateMinArrayLength = (array, minLength, fieldName) => {
  if (!array || !Array.isArray(array)) {
    return `${fieldName} must be an array`;
  }
  if (array.length < minLength) {
    return `${fieldName} must have at least ${minLength} items`;
  }
  return null;
};

// New: Validate that at least one field is filled
export const validateAtLeastOne = (fields, fieldNames) => {
  const hasValue = fields.some(field => field && field.toString().trim() !== '');
  if (!hasValue) {
    return `At least one of ${fieldNames.join(', ')} is required`;
  }
  return null;
};

// Generic validation function
export const validateField = (value, rules, fieldName) => {
  for (const rule of rules) {
    let error = null;
    
    switch (rule.type) {
      case 'required':
        error = validateRequired(value, fieldName);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      case 'date':
        error = validateDate(value, fieldName);
        break;
      case 'dateNotInFuture':
        error = validateDateNotInFuture(value, fieldName);
        break;
      case 'number':
        error = validateNumber(value, fieldName, rule.min, rule.max);
        break;
      case 'length':
        error = validateLength(value, fieldName, rule.minLength, rule.maxLength);
        break;
      case 'cnic':
        error = validateCNIC(value, fieldName);
        break;
      case 'url':
        error = validateURL(value);
        break;
      case 'pattern':
        error = validatePattern(value, rule.pattern, fieldName, rule.errorMessage);
        break;
      case 'conditional':
        error = validateConditional(value, rule.condition, rule.validator, ...rule.validatorArgs);
        break;
      case 'match':
        error = validateMatch(value, rule.value2, fieldName, rule.fieldName2);
        break;
      case 'minArrayLength':
        error = validateMinArrayLength(value, rule.minLength, fieldName);
        break;
      default:
        break;
    }
    
    if (error) {
      return error;
    }
  }
  
  return null;
};

// Validate entire form
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  for (const [fieldName, rules] of Object.entries(validationRules)) {
    const fieldValue = formData[fieldName];
    const fieldLabel = fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1');
    const error = validateField(fieldValue, rules, fieldLabel);
    
    if (error) {
      errors[fieldName] = error;
    }
  }
  
  // Check cross-field validations
  if (formData.dateOfBirth && formData.dateOfAdmission) {
    const admissionError = validateAdmissionAfterBirth(formData.dateOfBirth, formData.dateOfAdmission);
    if (admissionError) {
      errors.dateOfAdmission = admissionError;
    }
  }
  
  return errors;
};

// Validation rules for admission form
export const admissionFormValidationRules = {
  grNo: [
    { type: 'required' },
    { type: 'length', minLength: 1, maxLength: 20 }
  ],
  firstName: [
    { type: 'required' },
    { type: 'length', minLength: 2, maxLength: 50 }
  ],
  fatherName: [
    { type: 'required' },
    { type: 'length', minLength: 2, maxLength: 50 }
  ],
  religion: [
    { type: 'required' }
  ],
  address: [
    { type: 'required' },
    { type: 'length', minLength: 5, maxLength: 200 }
  ],
  dateOfBirth: [
    { type: 'required' },
    { type: 'date' },
    { type: 'dateNotInFuture' }
  ],
  birthPlace: [
    { type: 'required' },
    { type: 'length', minLength: 2, maxLength: 50 }
  ],
  dateOfAdmission: [
    { type: 'required' },
    { type: 'date' },
    { type: 'dateNotInFuture' }
  ],
  class: [
    { type: 'required' }
  ],
  section: [],
  // Fee fields for traditional schools (validation will be conditional in the component)
  admissionFees: [
    { type: 'number', min: 0 }
  ],
  monthlyFees: [
    { type: 'number', min: 0 }
  ],
  feesPaid: [
    { type: 'number', min: 0 }
  ],
  totalFees: [
    { type: 'number', min: 0 }
  ]
};