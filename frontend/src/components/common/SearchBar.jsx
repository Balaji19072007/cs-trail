// frontend/src/components/common/SearchBar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as feather from 'feather-icons';
import { FaSearch, FaArrowRight } from 'react-icons/fa';

// --- Mock Search Data Source (Consolidated Example) ---
const SEARCH_DATA = [
    { name: 'Full Stack Web Developer', category: 'Roadmap', url: '/roadmaps#full-stack-roadmap' },
    { name: 'C Language for Beginners', category: 'Course', url: '/courses#programming' },
    { name: 'Two Sum Problem', category: 'Problem', url: '/problems?q=two-sum' },
    { name: 'AI & Machine Learning', category: 'Roadmap', url: '/roadmaps#ai-ml-roadmap' },
    { name: 'Binary Search', category: 'Algorithm', url: '/problems?q=binary-search' },
    { name: 'MERN Stack Mastery', category: 'Course', url: '/courses#web' },
];

const SearchBar = ({ isMobile = false }) => {
    const navigate = useNavigate();
    const searchRef = useRef(null);
    
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // --- Effects & Handlers ---

    // Sync icons
    useEffect(() => {
        feather.replace();
    }, [results]);
    
    // Close suggestions when clicking outside
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    // Perform filter based on query
    const handleInputChange = (e) => {
        const newQuery = e.target.value;
        setQuery(newQuery);
        
        if (newQuery.length < 2) {
            setResults([]);
            setShowSuggestions(false);
            return;
        }
        
        const filtered = SEARCH_DATA.filter(item => 
            item.name.toLowerCase().includes(newQuery.toLowerCase()) || 
            item.category.toLowerCase().includes(newQuery.toLowerCase())
        ).slice(0, 8);
        
        setResults(filtered);
        setShowSuggestions(true);
    };

    // Handle selection and navigation
    const handleResultClick = (url) => {
        setShowSuggestions(false);
        setQuery('');
        navigate(url);
    };
    
    // Helper to highlight matched text
    const highlightText = (text, q) => {
        const index = text.toLowerCase().indexOf(q.toLowerCase());
        if (index >= 0) {
            return (
                <>{text.substring(0, index)}
                <span className="suggestion-highlight">{text.substring(index, index + q.length)}</span>
                {text.substring(index + q.length)}</>
            );
        }
        return text;
    };


    // --- Render Logic ---

    const inputId = isMobile ? 'mobile-search-input' : 'search-input';
    const suggestionsId = isMobile ? 'mobile-search-suggestions' : 'search-suggestions';
    const placeholderText = isMobile ? 'Search content...' : 'Search courses, problems, roadmaps...';
    
    const renderNoResults = () => (
        <div className="p-4 text-center text-gray-500">
            <FaSearch className="w-5 h-5 mx-auto mb-2" />
            <p>No results found</p>
        </div>
    );
    
    return (
        <div 
            ref={searchRef}
            className={`search-container relative w-full ${isMobile ? '' : 'max-w-md'}`}
        >
            <div className="relative">
                <FaSearch className="search-icon w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input 
                    type="text" 
                    id={inputId}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 text-sm" 
                    placeholder={placeholderText}
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                    autoComplete="off"
                />
            </div>
            
            {showSuggestions && (
                <div id={suggestionsId} className={`search-suggestions show absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto`}>
                    {results.length > 0 ? (
                        results.map(item => (
                            <div 
                                key={item.url}
                                className="suggestion-item px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer flex items-center"
                                onClick={() => handleResultClick(item.url)}
                            >
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">{highlightText(item.name, query)}</div>
                                    <div className="text-sm text-gray-500">{item.category}</div>
                                </div>
                                <FaArrowRight className="w-4 h-4 text-gray-400" />
                            </div>
                        ))
                    ) : (
                        query.length >= 2 ? renderNoResults() : null
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;