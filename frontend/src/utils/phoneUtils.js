// Utility functions for phone number formatting

/**
 * Format Pakistani phone number from 03XXXXXXXXX to 92XXXXXXXXX
 * @param {string} phoneNumber - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPakistaniPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if it's already in international format
  if (cleaned.startsWith('92')) {
    return `+${cleaned}`;
  }
  
  // Check if it's in local format (03XXXXXXXXX)
  if (cleaned.startsWith('03') && cleaned.length === 11) {
    // Replace leading 0 with 92
    return `+92${cleaned.substring(1)}`;
  }
  
  // Check if it's in local format without leading 0 (3XXXXXXXXX)
  if (cleaned.startsWith('3') && cleaned.length === 10) {
    // Add 92 prefix
    return `+92${cleaned}`;
  }
  
  // If none of the above, return as is
  return phoneNumber;
};

/**
 * Validate Pakistani phone number format
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidPakistaniPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return false;
  
  // Remove all non-digit characters and + sign
  const cleaned = phoneNumber.replace(/[^\d]/g, '');
  
  // Check for international format (923XXXXXXXXX) or (3XXXXXXXXX)
  return (
    (cleaned.startsWith('923') && cleaned.length === 12) ||
    (cleaned.startsWith('3') && cleaned.length === 10)
  );
};

/**
 * Format phone number for display
 * @param {string} phoneNumber - Phone number to format
 * @returns {string} Formatted phone number for display
 */
export const formatPhoneNumberForDisplay = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Format international Pakistani numbers for display
  const formatted = formatPakistaniPhoneNumber(phoneNumber);
  
  // If it's a valid Pakistani number, format it nicely
  if (formatted.startsWith('+92')) {
    const digits = formatted.substring(3); // Remove +92
    if (digits.length === 10) {
      return `+92 ${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6)}`;
    }
  }
  
  // Return as is if not a Pakistani number
  return formatted;
};

export default {
  formatPakistaniPhoneNumber,
  isValidPakistaniPhoneNumber,
  formatPhoneNumberForDisplay
};