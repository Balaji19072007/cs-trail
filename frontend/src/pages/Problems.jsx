// frontend/src/pages/Problems.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import * as feather from 'feather-icons';
import { fetchAllProblems } from '../api/problemApi.js'; 
import Loader from '../components/common/Loader.jsx'; 
import ProblemCard from '../components/problems/ProblemCard.jsx'; 

// --- CONSTANTS ---
const ProblemsPerPage = 12; 
const TOTAL_PROBLEMS_COUNT = 250; 

// Helper to get problem status from localStorage
const getProblemStatus = (problemId) => {
    try {
        const problemsStatus = JSON.parse(localStorage.getItem('problemsStatus') || '{}');
        return problemsStatus[problemId] || 'todo';
    } catch (error) {
        return 'todo';
    }
};

// FilterButton component remains the same
const FilterButton = ({ filterType, value, label, icon, isActive, onClick, children }) => {
    const baseClasses = "filter-btn w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 text-sm";
    const activeClasses = isActive 
        ? "bg-primary-500 text-white shadow-md" 
        : "dark-filter-default-style";
    
    return (
        <button 
            className={`${baseClasses} ${activeClasses}`}
            data-filter={filterType}
            data-value={value}
            onClick={() => onClick(filterType, value)}
        >
            {children || (
                <div className="flex items-center">
                    {icon && <i data-feather={icon} className={`w-4 h-4 mr-2 ${
                        isActive ? 'text-white' : ''
                    }`}></i>} 
                    {label}
                </div>
            )}
        </button>
    );
};

