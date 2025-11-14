// frontend/src/config/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Support both Authorization header and x-auth-token for compatibility
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Auto logout if 401 response returned from api
      console.log('Authentication failed, clearing tokens...');
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      
      // Redirect to login page if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export const API_ENDPOINTS = {
  AUTH: {
    SIGNIN: `/api/auth/signin`,
    SIGNUP: `/api/auth/signup`,
    SEND_OTP: `/api/auth/send-otp`,
    VERIFY_OTP: `/api/auth/verify-otp`,
  },
  
  GOOGLE_AUTH: {
    CALLBACK: `/api/google-auth`,
  },
  
  PROBLEMS: {
    GET_ALL: `/api/problems`,
    GET_BY_ID: (id) => `/api/problems/${id}`,
  },
  
  LEADERBOARD: {
    GET: `/api/leaderboard`,
  },

  STATS: {
    USER_STATS: `/api/stats/user-stats`,
    SUBMIT_RATING: `/api/stats/submit-rating`,
    RATING_STATUS: `/api/stats/rating-status`,
    START_TRACKING: `/api/stats/start-tracking`,
    STOP_TRACKING: `/api/stats/stop-tracking`,
    MARK_RATING_SHOWN: `/api/stats/mark-rating-shown`,
    RATING_ELIGIBILITY: `/api/stats/rating-eligibility`,
  },

  // 🔔 NEW: Notification endpoints
  NOTIFICATIONS: {
    BASE: `/api/notifications`,
    UNREAD_COUNT: `/api/notifications/unread-count`,
    MARK_ALL_READ: `/api/notifications/mark-all-read`,
    MARK_AS_READ: (id) => `/api/notifications/${id}/read`,
    CLEAR_ALL: `/api/notifications/clear-all`,
    PREFERENCES: `/api/notifications/preferences`,
  },

  PREDICTION: {
    PREDICT: `/predict`,
  },
  
  HEALTH: `/api/health`,
};

// API methods organized by resource
export const statsAPI = {
  // Public routes
  getUserStats: () => api.get(API_ENDPOINTS.STATS.USER_STATS),
  
  // Protected routes
  submitRating: (data) => api.post(API_ENDPOINTS.STATS.SUBMIT_RATING, data),
  checkRatingStatus: () => api.get(API_ENDPOINTS.STATS.RATING_STATUS),
  startUsageTracking: () => api.post(API_ENDPOINTS.STATS.START_TRACKING, {}),
  stopUsageTracking: () => api.post(API_ENDPOINTS.STATS.STOP_TRACKING, {}),
  markRatingShown: () => api.post(API_ENDPOINTS.STATS.MARK_RATING_SHOWN, {}),
  checkRatingEligibility: () => api.get(API_ENDPOINTS.STATS.RATING_ELIGIBILITY),
};

export const authAPI = {
  login: (credentials) => api.post(API_ENDPOINTS.AUTH.SIGNIN, credentials),
  register: (userData) => api.post(API_ENDPOINTS.AUTH.SIGNUP, userData),
  sendOtp: (email) => api.post(API_ENDPOINTS.AUTH.SEND_OTP, { email }),
  verifyOtp: (data) => api.post(API_ENDPOINTS.AUTH.VERIFY_OTP, data),
  googleAuth: (token) => api.post(API_ENDPOINTS.GOOGLE_AUTH.CALLBACK, { token }),
};

export const problemsAPI = {
  getAll: () => api.get(API_ENDPOINTS.PROBLEMS.GET_ALL),
  getById: (id) => api.get(API_ENDPOINTS.PROBLEMS.GET_BY_ID(id)),
};

export const leaderboardAPI = {
  get: () => api.get(API_ENDPOINTS.LEADERBOARD.GET),
};

// 🔔 NEW: Notifications API
export const notificationsAPI = {
  getAll: (params = {}) => api.get(API_ENDPOINTS.NOTIFICATIONS.BASE, { params }),
  getUnreadCount: () => api.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT),
  markAsRead: (id) => api.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(id)),
  markAllAsRead: () => api.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ),
  delete: (id) => api.delete(API_ENDPOINTS.NOTIFICATIONS.BASE + `/${id}`),
  clearAll: () => api.delete(API_ENDPOINTS.NOTIFICATIONS.CLEAR_ALL),
  getPreferences: () => api.get(API_ENDPOINTS.NOTIFICATIONS.PREFERENCES),
  updatePreferences: (preferences) => api.put(API_ENDPOINTS.NOTIFICATIONS.PREFERENCES, preferences),
};

export const predictionAPI = {
  predict: (data) => api.post(API_ENDPOINTS.PREDICTION.PREDICT, data),
};

// Utility functions
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Legacy functions for backward compatibility
export const getHeaders = (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['x-auth-token'] = token;
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  SOCKET_URL: SOCKET_URL,
  GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID,
  TIMEOUT: 10000,
};

// Export the raw api instance for custom requests
export default api;