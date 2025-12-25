/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

// Use our new PHP backend
// For local development
// export const API_BASE_URL = 'http://localhost/school-app/backend/api.php?endpoint=';
// export const API_BASE_URL_PHOTO = 'http://localhost/school-app/backend/api.php?endpoint=photos';

// For production deployment to subdirectory
export const API_BASE_URL = '/dawn-school/backend/api.php?endpoint=';
export const API_BASE_URL_PHOTO = '/dawn-school/backend/api.php?endpoint=photos';

/**
 * Helper function to construct full API URLs
 * @param {string} endpoint - The API endpoint path
 * @returns {string} Full URL with base and endpoint
 */
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

export default {
  API_BASE_URL,
  getApiUrl
};