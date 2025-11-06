// frontend/src/pages/Home.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import * as feather from 'feather-icons'; 

// Use relative URLs since CORS is now enabled
const API_BASE_URL = ''; // Empty for relative URLs

// --- Helper Components for Visual Appeal ---

const AbstractBackground = () => (
    <div className="absolute inset-0 overflow-hidden opacity-30">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                    <path d="M 80 0 L 0 0 0 80" fill="none" stroke="var(--color-primary-500)" strokeWidth="0.5" opacity="0.1"/>
                </pattern>
            </defs>
            
            <rect width="100%" height="100%" fill="url(#grid)" /> 
            
            <circle cx="25%" cy="30%" r="50" fill="var(--color-primary-400)" opacity="0.08" className="animate-float-slow"/>
            <circle cx="75%" cy="80%" r="80" fill="var(--color-primary-500)" opacity="0.05" className="animate-float-reverse"/>
        </svg>
    </div>
);

const InteractiveDemo = () => {
    useEffect(() => {
        feather.replace();
    });

    return (
        <div className="relative w-full max-w-xl rounded-2xl shadow-premium-lg overflow-hidden card-hover border-4 border-primary-500/50 hover:border-primary-500">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-4">
                
                <div className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-700 pb-3 mb-3">
                    <div className="flex items-center">
                        <span className="text-primary-400 mr-2">Problem 42:</span> Merge Sort Implementation
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-yellow-400 bg-yellow-500/20">Medium</span>
                        <i data-feather="clock" className="w-4 h-4"></i>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 h-[300px]">
                    
                    <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs overflow-auto border border-gray-700">
                        <p className="text-white font-semibold mb-2">Code (Python)</p>
                        <pre className="text-gray-300">
                            <span className="text-primary-400">def</span> mergeSort(<span className="text-white">arr</span>):
                            <span className="text-primary-400">    if</span> len(<span className="text-white">arr</span>) &gt; <span className="text-yellow-400">1</span>:
                            <span className="text-white">        mid</span> = len(<span className="text-white">arr</span>) // <span className="text-yellow-400">2</span>
                            <span className="text-white">        L</span> = <span className="text-white">arr</span>[:mid]
                            <span className="text-white">        R</span> = <span className="text-white">arr</span>[mid:]

                            <span className="text-primary-400">        mergeSort</span>(<span className="text-white">L</span>)
                            <span className="text-primary-400">        mergeSort</span>(<span className="text-white">R</span>)
                            
                            <span className="text-white">        i = j = k = 0</span>

                            <span className="text-primary-400">    return</span> <span className="text-white">arr</span>
                        </pre>
                    </div>

                    <div className="flex flex-col space-y-4">
                        
                        <div className="bg-gray-900 rounded-lg p-3 overflow-auto flex-1 border border-gray-700">
                            <p className="text-white font-semibold mb-2">Console Output</p>
                            <pre className="text-xs">
                                <span className="text-green-500">Input:</span> [12, 11, 13, 5]
                                <span className="text-green-500">Output:</span> [5, 11, 12, 13]
                                <span className="text-primary-400">Status:</span> Accepted
                            </pre>
                            
                            <div className="mt-3 w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                <div className="h-1.5 bg-gradient-to-r from-primary-500 to-primary-400 w-full"></div>
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-lg p-3 overflow-hidden flex-1 border border-gray-700 flex flex-col items-center justify-center">
                            <i data-feather="bar-chart-2" className="w-8 h-8 text-primary-400 mb-2"></i>
                            <p className="text-sm text-gray-400 text-center">
                                Live Merge View
                            </p>
                            <span className="text-xs text-green-500 mt-1">Sorting in Progress...</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-primary-500 p-2 rounded-full shadow-xl">
                <i data-feather="terminal" className="w-6 h-6 text-white"></i>
            </div>
        </div>
    );
};

