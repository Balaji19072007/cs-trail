// src/components/common/ErrorBoundary.jsx

import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary Caught:', error, errorInfo);
    
    // Log error to monitoring service (you can integrate with Sentry, LogRocket, etc.)
    this.logErrorToService(error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  logErrorToService = (error, errorInfo) => {
    // Here you can integrate with your error monitoring service
    // Example: Sentry.captureException(error, { extra: errorInfo });
    
    // For now, we'll just enhance console logging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    console.error('Application Error Details:', errorDetails);
  }

  handleReload = () => {
    window.location.reload();
  }

  handleGoHome = () => {
    window.location.href = '/';
  }

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
          <div className="max-w-md w-full text-center p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-500/10 rounded-full">
                <AlertTriangle className="w-12 h-12 text-red-500" />
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-white mb-3">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-300 mb-6">
              We're sorry for the inconvenience. Our team has been notified and is working on fixing the issue.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>

            {/* Error Details Toggle */}
            {process.env.NODE_ENV === 'development' && (
              <div className="border-t border-gray-700 pt-6">
                <button
                  onClick={this.toggleDetails}
                  className="flex items-center justify-center gap-2 mx-auto text-sm text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <Bug className="w-4 h-4" />
                  {this.state.showDetails ? 'Hide Error Details' : 'Show Error Details'}
                </button>

                {/* Error Details */}
                {this.state.showDetails && this.state.error && (
                  <div className="mt-4 p-4 bg-gray-900 rounded-lg text-left">
                    <h3 className="text-red-400 font-mono text-sm mb-2">
                      {this.state.error.toString()}
                    </h3>
                    <details className="text-xs text-gray-400">
                      <summary className="cursor-pointer mb-2">Stack Trace</summary>
                      <pre className="whitespace-pre-wrap mt-2 overflow-auto max-h-40">
                        {this.state.errorInfo?.componentStack}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            )}

            {/* Support Contact */}
            <div className="text-xs text-gray-500 mt-6">
              If the problem persists, please contact{' '}
              <a 
                href="mailto:support@codingplatform.com" 
                className="text-blue-400 hover:text-blue-300 underline"
              >
                support@codingplatform.com
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;