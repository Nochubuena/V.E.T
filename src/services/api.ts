import axios from 'axios';

// Get API URL from environment variable or use defaults
// Set REACT_APP_API_URL in your .env file or Vercel environment variables
// For local development: http://localhost:3000/api
// For production: Your deployed backend URL
const getApiBaseUrl = (): string => {
  // Check for environment variable first (for Vercel/production)
  if (typeof window !== 'undefined' && (window as any).__ENV__?.REACT_APP_API_URL) {
    return (window as any).__ENV__.REACT_APP_API_URL;
  }
  
  // Check for process.env (if available in build)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Fallback: detect based on hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Production domain
    if (hostname.includes('vercel.app') || hostname.includes('v-e-t')) {
      // Set your production backend URL via REACT_APP_API_URL environment variable
      // Or update this line with your actual backend URL
      return process.env.REACT_APP_API_URL || 'https://v-e-t-1.onrender.com/api';
    }
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000/api';
    }
  }
  
  // Default for __DEV__ (React Native)
  if (__DEV__) {
    return 'http://localhost:3000/api';
  }
  
  // Final fallback - set via REACT_APP_API_URL environment variable
  return process.env.REACT_APP_API_URL || 'https://v-e-t-1.onrender.com/api';
};

const API_BASE_URL = getApiBaseUrl();

// Log the API URL being used (helpful for debugging)
if (typeof window !== 'undefined') {
  console.log('🌐 API Base URL:', API_BASE_URL);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout to prevent hanging requests
});

// Helper function to get token from storage
export const getStoredToken = (): string | null => {
  // Use AsyncStorage in React Native or localStorage in web
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Helper function to save token
export const saveToken = (token: string): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('authToken', token);
  }
};

// Helper function to remove token
export const removeToken = (): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('authToken');
  }
};

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle authentication errors and network issues
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors (no response from server)
    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.error('⏱️ Request timeout - API took too long to respond');
        error.message = 'Request timed out. Please check your connection and try again.';
      } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        console.error('🌐 Network error - Unable to reach the API');
        error.message = 'Network error. Please check your connection and ensure the API is accessible.';
      } else {
        console.error('❌ Request error:', error.message);
        error.message = 'Unable to connect to the server. Please try again later.';
      }
    }
    
    // Handle HTTP status errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      removeToken();
      console.error('🔒 Authentication failed - Token invalid or expired');
    }
    
    return Promise.reject(error);
  }
);

export default api;