// API Debug Component
const APIDebug = () => {
    const [apiStatus, setApiStatus] = useState('Testing API...');
    const [responseData, setResponseData] = useState(null);
    
    useEffect(() => {
        const testAPI = async () => {
            try {
                console.log('Testing API endpoint: /api/stats/user-stats');
                const response = await fetch('/api/stats/user-stats');
                const contentType = response.headers.get('content-type');
                const responseText = await response.text();
                
                console.log('Response status:', response.status);
                console.log('Content-Type:', contentType);
                console.log('Response text:', responseText);
                
                if (contentType && contentType.includes('text/html')) {
                    setApiStatus('❌ API ERROR: Got HTML page instead of JSON');
                    setResponseData(responseText.substring(0, 200) + '...');
                } else if (response.ok) {
                    const data = JSON.parse(responseText);
                    setApiStatus('✅ API SUCCESS');
                    setResponseData(data);
                } else {
                    setApiStatus(`❌ API ERROR: ${response.status} ${response.statusText}`);
                    setResponseData(responseText);
                }
            } catch (error) {
                console.error('API test error:', error);
                setApiStatus(`❌ NETWORK ERROR: ${error.message}`);
                setResponseData(null);
            }
        };
        
        testAPI();
    }, []);
    
    return (
        <div className="fixed top-4 left-4 bg-gray-800 text-white p-4 rounded-lg z-50 text-xs max-w-md border border-yellow-500">
            <div className="font-bold mb-2 text-yellow-400">API Debug Info:</div>
            <div className="mb-2">{apiStatus}</div>
            {responseData && (
                <div className="mt-2">
                    <div className="font-semibold">Response:</div>
                    <pre className="text-xs mt-1 overflow-auto max-h-32 bg-gray-900 p-2 rounded">
                        {typeof responseData === 'string' 
                            ? responseData 
                            : JSON.stringify(responseData, null, 2)
                        }
                    </pre>
                </div>
            )}
        </div>
    );
};

// Rating Prompt Component
const RatingPrompt = () => {
    const [showPrompt, setShowPrompt] = useState(false);
    const { isLoggedIn } = useAuth();
    
    useEffect(() => {
        const checkRatingEligibility = async () => {
            if (!isLoggedIn) return;
            
            try {
                const token = localStorage.getItem('token');
                console.log('Checking rating eligibility...');
                const response = await fetch('/api/stats/rating-eligibility', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('text/html')) {
                    console.log('Rating eligibility API returned HTML - endpoint likely missing');
                    return;
                }
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Rating eligibility response:', data);
                    if (data.eligible) {
                        const hasSeenPrompt = sessionStorage.getItem('hasSeenRatingPrompt');
                        if (!hasSeenPrompt) {
                            setShowPrompt(true);
                            sessionStorage.setItem('hasSeenRatingPrompt', 'true');
                        }
                    }
                }
            } catch (error) {
                console.log('Rating eligibility check failed:', error.message);
            }
        };

        const timer = setTimeout(checkRatingEligibility, 2000);
        return () => clearTimeout(timer);
    }, [isLoggedIn]);
    
    const handleRating = async (rating) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/stats/submit-rating', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ rating })
            });
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                console.log('Submit rating API returned HTML - endpoint likely missing');
                setShowPrompt(false);
                return;
            }
            
            if (response.ok) {
                console.log('Rating submitted successfully');
                setShowPrompt(false);
                window.location.reload();
            } else {
                console.error('Failed to submit rating');
            }
        } catch (error) {
            console.error('Failed to submit rating:', error);
            setShowPrompt(false);
        }
    };

    const handleClose = () => {
        setShowPrompt(false);
    };
    
    if (!showPrompt) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="dark-glass p-8 rounded-2xl max-w-md w-full border border-gray-600">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white">How would you rate your experience?</h3>
                    <button 
                        onClick={handleClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <i data-feather="x" className="w-5 h-5"></i>
                    </button>
                </div>
                
                <p className="text-gray-300 mb-6">
                    You've been using CS Studio for a while now. We'd love to hear your feedback!
                </p>
                
                <div className="flex justify-center space-x-3 mb-6">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button 
                            key={star}
                            onClick={() => handleRating(star)}
                            className="text-3xl text-yellow-400 hover:scale-110 transition-transform duration-200 hover:text-yellow-300"
                            title={`${star} star${star > 1 ? 's' : ''}`}
                        >
                            ⭐
                        </button>
                    ))}
                </div>
                
                <p className="text-gray-400 text-sm text-center">
                    Your feedback helps us improve the learning experience!
                </p>
            </div>
        </div>
    );
};

