// src/pages/Code.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CodeEditor from '../components/problems/CodeEditor.jsx'; 
import * as feather from 'feather-icons';

const Code = () => {
    const navigate = useNavigate(); 
    const [isDark, setIsDark] = useState(false);
    
    useEffect(() => {
        feather.replace();
        
        const checkTheme = () => {
            setIsDark(document.body.classList.contains('dark-theme'));
        };
        
        checkTheme();
        
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.body, { 
            attributes: true, 
            attributeFilter: ['class'] 
        });
        
        return () => observer.disconnect();
    }, []);
    
    const handleGoBack = () => {
        navigate(-1);
    };
    
    // Theme-aware classes for button appearance
    const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
    const cardBorder = isDark ? 'border-gray-700' : 'border-gray-300';
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
    
    // Determine Monaco theme based on current theme
    const monacoTheme = isDark ? 'vs-dark' : 'vs-light';

    return (
        <div className="min-h-screen flex flex-col dark-gradient-secondary p-4 sm:p-6 lg:p-8 relative">
            
            {/* --- GO BACK BUTTON (TOP LEFT) --- */}
            <button 
                onClick={handleGoBack}
                className={`absolute top-10 left-4 sm:left-6 lg:left-8 dark-btn-secondary inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium z-40 border ${cardBorder} ${cardBg} ${textSecondary} hover:${textPrimary}`}
            >
                <i data-feather="arrow-left" className="w-4 h-4 mr-2"></i> Go Back
            </button>
            
            <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col pt-12"> 
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center">
                    <i data-feather="terminal" className="w-7 h-7 mr-3 text-primary-500"></i>
                    Freeform Code Playground
                </h1>
                <p className="text-gray-400 mb-4">Run quick tests and experiments across supported languages (C, Python, Java...) using our real-time compiler service.</p>
                
                {/* Editor fills the height of the container */}
                <div className="flex-grow min-h-0 h-[calc(100vh-14rem)] lg:h-[calc(100vh-10rem)]">
                    <CodeEditor theme={monacoTheme} />
                </div>
            </div>
            
            {/* FAB Button to Problems */}
            <Link 
                to="/problems" 
                className="fixed bottom-6 right-6 dark-btn inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium z-50"
            >
                <i data-feather="book" className="w-4 h-4 mr-2"></i> Browse Problems
            </Link>
        </div>
    );
};

export default Code;