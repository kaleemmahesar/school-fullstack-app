/**
 * Centralized date utility functions for consistent date handling across the application
 */

/**
 * Format a date to a localized string
 * @param {Date|string|null} date - The date to format
 * @param {string} locale - The locale to use for formatting (default: 'en-US')
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, locale = 'en-US', options = {}) => {
  if (!date) return '';
  
  // If it's already a string, return as is
  if (typeof date === 'string') {
    return date;
  }
  
  // If it's a Date object, format it
  if (date instanceof Date) {
    // Default options
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    // Merge with provided options
    const formatOptions = { ...defaultOptions, ...options };
    
    try {
      return date.toLocaleDateString(locale, formatOptions);
    } catch (error) {
      console.error('Error formatting date:', error);
      return date.toString();
    }
  }
  
  // If it's a timestamp or other format, try to convert to Date
  const dateObj = new Date(date);
  if (!isNaN(dateObj.getTime())) {
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    const formatOptions = { ...defaultOptions, ...options };
    return dateObj.toLocaleDateString(locale, formatOptions);
  }
  
  return '';
};

/**
 * Format a date to YYYY-MM-DD format (ISO date string)
 * @param {Date|string|null} date - The date to format
 * @returns {string} Formatted date string in YYYY-MM-DD format
 */
export const formatISODate = (date) => {
  if (!date) return '';
  
  let dateObj;
  
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    dateObj = new Date(date);
  }
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Check if a date is in the future
 * @param {Date|string} date - The date to check
 * @returns {boolean} True if date is in the future, false otherwise
 */
export const isFutureDate = (date) => {
  if (!date) return false;
  
  const dateObj = new Date(date);
  const today = new Date();
  
  if (isNaN(dateObj.getTime())) {
    return false;
  }
  
  // Reset time part for comparison
  today.setHours(0, 0, 0, 0);
  dateObj.setHours(0, 0, 0, 0);
  
  return dateObj > today;
};

/**
 * Check if a date is valid
 * @param {Date|string} date - The date to validate
 * @returns {boolean} True if date is valid, false otherwise
 */
export const isValidDate = (date) => {
  if (!date) return false;
  
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

/**
 * Get the difference between two dates in days
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {number} Difference in days
 */
export const getDateDifferenceInDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 0;
  }
  
  // Reset time part for day comparison
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Add days to a date
 * @param {Date|string} date - The date to add days to
 * @param {number} days - Number of days to add
 * @returns {Date} New date with days added
 */
export const addDays = (date, days) => {
  if (!date) return new Date();
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return new Date();
  }
  
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj;
};

/**
 * Get the start of the month for a given date
 * @param {Date|string} date - The date
 * @returns {Date} Start of the month
 */
export const getStartOfMonth = (date) => {
  if (!date) return new Date();
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return new Date();
  }
  
  return new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
};

/**
 * Get the end of the month for a given date
 * @param {Date|string} date - The date
 * @returns {Date} End of the month
 */
export const getEndOfMonth = (date) => {
  if (!date) return new Date();
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return new Date();
  }
  
  return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);
};

/**
 * Format date range
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @param {string} locale - The locale to use for formatting
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate, locale = 'en-US') => {
  if (!startDate || !endDate) return '';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return '';
  }
  
  // If same day
  if (start.toDateString() === end.toDateString()) {
    return formatDate(start, locale);
  }
  
  // If same month and year
  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    return `${start.getDate()}-${formatDate(end, locale)}`;
  }
  
  // If same year
  if (start.getFullYear() === end.getFullYear()) {
    return `${formatDate(start, locale, { month: 'short', day: 'numeric' })} - ${formatDate(end, locale)}`;
  }
  
  // Different years
  return `${formatDate(start, locale)} - ${formatDate(end, locale)}`;
};

// Get current academic year in format YYYY-YYYY
export const getCurrentAcademicYear = () => {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  return `${currentYear}-${nextYear}`;
};

export default {
  formatDate,
  formatISODate,
  isFutureDate,
  isValidDate,
  getDateDifferenceInDays,
  addDays,
  getStartOfMonth,
  getEndOfMonth,
  formatDateRange,
  getCurrentAcademicYear
};