const Problems = () => {
    const { isLoggedIn } = useAuth();
    const [allProblems, setAllProblems] = useState([]); 
    const [isLoading, setIsLoading] = useState(true); 
    const [filters, setFilters] = useState({
        difficulty: 'all',
        status: 'all',
        language: 'all',
        search: ''
    });
    const [allFilteredProblems, setAllFilteredProblems] = useState([]);
    const [problemsToShow, setProblemsToShow] = useState(ProblemsPerPage); 
    const [isVisible, setIsVisible] = useState(false); 


    // Fetch data from API and normalize it
    useEffect(() => {
        const getProblems = async () => {
            try {
                const data = await fetchAllProblems();
                
                const normalizedProblems = data.map(problem => {
                    // Normalize case for filtering and consistent display
                    const language = problem.language.charAt(0).toUpperCase() + problem.language.slice(1).toLowerCase();
                    const difficulty = problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1).toLowerCase();
                    
                    // Get status from localStorage instead of random
                    const status = getProblemStatus(problem.problemId || problem.id);
                    
                    return {
                        ...problem,
                        id: problem.problemId, 
                        status: status, 
                        tags: [language, difficulty],
                        language: language,
                        difficulty: difficulty,
                    };
                });
                
                setAllProblems(normalizedProblems);
            } catch (err) {
                console.error('Failed to fetch problems from API:', err);
                setAllProblems([
                    { id: 999, problemId: 999, title: "API Fetch Error: Check Backend/CORS", difficulty: "Hard", language: "C", status: "todo", tags: ["error"] },
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        getProblems();
    }, []);


    useEffect(() => {
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    });

    // Filter problems whenever filters or allProblems list changes
    useEffect(() => {
        let result = allProblems.filter(problem => {
            const titleMatch = !filters.search || problem.title.toLowerCase().includes(filters.search.toLowerCase());
            
            // Perform case-insensitive matching for filters
            const langMatch = filters.language === 'all' || problem.language.toLowerCase() === filters.language.toLowerCase();
            const diffMatch = filters.difficulty === 'all' || problem.difficulty.toLowerCase() === filters.difficulty.toLowerCase();
            const statusMatch = filters.status === 'all' || problem.status.toLowerCase() === filters.status.toLowerCase(); 
            
            return titleMatch && langMatch && diffMatch && statusMatch; 
        });
        
        setAllFilteredProblems(result);
        setProblemsToShow(ProblemsPerPage); 
    }, [filters, allProblems]);

    
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

    // Handle "Load More Problems" click
    const handleLoadMore = () => {
        setProblemsToShow(prev => prev + ProblemsPerPage);
    };
    
    // Handle "Back to Top" click
    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);


    const handleFilterChange = (type, value) => {
        setFilters(prev => ({ ...prev, [type]: value }));
    };

    const handleReset = () => {
        setFilters({ 
            difficulty: 'all', 
            status: 'all', 
            language: 'all', 
            search: '' 
        });
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';
    };

    const handleSolveClick = (problemId, e) => {
        if (!isLoggedIn) {
            e.preventDefault();
            alert('You must be signed in to solve problems.');
        }
    };

    const visibleProblems = allFilteredProblems.slice(0, problemsToShow);
    const hasMoreProblems = allFilteredProblems.length > problemsToShow;

    const shouldShowBackToTop = !hasMoreProblems && isVisible;

    if (isLoading) {
        return <Loader message="Fetching coding challenges..." size="lg" />; 
    }

    return (
        <div className="min-h-screen dark-gradient-secondary">
            {/* Hero Section */}
            <div className="gradient-bg text-white relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 floating hidden lg:block">
                    <i data-feather="code" className="w-40 h-40 text-primary-500 opacity-20"></i>
                </div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
                            <span className="block">Sharpen Your</span>
                            <span className="block text-primary-400">Coding Skills</span>
                        </h1>
                        <p className="mt-4 text-xl max-w-3xl mx-auto text-gray-300">
                            Tackle our collection of {allProblems.length} language-agnostic coding challenges. Filter by difficulty, topic, or language to find your next goal!
                        </p>
                        <div className="mt-10 flex justify-center">
                            <div className="inline-flex rounded-md shadow-xl">
                                <Link 
                                    to="/code"
                                    onClick={(e) => handleSolveClick(null, e)}
                                    className="dark-btn inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white transition-all duration-300 transform hover:scale-105"
                                >
                                    <i data-feather="terminal" className="w-5 h-5 mr-2"></i>
                                    Open Code Editor
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="dark-gradient-secondary py-8 border-b border-gray-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">{allProblems.length}</div>
                            <div className="text-sm text-gray-400 mt-1">Problems</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">5</div>
                            <div className="text-sm text-gray-400 mt-1">Languages</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">100+</div>
                            <div className="text-sm text-gray-400 mt-1">Algorithms</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">95%</div>
                            <div className="text-sm text-gray-400 mt-1">Success Rate</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className="lg:w-1/4">
                        <div className="bg-gray-900 rounded-xl shadow-lg p-6 sticky top-24 border border-gray-700/50">
                            <h3 className="text-xl font-bold text-white mb-6">Filter & Search</h3>
                            
                            {/* Search Bar */}
                            <div className="mb-6">
                                <div className="relative search-container">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <i data-feather="search" className="w-5 h-5 text-gray-400"></i>
                                    </div>
                                    <input 
                                        type="text"
                                        id="search-input"
                                        placeholder="Search by title..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="form-input block w-full pl-10 pr-3 py-2 border rounded-lg leading-5 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-white text-sm"
                                    />
                                </div>
                            </div>
                            
                            {/* Language Filter */}
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-400 mb-2">Language</h4>
                                <select 
                                    value={filters.language}
                                    onChange={(e) => handleFilterChange('language', e.target.value)}
                                    className="form-input w-full px-3 py-2 border rounded-lg text-white text-sm"
                                >
                                    <option value="all">All Languages</option>
                                    {/* Use all 5 languages you defined */}
                                    {['C', 'Python', 'Java', 'C++', 'Javascript'].map(lang => (
                                        <option key={lang} value={lang}>{lang}</option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Difficulty Filter */}
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-400 mb-2">Difficulty</h4>
                                <div className="space-y-2">
                                    <FilterButton
                                        filterType="difficulty"
                                        value="all"
                                        label="All Difficulty"
                                        isActive={filters.difficulty === 'all'}
                                        onClick={handleFilterChange}
                                    />
                                    <FilterButton
                                        filterType="difficulty"
                                        value="Easy"
                                        label="Easy"
                                        isActive={filters.difficulty === 'Easy'}
                                        onClick={handleFilterChange}
                                    >
                                        <div className="flex items-center">
                                            <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                                            <span className={filters.difficulty === 'Easy' ? 'text-white' : 'text-green-300'}>Easy</span>
                                        </div>
                                    </FilterButton>
                                    <FilterButton
                                        filterType="difficulty"
                                        value="Medium"
                                        label="Medium"
                                        isActive={filters.difficulty === 'Medium'}
                                        onClick={handleFilterChange}
                                    >
                                        <div className="flex items-center">
                                            <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                                            <span className={filters.difficulty === 'Medium' ? 'text-white' : 'text-yellow-300'}>Medium</span>
                                        </div>
                                    </FilterButton>
                                    <FilterButton
                                        filterType="difficulty"
                                        value="Hard"
                                        label="Hard"
                                        isActive={filters.difficulty === 'Hard'}
                                        onClick={handleFilterChange}
                                    >
                                        <div className="flex items-center">
                                            <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                                            <span className={filters.difficulty === 'Hard' ? 'text-white' : 'text-red-300'}>Hard</span>
                                        </div>
                                    </FilterButton>
                                </div>
                            </div>
                            
                            {/* Status Filter */}
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-400 mb-2">My Status</h4>
                                <div className="space-y-2">
                                    <FilterButton
                                        filterType="status"
                                        value="all"
                                        label="All Problems"
                                        icon="list" 
                                        isActive={filters.status === 'all'}
                                        onClick={handleFilterChange}
                                    />
                                    <FilterButton
                                        filterType="status"
                                        value="solved"
                                        label="Solved"
                                        icon="check-circle" 
                                        isActive={filters.status === 'solved'}
                                        onClick={handleFilterChange}
                                    />
                                    <FilterButton
                                        filterType="status"
                                        value="attempted"
                                        label="Attempted"
                                        icon="clock" 
                                        isActive={filters.status === 'attempted'}
                                        onClick={handleFilterChange}
                                    />
                                    <FilterButton
                                        filterType="status"
                                        value="todo"
                                        label="To Do"
                                        icon="circle" 
                                        isActive={filters.status === 'todo'}
                                        onClick={handleFilterChange}
                                    />
                                </div>
                            </div>
                            
                            <button
                                onClick={handleReset}
                                className="w-full px-4 py-2 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors duration-300 mt-4"
                            >
                                <i data-feather="refresh-cw" className="w-4 h-4 mr-2 inline-block"></i>
                                Reset Filters
                            </button>
                        </div>
                    </div>
                    
                    {/* Problems Grid */}
                    <div className="lg:w-3/4"> 
                        {/* Problems Header */}
                        <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-700/50">
                             <h2 className="text-2xl font-bold text-white">
                                Problem List ({allFilteredProblems.length} results)
                            </h2>
                        </div>

                        
                        {/* Problems Container - REMOVED EXTRA SOLVE BUTTON WRAPPER */}
                        <div className="grid grid-cols-1 gap-4">
                            {visibleProblems.length > 0 ? (
                                visibleProblems.map(problem => (
                                    <ProblemCard key={problem.problemId || problem.id} problem={problem} />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-16 bg-gray-900 rounded-xl shadow-lg border border-gray-700/50"> 
                                    <i data-feather="search" className="w-16 h-16 text-gray-500 mx-auto mb-4"></i>
                                    <h3 className="text-xl font-semibold text-gray-300 mb-2">No problems found</h3>
                                    <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                                
                                    {allProblems.length > 0 && (
                                        <p className="text-sm text-gray-500 mt-4">Showing filtered results from a total of {allProblems.length} problems.</p>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {/* Load More/Back to Top Button */}
                        <div className="mt-8 text-center">
                            {hasMoreProblems && (
                                <button
                                    onClick={handleLoadMore}
                                    className="dark-btn-secondary inline-flex items-center px-6 py-2.5 text-sm font-medium rounded-lg"
                                >
                                    <i data-feather="plus-circle" className="w-4 h-4 mr-2"></i>
                                    Load More Problems
                                </button>
                            )}
                            {!hasMoreProblems && shouldShowBackToTop && (
                                <button
                                    onClick={scrollToTop}
                                    className="dark-btn-secondary inline-flex items-center px-6 py-2.5 text-sm font-medium rounded-lg"
                                >
                                    <i data-feather="arrow-up" className="w-4 h-4 mr-2"></i>
                                    Back to Top
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer (Uses dark-gradient) */}
            <footer className="dark-gradient mt-16 border-t border-gray-700/50">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <p className="text-base text-gray-400">
                            &copy; 2023 CS Studio. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>

            {/* --- Floating Buttons (Consistent with Home.jsx) --- */}
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
        </div>
    );
};

export default Problems;