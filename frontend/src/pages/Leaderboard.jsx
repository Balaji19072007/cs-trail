// frontend/src/pages/Leaderboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as feather from 'feather-icons';
import { useAuth } from '../hooks/useAuth.jsx';
import { fetchLeaderboard } from '../api/leaderboardApi.js'; // <-- NEW IMPORT

// --- PLACEHOLDER FOR TOTAL USERS ---
const TOTAL_MOCK_USERS_COUNT = 15000; 

// --- DYNAMIC MOCK DATA GENERATION (Fallback) ---
// This entire block is needed to run the fallback logic when the API is down.
const generateMockUsers = (count = 50) => {
    const names = ["Sarah Chen", "Alex Johnson", "Priya Patel", "David Wilson", "Maria Garcia", "Kevin Brown", "Lisa Wong", "Tom Black", "Jenny Lee", "Mark Davis", "Chloe Smith", "Ben Hall", "Ethan Miller", "Aisha Khan", "Jake Ryan", "Sophie Green", "Noah Parker", "Mia Lewis", "Ryan Kim", "Ava Scott"];
    const users = [];

    // Generate high-ranking mock users
    for (let i = 1; i <= count - 1; i++) { 
        const nameIndex = i % names.length;
        const baseSolved = Math.max(15, 550 - i * 8); 
        const basePoints = Math.floor(baseSolved * 10);

        const user = {
            rank: i,
            name: names[nameIndex] + " (Mock #" + i + ")",
            username: names[nameIndex].toLowerCase().replace(/\s/g, '').replace(/[^\w]/g, '') + i,
            solved: Math.floor(baseSolved + Math.random() * 5),
            accuracy: Math.floor(75 + Math.random() * 20),
            streak: Math.floor(Math.random() * 60),
            points: Math.floor(basePoints + Math.random() * 100),
            isCurrentUser: false,
        };
        users.push(user);
    }
    return users;
};
const INITIAL_MOCK_USERS = generateMockUsers(50);
// --- END MOCK DATA AREA ---


// --- HELPER FUNCTIONS ---
const generateInitials = (name) => {
    if (typeof name !== 'string' || !name) {
        return 'U'; 
    }
    
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
        return parts.map(n => n[0]).join('').toUpperCase().substring(0, 2);
    } else if (parts.length === 1 && parts[0].length > 0) {
        return parts[0].charAt(0).toUpperCase();
    }
    return 'U';
};

// --- COMPONENTS ---

// Redesigned Podium Card
const PodiumCard = ({ user, rank }) => {
    const initials = generateInitials(user.name);
    
    const getRankClass = (rank) => {
        switch(rank) {
            case 1: return 'rank-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-yellow-500/50 border-4 border-yellow-400';
            case 2: return 'rank-2 bg-gradient-to-r from-gray-400 to-gray-500 text-black shadow-gray-500/50 border-4 border-gray-400';
            case 3: return 'rank-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-amber-700/50 border-4 border-amber-600';
            default: return 'bg-gray-200';
        }
    };

    const getRankOrder = (rank) => {
        switch(rank) {
            case 1: return 'order-2'; // Center
            case 2: return 'order-3'; // Right
            case 3: return 'order-1'; // Left
            default: return '';
        }
    };

    const getSizeClass = (rank) => {
        return rank === 1 ? 'h-14 w-14 text-lg md:h-24 md:w-24 md:text-3xl' : 'h-12 w-12 text-base md:h-20 md:w-20 md:text-2xl';
    };
    
    const getNameSizeClass = (rank) => {
        return rank === 1 ? 'text-sm sm:text-lg md:text-xl' : 'text-xs sm:text-base md:text-lg';
    };

    const getPointsColor = (rank) => {
        return rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-400' : 'text-amber-500';
    }

    return (
        <div className={`podium flex flex-col items-center p-0 sm:p-2 md:p-4 ${getRankOrder(rank)}`}>
            {rank === 1 && (
                <i data-feather="award" className="w-6 h-6 text-yellow-400 mb-1 transform scale-125"></i>
            )}
            {rank !== 1 && (
                 <div className="h-7"></div> 
            )}
            
            <div 
                className="bg-gray-900 rounded-xl shadow-xl px-2 py-3 md:p-6 w-full text-center user-card card-hover transition-all duration-300 border border-gray-700/50"
                style={{ transform: rank === 1 ? 'translateY(-5px)' : 'translateY(0)' }} 
            >
                <div className="flex justify-center mb-1 md:mb-4">
                    <div className={`${getSizeClass(rank)} rounded-full ${getRankClass(rank)} flex items-center justify-center text-white font-bold shadow-md`}>
                        {initials}
                    </div>
                </div>
                
                <h3 className={`font-bold text-white ${getNameSizeClass(rank)} mt-1 md:mt-2 truncate`}>{user.name}</h3>
                
                <p className="text-gray-500 text-xs hidden md:block">@{user.username}</p> 
                
                <div className="hidden md:flex mt-4 border-t border-gray-700/50 pt-4 justify-between text-center">
                    <div className="flex flex-col items-center">
                        <span className={`text-white font-extrabold text-xl`}>{user.solved}</span>
                        <div className="text-gray-500 text-xs mt-1">Solved</div>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className={`text-white font-extrabold text-xl`}>{user.accuracy}%</span>
                        <div className="text-gray-500 text-xs mt-1">Accuracy</div>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className={`font-extrabold text-xl ${getPointsColor(rank)}`}>{user.points}</span>
                        <div className="text-gray-500 text-xs mt-1">Points</div>
                    </div>
                </div>
                
            </div>
            <div className={`mt-1 text-lg sm:text-xl font-black ${getPointsColor(rank)}`}>
                 # {rank}
            </div>
        </div>
    );
};


// Redesigned Table Row
const LeaderboardTableRow = ({ user }) => {
    const initials = generateInitials(user.name);
    const isCurrentUser = user.isCurrentUser;
    
    const rowClass = isCurrentUser 
        ? 'bg-primary-500/20 hover:bg-primary-500/30 font-semibold' 
        : 'hover:bg-gray-800/50';

    const textClass = isCurrentUser ? 'text-gray-200' : 'text-gray-400';
    const mainTextClass = isCurrentUser ? 'text-white font-semibold' : 'text-white';
    
    return (
        <tr className={`bg-gray-900 border-b border-gray-700/50 transition-colors duration-200 ${rowClass}`}>
            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isCurrentUser ? 'text-primary-400' : 'text-gray-400'}`}>{user.rank}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex items-center">
                    <div className={`h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold mr-3 ${isCurrentUser ? 'bg-primary-500/50' : ''}`}>
                        <span className={mainTextClass}>{initials}</span>
                    </div>
                    <div className={mainTextClass}>{user.name}</div>
                </div>
            </td>
            <td className={`px-6 py-4 whitespace-nowrap text-sm ${mainTextClass}`}>{user.solved}</td>
            <td className={`px-6 py-4 whitespace-nowrap text-sm ${textClass}`}>{user.accuracy}%</td>
            <td className={`px-6 py-4 whitespace-nowrap text-sm ${textClass}`}>
                <i data-feather="award" className="w-4 h-4 text-orange-500 mr-1 inline-block"></i> {user.streak} days
            </td>
            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isCurrentUser ? 'text-primary-400' : 'text-white'}`}>{user.points}</td>
        </tr>
    );
};

