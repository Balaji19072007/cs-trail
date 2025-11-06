// frontend/src/config/api.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const API_ENDPOINTS = {
  AUTH: {
    SIGNIN: `${API_BASE_URL}/api/auth/signin`,
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
    SEND_OTP: `${API_BASE_URL}/api/auth/send-otp`,
    VERIFY_OTP: `${API_BASE_URL}/api/auth/verify-otp`,
  },
  
  GOOGLE_AUTH: {
    CALLBACK: `${API_BASE_URL}/api/google-auth`,
  },
  
  PROBLEMS: {
    GET_ALL: `${API_BASE_URL}/api/problems`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/problems/${id}`,
  },
  
  LEADERBOARD: {
    GET: `${API_BASE_URL}/api/leaderboard`,
  },

  // ADD THIS: Prediction endpoint
  PREDICTION: {
    PREDICT: `${API_BASE_URL}/predict`,
  },
  
  HEALTH: `${API_BASE_URL}/api/health`,
};

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  SOCKET_URL: SOCKET_URL,
  GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID,
  TIMEOUT: 10000,
};

export const getHeaders = (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['x-auth-token'] = token;
    }
  }

  return headers;
};

export default API_CONFIG;