import React, { useState, useEffect } from 'react';
import { statsAPI, isAuthenticated } from '../../config/api'; // Fixed import path
import './RatingPopup.css';

const RatingPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [currentTheme, setCurrentTheme] = useState('dark');

  // Detect theme changes
  useEffect(() => {
    const detectTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme') || 
                   (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
      setCurrentTheme(theme);
    };

    // Initial detection
    detectTheme();

    // Observe theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          detectTheme();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleSystemThemeChange = (e) => {
      if (!document.documentElement.hasAttribute('data-theme')) {
        setCurrentTheme(e.matches ? 'light' : 'dark');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) return;

    initializeRatingSystem();
    
    const interval = setInterval(checkRatingStatus, 30000);
    
    const handleBeforeUnload = () => {
      stopUsageTracking();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      clearInterval(interval);
      stopUsageTracking();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const initializeRatingSystem = async () => {
    if (!isAuthenticated()) return;

    try {
      await startUsageTracking();
      await checkRatingStatus();
    } catch (error) {
      console.error('Error initializing rating system:', error);
    }
  };

  const startUsageTracking = async () => {
    if (!isAuthenticated()) return;
    
    try {
      await statsAPI.startUsageTracking();
    } catch (error) {
      console.error('Error starting usage tracking:', error);
    }
  };

  const stopUsageTracking = async () => {
    if (!isAuthenticated()) return;
    
    try {
      await statsAPI.stopUsageTracking();
    } catch (error) {
      console.error('Error stopping usage tracking:', error);
    }
  };

  const checkRatingStatus = async () => {
    if (!isAuthenticated()) return;

    try {
      const response = await statsAPI.checkRatingStatus();

      if (response.data.success && response.data.showRating && !showPopup) {
        showRatingPopup();
      }
    } catch (error) {
      console.error('Error checking rating status:', error);
    }
  };

  const showRatingPopup = () => {
    setShowPopup(true);
    markRatingAsShown();
  };

  const markRatingAsShown = async () => {
    if (!isAuthenticated()) return;
    
    try {
      await statsAPI.markRatingShown();
    } catch (error) {
      console.error('Error marking rating as shown:', error);
    }
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      setMessage('Please select a rating');
      return;
    }

    if (!isAuthenticated()) {
      setMessage('Please log in to submit rating');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await statsAPI.submitRating({ rating, feedback });
      
      if (response.data.success) {
        setMessage('Thank you for your feedback!');
        setTimeout(() => {
          setShowPopup(false);
          setRating(0);
          setFeedback('');
          setMessage('');
        }, 1500);
      }
    } catch (error) {
      setMessage(error.response?.data?.msg || 'Error submitting rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setRating(0);
    setFeedback('');
    setMessage('');
  };

  const StarIcon = ({ filled, hovered, onClick, onMouseEnter, onMouseLeave }) => (
    <svg
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`star-icon ${filled ? 'filled' : ''} ${hovered ? 'hovered' : ''}`}
      viewBox="0 0 24 24"
      width="32"
      height="32"
    >
      <path
        fill="currentColor"
        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
      />
    </svg>
  );

  if (!isAuthenticated()) {
    return null;
  }

  if (!showPopup) return null;

  return (
    <div className="rating-popup-overlay" data-theme={currentTheme}>
      <div className="rating-popup">
        <div className="popup-header">
          <div className="header-content">
            <div className="icon-wrapper">
              <svg className="sparkle-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"/>
              </svg>
            </div>
            <div className="header-text">
              <h3>Share Your Experience</h3>
              <p>Help us improve CS Studio</p>
            </div>
          </div>
          <button className="close-btn" onClick={handleClosePopup}>
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        
        <div className="popup-body">
          <div className="rating-section">
            <label className="rating-label">How would you rate your experience?</label>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  filled={star <= rating}
                  hovered={star <= hoverRating}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                />
              ))}
            </div>
            <div className="rating-labels">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>

          <div className="feedback-section">
            <label className="feedback-label">Optional Feedback</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What did you like? How can we improve?"
              rows="3"
              maxLength="500"
              className="feedback-textarea"
            />
            <div className="char-count">{feedback.length}/500</div>
          </div>

          {message && (
            <div className={`message ${message.includes('Thank you') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </div>

        <div className="popup-footer">
          <button 
            className="cancel-btn"
            onClick={handleClosePopup}
          >
            Maybe Later
          </button>
          <button 
            className="submit-btn"
            onClick={handleSubmitRating}
            disabled={rating === 0 || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="spinner" viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
                </svg>
                Submitting...
              </>
            ) : (
              'Submit Rating'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingPopup;