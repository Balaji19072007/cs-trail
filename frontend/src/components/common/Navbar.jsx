// frontend/src/components/common/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from "../../hooks/useAuth.jsx"; 
import * as feather from 'feather-icons';
import SearchBar from './SearchBar.jsx'; 

// Data that describes all navigation links
// PRIMARY items for the new bottom nav (high-traffic pages)
const PRIMARY_NAV_ITEMS = [
    { name: 'Home', path: '/', icon: 'home' },
    { name: 'Courses', path: '/courses', icon: 'book' },
    { name: 'Roadmap', path: '/roadmaps', icon: 'map' },
    { name: 'Problems', path: '/problems', icon: 'target' },
];

// SECONDARY items for desktop nav and mobile side-drawer
const SECONDARY_NAV_ITEMS = [
    { name: 'Leaderboard', path: '/leaderboard', icon: 'award' },
    { name: 'Community', path: '/community', icon: 'users' }
];

// Combined list for desktop nav
const NAV_ITEMS = [...PRIMARY_NAV_ITEMS, ...SECONDARY_NAV_ITEMS];


const Navbar = () => {
    const { isLoggedIn, user, logout, loading } = useAuth();
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const storedTheme = localStorage.getItem('theme');
        return storedTheme ? storedTheme === 'dark' : false; 
    }); 

    const featherIconsInitialized = useRef(false);

    const currentPath = location.pathname.replace(/.html$/, '');
    
    // Initialize Feather icons safely
    const initializeFeatherIcons = () => {
        try {
            if (typeof feather !== 'undefined' && feather.replace) {
                feather.replace();
                featherIconsInitialized.current = true;
            }
        } catch (error) {
            console.warn('Feather icons initialization failed:', error);
        }
    };

    // Replace icons on component mount and updates
    useEffect(() => {
        initializeFeatherIcons();
    });

    // Handle theme changes
    useEffect(() => {
        // Apply theme class to body and store preference
        const theme = isDarkMode ? 'dark' : 'light';
        document.body.classList.remove('dark-theme', 'light-theme');
        document.body.classList.add(theme + '-theme');
        localStorage.setItem('theme', theme);
        
        // Re-initialize icons after theme change with a small delay
        const timer = setTimeout(() => {
            initializeFeatherIcons();
        }, 10);
        
        return () => clearTimeout(timer);
    }, [isDarkMode]);

    // ⭐ NEW useEffect to handle content spacing for fixed navbars
    useEffect(() => {
        if (isLoggedIn) {
            // Applies pt-16 (top navbar) and pb-16 (bottom navbar) only on mobile (max-width: 640px)
            // On desktop (sm:), it will only need pt-16 for the top navbar.
            document.body.classList.add('mobile-nav-spacing');
        } else {
            // When logged out, there is no bottom nav on mobile, so we just need pt-16
            document.body.classList.remove('mobile-nav-spacing');
            document.body.classList.add('logged-out-top-spacing'); 
        }

        // Cleanup function
        return () => {
            document.body.classList.remove('mobile-nav-spacing', 'logged-out-top-spacing');
        };
    }, [isLoggedIn]);
    // ⭐ END NEW useEffect

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (isDropdownOpen && !event.target.closest('#logged-in-profile')) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, [isDropdownOpen]);
    
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const handleThemeToggle = () => {
        setIsDarkMode(prev => !prev);
    }
    
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(prev => !prev);
    }

    const renderNavLinks = (isMobile = false, items = NAV_ITEMS) => {
        if (!isLoggedIn) return null;

        return items.map(item => {
            
            let isActive = false;
            
            if (item.path === '/') {
                isActive = currentPath === '/'; 
            } else {
                isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
            }
            
            const baseClasses = "font-medium transition-all duration-300";
            // Desktop Classes (only used for NAV_ITEMS combined array)
            const desktopClasses = `h-full flex items-center px-4 pt-1 text-sm ${isActive ? 'active-nav' : 'text-gray-300 hover:text-white'}`;
            
            // Theme-aware mobile classes (used for SECONDARY_NAV_ITEMS in the side-drawer)
            const mobileClasses = `flex items-center px-4 py-3 text-base font-medium rounded-lg mx-2 transition-all duration-200 border-l-4 ${
                isActive 
                    ? 'bg-primary-500/20 text-primary-600 border-primary-500' 
                    : `border-transparent ${isDarkMode ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
            }`;
            
            // Mobile Bottom Nav Classes (used for PRIMARY_NAV_ITEMS in bottom nav)
            const bottomNavClasses = `flex flex-col items-center justify-center p-2 pt-2.5 transition-colors duration-200 ${
                isActive
                    ? 'text-primary-500' // Active color for bottom nav
                    : (isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
            }`;


            return (
                <Link 
                    key={item.name} 
                    to={item.path} 
                    className={`nav-link ${
                        !isMobile ? desktopClasses 
                        : (items === PRIMARY_NAV_ITEMS ? bottomNavClasses : mobileClasses)
                    } ${baseClasses}`}
                >
                    {(isMobile && items !== PRIMARY_NAV_ITEMS) && (
                        <i data-feather={item.icon} className="w-5 h-5 mr-3"></i>
                    )}
                    {/* Only use icon and small text for the bottom nav */}
                    {(isMobile && items === PRIMARY_NAV_ITEMS) ? (
                        <>
                            <i data-feather={item.icon} className="w-5 h-5 mb-1"></i>
                            <span className="text-xs">{item.name}</span>
                        </>
                    ) : (
                        item.name
                    )}
                </Link>
            );
        });
    }
    
    const renderAvatar = () => {
        if (!user) return <span className="font-bold">U</span>;

        const userInitials = user.name ? 
            user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';
        
        if (user.photoUrl) {
            return <img src={user.photoUrl} alt="Profile" className="h-full w-full rounded-full object-cover" />;
        }
        return <span className="font-bold">{userInitials}</span>;
    }
    
    const renderSearch = (isMobile = false) => {
        return <SearchBar isMobile={isMobile} />;
    }

    const handleLogout = () => {
        logout();
        setIsDropdownOpen(false);
    }

    // Theme-aware background and text classes
    const mobileBgClass = isDarkMode ? 'bg-gray-900' : 'bg-white';
    const mobileBorderClass = isDarkMode ? 'border-gray-700' : 'border-gray-200';
    const mobileTextClass = isDarkMode ? 'text-white' : 'text-gray-900';
    const mobileSecondaryTextClass = isDarkMode ? 'text-gray-400' : 'text-gray-500';
    const mobileHoverBgClass = isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100';
    const mobileCardBgClass = isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50';
    
    if (loading) {
        // Reduced opacity to 0 to make it invisible while loading
        return <nav className="dark-gradient shadow-lg fixed top-0 left-0 w-full z-50 h-16 border-b border-gray-700 opacity-0"></nav>;
    }

    // Get the correct theme icon
    const themeIcon = isDarkMode ? 'sun' : 'moon';
    const menuIcon = isMobileMenuOpen ? 'x' : 'menu';

    return (
        <>
            {/* 1. TOP NAVBAR (STATIC) */}
            <nav className={`${isDarkMode ? 'dark-gradient' : 'bg-white shadow-lg'} fixed top-0 left-0 w-full z-50 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                {/* Main Flex Container */}
                <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                    
                    {/* 1. LEFT SIDE: LOGO + NAV LINKS */}
                    <div className="flex items-center h-full">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="flex items-center">
                                <div className="h-8 w-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
                                    <i data-feather="code" className="text-white w-4 h-4 logo-icon"></i>
                                </div>
                                <span className={`ml-2 text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>CS Studio</span>
                            </Link>
                        </div>
                        
                        {/* Desktop Navigation Links - Combined NAV_ITEMS */}
                        {isLoggedIn && (
                            <div className="hidden h-full items-center sm:ml-6 sm:flex sm:space-x-2 lg:space-x-6">
                                {renderNavLinks()}
                            </div>
                        )}
                    </div>

                    {/* 2. RIGHT SIDE: SEARCH, THEME, & AUTH/PROFILE */}
                    <div className="flex items-center space-x-3 h-full">
                        
                        {/* Desktop Search Bar */}
                        {isLoggedIn && (
                            <div className="hidden sm:block w-48 lg:w-64 mr-4">
                                {renderSearch(false)}
                            </div>
                        )}
                        
                        {/* Theme Toggle */}
                        <button 
                            onClick={handleThemeToggle}
                            className={`hidden sm:block p-2 rounded-lg transition-all duration-300 ${
                                isDarkMode 
                                    ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                            }`}
                            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            <i data-feather={themeIcon} className="w-5 h-5"></i>
                        </button>

                        {/* Auth Section */}
                        <div id="auth-nav-container" className="flex items-center space-x-3">
                            {isLoggedIn ? (
                                <div id="logged-in-profile" className="flex items-center space-x-3 relative">
                                    {user && user.name && (
                                        <span className={`hidden lg:block font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {user.name.split(' ')[0]}
                                        </span>
                                    )}
                                    
                                    <button 
                                        id="profile-icon-button" 
                                        className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg ring-2 ring-primary-300/50 ring-offset-2 hover:ring-offset-1 transition-all duration-300 overflow-hidden"
                                        onClick={() => setIsDropdownOpen(prev => !prev)}
                                    >
                                        {renderAvatar()}
                                    </button>
                                    
                                    <div id="profile-dropdown-menu" className={`absolute right-0 top-16 mt-2 w-56 ${isDropdownOpen ? 'block' : 'hidden'} rounded-lg shadow-xl divide-y ${isDarkMode ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'} z-50`}>
                                        {user && (
                                            <>
                                                <div className={`px-4 py-3 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                                                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                                                </div>
                                                <div className="py-1">
                                                    <Link to="/courses" className={`flex px-4 py-2 text-sm items-center transition-colors duration-200 ${
                                                        isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                                    }`}>
                                                        <i data-feather="book-open" className="w-4 h-4 mr-2"></i> My Courses
                                                    </Link>
                                                    <Link to="/problems" className={`flex px-4 py-2 text-sm items-center transition-colors duration-200 ${
                                                        isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                                    }`}>
                                                        <i data-feather="target" className="w-4 h-4 mr-2"></i> My Progress
                                                    </Link>
                                                    <Link to="/settings" className={`flex px-4 py-2 text-sm items-center transition-colors duration-200 ${
                                                        isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                                    }`}>
                                                        <i data-feather="settings" className="w-4 h-4 mr-2"></i> Settings
                                                    </Link>
                                                    <button 
                                                        id="sign-out-button" 
                                                        className={`w-full text-left flex items-center px-4 py-2 text-sm transition-colors duration-200 ${
                                                            isDarkMode ? 'text-red-400 hover:bg-red-500/20 hover:text-red-300' : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                                                        }`}
                                                        onClick={handleLogout}
                                                    >
                                                        <i data-feather="log-out" className="w-4 h-4 mr-2"></i> Sign Out
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div id="logged-out-buttons" className="flex space-x-3">
                                    <Link to="/signin" className="dark-btn-secondary hidden lg:inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300">
                                        Sign In
                                    </Link>
                                    <Link to="/signup" className="dark-btn inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300">
                                        Join for Free
                                    </Link>
                                </div>
                            )}
                        </div>
                            
                        {/* Mobile menu button */}
                        <div className="flex items-center sm:hidden ml-2">
                            <button 
                                id="mobile-menu-button" 
                                type="button" 
                                className={`inline-flex items-center justify-center p-2 rounded-lg transition-all duration-300 ${
                                    isDarkMode 
                                        ? 'text-gray-400 hover:text-white hover:bg-gray-700/50' 
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                                }`}
                                onClick={toggleMobileMenu}
                            >
                                <i data-feather={menuIcon} className="w-6 h-6"></i>
                            </button>
                        </div>
                    </div>
                    
                    {/* Enhanced Mobile menu - Now theme-aware */}
                    <div className={`sm:hidden fixed inset-0 z-40 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
                        {/* Backdrop */}
                        <div 
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={toggleMobileMenu}
                        ></div>
                        
                        {/* Menu Panel */}
                        <div className={`absolute right-0 top-0 w-80 h-full shadow-2xl border-l transform transition-transform duration-300 ease-in-out ${mobileBgClass} ${mobileBorderClass}`}>
                            <div className="flex flex-col h-full">
                                {/* Header */}
                                <div className={`flex items-center justify-between p-4 border-b ${mobileBorderClass} ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
                                            <i data-feather="code" className="text-white w-4 h-4"></i>
                                        </div>
                                        <span className={`ml-2 text-lg font-bold ${mobileTextClass}`}>CS Studio</span>
                                    </div>
                                    <button 
                                        onClick={toggleMobileMenu}
                                        className={`p-2 rounded-lg transition-colors duration-200 ${
                                            isDarkMode 
                                                ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        <i data-feather="x" className="w-5 h-5"></i>
                                    </button>
                                </div>

                                {/* Scrollable Content */}
                                <div className="flex-1 overflow-y-auto pb-4"> {/* Added pb-4 for space above the footer */}
                                    {/* User Profile Section */}
                                    {isLoggedIn && user && (
                                        <div className={`p-4 border-b ${mobileBorderClass} ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
                                            <div className="flex items-center space-x-3">
                                                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white overflow-hidden shadow-lg">
                                                    {renderAvatar()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-base font-semibold truncate ${mobileTextClass}`}>{user.name}</p>
                                                    <p className={`text-sm truncate ${mobileSecondaryTextClass}`}>{user.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Quick Actions - Removed original quick links since they are now in the bottom nav */}
                                    {/* I will keep the settings/progress link, and remove links that are now primary. */}
                                    {isLoggedIn && (
                                        <div className={`p-4 border-b ${mobileBorderClass}`}>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Link 
                                                    to="/progress" 
                                                    className={`flex flex-col items-center p-3 rounded-lg transition-colors duration-200 group ${mobileCardBgClass} ${mobileHoverBgClass}`}
                                                >
                                                    <i data-feather="bar-chart-2" className="w-5 h-5 text-primary-500 mb-1 group-hover:scale-110 transition-transform"></i>
                                                    <span className={`text-xs group-hover:scale-105 transition-transform ${
                                                        isDarkMode ? 'text-gray-300 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'
                                                    }`}>Progress</span>
                                                </Link>
                                                <Link 
                                                    to="/settings" 
                                                    className={`flex flex-col items-center p-3 rounded-lg transition-colors duration-200 group ${mobileCardBgClass} ${mobileHoverBgClass}`}
                                                >
                                                    <i data-feather="settings" className="w-5 h-5 text-primary-500 mb-1 group-hover:scale-110 transition-transform"></i>
                                                    <span className={`text-xs group-hover:scale-105 transition-transform ${
                                                        isDarkMode ? 'text-gray-300 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'
                                                    }`}>Settings</span>
                                                </Link>
                                            </div>
                                        </div>
                                    )}

                                    {/* Search Bar */}
                                    {isLoggedIn && (
                                        <div className={`p-4 border-b ${mobileBorderClass}`}>
                                            {renderSearch(true)}
                                        </div>
                                    )}

                                    {/* SECONDARY Navigation Links (Leaderboard & Community) */}
                                    {isLoggedIn && SECONDARY_NAV_ITEMS.length > 0 && (
                                        <div className="p-2 border-b">
                                            <p className={`px-4 py-2 text-xs uppercase font-semibold ${mobileSecondaryTextClass}`}>More</p>
                                            <nav className="space-y-1">
                                                {renderNavLinks(true, SECONDARY_NAV_ITEMS)}
                                            </nav>
                                        </div>
                                    )}

                                    {/* Theme Toggle */}
                                    <div className={`p-4 border-t ${mobileBorderClass}`}>
                                        <button 
                                            onClick={handleThemeToggle}
                                            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors duration-200 group ${mobileCardBgClass} ${mobileHoverBgClass}`}
                                        >
                                            <div className="flex items-center">
                                                <i data-feather={themeIcon} className={`w-5 h-5 mr-3 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`}></i>
                                                <span className={`group-hover:scale-105 transition-transform ${
                                                    isDarkMode ? 'text-gray-300 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'
                                                }`}>
                                                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                                                </span>
                                            </div>
                                            <div className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                                                isDarkMode ? 'bg-primary-500' : 'bg-gray-300'
                                            }`}>
                                                <div className={`w-5 h-5 bg-white rounded-full transform transition-transform duration-200 ${
                                                    isDarkMode ? 'translate-x-7' : 'translate-x-1'
                                                }`}></div>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className={`p-4 border-t ${mobileBorderClass} ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
                                    {isLoggedIn ? (
                                        <div className="space-y-2">
                                            <button 
                                                onClick={handleLogout}
                                                className={`w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200 group ${
                                                    isDarkMode 
                                                        ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300' 
                                                        : 'bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700'
                                                }`}
                                            >
                                                <i data-feather="log-out" className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform"></i>
                                                Sign Out
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Link 
                                                to="/signup" 
                                                className="w-full dark-btn inline-flex items-center justify-center p-3 rounded-lg text-sm font-medium transition-all duration-200"
                                                onClick={toggleMobileMenu}
                                            >
                                                <i data-feather="user-plus" className="w-4 h-4 mr-2"></i>
                                                Join for Free
                                            </Link>
                                            <Link 
                                                to="/signin" 
                                                className="w-full dark-btn-secondary inline-flex items-center justify-center p-3 rounded-lg text-sm font-medium transition-all duration-200"
                                                onClick={toggleMobileMenu}
                                            >
                                                <i data-feather="log-in" className="w-4 h-4 mr-2"></i>
                                                Sign In
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            
            {/* 2. MOBILE BOTTOM NAVIGATION (STATIC) */}
            {isLoggedIn && (
                <div id="mobile-bottom-nav" className={`fixed bottom-0 left-0 right-0 h-16 sm:hidden z-40 shadow-2xl ${isDarkMode ? 'dark-gradient border-t border-gray-700' : 'bg-white border-t border-gray-200'}`}>
                    <div className="h-full flex justify-around">
                        {renderNavLinks(true, PRIMARY_NAV_ITEMS)}
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