// --- Main Home Component ---

const Home = () => {
    const { isLoggedIn } = useAuth();
    const [isVisible, setIsVisible] = useState(false);
    const [userStats, setUserStats] = useState({
        totalUsers: 15678,
        satisfactionRate: 96
    });
    const [apiData, setApiData] = useState(null);

    // Fetch real-time stats
    useEffect(() => {
        const fetchUserStats = async () => {
            try {
                console.log('🔄 Fetching user stats from API...');
                const response = await fetch('/api/stats/user-stats');
                const contentType = response.headers.get('content-type');
                
                if (contentType && contentType.includes('text/html')) {
                    console.log('❌ API returned HTML page. Check if route exists.');
                    return;
                }
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ API Success - Data received:', data);
                    setUserStats({
                        totalUsers: data.totalUsers,
                        satisfactionRate: data.satisfactionRate
                    });
                    setApiData(data);
                } else {
                    console.log('❌ API Error:', response.status, response.statusText);
                }
            } catch (error) {
                console.log('❌ Network Error:', error.message);
            }
        };

        fetchUserStats();
        
        const interval = setInterval(fetchUserStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleScroll = useCallback(() => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, []);

    useEffect(() => {
        feather.replace(); 
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]); 
    
    useEffect(() => {
        feather.replace();
    });

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleStartLearning = () => {
        return isLoggedIn ? '/courses' : '/signup';
    };
    
    const FEATURE_DATA = [
        { icon: 'git-merge', title: 'Interactive Data Structures', description: 'See lists, trees, and graphs animate as code executes, eliminating abstract concepts.' },
        { icon: 'aperture', title: 'Visualize Algorithms', description: 'Step-by-step visualizations for sorting, pathfinding (e.g., Dijkstra), and recursion.' },
        { icon: 'cloud-lightning', title: 'Real-time Execution', description: 'Fast, sandbox compiler for C, Python, Java, and more, powered by our Socket.IO backend.' },
        { icon: 'activity', title: 'Master Design Patterns', description: 'Structured projects guide you through SOLID principles and design patterns like Factory and Observer.' },
        { icon: 'command', title: 'Competitive Challenges', description: 'Tackle problems rated Easy to Hard, preparing you for technical interviews.' },
        { icon: 'shield', title: 'Full Career Roadmaps', description: 'Structured paths for Full Stack, Data Science, and DevOps, built by industry experts.' }
    ];

    const PATHS_DATA = [
        { icon: 'code', title: 'Programming Fundamentals', subtitle: 'Start with Python & C', description: 'Master core syntax, logic, and functional programming concepts for a strong foundation.' },
        { icon: 'database', title: 'Data Structures & Algorithms', subtitle: 'Trees, Graphs, and DP', description: 'The essential core of computer science. Prepare for any technical interview with deep visualization.' },
        { icon: 'globe', title: 'Full Stack Web Developer', subtitle: 'MERN Stack & Beyond', description: 'Learn modern web development from database management to front-end architecture.' },
    ];
    
    const TESTIMONIALS_DATA = [
        { initials: 'MC', name: 'Michael Chen', title: 'Software Engineer', quote: 'The interactive lessons made complex algorithms so much easier to understand. I went from zero to getting multiple job offers in just 6 months!' },
        { initials: 'SJ', name: 'Sarah Johnson', title: 'Frontend Developer', quote: 'I love the problem-solving approach. The animated explanations helped me visualize concepts I struggled with for years. Now I\'m building my own apps!' },
        { initials: 'DW', name: 'David Wilson', title: 'CS Student', quote: 'The perfect supplement to my CS degree. The problems are challenging but the explanations are clear. My interview skills improved dramatically.' }
    ];

    return (
        <div className="min-h-screen dark-gradient-secondary">
            
            <div id="hero-section" className="gradient-bg text-white relative overflow-hidden min-h-[90vh] flex items-center border-b border-gray-700">
                <AbstractBackground />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-20 w-full">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
                        <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                            <h1 className="text-5xl tracking-tight font-extrabold sm:text-6xl md:text-7xl">
                                <span className="block text-white">Master Algorithms with</span>
                                <span className="block text-primary-400">Interactive Visual Coding</span>
                            </h1>
                            <p className="mt-6 text-xl text-gray-300 max-w-xl">
                                Instantly transform complex <strong>Data Structures</strong> and <strong>Algorithms</strong> into visual steps. Code, run, and see exactly <strong>why</strong> your solution works (or doesn't).
                            </p>
                            <div className="mt-10 sm:max-w-lg sm:mx-auto lg:text-left lg:mx-0">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link 
                                        to={handleStartLearning()} 
                                        className="dark-btn w-full flex items-center justify-center px-8 py-4 text-lg rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.03]"
                                    >
                                        Start Your Free Trial
                                    </Link>
                                    <Link 
                                        to="/problems" 
                                        className="dark-btn-secondary w-full flex items-center justify-center px-8 py-4 text-lg rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.03]"
                                    >
                                        Browse Challenges
                                    </Link>
                                </div>
                                <p className="mt-4 text-sm text-gray-400">
                                    <span className="text-primary-400 font-semibold">{userStats.totalUsers.toLocaleString()}+</span> developers are currently accelerating their careers.
                                    {apiData && <span className="text-green-400 ml-2">(Live Data)</span>}
                                </p>
                            </div>
                        </div>
                        
                        <div className="mt-16 lg:mt-0 lg:col-span-6 flex justify-center w-full">
                            <div className="hidden lg:block w-full justify-center">
                                <InteractiveDemo />
                            </div>
                            
                            <div className="lg:hidden w-full max-w-sm mx-auto grid grid-cols-2 gap-4">
                                {FEATURE_DATA.slice(0, 4).map((feature, index) => (
                                    <div 
                                        key={index} 
                                        className="dark-glass p-5 rounded-xl shadow-xl border border-gray-700 flex flex-col items-start space-y-2"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center text-white shadow-md">
                                            <i data-feather={feature.icon} className="w-5 h-5 text-primary-400"></i>
                                        </div>
                                        <h3 className="text-base font-semibold text-white leading-tight">{feature.title}</h3>
                                        <p className="text-gray-400 text-xs">{feature.description.split(',')[0]}</p>
                                    </div>
                                ))}
                                <Link 
                                    to="/problems" 
                                    className="col-span-2 dark-btn w-full text-center mt-2 inline-flex items-center justify-center px-4 py-3 text-base font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.03]"
                                >
                                    Try a Free Challenge
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Stats Section - Simple & Attractive */}
            <div className="py-16 dark-gradient-secondary border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Elevated Stats Box */}
                    <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-8 lg:p-12">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-white mb-2">
                                    {userStats.totalUsers.toLocaleString()}+
                                </div>
                                <div className="text-gray-400">Active Learners</div>
                                
                            </div>
                            
                            <div className="text-center">
                                <div className="text-4xl font-bold text-white mb-2">500+</div>
                                <div className="text-gray-400">Interactive Lessons</div>
                                
                            </div>
                            
                            <div className="text-center">
                                <div className="text-4xl font-bold text-white mb-2">250+</div>
                                <div className="text-gray-400">Coding Problems</div>
                            </div>
                            
                            <div className="text-center">
                                <div className="text-4xl font-bold text-white mb-2">
                                    {userStats.satisfactionRate}%
                                </div>
                                <div className="text-gray-400">Satisfaction Rate</div>
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rest of your sections remain the same */}
            <div className="py-20 dark-gradient-secondary">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-base text-primary-500 font-semibold tracking-wide uppercase">The CS Studio Advantage</h2>
                        <p className="mt-2 text-4xl leading-8 font-extrabold tracking-tight text-white sm:text-5xl">
                            Features Designed to Accelerate Mastery
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-400 mx-auto">
                            Go beyond passive reading with the tools industry professionals use for deep understanding.
                        </p>
                    </div>

                    <div className="mt-16">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {FEATURE_DATA.map((feature, index) => (
                                <div key={index} className="dark-glass p-8 rounded-xl shadow-xl card-hover transition-all duration-500 hover:border-primary-500">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-primary-500 to-primary-400 flex items-center justify-center text-white shadow-lg mb-4">
                                        <i data-feather={feature.icon} className="w-6 h-6"></i>
                                    </div>
                                    <h3 className="mt-4 text-xl font-semibold text-white">{feature.title}</h3>
                                    <p className="mt-2 text-gray-400">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="py-20 dark-gradient-secondary border-t border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-base text-primary-500 font-semibold tracking-wide uppercase">Your Path to Employment</h2>
                        <p className="mt-2 text-4xl leading-8 font-extrabold tracking-tight text-white sm:text-5xl">
                            Structured Roadmaps for Job Readiness
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-400 mx-auto">
                            Follow our complete learning paths—each step is designed to fill knowledge gaps and build a portfolio.
                        </p>
                    </div>

                    <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
                        {PATHS_DATA.map((path, index) => (
                            <div key={index} className="dark-glass p-6 rounded-2xl shadow-xl card-hover border border-gray-700">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white shadow-md">
                                        <i data-feather={path.icon} className="w-6 h-6"></i>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{path.title}</h3>
                                        <p className="text-sm text-primary-400">{path.subtitle}</p>
                                    </div>
                                </div>
                                <p className="mt-4 text-gray-400 text-sm">{path.description}</p>
                                <Link 
                                    to="/roadmaps" 
                                    className="dark-btn-secondary w-full text-center mt-6 inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:bg-gray-700"
                                >
                                    Explore Roadmap
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="py-20 dark-gradient-secondary border-t border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-base text-primary-500 font-semibold tracking-wide uppercase">Trust & Results</h2>
                        <p className="mt-2 text-4xl leading-8 font-extrabold tracking-tight text-white sm:text-5xl">
                            What Our Developers Say
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {TESTIMONIALS_DATA.map((testimonial, index) => (
                            <div key={index} className="dark-glass p-8 rounded-2xl shadow-xl border border-gray-700 card-hover">
                                <div className="flex mb-4">
                                    {Array(5).fill(0).map((_, i) => (
                                        <i key={i} data-feather="star" className="w-5 h-5 text-yellow-400 fill-current"></i>
                                    ))}
                                </div>
                                <p className="text-gray-300 italic">
                                    "{testimonial.quote}"
                                </p>
                                <div className="flex items-center mt-6">
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-primary-400 flex items-center justify-center text-white font-bold">
                                            {testimonial.initials}
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-lg font-semibold text-white">{testimonial.name}</h4>
                                        <p className="text-sm text-gray-400">{testimonial.title}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="py-20 dark-gradient-secondary"> 
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-premium-lg relative overflow-hidden py-16 px-8"> 
                        <div className="absolute inset-0 bg-black opacity-5"></div>
                        
                        <div className="relative"> 
                            <div className="lg:flex lg:items-center lg:justify-between">
                                <div className="flex-1">
                                    <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                                        <span className="block">Ready to build your career?</span>
                                        <span className="block text-primary-100 mt-2">Access the full library, free for 7 days.</span>
                                    </h2>
                                    <p className="mt-4 max-w-3xl text-lg text-primary-100">
                                        No credit card required. Cancel anytime.
                                    </p>
                                </div>
                                <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
                                    <div className="inline-flex rounded-md shadow-lg">
                                        <Link 
                                            to="/signup" 
                                            className="dark-btn inline-flex items-center justify-center px-8 py-4 rounded-lg text-base font-semibold text-white transition-all duration-300 transform hover:scale-105"
                                        >
                                            Start Free Trial Now
                                            <i data-feather="arrow-right" className="ml-3 -mr-1 w-5 h-5"></i>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <Link 
                to="/code" 
                id="floating-action-button" 
                className="fixed bottom-20 sm:bottom-6 right-6 h-14 w-14 rounded-full dark-gradient-accent text-white flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl z-50"
            >
                <i data-feather="edit-3" className="h-6 w-6"></i>
            </Link>

            <button 
                id="back-to-top" 
                onClick={scrollToTop}
                className={`fixed bottom-40 sm:bottom-24 right-6 h-12 w-12 rounded-full dark-gradient-accent text-white flex items-center justify-center transition-all duration-300 shadow-lg z-50 ${
                    isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
            >
                <i data-feather="arrow-up" className="h-5 w-5"></i>
            </button>

            <RatingPrompt />
        </div>
    );
};

export default Home;