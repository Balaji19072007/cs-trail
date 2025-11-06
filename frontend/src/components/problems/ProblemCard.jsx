// src/components/problems/ProblemCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx'; 
import { ProblemManager } from '../../utils/problemManager.js'; // Import ProblemManager

const languageDisplayNames = {
    'C': 'C', 'C++': 'C++', 'Java': 'Java', 'Python': 'Python', 'JavaScript': 'JS',
};

const ProblemCard = ({ problem }) => {
    const { isLoggedIn } = useAuth();
    const problemId = problem.problemId || problem.id; 
    
    // Check local progress manager status
    const progress = ProblemManager.getProblemProgress(problemId);
    const status = progress.solved ? 'solved' : (progress.submissions.length > 0 ? 'attempted' : 'todo');

    const statusTexts = {
        solved: 'Solved',
        attempted: 'Attempted',
        todo: 'To Do'
    };

    const statusClasses = status === 'solved'
        ? 'text-green-400 bg-green-900/30 border-green-700/50'
        : status === 'attempted'
        ? 'text-yellow-400 bg-yellow-900/30 border-yellow-700/50'
        : 'text-gray-400 bg-gray-700/30 border-gray-700';

    const difficultyKey = problem.difficulty?.toLowerCase() || 'easy';
    const difficultyClasses = difficultyKey === 'easy'
        ? 'text-green-400'
        : difficultyKey === 'medium'
        ? 'text-yellow-400'
        : 'text-red-400';

    const handleSolveClick = (e) => {
        if (!isLoggedIn) {
            e.preventDefault();
            // Note: Alerts are generally forbidden in modern UIs; using console log as alternative to prevent crashes
            console.log('Action blocked: User must be signed in to solve problems.');
        }
    };
    
    return (
        <div 
            id={`problem-${problemId}`} // ADDED ID for scrolling
            className="bg-gray-800 rounded-lg shadow-xl p-3 sm:p-4 transition-all duration-300 border border-gray-700 card-hover"
        > 
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
                    
                    {/* Solve Button - FIX: Link updated to /solve */}
                    <Link 
                        // FIX: Change destination from /code to /solve?problemId={problemId}
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