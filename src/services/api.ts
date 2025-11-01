import axios from 'axios';

// Get API URL from environment variable or use defaults
// Set REACT_APP_API_URL in your .env file or Vercel environment variables
// For local development: http://localhost:3000/api
// For production: Your deployed backend URL (e.g., https://your-backend.onrender.com/api)
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
      // Backend deployed on Render
      return 'https://v-e-t.onrender.com/api';
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
  
  // Final fallback - production backend on Render
  return 'https://v-e-t.onrender.com/api';
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
});

// Helper function to get token from storage
const getStoredToken = (): string | null => {
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

// Handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      removeToken();
      // You might want to redirect to login here
    }
    return Promise.reject(error);
  }
);

export default api;

