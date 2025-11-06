// frontend/src/pages/Problems.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as feather from 'feather-icons';
import { fetchAllProblems } from '../api/problemApi.js';
import { ProblemManager } from '../utils/problemManager.js';
import ProblemCard from '../components/problems/ProblemCard.jsx';
import Loader from '../components/common/Loader.jsx';
import SearchBar from '../components/common/SearchBar.jsx';
import { useAuth } from '../hooks/useAuth.jsx';


// ---------- Constants ----------
const FILTER_OPTIONS = {
    difficulty: ['All', 'Easy', 'Medium', 'Hard'],
    language: ['All', 'C', 'C++', 'Java', 'Python', 'JavaScript'],
};

// ---------- Component ----------
const Problems = () => {
    const { isLoggedIn } = useAuth();
    const location = useLocation();

    const [allProblems, setAllProblems] = useState([]);
    const [filteredProblems, setFilteredProblems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(ProblemManager.getGlobalProgress());

    const [filters, setFilters] = useState({
        difficulty: 'All',
        language: 'All',
        search: ''
    });

    // --- Data Fetching ---
    useEffect(() => {
        let isMounted = true;
        const loadProblems = async () => {
            try {
                const data = await fetchAllProblems();
                if (isMounted) {
                    // Update problem status based on local progress
                    const problemsWithStatus = data.map(p => ({
                        ...p,
                        status: ProblemManager.getProblemProgress(p.problemId || p.id).solved ? 'solved' : (ProblemManager.getProblemProgress(p.problemId || p.id).submissions.length > 0 ? 'attempted' : 'todo')
                    }));
                    
                    setAllProblems(problemsWithStatus);
                    setFilteredProblems(problemsWithStatus); 
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('Error fetching problems:', err);
                if (isMounted) {
                    setError('Failed to load coding problems.');
                    setIsLoading(false);
                }
            }
        };

        const updateProgress = () => {
            if (isMounted) {
                setProgress(ProblemManager.getGlobalProgress());
                // Re-apply status to problems after progress update
                setAllProblems(prev => prev.map(p => ({
                    ...p,
                    status: ProblemManager.getProblemProgress(p.problemId || p.id).solved ? 'solved' : (ProblemManager.getProblemProgress(p.problemId || p.id).submissions.length > 0 ? 'attempted' : 'todo')
                })));
            }
        };

        loadProblems();

        // Listener for local storage changes (e.g., problem solved on /solve page)
        window.addEventListener('storage', updateProgress);

        return () => {
            isMounted = false;
            window.removeEventListener('storage', updateProgress);
        };
    }, []);

    // --- Filtering Logic ---
    const applyFilters = useCallback((problems, currentFilters) => {
        return problems.filter(problem => {
            const matchesDifficulty = currentFilters.difficulty === 'All' || problem.difficulty === currentFilters.difficulty;
            const matchesLanguage = currentFilters.language === 'All' || problem.language === currentFilters.language;
            const matchesSearch = problem.title.toLowerCase().includes(currentFilters.search.toLowerCase());
            
            return matchesDifficulty && matchesLanguage && matchesSearch;
        });
    }, []);

    useEffect(() => {
        const filtered = applyFilters(allProblems, filters);
        setFilteredProblems(filtered);
    }, [allProblems, filters, applyFilters]);

    // --- Scrolling to Solved Problem ---
    useEffect(() => {
        // Check for scroll instruction from navigation state (used when returning from /solve)
        if (location.state && location.state.scrollToId) {
            const targetElement = document.getElementById(location.state.scrollToId);
            if (targetElement) {
                // Scroll to target element with an offset
                setTimeout(() => {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100); 
                // Clean up state so the scroll doesn't happen on refresh
                window.history.replaceState({}, document.title); 
            }
        }
    }, [location.state]);


    // --- Handlers ---
    const handleFilterChange = (type, value) => {
        setFilters(prev => ({
            ...prev,
            [type]: value,
            // When filtering by a specific type, usually reset search unless explicitly searching
            search: type === 'search' ? value : prev.search,
        }));
    };

    const handleSearch = (searchTerm) => {
        setFilters(prev => ({ ...prev, search: searchTerm }));
    };

    const handleSolveClick = (problemId, e) => {
        if (!isLoggedIn) {
            e.preventDefault();
            // In a real app, this would trigger a modal or redirection to sign-in
            console.log('Redirecting to sign-in...');
        }
    };

    // --- Progress Display Calculation (Keep logic for filtering/sorting if needed later) ---
    const solvedEasy = progress.problemsByDifficulty.Easy.solved;
    const totalEasy = progress.problemsByDifficulty.Easy.total;
    const solvedMedium = progress.problemsByDifficulty.Medium.solved;
    const totalMedium = progress.problemsByDifficulty.Medium.total;
    const solvedHard = progress.problemsByDifficulty.Hard.solved;
    const totalHard = progress.problemsByDifficulty.Hard.total;
    const totalSolved = solvedEasy + solvedMedium + solvedHard;
    const totalTotal = totalEasy + totalMedium + totalHard;


    return (
        <div className="min-h-screen dark-gradient-secondary">
            {/* Hero Section */}
            <div className="gradient-bg text-white relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{
                    backgroundImage: 'radial-gradient(circle at center, #0ea5e940 0%, transparent 70%)',
                }}></div>
                
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
                                    to="/solve"
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

            {/* Main Content & Filters - REMOVED Progress Overview Box - ADJUSTED MARGIN */}
            {/* The -mt-16 needs to be removed/adjusted since the large component is gone */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-20"> 
                
                {/* --- REMOVED: Your Progress Overview Box --- */}
                
                {/* Filters and Search - ADDED mb-6 for spacing */}
                <div className="mb-6 grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-2">
                        <SearchBar onSearch={handleSearch} placeholder="Search by problem title..." />
                    </div>
                    
                    <select 
                        className="dark-input h-11"
                        value={filters.difficulty}
                        onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                    >
                        {FILTER_OPTIONS.difficulty.map(option => (
                            <option key={option} value={option}>{option} Difficulty</option>
                        ))}
                    </select>

                    <select 
                        className="dark-input h-11"
                        value={filters.language}
                        onChange={(e) => handleFilterChange('language', e.target.value)}
                    >
                        {FILTER_OPTIONS.language.map(option => (
                            <option key={option} value={option}>{option} Language</option>
                        ))}
                    </select>
                </div>
                
                {/* Problem List */}
                {isLoading ? (
                    <div className="mt-10"><Loader message="Loading problems..." size="lg" /></div>
                ) : error ? (
                    <div className="text-center text-red-400 mt-10 p-8 bg-gray-800 rounded-xl border border-red-900/50">{error}</div>
                ) : filteredProblems.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10 p-8 bg-gray-800 rounded-xl border border-gray-700/50">
                        <i data-feather="search" className="w-8 h-8 mx-auto mb-4"></i>
                        <p className="text-lg font-semibold">No problems found matching your criteria.</p>
                        <p className="text-sm">Try resetting your filters or adjusting your search term.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredProblems.map(problem => (
                            <ProblemCard 
                                key={problem.problemId || problem.id} // FIX: Ensures unique key using problemId or fallback id
                                problem={problem} 
                                isLoggedIn={isLoggedIn}
                            />
                        ))}
                    </div>
                )}
            </div>
            
            {/* Final feather-icons rendering */}
            {useEffect(() => {
                feather.replace();
            })}
        </div>
    );
};

export default Problems;