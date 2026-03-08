/**
 * API utilities for Renta-Car frontend
 * Provides helper functions for authenticated API calls
 */

// API base URL from environment or relative path for development
export const API_URL = process.env.REACT_APP_API_URL || '';

/**
 * Get authentication headers with JWT token
 * @returns {Object} Headers object with Authorization if token exists
 */
export function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/api/vehiculos')
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };
  
  const response = await fetch(url, config);
  
  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('usuario');
    // Optionally redirect to login
    // window.location.href = '/login';
  }
  
  return response;
}

/**
 * Make an authenticated GET request
 * @param {string} endpoint - API endpoint
 * @returns {Promise<any>} Parsed JSON response
 */
export async function apiGet(endpoint) {
  const response = await apiRequest(endpoint, { method: 'GET' });
  return response.json();
}

/**
 * Make an authenticated POST request
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body
 * @returns {Promise<any>} Parsed JSON response
 */
export async function apiPost(endpoint, data) {
  const response = await apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Make an authenticated PUT request
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body
 * @returns {Promise<any>} Parsed JSON response
 */
export async function apiPut(endpoint, data) {
  const response = await apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Make an authenticated DELETE request
 * @param {string} endpoint - API endpoint
 * @returns {Promise<any>} Parsed JSON response
 */
export async function apiDelete(endpoint) {
  const response = await apiRequest(endpoint, { method: 'DELETE' });
  return response.json();
}

/**
 * Make an authenticated POST request with FormData (for file uploads)
 * @param {string} endpoint - API endpoint
 * @param {FormData} formData - Form data with files
 * @returns {Promise<any>} Parsed JSON response
 */
export async function apiPostFormData(endpoint, formData) {
  const token = localStorage.getItem('authToken');
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // Note: Don't set Content-Type for FormData, browser sets it with boundary
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });
  
  return response.json();
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if auth token exists
 */
export function isAuthenticated() {
  return !!localStorage.getItem('authToken');
}

/**
 * Logout user - clear auth data
 */
export function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('usuario');
}
