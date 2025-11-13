// frontend/src/pages/SignUp.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import * as feather from 'feather-icons';
import { API_ENDPOINTS, API_CONFIG, getHeaders } from '../config/api.js';

const SignUp = () => {
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

  // Form State - Step 1
  const [registrationData, setRegistrationData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsChecked, setTermsChecked] = useState(false);

  // OTP State - Step 2
  const [step, setStep] = useState(1); // 1 = Registration, 2 = OTP Verification
  const [otpCode, setOtpCode] = useState(new Array(6).fill(''));
  const [otpSent, setOtpSent] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // UI State
  const [message, setMessage] = useState({ type: null, text: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Timer for OTP expiry
  useEffect(() => {
    let timer;
    if (otpExpiry && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpExpiry, timeLeft]);

  // Reset step when component mounts or when going back
  useEffect(() => {
    // Always start at step 1 when component loads
    setStep(1);
    setOtpSent(false);
  }, []);

  useEffect(() => {
    feather.replace();
  }, [message, showPassword, loading, step, timeLeft]);

  // --- Utility Functions ---

  const showMessage = (type, text) => {
    setMessage({ type, text });
    if (type === 'success') {
      setTimeout(() => setMessage({ type: null, text: '' }), 5000);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleChange = (e) => {
    setRegistrationData({ ...registrationData, [e.target.id]: e.target.value });
  };

  // --- Step 1: Registration Form Submission (Sends OTP) ---

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: null, text: '' });

    const { firstName, lastName, email, password } = registrationData;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      showMessage('error', 'Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      showMessage('error', 'Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      showMessage('error', 'Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    if (!termsChecked) {
      showMessage('error', 'Please accept the Terms and Conditions');
      setLoading(false);
      return;
    }

    try {
      const otpResponse = await fetch(API_ENDPOINTS.AUTH.SEND_OTP, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify({ 
          email,
          firstName,
          lastName 
        }),
      });

      const otpData = await otpResponse.json();

      if (otpResponse.ok) {
        showMessage('success', `OTP sent to your email! It will expire in 2 minutes.`);
        setOtpSent(true);
        setStep(2); // Only move to step 2 when OTP is successfully sent
        // Set OTP expiry timer (2 minutes)
        setOtpExpiry(Date.now() + 2 * 60 * 1000);
        setTimeLeft(2 * 60); // 2 minutes in seconds
        setCanResend(false);
        
        // For development: show OTP in console
        if (otpData.debugOtp) {
          console.log('Development OTP:', otpData.debugOtp);
        }
      } else {
        showMessage('error', otpData.msg || 'Failed to send OTP');
        // Stay on step 1 if OTP sending fails
        setStep(1);
        setOtpSent(false);
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      showMessage('error', 'Network error. Please try again.');
      setStep(1);
      setOtpSent(false);
    } finally {
      setLoading(false);
    }
  };

  // --- Step 2: OTP Verification & Final Sign Up ---

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = element.value;
    setOtpCode(newOtp);

    if (element.value && element.nextSibling) {
      element.nextSibling.focus();
    }

    // Auto-submit when all OTP digits are filled
    if (element.value && index === 5) {
      const allFilled = newOtp.every(digit => digit !== '');
      if (allFilled) {
        document.getElementById('verify-otp-btn')?.click();
      }
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: null, text: '' });

    const otp = otpCode.join('');

    if (otp.length !== 6) {
      showMessage('error', 'Please enter the complete 6-digit OTP');
      setLoading(false);
      return;
    }

    // Check if OTP expired client-side
    if (timeLeft <= 0) {
      showMessage('error', 'OTP has expired. Please request a new one.');
      setLoading(false);
      return;
    }

    try {
      // Combine OTP with registration data and send to signup endpoint
      const signupResponse = await fetch(API_ENDPOINTS.AUTH.SIGNUP, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify({
          ...registrationData,
          otp: otp
        }),
      });

      const signupData = await signupResponse.json();

      if (signupResponse.ok) {
        // Successful Sign Up: Log user in and update global state
        login(signupData.token, {
          userId: signupData.userId,
          name: signupData.name,
          email: signupData.email,
          photoUrl: signupData.photoUrl,
        });

        showMessage('success', 'Account created successfully! Redirecting...');
        setTimeout(() => navigate('/'), 1500);
      } else {
        showMessage('error', signupData.msg || 'Failed to create account');
        // Clear OTP on failure but stay on OTP step
        setOtpCode(new Array(6).fill(''));
      }
    } catch (error) {
      console.error('OTP verification/Sign Up error:', error);
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP functionality
  const handleResendOTP = async () => {
    setLoading(true);
    setMessage({ type: null, text: '' });

    try {
      const { firstName, lastName, email } = registrationData;
      const otpResponse = await fetch(API_ENDPOINTS.AUTH.SEND_OTP, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify({ 
          email,
          firstName,
          lastName 
        }),
      });

      const otpData = await otpResponse.json();

      if (otpResponse.ok) {
        showMessage('success', 'New OTP sent to your email!');
        // Reset OTP fields and timer
        setOtpCode(new Array(6).fill(''));
        setOtpExpiry(Date.now() + 2 * 60 * 1000);
        setTimeLeft(2 * 60);
        setCanResend(false);
        
        // For development: show OTP in console
        if (otpData.debugOtp) {
          console.log('New Development OTP:', otpData.debugOtp);
        }
      } else {
        showMessage('error', otpData.msg || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle back to registration - COMPLETELY RESET STATE
  const handleBackToRegistration = () => {
    console.log('Going back to registration - resetting all states');
    // Reset ALL OTP-related states completely
    setStep(1);
    setOtpCode(new Array(6).fill(''));
    setTimeLeft(0);
    setCanResend(false);
    setOtpExpiry(null);
    setOtpSent(false);
    setMessage({ type: null, text: '' });
    setLoading(false);
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

        showMessage('success', 'Google sign up successful! Redirecting...');
        setTimeout(() => navigate('/'), 1000);
      } else {
        showMessage('error', data.msg || 'Google sign up failed');
      }
    } catch (error) {
      console.error('Google sign up error:', error);
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Improved Google Sign-Up initialization
  useEffect(() => {
    const initializeGoogleSignUp = () => {
      console.log('Initializing Google Sign-Up...');
      
      // Check if required configuration is available
      if (!API_CONFIG.GOOGLE_CLIENT_ID) {
        console.error('Google Client ID is not configured');
        showMessage('error', 'Google Sign-Up is not properly configured. Please contact support.');
        return;
      }

      if (window.google && window.google.accounts) {
        try {
          console.log('Google API loaded, initializing...');
          
          window.google.accounts.id.initialize({
            client_id: API_CONFIG.GOOGLE_CLIENT_ID,
            callback: handleGoogleCallback,
            context: 'signup',
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
                text: 'signup_with',
                shape: 'rectangular',
                logo_alignment: 'left',
                width: '300'
              }
            );
            console.log('Google button rendered successfully');
          }
        } catch (error) {
          console.error('Error initializing Google Sign-Up:', error);
          showMessage('error', 'Failed to initialize Google Sign-Up. Please try again.');
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
        setTimeout(initializeGoogleSignUp, 100); // Small delay to ensure everything is ready
      };
      script.onerror = () => {
        console.error('Failed to load Google Sign-In script');
        showMessage('error', 'Failed to load Google Sign-In. Please check your connection.');
      };
      document.head.appendChild(script);
    } else {
      console.log('Google API already loaded, initializing directly...');
      initializeGoogleSignUp();
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
        initializeGoogleSignUp();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [googleScriptLoaded]);

  const initializeGoogleSignUp = () => {
    if (!API_CONFIG.GOOGLE_CLIENT_ID) {
      console.error('Google Client ID is not configured');
      return;
    }

    if (window.google && window.google.accounts) {
      try {
        window.google.accounts.id.initialize({
          client_id: API_CONFIG.GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
          context: 'signup',
          ux_mode: 'popup',
        });
        
        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(
            googleButtonRef.current,
            {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: 'signup_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: '300'
            }
          );
        }
      } catch (error) {
        console.error('Error initializing Google Sign-Up:', error);
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
                    Start Your<br/>
                    <span className="block text-primary-400">Coding Journey</span>
                </h1>
                
                <p className="text-lg text-gray-400 mb-8">
                    Join 15,000+ developers mastering computer science with interactive lessons, real-world projects, and personalized learning paths.
                </p>
                
                <div className="space-y-4">
                    <div className="flex items-center text-gray-300">
                        <div className="h-10 w-10 rounded-full bg-primary-500/10 flex items-center justify-center mr-4">
                            <i data-feather="play-circle" className="text-primary-400 w-5 h-5"></i>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Interactive Learning</h3>
                            <p className="text-gray-400 text-sm">Learn with animations and visualizations</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center text-gray-300">
                        <div className="h-10 w-10 rounded-full bg-primary-500/10 flex items-center justify-center mr-4">
                            <i data-feather="target" className="text-primary-400 w-5 h-5"></i>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Personalized Path</h3>
                            <p className="text-gray-400 text-sm">Follow career-focused roadmaps</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center text-gray-300">
                        <div className="h-10 w-10 rounded-full bg-primary-500/10 flex items-center justify-center mr-4">
                            <i data-feather="briefcase" className="text-primary-400 w-5 h-5"></i>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Career Ready</h3>
                            <p className="text-gray-400 text-sm">Build job-ready skills and confidence</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* RIGHT COLUMN: Sign Up Form */}
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
                    <h2 className="text-2xl font-bold text-white">
                        {step === 1 ? 'Create Account' : 'Verify Email'}
                    </h2>
                    <p className="mt-1 text-gray-400 text-sm">
                        {step === 1 ? 'Start your coding journey in minutes' : 'Enter the OTP sent to your email'}
                    </p>
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

                {step === 1 ? (
                    /* Step 1: Registration Form */
                    <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                        {/* First Name & Last Name (Grouped) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="mb-0">
                                <label htmlFor="firstName" className="sr-only">First Name</label>
                                <input
                                type="text"
                                id="firstName"
                                value={registrationData.firstName}
                                onChange={handleChange}
                                className="form-input w-full px-4 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="First Name" 
                                disabled={loading}
                                />
                            </div>
                            <div className="mb-0">
                                <label htmlFor="lastName" className="sr-only">Last Name</label>
                                <input
                                type="text"
                                id="lastName"
                                value={registrationData.lastName}
                                onChange={handleChange}
                                className="form-input w-full px-4 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="Last Name"
                                disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="mb-4">
                            <label htmlFor="email" className="sr-only">Email Address</label>
                            <input
                            type="email"
                            id="email"
                            value={registrationData.email}
                            onChange={handleChange}
                            className="form-input w-full px-4 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            placeholder="Email Address"
                            disabled={loading}
                            />
                        </div>

                        {/* Password */}
                        <div className="mb-4">
                            <label htmlFor="password" className="sr-only">Password</label>
                            <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={registrationData.password}
                                onChange={handleChange}
                                className="form-input w-full px-4 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
                        </div>

                        {/* Confirm Password */}
                        <div className="mb-4">
                            <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                            <input
                            type={showPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="form-input w-full px-4 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            placeholder="Confirm Password"
                            disabled={loading}
                            />
                        </div>

                        {/* Terms Checkbox */}
                        <div className="mb-6 pt-2">
                            <label className="flex items-start cursor-pointer">
                            <input
                                type="checkbox"
                                checked={termsChecked}
                                onChange={(e) => setTermsChecked(e.target.checked)}
                                className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-700/50 text-primary-500 focus:ring-2 focus:ring-primary-500"
                                disabled={loading}
                            />
                            <span className="ml-2 text-sm text-gray-400">
                                I agree to the{' '}
                                <a href="#" className="text-primary-400 hover:text-primary-300 underline">
                                Terms and Conditions
                                </a>{' '}
                                and{' '}
                                <a href="#" className="text-primary-400 hover:text-primary-300 underline">
                                Privacy Policy
                                </a>
                            </span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                            <span className="flex items-center justify-center">
                                <i data-feather="loader" className="w-5 h-5 animate-spin mr-2"></i>
                                Sending OTP...
                            </span>
                            ) : (
                            'Send OTP'
                            )}
                        </button>
                    </form>
                ) : (
                    /* Step 2: OTP Verification */
                    <form onSubmit={handleOtpSubmit} className="space-y-6">
                        <p className="text-gray-400 text-center mb-2">
                            We sent a 6-digit code to <strong className="text-white">{registrationData.email}</strong>
                        </p>

                        {/* Timer Display */}
                        <div className="text-center mb-4">
                            <div className={`text-sm font-medium ${timeLeft > 30 ? 'text-green-400' : 'text-red-400'}`}>
                                ⏰ OTP expires in: {formatTime(timeLeft)}
                            </div>
                            {timeLeft === 0 && (
                                <div className="text-red-400 text-sm mt-1">
                                    OTP has expired. Please request a new one.
                                </div>
                            )}
                        </div>

                        {/* OTP Input (Center Aligned) */}
                        <div className="flex justify-center space-x-2 mb-4">
                            {otpCode.map((digit, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleOtpChange(e.target, index)}
                                onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                onFocus={(e) => e.target.select()}
                                className="form-input w-12 h-14 text-center text-2xl font-bold rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                disabled={loading || timeLeft === 0}
                            />
                            ))}
                        </div>

                        {/* Resend OTP Link */}
                        <div className="text-center mb-4">
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={loading || !canResend}
                                className="text-primary-400 hover:text-primary-300 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Didn't receive code? Resend OTP
                            </button>
                        </div>

                        {/* Verify Button */}
                        <button
                            id="verify-otp-btn"
                            type="submit"
                            disabled={loading || timeLeft === 0}
                            className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                            <span className="flex items-center justify-center">
                                <i data-feather="loader" className="w-5 h-5 animate-spin mr-2"></i>
                                Verifying...
                            </span>
                            ) : (
                            'Verify & Create Account'
                            )}
                        </button>

                        {/* Back Button - FIXED: Uses the proper reset function */}
                        <button
                            type="button"
                            onClick={handleBackToRegistration}
                            className="w-full mt-4 py-2 text-primary-400 hover:text-white transition-colors"
                            disabled={loading}
                        >
                            ← Back to Registration
                        </button>
                    </form>
                )}

                {step === 1 && (
                    <>
                    {/* Divider */}
                    <div className="my-6 flex items-center">
                        <div className="flex-1 border-t border-gray-700"></div>
                        <span className="px-4 text-gray-400 text-sm">OR</span>
                        <div className="flex-1 border-t border-gray-700"></div>
                    </div>

                    {/* Google Sign Up */}
                    <div className="w-full flex justify-center">
                      <div ref={googleButtonRef}></div>
                    </div>

                    {/* Fallback message if Google Sign-In fails */}
                    {!API_CONFIG.GOOGLE_CLIENT_ID && (
                      <div className="text-center mt-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg">
                        <p className="text-yellow-200 text-sm">
                          Google Sign-Up is currently unavailable. Please use email sign-up.
                        </p>
                      </div>
                    )}

                    {/* Sign In Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                        Already have an account?{' '}
                        <Link
                            to="/signin"
                            className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
                        >
                            Sign In
                        </Link>
                        </p>
                    </div>
                    </>
                )}
            </div>
            {/* Footer Text */}
            <p className="text-center text-gray-400 text-sm mt-6">
                By signing up, you agree to our{' '}
                <a href="#" className="underline hover:text-gray-300">Terms</a>{' '}
                and{' '}
                <a href="#" className="underline hover:text-gray-300">Privacy Policy</a>
            </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;