// --- MAIN COMPONENT ---
const Leaderboard = () => {
    const { isLoggedIn, user } = useAuth(); 

    const [leaderboardData, setLeaderboardData] = useState([]); 
    const [timeframe, setTimeframe] = useState('all-time');
    const [category, setCategory] = useState('all');
    const [isVisible, setIsVisible] = useState(false); 
    const [isLoading, setIsLoading] = useState(true); 
    
    // Default stats for current user (used if they are not in the top 50 list)
    const [currentUserStats] = useState({
        name: user?.name || "You",
        username: user?.username || "currentuser",
        // Mocked default stats based on an average user who is logged in
        solved: 42, 
        accuracy: 85,
        streak: 7,
        points: 500,
    });
    
    // Function to fetch real data from the backend
    const fetchLeaderboardData = useCallback(async (tf, cat) => {
        setIsLoading(true);
        try {
            const apiData = await fetchLeaderboard(tf, cat);
            const finalData = compileLeaderboard(apiData, currentUserStats);
            setLeaderboardData(finalData);
        } catch (error) {
            console.error('API Error:', error);
            // Fallback to mock data if fetch errors (e.g., network issue)
            console.warn('Fetch error. Using mock data fallback.');
            const finalData = compileLeaderboard(INITIAL_MOCK_USERS, currentUserStats);
            setLeaderboardData(finalData);
        } finally {
            setIsLoading(false);
        }
    }, [currentUserStats, isLoggedIn, user]);


    // Helper function to integrate current user and apply final rank/status
    const compileLeaderboard = useCallback((apiData, currentUserData) => {
        let combinedData = [...apiData];
        
        if (isLoggedIn) {
            // Find the actual current user entry in the data (if they are in the top 50)
            // Note: API data uses username for matching
            const userInApi = apiData.find(u => u.username === currentUserData.username);

            if (userInApi) {
                // User is in the list, just mark them
                combinedData = combinedData.map(user => ({
                    ...user,
                    isCurrentUser: user.username === currentUserData.username
                }));
            } else {
                // User is not in the list (not top 50). Add a mocked entry at the bottom.
                const userEntry = { 
                    ...currentUserData, 
                    // Calculate a large rank to push them far down
                    rank: TOTAL_MOCK_USERS_COUNT - 50 + (apiData.length + 1), 
                    isCurrentUser: true,
                    name: `${currentUserData.name} (You)`,
                    // Use actual solved/accuracy/streak/points from currentUserStats
                    solved: currentUserData.solved,
                    accuracy: currentUserData.accuracy,
                    streak: currentUserData.streak,
                    points: currentUserData.points,
                };
                combinedData.push(userEntry);
            }
        }

        return combinedData;
    }, [isLoggedIn]); 

    
    // --- EFFECTS ---
    
    // Effect to fetch leaderboard data when filters change
    useEffect(() => {
        fetchLeaderboardData(timeframe, category);

        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }, [timeframe, category, fetchLeaderboardData]);
    
    // Handle scroll for floating buttons
    const handleScroll = useCallback(() => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // --- RENDER DATA ---
    const allUsers = leaderboardData;
    const topThree = allUsers.slice(0, 3);
    
    const currentUserListEntry = allUsers.find(user => user.isCurrentUser);

    const finalCurrentUserStats = currentUserListEntry || currentUserStats;
    
    const shouldShowBackToTop = isVisible;
    // Show current user card if they are logged in and their rank is below the top 3 visible on the podium.
    const shouldDisplayCurrentUserCard = isLoggedIn && finalCurrentUserStats && (finalCurrentUserStats.rank > 3);
    const totalUsers = TOTAL_MOCK_USERS_COUNT; 

    return (
        <div className="min-h-screen dark-gradient-secondary">
            {/* Hero Section */}
            <div className="gradient-bg text-white relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 floating hidden lg:block">
                    <i data-feather="award" className="w-40 h-40 text-primary-500 opacity-20"></i>
                </div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
                            <span className="block">Global</span>
                            <span className="block text-primary-400">Leaderboard</span>
                        </h1>
                        <p className="mt-4 text-xl max-w-3xl mx-auto text-gray-300">
                            See how you stack up against other developers and <span className="text-primary-400 font-semibold">climb the ranks</span> by solving more coding problems!
                        </p>
                        <div className="mt-10 flex justify-center">
                            <div className="inline-flex rounded-md shadow-xl">
                                <Link 
                                    to="/problems" 
                                    className="dark-btn-secondary inline-flex items-center justify-center px-6 py-3 border text-base font-medium rounded-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    <i data-feather="code" className="w-5 h-5 mr-2"></i>
                                    Start Solving Today
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-dark-gradient-secondary to-transparent z-0"></div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Controls and Stats */}
                <div className="bg-gray-900 rounded-xl shadow-lg p-6 mb-8 border border-gray-700/50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="mb-4 md:mb-0">
                            <h2 className="text-2xl font-bold text-white">Global Rankings</h2>
                            <p className="text-gray-400 mt-1">Showing top {allUsers.length} users. Data sorted by {timeframe.replace('-', ' ')} metrics.</p>
                        </div>
                        <div className="flex space-x-4">
                            <div className="relative">
                                <select 
                                    value={timeframe}
                                    onChange={(e) => setTimeframe(e.target.value)}
                                    className="form-input block w-full pl-3 pr-10 py-2 text-base rounded-md"
                                >
                                    <option value="all-time">All Time Points</option>
                                    <option value="monthly">Monthly Points</option>
                                    <option value="weekly">Weekly Streak</option>
                                    <option value="daily">Daily Solved</option>
                                </select>
                            </div>
                            <div className="relative">
                                <select 
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="form-input block w-full pl-3 pr-10 py-2 text-base rounded-md"
                                >
                                    <option value="all">All Categories</option>
                                    <option value="easy">Easy Problems</option>
                                    <option value="medium">Medium Problems</option>
                                    <option value="hard">Hard Problems</option>
                                    <option value="algorithms">Algorithms</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-10">
                        <svg className="animate-spin h-8 w-8 text-primary-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-400 mt-3">Fetching real-time rankings...</p>
                    </div>
                )}
                
                {/* Podium - The ordering [3] [1] [2] is permanent and tightly packed */}
                {!isLoading && topThree.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-12 sm:gap-6 md:grid-cols-3">
                        {topThree.map((user) => (
                            <PodiumCard key={user.username} user={user} rank={user.rank} />
                        ))}
                    </div>
                )}
                
                {/* Leaderboard Table */}
                {!isLoading && (
                    <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-700/50">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700/50">
                                <thead className="bg-gray-800">
                                    <tr>
                                        {['Rank', 'User', 'Solved', 'Accuracy', 'Streak', 'Points'].map(header => (
                                            <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/50">
                                    {allUsers.map(user => (
                                        <LeaderboardTableRow 
                                            key={user.rank} 
                                            user={user} 
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                {/* Current User Stats Card (Shows your rank if below top 3) */}
                {shouldDisplayCurrentUserCard && isLoggedIn && (
                    <div className="mt-8 bg-gradient-to-r from-primary-500/10 to-primary-600/10 rounded-xl shadow-lg p-6 mb-8 border border-primary-500/30">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-4 md:mb-0 flex items-center">
                                <div className={`h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-md font-bold text-white mr-4`}>
                                    {generateInitials(finalCurrentUserStats.name)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Your Position: <span className="text-primary-400 font-extrabold">#{finalCurrentUserStats.rank}</span></h3>
                                    <span className="text-sm text-gray-400">@{finalCurrentUserStats.username} out of {totalUsers.toLocaleString()} users</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
                                <div className="text-center">
                                    <div className="text-xl font-bold text-white">{finalCurrentUserStats.solved}</div>
                                    <div className="text-sm text-gray-500">Solved</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-white">{finalCurrentUserStats.accuracy}%</div>
                                    <div className="text-sm text-gray-500">Accuracy</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-orange-400">{finalCurrentUserStats.streak}</div>
                                    <div className="text-sm text-gray-500">Day Streak</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-primary-400">{finalCurrentUserStats.points}</div>
                                    <div className="text-sm text-gray-500">Points</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Final CTA (Consistent) */}
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
                                            to={isLoggedIn ? "/problems" : "/signup"} 
                                            className="dark-btn inline-flex items-center justify-center px-8 py-4 text-lg rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.03]"
                                        >
                                            {isLoggedIn ? 'Continue Solving Problems' : 'Start Free Trial Now'}
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
            
            {/* --- Floating Buttons --- */}
            
            <button 
                id="back-to-top" 
                onClick={scrollToTop}
                className={`fixed bottom-20 sm:bottom-6 right-6 h-12 w-12 rounded-full dark-gradient-accent text-white flex items-center justify-center transition-all duration-300 shadow-lg z-50 ${
                    shouldShowBackToTop ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
            >
                <i data-feather="arrow-up" className="h-5 w-5"></i>
            </button>
        </div>
    );
};

export default Leaderboard;
