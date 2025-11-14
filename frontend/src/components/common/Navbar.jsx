// frontend/src/components/common/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from "../../hooks/useAuth.jsx"; 
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { useNotifications } from '../../hooks/useNotifications.js';
import * as feather from 'feather-icons';
import SearchBar from './SearchBar.jsx'; 

// Data that describes all navigation links
const PRIMARY_NAV_ITEMS = [
    { name: 'Home', path: '/', icon: 'home' },
    { name: 'Courses', path: '/courses', icon: 'book' },
    { name: 'Roadmap', path: '/roadmaps', icon: 'map' },
    { name: 'Problems', path: '/problems', icon: 'target' },
];

const SECONDARY_NAV_ITEMS = [
    { name: 'Leaderboard', path: '/leaderboard', icon: 'award' },
    { name: 'Community', path: '/community', icon: 'users' }
];

const NAV_ITEMS = [...PRIMARY_NAV_ITEMS, ...SECONDARY_NAV_ITEMS];

const Navbar = () => {
    const { isLoggedIn, user, logout, loading } = useAuth();
    const { theme, toggleTheme, isDark } = useTheme();
    const { 
        notifications, 
        unreadCount, 
        loading: notificationsLoading, 
        markAsRead, 
        markAllAsRead, 
        clearAllNotifications,
        deleteNotification,
        refreshNotifications
    } = useNotifications();
    const location = useLocation();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    
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

    // Handle content spacing for fixed navbars
    useEffect(() => {
        if (isLoggedIn) {
            document.body.classList.add('mobile-nav-spacing');
        } else {
            document.body.classList.remove('mobile-nav-spacing');
            document.body.classList.add('logged-out-top-spacing'); 
        }

        return () => {
            document.body.classList.remove('mobile-nav-spacing', 'logged-out-top-spacing');
        };
    }, [isLoggedIn]);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (isDropdownOpen && !event.target.closest('#logged-in-profile')) {
                setIsDropdownOpen(false);
            }
            if (isNotificationsOpen && !event.target.closest('#notifications-container')) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, [isDropdownOpen, isNotificationsOpen]);
    
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);
    
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(prev => !prev);
    }

    const toggleNotifications = async () => {
        if (!isNotificationsOpen && unreadCount > 0) {
            // Mark all as read when opening notifications
            try {
                await markAllAsRead();
            } catch (error) {
                console.error('Failed to mark notifications as read:', error);
            }
        }
        setIsNotificationsOpen(prev => !prev);
    }

    const handleNotificationClick = async (notification) => {
        try {
            if (!notification.read) {
                await markAsRead(notification._id);
            }
            setIsNotificationsOpen(false);
            
            // Navigate to notification link if available
            if (notification.link) {
                navigate(notification.link);
            }
        } catch (error) {
            console.error('Failed to handle notification click:', error);
        }
    }

    const handleClearAllNotifications = async () => {
        try {
            await clearAllNotifications();
            setIsNotificationsOpen(false);
        } catch (error) {
            console.error('Failed to clear notifications:', error);
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    }

    const formatNotificationTime = (createdAt) => {
        const now = new Date();
        const created = new Date(createdAt);
        const diffInSeconds = Math.floor((now - created) / 1000);
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInDays < 7) return `${diffInDays}d ago`;
        
        return created.toLocaleDateString();
    };

    const getNotificationIcon = (type) => {
        const icons = {
            course: 'book',
            achievement: 'award',
            challenge: 'target',
            system: 'info',
            progress: 'trending-up',
            community: 'users'
        };
        return icons[type] || 'bell';
    };

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
            const desktopClasses = `h-full flex items-center px-4 pt-1 text-sm ${isActive ? 'active-nav' : 'text-gray-300 hover:text-white'}`;
            
            const mobileClasses = `flex items-center px-4 py-3 text-base font-medium rounded-lg mx-2 transition-all duration-200 border-l-4 ${
                isActive 
                    ? 'bg-primary-500/20 text-primary-600 border-primary-500' 
                    : `border-transparent ${isDark ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
            }`;
            
            const bottomNavClasses = `flex flex-col items-center justify-center p-2 pt-2.5 transition-colors duration-200 ${
                isActive
                    ? 'text-primary-500'
                    : (isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
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

    const renderNotifications = () => {
        return (
            <div id="notifications-container" className="relative">
                {/* Notification Bell Button */}
                <button 
                    onClick={toggleNotifications}
                    className={`relative p-2 rounded-lg transition-all duration-300 ${
                        isDark 
                            ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                    }`}
                    title="Notifications"
                    disabled={notificationsLoading}
                >
                    <i data-feather="bell" className="w-5 h-5"></i>
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 text-xs font-bold rounded-full bg-red-500 text-white animate-pulse">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                    {notificationsLoading && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 text-xs font-bold rounded-full bg-gray-500 text-white">
                            ...
                        </span>
                    )}
                </button>

                {/* Notifications Dropdown */}
                {isNotificationsOpen && (
                    <div className={`absolute right-0 top-12 mt-2 w-80 sm:w-96 rounded-lg shadow-xl z-50 ${
                        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                    }`}>
                        {/* Header */}
                        <div className={`flex items-center justify-between p-4 border-b ${
                            isDark ? 'border-gray-700' : 'border-gray-200'
                        }`}>
                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                                        {unreadCount} new
                                    </span>
                                )}
                            </h3>
                            <div className="flex items-center space-x-2">
                                {notifications.length > 0 && unreadCount > 0 && (
                                    <button 
                                        onClick={handleMarkAllAsRead}
                                        className={`text-xs px-2 py-1 rounded transition-colors ${
                                            isDark 
                                                ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/20' 
                                                : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                                        }`}
                                    >
                                        Mark all read
                                    </button>
                                )}
                                {notifications.length > 0 && (
                                    <button 
                                        onClick={handleClearAllNotifications}
                                        className={`text-xs px-2 py-1 rounded transition-colors ${
                                            isDark 
                                                ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/20' 
                                                : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                                        }`}
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                                    <i data-feather="bell-off" className={`w-12 h-12 mb-3 ${
                                        isDark ? 'text-gray-600' : 'text-gray-400'
                                    }`}></i>
                                    <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                                        No notifications yet
                                    </p>
                                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        We'll notify you when something important happens
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {notifications.map((notification) => (
                                        <div 
                                            key={notification._id}
                                            className={`p-4 transition-colors cursor-pointer group ${
                                                !notification.read 
                                                    ? (isDark ? 'bg-blue-500/10 border-l-4 border-blue-500' : 'bg-blue-50 border-l-4 border-blue-500')
                                                    : (isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50')
                                            }`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className={`flex-shrink-0 mt-1 ${
                                                    !notification.read 
                                                        ? (isDark ? 'text-blue-400' : 'text-blue-500')
                                                        : (isDark ? 'text-gray-500' : 'text-gray-400')
                                                }`}>
                                                    <i data-feather={getNotificationIcon(notification.type)} className="w-4 h-4"></i>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium ${
                                                        isDark ? 'text-white' : 'text-gray-900'
                                                    }`}>
                                                        {notification.title}
                                                    </p>
                                                    <p className={`text-sm mt-1 ${
                                                        isDark ? 'text-gray-300' : 'text-gray-600'
                                                    }`}>
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <p className={`text-xs ${
                                                            isDark ? 'text-gray-500' : 'text-gray-400'
                                                        }`}>
                                                            {formatNotificationTime(notification.createdAt)}
                                                        </p>
                                                        {notification.important && (
                                                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                                                                isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                                Important
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteNotification(notification._id);
                                                    }}
                                                    className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all ${
                                                        isDark 
                                                            ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/20' 
                                                            : 'text-gray-300 hover:text-red-600 hover:bg-red-50'
                                                    }`}
                                                >
                                                    <i data-feather="x" className="w-3 h-3"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className={`p-3 border-t ${
                                isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
                            }`}>
                                <Link 
                                    to="/notifications"
                                    className={`block text-center text-sm font-medium transition-colors ${
                                        isDark 
                                            ? 'text-primary-400 hover:text-primary-300' 
                                            : 'text-primary-600 hover:text-primary-700'
                                    }`}
                                    onClick={() => setIsNotificationsOpen(false)}
                                >
                                    View All Notifications
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // Theme-aware background and text classes
    const mobileBgClass = isDark ? 'bg-gray-900' : 'bg-white';
    const mobileBorderClass = isDark ? 'border-gray-700' : 'border-gray-200';
    const mobileTextClass = isDark ? 'text-white' : 'text-gray-900';
    const mobileSecondaryTextClass = isDark ? 'text-gray-400' : 'text-gray-500';
    const mobileHoverBgClass = isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100';
    const mobileCardBgClass = isDark ? 'bg-gray-800/50' : 'bg-gray-50';
    
    if (loading) {
        return <nav className="dark-gradient shadow-lg fixed top-0 left-0 w-full z-50 h-16 border-b border-gray-700 opacity-0"></nav>;
    }

    // Get the correct theme icon
    const themeIcon = isDark ? 'sun' : 'moon';
    const menuIcon = isMobileMenuOpen ? 'x' : 'menu';

    return (
        <>
            {/* 1. TOP NAVBAR (STATIC) */}
            <nav className={`${isDark ? 'dark-gradient' : 'bg-white shadow-lg'} fixed top-0 left-0 w-full z-50 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                {/* Main Flex Container */}
                <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                    
                    {/* 1. LEFT SIDE: LOGO + NAV LINKS */}
                    <div className="flex items-center h-full">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="flex items-center">
                                <div className="h-8 w-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
                                    <i data-feather="code" className="text-white w-4 h-4 logo-icon"></i>
                                </div>
                                <span className={`ml-2 text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>CS Studio</span>
                            </Link>
                        </div>
                        
                        {/* Desktop Navigation Links - Combined NAV_ITEMS */}
                        {isLoggedIn && (
                            <div className="hidden h-full items-center sm:ml-6 sm:flex sm:space-x-2 lg:space-x-6">
                                {renderNavLinks()}
                            </div>
                        )}
                    </div>

                    {/* 2. RIGHT SIDE: SEARCH, THEME, NOTIFICATIONS & AUTH/PROFILE */}
                    <div className="flex items-center space-x-3 h-full">
                        
                        {/* Desktop Search Bar */}
                        {isLoggedIn && (
                            <div className="hidden sm:block w-48 lg:w-64 mr-4">
                                {renderSearch(false)}
                            </div>
                        )}
                        
                        {/* Theme Toggle */}
                        <button 
                            onClick={toggleTheme}
                            className={`hidden sm:block p-2 rounded-lg transition-all duration-300 ${
                                isDark 
                                    ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                            }`}
                            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            <i data-feather={themeIcon} className="w-5 h-5"></i>
                        </button>

                        {/* Notifications */}
                        {isLoggedIn && (
                            <div className="hidden sm:block">
                                {renderNotifications()}
                            </div>
                        )}

                        {/* Auth Section */}
                        <div id="auth-nav-container" className="flex items-center space-x-3">
                            {isLoggedIn ? (
                                <div id="logged-in-profile" className="flex items-center space-x-3 relative">
                                    {user && user.name && (
                                        <span className={`hidden lg:block font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
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
                                    
                                    <div id="profile-dropdown-menu" className={`absolute right-0 top-16 mt-2 w-56 ${isDropdownOpen ? 'block' : 'hidden'} rounded-lg shadow-xl divide-y ${isDark ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'} z-50`}>
                                        {user && (
                                            <>
                                                <div className={`px-4 py-3 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                                                </div>
                                                <div className="py-1">
                                                    <Link 
                                                        to="/my-courses" 
                                                        className={`flex px-4 py-2 text-sm items-center transition-colors duration-200 ${
                                                            isDark ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                                        }`}
                                                        onClick={() => setIsDropdownOpen(false)}
                                                    >
                                                        <i data-feather="book-open" className="w-4 h-4 mr-2"></i> My Courses
                                                    </Link>
                                                    <Link 
                                                        to="/my-progress" 
                                                        className={`flex px-4 py-2 text-sm items-center transition-colors duration-200 ${
                                                            isDark ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                                        }`}
                                                        onClick={() => setIsDropdownOpen(false)}
                                                    >
                                                        <i data-feather="bar-chart-2" className="w-4 h-4 mr-2"></i> My Progress
                                                    </Link>
                                                    <Link 
                                                        to="/notifications"
                                                        className={`flex px-4 py-2 text-sm items-center transition-colors duration-200 ${
                                                            isDark ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                                        }`}
                                                        onClick={() => setIsDropdownOpen(false)}
                                                    >
                                                        <i data-feather="bell" className="w-4 h-4 mr-2"></i> Notifications
                                                        {unreadCount > 0 && (
                                                            <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                                                {unreadCount}
                                                            </span>
                                                        )}
                                                    </Link>
                                                    <Link 
                                                        to="/settings" 
                                                        className={`flex px-4 py-2 text-sm items-center transition-colors duration-200 ${
                                                            isDark ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                                        }`}
                                                        onClick={() => setIsDropdownOpen(false)}
                                                    >
                                                        <i data-feather="settings" className="w-4 h-4 mr-2"></i> Settings
                                                    </Link>
                                                    <button 
                                                        id="sign-out-button" 
                                                        className={`w-full text-left flex items-center px-4 py-2 text-sm transition-colors duration-200 ${
                                                            isDark ? 'text-red-400 hover:bg-red-500/20 hover:text-red-300' : 'text-red-600 hover:bg-red-50 hover:text-red-700'
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
                                    isDark 
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
                                <div className={`flex items-center justify-between p-4 border-b ${mobileBorderClass} ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
                                            <i data-feather="code" className="text-white w-4 h-4"></i>
                                        </div>
                                        <span className={`ml-2 text-lg font-bold ${mobileTextClass}`}>CS Studio</span>
                                    </div>
                                    <button 
                                        onClick={toggleMobileMenu}
                                        className={`p-2 rounded-lg transition-colors duration-200 ${
                                            isDark 
                                                ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        <i data-feather="x" className="w-5 h-5"></i>
                                    </button>
                                </div>

                                {/* Scrollable Content */}
                                <div className="flex-1 overflow-y-auto pb-4">
                                    {/* User Profile Section */}
                                    {isLoggedIn && user && (
                                        <div className={`p-4 border-b ${mobileBorderClass} ${isDark ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
                                            <div className="flex items-center space-x-3">
                                                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white overflow-hidden shadow-lg">
                                                    {renderAvatar()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-base font-semibold truncate ${mobileTextClass}`}>{user.name}</p>
                                                    <p className={`text-sm truncate ${mobileSecondaryTextClass}`}>{user.email}</p>
                                                </div>
                                                {/* Mobile Notification Bell */}
                                                {isLoggedIn && (
                                                    <button 
                                                        onClick={toggleNotifications}
                                                        className="relative p-2"
                                                    >
                                                        <i data-feather="bell" className={`w-5 h-5 ${mobileSecondaryTextClass}`}></i>
                                                        {unreadCount > 0 && (
                                                            <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 text-xs font-bold rounded-full bg-red-500 text-white">
                                                                {unreadCount > 9 ? '9+' : unreadCount}
                                                            </span>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Quick Actions */}
                                    {isLoggedIn && (
                                        <div className={`p-4 border-b ${mobileBorderClass}`}>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Link 
                                                    to="/my-progress" 
                                                    className={`flex flex-col items-center p-3 rounded-lg transition-colors duration-200 group ${mobileCardBgClass} ${mobileHoverBgClass}`}
                                                    onClick={toggleMobileMenu}
                                                >
                                                    <i data-feather="bar-chart-2" className="w-5 h-5 text-primary-500 mb-1 group-hover:scale-110 transition-transform"></i>
                                                    <span className={`text-xs group-hover:scale-105 transition-transform ${
                                                        isDark ? 'text-gray-300 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'
                                                    }`}>My Progress</span>
                                                </Link>
                                                <Link 
                                                    to="/my-courses" 
                                                    className={`flex flex-col items-center p-3 rounded-lg transition-colors duration-200 group ${mobileCardBgClass} ${mobileHoverBgClass}`}
                                                    onClick={toggleMobileMenu}
                                                >
                                                    <i data-feather="book-open" className="w-5 h-5 text-primary-500 mb-1 group-hover:scale-110 transition-transform"></i>
                                                    <span className={`text-xs group-hover:scale-105 transition-transform ${
                                                        isDark ? 'text-gray-300 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'
                                                    }`}>My Courses</span>
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

                                    {/* SECONDARY Navigation Links */}
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
                                            onClick={toggleTheme}
                                            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors duration-200 group ${mobileCardBgClass} ${mobileHoverBgClass}`}
                                        >
                                            <div className="flex items-center">
                                                <i data-feather={themeIcon} className={`w-5 h-5 mr-3 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`}></i>
                                                <span className={`group-hover:scale-105 transition-transform ${
                                                    isDark ? 'text-gray-300 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'
                                                }`}>
                                                    {isDark ? 'Light Mode' : 'Dark Mode'}
                                                </span>
                                            </div>
                                            <div className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                                                isDark ? 'bg-primary-500' : 'bg-gray-300'
                                            }`}>
                                                <div className={`w-5 h-5 bg-white rounded-full transform transition-transform duration-200 ${
                                                    isDark ? 'translate-x-7' : 'translate-x-1'
                                                }`}></div>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className={`p-4 border-t ${mobileBorderClass} ${isDark ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
                                    {isLoggedIn ? (
                                        <div className="space-y-2">
                                            <button 
                                                onClick={handleLogout}
                                                className={`w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200 group ${
                                                    isDark 
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
                <div id="mobile-bottom-nav" className={`fixed bottom-0 left-0 right-0 h-16 sm:hidden z-40 shadow-2xl ${isDark ? 'dark-gradient border-t border-gray-700' : 'bg-white border-t border-gray-200'}`}>
                    <div className="h-full flex justify-around">
                        {renderNavLinks(true, PRIMARY_NAV_ITEMS)}
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;