// frontend/src/pages/Community.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as feather from 'feather-icons';
import { FaUsers } from 'react-icons/fa'; // Retain FaUsers if used in future

const Community = () => {
    const [isVisible, setIsVisible] = useState(false);
    
    // Mock data for community discussions
    const MOCK_DISCUSSIONS = [
        { id: 1, title: 'Need help with Dijkstra\'s Algorithm implementation in Java', tag: 'Java', replies: 15, views: 320, author: 'AlexJ' },
        { id: 2, title: 'Best practices for React state management (Redux vs Context)', tag: 'Web Dev', replies: 28, views: 510, author: 'EmmaR' },
        { id: 3, title: 'Understanding complexity: O(log n) explained simply', tag: 'Algorithms', replies: 8, views: 450, author: 'DrChen' },
        { id: 4, title: 'Is C++ still relevant for system programming?', tag: 'C/C++', replies: 45, views: 600, author: 'BobJ' },
        { id: 5, title: 'Best way to learn Kubernetes in 2025', tag: 'DevOps', replies: 12, views: 280, author: 'RachelL' },
    ];

    // Handle scroll for floating buttons
    const handleScroll = useCallback(() => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, []);

    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    useEffect(() => {
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    return (
        <div className="min-h-screen dark-gradient-secondary">
            {/* Hero Section */}
            <div className="gradient-bg text-white relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 floating hidden lg:block">
                    <i data-feather="users" className="w-40 h-40 text-primary-500 opacity-20"></i>
                </div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
                    <div className="text-center">
                        <h1 className="text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl">
                            <span className="block">Join Our</span>
                            <span className="block text-primary-400">Community Forum</span>
                        </h1>
                        <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl max-w-3xl mx-auto">
                            Connect with fellow learners, share knowledge, and get help from experts. Together we grow stronger!
                        </p>
                        <div className="mt-8 sm:max-w-lg sm:mx-auto lg:text-center lg:mx-auto">
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link 
                                    to="/signup" 
                                    className="dark-btn w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    Join Community
                                    <i data-feather="users" className="ml-2 w-5 h-5"></i>
                                </Link>
                                <Link 
                                    to="/problems" 
                                    className="dark-btn-secondary w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    Start Learning
                                    <i data-feather="code" className="ml-2 w-5 h-5"></i>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                 {/* Ensure bottom area respects dark theme */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-dark-gradient-secondary to-transparent z-0"></div>
            </div>

            {/* Stats Bar (Redesigned for theme consistency) */}
            <div className="dark-gradient-secondary py-8 border-b border-gray-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">15,000+</div>
                            <div className="text-sm text-gray-400 mt-1">Active Members</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">500+</div>
                            <div className="text-sm text-gray-400 mt-1">Discussions</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">50+</div>
                            <div className="text-sm text-gray-400 mt-1">Experts</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">24/7</div>
                            <div className="text-sm text-gray-400 mt-1">Support</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Discussion Forum Section (Redesigned with theme-aware cards) */}
            <div id="discussions" className="py-16 dark-gradient-secondary">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
                            Latest Discussions
                        </h2>
                        <p className="mt-4 max-w-2xl text-xl text-gray-400 mx-auto">
                            Ask questions, share insights, and get expert help from the community.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {MOCK_DISCUSSIONS.map(discussion => (
                            <Link 
                                to={`/community/discussion/${discussion.id}`} 
                                key={discussion.id} 
                                // Uses bg-gray-900 for card background which is theme-fixed
                                className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-700/50 hover:shadow-xl transition-all duration-300 flex justify-between items-center card-hover"
                            >
                                <div className="flex items-center w-full">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center mr-4">
                                        <i data-feather="message-square" className="w-6 h-6 text-primary-400"></i>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-lg font-semibold text-white hover:text-primary-400 transition-colors duration-200 truncate">{discussion.title}</div>
                                        <div className="mt-1 flex items-center space-x-3 text-sm text-gray-500">
                                            <span className="text-gray-400">Posted by: <span className="font-medium text-white">{discussion.author}</span></span>
                                            {/* Tag styling consistent with ProblemCard */}
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-400 dark-tag-style">
                                                {discussion.tag}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="text-right flex-shrink-0 ml-4 hidden sm:block">
                                    <div className="text-sm font-medium text-white">{discussion.replies} Replies</div>
                                    <div className="text-xs text-gray-500">{discussion.views} Views</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    
                    <div className="mt-10 text-center">
                        <button className="dark-btn inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-lg transition-colors duration-300">
                            Start a New Discussion
                            <i data-feather="message-square" className="ml-2 w-5 h-5"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Events Section (Simple integration for structure) */}
            <div id="events" className="py-16 dark-gradient-secondary border-t border-gray-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
                        Upcoming Community Events
                    </h2>
                    <p className="mt-4 max-w-2xl text-xl text-gray-400 mx-auto">
                        Join live coding sessions and Q&A events with our expert instructors.
                    </p>
                    <div className="mt-10">
                        {/* Mock Event Card */}
                         <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700/50 inline-block w-full max-w-lg card-hover">
                            <h3 className="text-xl font-semibold text-white">Live Workshop: Dynamic Programming Deep Dive</h3>
                            <p className="text-gray-400 mt-2">Date: November 15th, 2025 | Host: Dr. Chen</p>
                            <button className="dark-btn-secondary mt-4 px-4 py-2 text-sm">Register Now</button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Final CTA (Consistent with Home/Leaderboard) */}
             <div className="py-20 dark-gradient-secondary"> 
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-premium-lg relative overflow-hidden py-16 px-8"> 
                        <div className="absolute inset-0 bg-black opacity-5"></div>
                        
                        <div className="relative"> 
                            <div className="lg:flex lg:items-center lg:justify-between text-center lg:text-left">
                                <div className="flex-1">
                                    <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                                        <span className="block">Ready to build your career?</span>
                                        <span className="block text-primary-100 mt-2 text-xl">Access the full library, free for 7 days.</span>
                                    </h2>
                                    <p className="mt-4 max-w-3xl text-lg text-primary-100 mx-auto lg:mx-0">
                                        No credit card required. Cancel anytime.
                                    </p>
                                </div>
                                <div className="mt-8 flex justify-center lg:mt-0 lg:flex-shrink-0">
                                    <div className="inline-flex rounded-md shadow-lg">
                                        <Link 
                                            to="/signup" 
                                            className="dark-btn inline-flex items-center justify-center px-8 py-4 text-lg rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.03]"
                                        >
                                            Start Free Trial Now
                                            <i data-feather="arrow-right" className="ml-2 w-5 h-5"></i>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Footer (Consistent) */}
            <footer className="dark-gradient mt-16 border-t border-gray-700/50">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <p className="text-base text-gray-400">
                            &copy; 2023 CS Studio. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
            {/* Floating Back to Top Button */}
            <button 
                id="back-to-top" 
                onClick={scrollToTop}
                // FIX: Added sm:bottom-24 to retain original desktop position, and bottom-40 for mobile offset (h-16 + bottom-24 = bottom-40)
                className={`fixed bottom-40 sm:bottom-24 right-6 h-12 w-12 rounded-full dark-gradient-accent text-white flex items-center justify-center transition-all duration-300 shadow-lg z-50 ${
                    isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
            >
                <i data-feather="arrow-up" className="h-5 w-5"></i>
            </button>
        </div>
    );
};

export default Community;