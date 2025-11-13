// frontend/src/pages/SignIn.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import * as feather from 'feather-icons';
import { API_ENDPOINTS, API_CONFIG, getHeaders } from '../config/api.js';

const SignIn = () => {
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);

  // Redirect if already logged in
  
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: null, text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    feather.replace();
  }, [message, showPassword, loading]);

  // --- Utility Functions ---

  const showMessage = (type, text) => {
    setMessage({ type, text });
    if (type === 'success') {
      setTimeout(() => setMessage({ type: null, text: '' }), 5000);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // --- Core Authentication Handlers ---

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: null, text: '' });

    const { email, password } = formData;

    if (!email || !password) {
      showMessage('error', 'Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.SIGNIN, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, {
          userId: data.userId,
          name: data.name,
          email: data.email,
          photoUrl: data.photoUrl,
        });

        showMessage('success', 'Sign in successful! Redirecting...');
        setTimeout(() => navigate('/'), 1000);
      } else {
        showMessage('error', data.msg || 'Sign in failed');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCallback = async (response) => {
    setLoading(true);
    setMessage({ type: null, text: '' });

    try {
      const res = await fetch(API_ENDPOINTS.GOOGLE_AUTH.CALLBACK, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify({ idToken: response.credential }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token, {
          userId: data.userId,
          name: data.name,
          email: data.email,
          photoUrl: data.photoUrl,
        });

        showMessage('success', 'Google sign in successful! Redirecting...');
        setTimeout(() => navigate('/'), 1000);
      } else {
        showMessage('error', data.msg || 'Google sign in failed');
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Improved Google Sign-In initialization
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      console.log('Initializing Google Sign-In...');
      
      // Check if required configuration is available
      if (!API_CONFIG.GOOGLE_CLIENT_ID) {
        console.error('Google Client ID is not configured');
        showMessage('error', 'Google Sign-In is not properly configured. Please contact support.');
        return;
      }

      if (window.google && window.google.accounts) {
        try {
          console.log('Google API loaded, initializing...');
          
          window.google.accounts.id.initialize({
            client_id: API_CONFIG.GOOGLE_CLIENT_ID,
            callback: handleGoogleCallback,
            context: 'signin',
            ux_mode: 'popup',
          });
          
          if (googleButtonRef.current) {
            console.log('Rendering Google button...');
            window.google.accounts.id.renderButton(
              googleButtonRef.current,
              {
                type: 'standard',
                theme: 'outline',
                size: 'large',
                text: 'continue_with',
                shape: 'rectangular',
                logo_alignment: 'left',
                width: '300'
              }
            );
            console.log('Google button rendered successfully');
          }
        } catch (error) {
          console.error('Error initializing Google Sign-In:', error);
          showMessage('error', 'Failed to initialize Google Sign-In. Please try again.');
        }
      } else {
        console.error('Google accounts API not available');
      }
    };

    // Load Google Sign-In script if not already loaded
    if (!window.google) {
      console.log('Loading Google Sign-In script...');
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google Sign-In script loaded successfully');
        setGoogleScriptLoaded(true);
        setTimeout(initializeGoogleSignIn, 100); // Small delay to ensure everything is ready
      };
      script.onerror = () => {
        console.error('Failed to load Google Sign-In script');
        showMessage('error', 'Failed to load Google Sign-In. Please check your connection.');
      };
      document.head.appendChild(script);
    } else {
      console.log('Google API already loaded, initializing directly...');
      initializeGoogleSignIn();
    }

    return () => {
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.cancel();
        } catch (error) {
          console.warn('Error cleaning up Google Sign-In:', error);
        }
      }
    };
  }, []);

  // Re-initialize when script loads
  useEffect(() => {
    if (googleScriptLoaded && window.google) {
      const timer = setTimeout(() => {
        initializeGoogleSignIn();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [googleScriptLoaded]);

  const initializeGoogleSignIn = () => {
    if (!API_CONFIG.GOOGLE_CLIENT_ID) {
      console.error('Google Client ID is not configured');
      return;
    }

    if (window.google && window.google.accounts) {
      try {
        window.google.accounts.id.initialize({
          client_id: API_CONFIG.GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
          context: 'signin',
          ux_mode: 'popup',
        });
        
        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(
            googleButtonRef.current,
            {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: 'continue_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: '300'
            }
          );
        }
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
      }
    }
  };

  // --- Component Render ---

  return (
    <div className="min-h-screen dark-gradient-secondary flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* LEFT COLUMN: Informational Content */}
        <div className="hidden lg:block">
            <div className="max-w-md">
                <div className="flex items-center mb-8">
                    <div className="h-12 w-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                        <i data-feather="code" className="text-white text-xl"></i>
                    </div>
                    <span className="ml-3 text-3xl font-bold nav-user-text">CS Studio</span>
                </div>
                
                <h1 className="text-4xl font-extrabold text-white mb-6">
                    Continue Your<br/>
                    <span className="block text-primary-400">Coding Journey</span>
                </h1>
                
                <p className="text-lg text-gray-400 mb-10">
                    Sign in to access your personalized learning path, track progress, and join our community of 15,000+ developers worldwide.
                </p>
                
                <div className="space-y-4">
                    <div className="flex items-center text-gray-300">
                        <div className="h-10 w-10 rounded-full bg-primary-500/10 flex items-center justify-center mr-4">
                            <i data-feather="book-open" className="text-primary-400 w-5 h-5"></i>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Pick Up Where You Left Off</h3>
                            <p className="text-gray-400 text-sm">Access saved progress and course bookmarks.</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center text-gray-300">
                        <div className="h-10 w-10 rounded-full bg-primary-500/10 flex items-center justify-center mr-4">
                            <i data-feather="award" className="text-primary-400 w-5 h-5"></i>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Track Progress & Ranks</h3>
                            <p className="text-gray-400 text-sm">Monitor your skill growth and leaderboard position.</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center text-gray-300">
                        <div className="h-10 w-10 rounded-full bg-primary-500/10 flex items-center justify-center mr-4">
                            <i data-feather="users" className="text-primary-400 w-5 h-5"></i>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Community Support</h3>
                            <p className="text-gray-400 text-sm">Connect with fellow learners and get help.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* RIGHT COLUMN: Sign In Form */}
        <div className="w-full max-w-md mx-auto">
            {/* Mobile Logo Header */}
            <div className="lg:hidden flex justify-center mb-8">
                <Link to="/" className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-md">
                        <i data-feather="code" className="text-white"></i>
                    </div>
                    <span className="ml-2 text-xl font-bold nav-user-text">CS Studio</span>
                </Link>
            </div>
            
            <div className="dark-glass rounded-lg shadow-2xl p-8 border border-gray-700">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white">Sign In</h2>
                    <p className="mt-1 text-gray-400 text-sm">Access your personalized dashboard</p>
                </div>

                {/* Message Display */}
                {message.type && (
                    <div
                        className={`mb-6 p-4 rounded-lg ${
                            message.type === 'success'
                            ? 'bg-green-500/20 border border-green-500 text-green-100'
                            : 'bg-red-500/20 border border-red-500 text-red-100'
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleEmailSignIn} className="space-y-5">
                    {/* Email Field */}
                    <div className="pt-3">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400">
                                <i data-feather="mail" className="w-5 h-5"></i>
                            </span>
                            <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-input w-full pl-10 pr-4 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="Email Address"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="pb-2">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400">
                                <i data-feather="lock" className="w-5 h-5"></i>
                            </span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="form-input w-full pl-10 pr-12 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="Password"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                disabled={loading}
                            >
                                <i
                                    data-feather={showPassword ? 'eye-off' : 'eye'}
                                    className="w-5 h-5"
                                ></i>
                            </button>
                        </div>
                        <div className="mt-3 flex justify-end">
                            <a href="#" className="text-sm text-primary-400 hover:text-primary-300 font-medium transition duration-300">
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <i data-feather="loader" className="w-5 h-5 animate-spin mr-2"></i>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </div>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center">
                    <div className="flex-1 border-t border-gray-700"></div>
                    <span className="px-4 text-gray-400 text-sm">OR</span>
                    <div className="flex-1 border-t border-gray-700"></div>
                </div>

                {/* Google Sign In */}
                <div className="w-full flex justify-center">
                  <div ref={googleButtonRef}></div>
                </div>

                {/* Fallback message if Google Sign-In fails */}
                {!API_CONFIG.GOOGLE_CLIENT_ID && (
                  <div className="text-center mt-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg">
                    <p className="text-yellow-200 text-sm">
                      Google Sign-In is currently unavailable. Please use email sign-in.
                    </p>
                  </div>
                )}

                {/* Sign Up Link */}
                <div className="mt-6 text-center">
                    <p className="text-gray-400">
                    Don't have an account?{' '}
                    <Link
                        to="/signup"
                        className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
                    >
                        Sign Up
                    </Link>
                    </p>
                </div>
            </div>

            {/* Footer */}
            <p className="text-center text-gray-400 text-sm mt-6">
                By signing in, you agree to our{' '}
                <a href="#" className="underline hover:text-gray-300">Terms</a>{' '}
                and{' '}
                <a href="#" className="underline hover:text-gray-300">Privacy Policy</a>
            </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;