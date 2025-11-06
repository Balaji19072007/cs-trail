// frontend/src/hooks/useAuth.jsx

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';

// Custom hook to use the authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // This error will trigger if useAuth is called outside of the AuthProvider
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};