// src/components/common/Footer.jsx

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as feather from 'feather-icons';

const Footer = () => {
    useEffect(() => {
        feather.replace();
    }, []);
    
    return (
        // FIXED: dark-gradient is now on the footer tag itself to span full width
        <footer className="dark-gradient w-full border-t border-gray-700">
            {/* This inner container sets the max width for the entire footer content */}
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                
                {/* FINAL FIX: Using a strict grid to force even horizontal distribution of columns */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 lg:gap-24">
                    
                    {/* Learn Column */}
                    {/* ... (Content remains unchanged) ... */}
                        <div> 
                            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Learn</h3>
                            <ul className="mt-4 space-y-4">
                                <li>
                                    <Link to="/courses" className="text-base text-gray-400 hover:text-white transition-colors duration-300">Courses</Link>
                                </li>
                                <li>
                                    <Link to="/roadmaps" className="text-base text-gray-400 hover:text-white transition-colors duration-300">Paths</Link>
                                </li>
                                <li>
                                    <Link to="#" className="text-base text-gray-400 hover:text-white transition-colors duration-300">Interactive Lessons</Link>
                                </li>
                            </ul>
                        </div>
                    
                    {/* Practice Column */}
                    {/* ... (Content remains unchanged) ... */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Practice</h3>
                            <ul className="mt-4 space-y-4">
                                <li>
                                    <Link to="/problems" className="text-base text-gray-400 hover:text-white transition-colors duration-300">Problems</Link>
                                </li>
                                <li>
                                    <Link to="#" className="text-base text-gray-400 hover:text-white transition-colors duration-300">Challenges</Link>
                                </li>
                            </ul>
                        </div>
                    
                    {/* Community Column */}
                    {/* ... (Content remains unchanged) ... */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Community</h3>
                            <ul className="mt-4 space-y-4">
                                <li>
                                    <Link to="/community" className="text-base text-gray-400 hover:text-white transition-colors duration-300">Forums</Link>
                                </li>
                                <li>
                                    <Link to="/leaderboard" className="text-base text-gray-400 hover:text-white transition-colors duration-300">Leaderboard</Link>
                                </li>
                                <li>
                                    <Link to="#" className="text-base text-gray-400 hover:text-white transition-colors duration-300">Events</Link>
                                </li>
                            </ul>
                        </div>
                    
                    {/* Company Column */}
                    {/* ... (Content remains unchanged) ... */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Company</h3>
                            <ul className="mt-4 space-y-4">
                                <li>
                                    <Link to="#" className="text-base text-gray-400 hover:text-white transition-colors duration-300">About</Link>
                                </li>
                                <li>
                                    <Link to="#" className="text-base text-gray-400 hover:text-white transition-colors duration-300">Careers</Link>
                                </li>
                                <li>
                                    <Link to="#" className="text-base text-gray-400 hover:text-white transition-colors duration-300">Contact</Link>
                                </li>
                            </ul>
                        </div>
                </div>
                
                {/* Bottom section (Copyright and Social Media) - Uses justify-between to push content to edges of the max-width container */}
                <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
                    {/* Copyright Text (Left side) */}
                    <p className="text-base text-gray-400 md:order-1">
                        &copy; 2025 CS Studio. All rights reserved.
                    </p>
                    
                    {/* Social Media (Right side) */}
                    <div className="flex space-x-6 mt-4 md:mt-0 md:order-2">
                        <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300" aria-label="Twitter">
                            <i data-feather="twitter" className="h-6 w-6"></i>
                        </a>
                        <a href="https://github.com/Balaji19072007?tab=repositories" className="text-gray-400 hover:text-white transition-colors duration-300" aria-label="GitHub">
                            <i data-feather="github" className="h-6 w-6"></i>
                        </a>
                        <a href="https://www.linkedin.com/in/balaji-reddy-590583290/" className="text-gray-400 hover:text-white transition-colors duration-300" aria-label="LinkedIn">
                            <i data-feather="linkedin" className="h-6 w-6"></i>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300" aria-label="YouTube">
                            <i data-feather="youtube" className="h-6 w-6"></i>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;