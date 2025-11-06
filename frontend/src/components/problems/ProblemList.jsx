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

    // Dynamically set difficulty classes
    const difficultyClasses = difficultyKey === 'easy' 
        ? 'text-green-400' 
        : difficultyKey === 'medium' 
        ? 'text-yellow-400' 
        : 'text-red-400';
    
    // Mock status and tags since the backend list doesn't provide them yet
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
            // Note: Alerts are generally forbidden in modern UIs; using console log as alternative to prevent crashes
            console.log('Action blocked: User must be signed in to solve problems.');
        }
    };
    
    const problemId = problem.problemId || problem.id; 

    return (
        // Re-using theme-aware classes (bg-gray-800 is mapped to background-card in index.css)
        <div className="bg-gray-800 rounded-lg shadow-xl p-4 transition-all duration-300 border border-gray-700 card-hover"> 
            <div className="flex justify-between items-center">
                <div className="flex items-center flex-wrap min-w-0 flex-1 pr-4">
                    <h3 className="text-lg font-bold text-white leading-snug mr-4 truncate">
                        <Link to={`/code?problemId=${problemId}`} className="hover:text-primary-400 transition-colors">
                            {problemId}. {problem.title}
                        </Link>
                    </h3>
                    
                    {/* Language Tag - Using dark-tag-style for better theme consistency */}
                    <span className="language-tag inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium dark-tag-style mr-4 mt-1 md:mt-0">
                        {languageDisplayNames[problem.language] || problem.language}
                    </span>
                    
                    {/* Status Tag */}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusClasses} mt-1 md:mt-0`}>
                        {statusTexts[status]}
                    </span>
                </div>
                
                <div className="flex-shrink-0 flex items-center gap-3">
                    {/* Difficulty Tag (Hidden on mobile, relies on custom CSS variables) */}
                    <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border border-gray-700 dark-tag-style`}>
                        <span className={`w-2 h-2 rounded-full mr-1 ${difficultyKey === 'easy' ? 'bg-green-500' : difficultyKey === 'medium' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                        <span className={`${difficultyClasses}`}>{problem.difficulty}</span>
                    </span>
                    
                    {/* Solve Button */}
                    <Link 
                        to={isLoggedIn ? `/code?problemId=${problemId}` : '/signin'}
                        onClick={handleSolveClick}
                        className="dark-btn inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg"
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
