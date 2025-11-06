// frontend/src/components/problems/ProblemCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx'; 

const languageDisplayNames = {
    'C': 'C', 'Python': 'Python', 'Java': 'Java', 'C++': 'C++', 'JavaScript': 'JavaScript',
    'c': 'C', 'python': 'Python', 'java': 'Java', 'cpp': 'C++', 'javascript': 'JavaScript'
};

const ProblemCard = ({ problem }) => {
    const { isLoggedIn } = useAuth();
    
    // Normalize difficulty for class lookup (should be uppercase in data, but lowercasing for robustness)
    const difficultyKey = problem.difficulty?.toLowerCase() || 'easy';

    // Dynamically set difficulty text color classes
    const difficultyClasses = difficultyKey === 'easy' 
        ? 'text-green-400' 
        : difficultyKey === 'medium' 
        ? 'text-yellow-400' 
        : 'text-red-400';
    
    // Mock status since the backend list doesn't provide it yet
    const status = problem.status?.toLowerCase() || 'todo'; 

    const statusClasses = status === 'solved' 
        ? 'bg-primary-500/10 text-primary-400 border-primary-500/30' 
        : status === 'attempted' 
        ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
        : 'bg-gray-700/50 text-gray-400 border-gray-600';

    const statusTexts = {
        'solved': 'Solved',
        'attempted': 'Attempted',
        'todo': 'To Do'
    };

    const handleSolveClick = (e) => {
        if (!isLoggedIn) {
            e.preventDefault();
            alert('You must be signed in to solve problems.');
        }
    };
    
    const problemId = problem.problemId || problem.id; 

    return (
        <div className="bg-gray-800 rounded-lg shadow-xl p-3 sm:p-4 transition-all duration-300 border border-gray-700 card-hover"> 
            <div className="flex justify-between items-center">
                
                {/* Problem Title & ID - Now just text, not clickable */}
                <div className="flex items-center min-w-0 flex-1 pr-4"> 
                    <h3 className="text-base sm:text-lg font-bold text-white leading-snug mr-4">
                        <span className="text-primary-400 mr-2">#{problemId}</span>
                        {problem.title}
                    </h3>
                    
                    {/* Language Tag */}
                    <span className="language-tag inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium dark-tag-style mr-4">
                        {languageDisplayNames[problem.language] || problem.language}
                    </span>
                    
                    {/* Status Tag */}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusClasses}`}>
                        {statusTexts[status]}
                    </span>
                </div>
                
                <div className="flex-shrink-0 flex items-center gap-3">
                    {/* Difficulty Tag */}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border border-gray-700 dark-tag-style`}>
                        <span className={`w-2 h-2 rounded-full mr-1 ${difficultyKey === 'easy' ? 'bg-green-500' : difficultyKey === 'medium' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                        <span className={`${difficultyClasses}`}>{problem.difficulty}</span>
                    </span>
                    
                    {/* Only ONE Solve Button - on the right side */}
                    <Link 
                        to={isLoggedIn ? `/solve?problemId=${problemId}` : '/signin'}
                        onClick={handleSolveClick}
                        className="dark-btn inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg flex-shrink-0"
                    >
                        <i data-feather="code" className="w-4 h-4 mr-2"></i>
                        Solve
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProblemCard;