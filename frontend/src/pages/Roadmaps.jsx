// frontend/src/pages/Roadmaps.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import * as feather from 'feather-icons';

// --- MOCK HOOKS FOR DEMONSTRATION (REPLACE WITH REAL useTheme) ---
const useTheme = () => {
    // In a real application, this would read from global state/context
    const [theme, setTheme] = useState('dark');
    return { 
        theme, 
        toggleTheme: () => setTheme(prev => prev === 'dark' ? 'light' : 'dark'),
        isDark: theme === 'dark'
    };
};
// -----------------------------------------------------------------

// --- NEW/UPDATED MOCK DATA: Course Details for Specialization Selector ---
const SPECIALIZED_COURSES = {
    'programming-roadmap': [
        { id: 'c-fundamentals', title: 'C Fundamentals', lessons: 30, description: 'Variables, pointers, and memory management.', icon: 'hash', primaryJob: 'Embedded Systems Engineer', estimatedTime: '4 weeks' },
        { id: 'python-fundamentals', title: 'Python Fundamentals', lessons: 25, description: 'Syntax, data structures, and standard libraries.', icon: 'coffee', primaryJob: 'Data Analyst', estimatedTime: '3 weeks' },
        { id: 'java-fundamentals', title: 'Java Fundamentals', lessons: 30, description: 'OOP concepts, core APIs, and JVM structure.', icon: 'box', primaryJob: 'Backend Developer', estimatedTime: '4 weeks' },
    ],
    // ADDED NEW DSA SPECIALIZATIONS HERE
    'dsa-roadmap': [ 
        { id: 'dsa-java', title: 'DSA in Java', lessons: 40, description: 'High-performance algorithms optimized for the JVM.', icon: 'box', primaryJob: 'Senior Backend Engineer', estimatedTime: '6 weeks' },
        { id: 'dsa-python', title: 'DSA in Python', lessons: 35, description: 'Algorithm analysis and implementation for interviews.', icon: 'coffee', primaryJob: 'Data Scientist', estimatedTime: '5 weeks' },
        { id: 'dsa-cpp', title: 'DSA in C++', lessons: 45, description: 'Competitive programming with C++ STL and optimal memory usage.', icon: 'hash', primaryJob: 'HPC Engineer', estimatedTime: '7 weeks' },
    ],
    // ADDED MOCK COURSES FOR FEATURED ROADMAPS (for expansion demonstration)
    'full-stack-roadmap': [
        { id: 'fs-frontend', title: 'Modern Frontend (React)', lessons: 45, description: 'Components, state management, and hooks.', icon: 'layout', primaryJob: 'Frontend Engineer', estimatedTime: '6 weeks' },
        { id: 'fs-backend', title: 'API Development (Node/Express)', lessons: 38, description: 'Express, authentication, and database.', icon: 'server', primaryJob: 'Backend Developer', estimatedTime: '5 weeks' },
        { id: 'fs-database', title: 'Database Fundamentals (SQL/NoSQL)', lessons: 20, description: 'Data modeling, queries, and security.', icon: 'database', primaryJob: 'Database Admin', estimatedTime: '3 weeks' },
    ],
    'data-science-roadmap': [
        { id: 'ds-python', title: 'Python for Data Science', lessons: 30, description: 'Pandas, NumPy, and basic data manipulation.', icon: 'coffee', primaryJob: 'Data Analyst', estimatedTime: '4 weeks' },
        { id: 'ds-viz', title: 'Data Visualization & Reporting', lessons: 25, description: 'Matplotlib, Seaborn, and dashboard creation.', icon: 'bar-chart-2', primaryJob: 'BI Specialist', estimatedTime: '3 weeks' },
        { id: 'ds-ml', title: 'Introduction to Machine Learning', lessons: 40, description: 'Linear models, clustering, and evaluation.', icon: 'activity', primaryJob: 'ML Engineer', estimatedTime: '6 weeks' },
    ],
    'mobile-roadmap': [
        { id: 'mob-react-native', title: 'React Native Fundamentals', lessons: 40, description: 'Cross-platform mobile application development.', icon: 'smartphone', primaryJob: 'React Native Engineer', estimatedTime: '6 weeks' },
        { id: 'mob-ios', title: 'Native iOS Development (Swift)', lessons: 45, description: 'UIkit, SwiftUI, and Apple ecosystem.', icon: 'aperture', primaryJob: 'iOS Developer', estimatedTime: '7 weeks' },
    ],
    // ADDED remaining roadmaps to show content when expanded
    'ai-ml-roadmap': [
        { id: 'ai-python', title: 'Python for AI & ML', lessons: 35, description: 'Jupyter, NumPy, and Scikit-learn.', icon: 'coffee', primaryJob: 'ML Engineer', estimatedTime: '5 weeks' },
        { id: 'ai-deep', title: 'Deep Learning with TensorFlow', lessons: 40, description: 'Neural networks, CNNs, and RNNs.', icon: 'activity', primaryJob: 'AI Researcher', estimatedTime: '6 weeks' },
    ],
    'cybersecurity-roadmap': [
        { id: 'cs-network', title: 'Network Security Fundamentals', lessons: 30, description: 'Protocols, firewalls, and intrusion detection.', icon: 'globe', primaryJob: 'Security Analyst', estimatedTime: '4 weeks' },
        { id: 'cs-ethical', title: 'Ethical Hacking & Penetration Testing', lessons: 45, description: 'Scanning, exploitation, and vulnerability assessment.', icon: 'shield', primaryJob: 'Penetration Tester', estimatedTime: '7 weeks' },
    ],
    'devops-roadmap': [
        { id: 'do-cloud', title: 'Cloud Fundamentals (AWS/Azure)', lessons: 30, description: 'Compute, storage, and networking basics.', icon: 'cloud', primaryJob: 'Cloud Architect', estimatedTime: '4 weeks' },
        { id: 'do-cicd', title: 'CI/CD with Jenkins & GitHub Actions', lessons: 25, description: 'Automating build, test, and deployment.', icon: 'git-branch', primaryJob: 'DevOps Engineer', estimatedTime: '3 weeks' },
    ]
};

// Mock data for roadmaps
const ROADMAPS_DATA = [
    { 
        id: 'programming-roadmap', 
        title: 'Programming Fundamentals Roadmap', 
        description: 'Master the core programming concepts and problem-solving skills',
        completion: 3, 
        total: 9, 
        courses: 8, 
        months: '3-6',
        completionRate: '88%',
        category: 'Programming',
        gradient: 'from-primary-700 to-primary-600',
        icon: 'layers',
        careerJobs: ['Software Engineer', 'Coding Instructor', 'Technical Analyst'],
        requiresSelection: true, // Indicate that this needs a course choice
    },
    { 
        id: 'dsa-roadmap', 
        title: 'Data Structure & Algorithm Roadmap', 
        description: 'Master fundamental data structures, graph theory, dynamic programming, and complexity analysis.',
        completion: 0, 
        total: 15, 
        courses: 10, 
        months: '4-7',
        completionRate: '92%',
        category: 'Algorithms',
        gradient: 'from-green-700 to-green-600',
        icon: 'cpu',
        careerJobs: ['Algorithm Engineer', 'Backend Developer', 'Interviewer'],
        requiresSelection: true,
    },
    { 
        id: 'full-stack-roadmap', 
        title: 'Full Stack Web Developer Roadmap', 
        description: 'Complete path to becoming a full-stack web developer',
        completion: 2, 
        total: 9, 
        courses: 12, 
        months: '6-9',
        completionRate: '85%',
        category: 'Web Development',
        gradient: 'from-blue-700 to-blue-600',
        icon: 'layout',
        careerJobs: ['Frontend Developer', 'Backend Engineer', 'Full Stack Developer'],
        requiresSelection: false,
    },
    { 
        id: 'data-science-roadmap', 
        title: 'Data Scientist Roadmap', 
        description: 'Master data analysis, visualization, and machine learning',
        completion: 0, 
        total: 10, 
        courses: 10, 
        months: '8-12',
        completionRate: '78%',
        category: 'Data Science',
        gradient: 'from-purple-700 to-purple-600',
        icon: 'database',
        careerJobs: ['Data Analyst', 'Machine Learning Engineer', 'BI Specialist'],
        requiresSelection: false,
    },
    { 
        id: 'mobile-roadmap', 
        title: 'Mobile App Developer Roadmap', 
        description: 'Master native and cross-platform mobile development for iOS and Android',
        completion: 0, 
        total: 10, 
        courses: 10, 
        months: '6-9',
        completionRate: '76%',
        category: 'Mobile Development',
        gradient: 'from-yellow-700 to-yellow-600',
        icon: 'smartphone',
        careerJobs: ['iOS Developer', 'Android Developer', 'React Native Engineer'],
        requiresSelection: false,
    },
    { 
        id: 'ai-ml-roadmap', 
        title: 'AI & Machine Learning Engineer Roadmap', 
        description: 'Master artificial intelligence, deep learning, and ML deployment',
        completion: 0, 
        total: 14, 
        courses: 14, 
        months: '9-15',
        completionRate: '72%',
        category: 'AI/ML',
        gradient: 'from-red-700 to-red-600',
        icon: 'activity',
        careerJobs: ['AI Researcher', 'ML Engineer', 'NLP Specialist'],
        requiresSelection: false,
    },
    { 
        id: 'cybersecurity-roadmap', 
        title: 'Cybersecurity Engineer Roadmap', 
        description: 'Master network security, ethical hacking, and defense strategies',
        completion: 0, 
        total: 11, 
        courses: 11, 
        months: '8-12',
        completionRate: '81%',
        category: 'Cybersecurity',
        gradient: 'from-indigo-700 to-indigo-600',
        icon: 'shield',
        careerJobs: ['Penetration Tester', 'Security Analyst', 'Ethical Hacker'],
        requiresSelection: false,
    },
    { 
        id: 'devops-roadmap', 
        title: 'DevOps Engineer Roadmap', 
        description: 'Master CI/CD, infrastructure as code, cloud platforms, and automation',
        completion: 0, 
        total: 11, 
        courses: 11, 
        months: '6-9',
        completionRate: '82%',
        category: 'DevOps',
        gradient: 'from-pink-700 to-pink-600',
        icon: 'cloud',
        requiresSelection: false,
        careerJobs: ['DevOps Engineer', 'Cloud Architect', 'Site Reliability Engineer'],
    }
];

// FEATURED_ROADMAPS data is retained but we use the matching objects from ROADMAPS_DATA to ensure consistency
const FEATURED_ROADMAPS = ROADMAPS_DATA.filter(r => 
    r.id === 'full-stack-roadmap' || r.id === 'data-science-roadmap' || r.id === 'mobile-roadmap'
);

// --- HELPER FUNCTION: Get detailed steps for a specific course (Point 2/3) ---
const getSpecializedCourseRoadmap = (roadmapId, courseId) => {
    // This function simulates fetching the detailed steps for a particular course/specialization
    let defaultSteps = [];
    let courseTitle = 'Core Fundamentals';
    let courseLink = '/courses';

    const roadmap = ROADMAPS_DATA.find(r => r.id === roadmapId);
    
    // Check if the roadmap is one of the specialized ones and return specific steps
    if (roadmapId === 'programming-roadmap') {
        defaultSteps = [
            { title: 'Setup & Environment', description: 'Install necessary tools and IDE.', status: 'completed' },
            { title: 'Syntax & Data Types', description: 'Master core language syntax and variables.', status: 'completed' },
            { title: 'Control Flow', description: 'Loops, conditionals, and program structure.', status: 'current' },
            { title: 'Functions & Modules', description: 'Code organization and reusability basics.', status: 'todo' },
            { title: 'Data Structures Deep Dive', description: 'Working with arrays, lists, and maps.', status: 'todo' },
            { title: 'File I/O & Networking', description: 'Reading/writing files and basic network concepts.', status: 'todo' },
            { title: 'Intro to OOP', description: 'Classes, objects, and basic inheritance.', status: 'todo' },
            { title: 'Error Handling & Debugging', description: 'Exception handling and tracing code errors.', status: 'todo' },
            { title: 'Final Capstone Project', description: 'Apply all concepts to build a small application.', status: 'todo' }
        ];

        let prefix = 'Language';
        switch (courseId) {
            case 'c-fundamentals': prefix = 'C'; courseTitle = 'C Fundamentals'; courseLink = '/courses?search=C+Fundamentals'; break;
            case 'python-fundamentals': prefix = 'Python'; courseTitle = 'Python Fundamentals'; courseLink = '/courses?search=Python+Fundamentals'; break;
            case 'java-fundamentals': prefix = 'Java'; courseTitle = 'Java Fundamentals'; courseLink = '/courses?search=Java+Fundamentals'; break;
            default: break;
        }
        return {
            steps: defaultSteps.map(step => ({...step, title: `${prefix}: ${step.title}`})),
            courseTitle,
            courseLink,
            meta: roadmap
        };
    } else if (roadmapId === 'dsa-roadmap') {
        defaultSteps = [
            { title: 'Complexity & Analysis', description: 'Big O notation, time/space trade-offs.', status: 'completed' },
            { title: 'Arrays & Hashing', description: 'Fundamental data structures and collision handling.', status: 'completed' },
            { title: 'Stacks, Queues, Linked Lists', description: 'Implementing and applying linear structures.', status: 'current' },
            { title: 'Trees & Heaps', description: 'Binary search trees, AVL trees, and priority queues.', status: 'todo' },
            { title: 'Graphs & Traversal', description: 'DFS, BFS, Dijkstra\'s, and minimum spanning trees.', status: 'todo' },
            { title: 'Sorting & Searching', description: 'Quicksort, Mergesort, and advanced search algorithms.', status: 'todo' },
            { title: 'Greedy Algorithms', description: 'Problem solving using locally optimal choices.', status: 'todo' },
            { title: 'Dynamic Programming', description: 'Memoization and tabulation for complex problems.', status: 'todo' },
            { title: 'Advanced Algorithms Project', description: 'Solving competitive programming challenges.', status: 'todo' }
        ];

        let prefix = 'DSA';
        switch (courseId) {
            case 'dsa-java': prefix = 'Java'; courseTitle = 'DSA in Java'; courseLink = '/courses?search=DSA+in+Java'; break;
            case 'dsa-python': prefix = 'Python'; courseTitle = 'DSA in Python'; courseLink = '/courses?search=DSA+in+Python'; break;
            case 'dsa-cpp': prefix = 'C++'; courseTitle = 'DSA in C++'; courseLink = '/courses?search=DSA+in+C++'; break;
            default: break;
        }
        return {
            steps: defaultSteps.map(step => ({...step, title: `${prefix}: ${step.title}`})),
            courseTitle,
            courseLink,
            meta: roadmap
        };
    }
    
    // For general non-selection roadmaps (Full Stack, Data Science, etc.)
    defaultSteps = [
        // A generic set of steps to display for non-specialized roadmaps
        { title: 'Core Foundations', description: 'Introduction to technology and tools.', status: 'completed' },
        { title: 'Deep Dive Module 1', description: 'Key skills and core language principles.', status: 'completed' },
        { title: 'Deep Dive Module 2', description: 'Intermediate concepts and frameworks.', status: 'current' },
        { title: 'Advanced Topics', description: 'Mastering performance and best practices.', status: 'todo' },
        { title: 'Portfolio Project', description: 'Building a complex, real-world project.', status: 'todo' },
    ];

    return {
        steps: defaultSteps.map((step, index) => ({
            ...step,
            status: index < roadmap.completion ? 'completed' : index === roadmap.completion ? 'current' : 'todo'
        })),
        courseTitle: roadmap.title,
        courseLink: `/courses?search=${encodeURIComponent(roadmap.title.replace(' Roadmap', ''))}`,
        meta: roadmap
    };
};
// -------------------------------------------------------------------------


// This component is used for the step-by-step part of the DetailedRoadmapView
const RoadmapStep = ({ number, title, description, status, onContinue }) => {
    
    const { isDark } = useTheme();
    
    // FIX 1: Ensure feather icons are rendered when this component updates
    useEffect(() => {
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    });

    const getStatusIcon = () => {
        switch (status) {
            case 'completed':
                return (
                    <div className="flex-shrink-0 w-10 h-10 bg-success-500 rounded-full flex items-center justify-center">
                        <i data-feather="check" className="text-white w-5 h-5"></i>
                    </div>
                );
            case 'current':
                return (
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-500/10 border-2 border-primary-500 rounded-full flex items-center justify-center">
                        <span className="text-primary-400 font-medium">{number}</span>
                    </div>
                );
            default:
                // Light/Dark conditional for todo steps
                return (
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'} font-medium`}>{number}</span>
                    </div>
                );
        }
    };
    
    // Theme Fix: Conditionally set text colors
    const titleClass = status === 'completed' ? (isDark ? 'text-white' : 'text-gray-800') : status === 'current' ? 'text-primary-400' : (isDark ? 'text-gray-300' : 'text-gray-500');
    const descriptionClass = status === 'completed' ? (isDark ? 'text-gray-400' : 'text-gray-500') : (isDark ? 'text-gray-500' : 'text-gray-400');

    return (
        <div className={`roadmap-step ${status} space-y-4`}>
            <div className="flex items-start">
                {getStatusIcon()}
                <div className="ml-4">
                    <h4 className={`font-medium mb-1 ${titleClass}`}>{title}</h4>
                    <p className={`text-sm ${descriptionClass}`}>{description}</p>
                    {status === 'current' && (
                        <button 
                            onClick={onContinue}
                            className="mt-2 text-sm text-primary-400 hover:text-primary-600 font-medium transition-colors"
                        >
                            Continue Learning →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- NEW COMPONENT: Expanded Course List (The content that drops down) ---
const ExpandedCourseList = ({ roadmap, onSelectCourse }) => {
    const { isDark } = useTheme();
    // Use SPECIALIZED_COURSES data for all roadmaps now
    const courses = SPECIALIZED_COURSES[roadmap.id] || [];

    // FIX 1: Ensure feather icons are rendered
    useEffect(() => {
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    });
    
    if (courses.length === 0) return null;

    // The background color for this div is fixed via CSS in index.css for light theme
    return (
        // CRITICAL FIX: The inner content container should provide internal padding
        // Using bg-gray-100/50 in light mode and bg-gray-800/50 in dark mode
        <div className={`p-4 ${isDark ? 'bg-gray-800/50' : 'bg-gray-100/50'}`}>
            <p className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {roadmap.requiresSelection ? 'Choose Your Specialization:' : 'Core Courses:'}
            </p>
            <div className="space-y-3">
                {courses.map((course) => (
                    <div 
                        key={course.id}
                        // FIX: Added flex-col for mobile, sm:flex-row for desktop to stop elements cutting off
                        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border cursor-pointer 
                            ${isDark ? 'bg-gray-700 border-gray-600 hover:border-primary-500' : 'bg-white border-gray-200 hover:border-primary-500'} 
                            transition-all duration-200`}
                        // IMPORTANT: onSelectCourse triggers the detailed view
                        onClick={() => onSelectCourse(roadmap, course.id)}
                    >
                        {/* Course Title and Icon Group */}
                        <div className="flex items-center w-full sm:w-auto mb-2 sm:mb-0">
                            <i data-feather={course.icon} className="w-5 h-5 text-primary-500 mr-3 flex-shrink-0"></i>
                            {/* FIX: Ensure title is theme-aware - relied on global CSS rule */}
                            <h4 className={`font-medium text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.title}</h4>
                        </div>
                        
                        {/* Time Tag and Button Group - Use space-y-2 on mobile */}
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto flex-shrink-0">
                            {course.estimatedTime && (
                                <span className={`text-xs font-medium px-2 py-1 rounded-full text-center sm:text-left ${isDark ? 'text-gray-400 bg-gray-600' : 'text-gray-600 bg-gray-200'}`}>
                                    {course.estimatedTime}
                                </span>
                            )}
                            {/* The "View Roadmap" button is now full width on mobile */}
                             <Link
                                to={`#${roadmap.id}/${course.id}`}
                                // FIX: Added w-full on mobile
                                className={`px-3 py-1 text-sm font-medium rounded-lg text-white bg-primary-500 hover:bg-primary-600 transition duration-300 whitespace-nowrap w-full sm:w-auto text-center`}
                            >
                                View Roadmap
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}


// --- Standard/Featured Card Component (MODIFIED FOR RECTANGULAR DROP DOWN) ---
const FeaturedRoadmapCard = ({ roadmap, isExpanded, onToggleExpand }) => {
    const { isDark } = useTheme();
    
    useEffect(() => {
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    });

    const handleToggle = () => {
        onToggleExpand(roadmap.id);
    };

    return (
        // Main Card: rounded-t-2xl when expanded, rounded-2xl when collapsed
        // ADDED ID HERE for scrolling on mobile
        <div 
            id={`featured-card-${roadmap.id}`} 
            // CRITICAL FIX: The rounded-b-none on active card is crucial for the seam.
            className={`shadow-lg card-hover border transition-all duration-300 cursor-pointer overflow-hidden 
                        ${isExpanded ? 'rounded-t-2xl rounded-b-none' : 'rounded-2xl'} 
                        ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}
            onClick={handleToggle} // Clickable area is the main card
        >
            {/* Visual Header Area */}
            <div className={`bg-gradient-to-r ${roadmap.gradient} h-48 flex items-center justify-center relative overflow-hidden`}>
                <div className="text-center p-4 z-10">
                    <div className={`w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                        <i data-feather={roadmap.icon} className="w-8 h-8 text-white"></i>
                    </div>
                    <p className="text-white font-medium">{roadmap.category}</p>
                </div>
                {/* Abstract floating circles */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white rounded-full opacity-5"></div>
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full opacity-5"></div>
            </div>
            
            {/* Content Area */}
            <div className="p-6">
                <h3 className={`text-xl font-bold mb-2 roadmap-title ${isDark ? 'text-white' : 'text-gray-900'}`}>{roadmap.title}</h3>
                <p className={`roadmap-description mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{roadmap.description}</p>
                
                {/* Info Line + Arrow */}
                <div className={`flex items-center justify-between text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <i data-feather="clock" className="w-4 h-4 mr-1 text-primary-400"></i>
                            <span>{roadmap.months} months</span>
                        </div>
                        <div className="flex items-center">
                            <i data-feather="book-open" className="w-4 h-4 mr-1 text-primary-400"></i>
                            <span>{roadmap.courses} courses</span>
                        </div>
                    </div>
                    
                    {/* Toggle Button/Icon (passive, click handled by parent) */}
                    <button 
                        className={`text-primary-400 hover:text-primary-500 p-2 rounded-full transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        aria-expanded={isExpanded}
                        aria-controls={`course-list-featured-${roadmap.id}`}
                    >
                        <i data-feather="chevron-down" className="w-6 h-6"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Simplified Card for Other Roadmaps (MODIFIED TO USE FULL-WIDTH DROP DOWN) ---
const SimpleRoadmapCard = ({ roadmap, isExpanded, onToggleExpand, onSelectCourse }) => {
    const { isDark } = useTheme();

    useEffect(() => {
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    });

    const progressPercentage = (roadmap.completion / roadmap.total) * 100;
    
    const handleToggle = () => {
        onToggleExpand(roadmap.id);
    };
    
    return (
        // The main wrapper for the Simple Card is now a container for the card + expanded box
        // ADDED ID HERE for scrolling on mobile
        <div className={`my-4`} id={`simple-card-${roadmap.id}`}>
            {/* The main card container: rounded-t-xl when expanded, rounded-xl when collapsed */}
            <div className={`simple-roadmap-card shadow-lg overflow-hidden border transition-all duration-300 cursor-pointer 
                           ${isExpanded ? 'rounded-t-xl rounded-b-none' : 'rounded-xl'}`} onClick={handleToggle}>
                
                <div className="flex items-stretch min-h-[100px]">
                    
                    {/* Visual Bar */}
                    <div 
                        className={`flex-shrink-0 w-1/5 max-w-[100px] 
                                    flex items-center justify-center bg-gradient-to-t ${roadmap.gradient} relative overflow-hidden`}
                    >
                        <i data-feather={roadmap.icon} className="w-8 h-8 text-white opacity-90 absolute z-10"></i>
                        <div 
                            className="absolute inset-0 bg-black/20 transition-all duration-500" 
                            style={{ height: `${100 - progressPercentage}%`, width: '100%', left: 0, top: 0 }}
                        ></div>
                    </div>
                    
                    {/* Content Area */}
                    <div className={`roadmap-content flex-1 p-4 flex flex-col justify-center sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0`}>
                        
                        <div className="min-w-0 pr-4 flex-1">
                            <h3 className={`roadmap-title text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{roadmap.title}</h3>
                            {roadmap.careerJobs && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {roadmap.careerJobs.slice(0, 3).map((job, i) => (
                                        <span key={i} className={`career-job-tag px-2 py-0.5 rounded-full text-xs font-medium border ${isDark ? 'bg-gray-700/50 text-primary-300 border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300'}`}>
                                            {job}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Toggle Button/Icon */}
                        <div className="flex-shrink-0 w-auto">
                            <button 
                                className={`text-primary-400 hover:text-primary-500 p-2 rounded-full transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                aria-expanded={isExpanded}
                                aria-controls={`course-list-simple-${roadmap.id}`}
                            >
                                <i data-feather="chevron-down" className="w-6 h-6"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* NEW: Expanded Content Box - Full Width Drop Down */}
            <div 
                id={`course-list-simple-${roadmap.id}`}
                className={`transition-all duration-500 overflow-hidden ${isExpanded ? 'max-h-[500px]' : 'max-h-0'}`}
            >
                {/* This uses the rounded-b-xl to close the list item properly */}
                {/* FIX: Use bg-white/bg-gray-800 for the outer container which is border + shadow */}
                <div className={`p-0 rounded-b-xl shadow-lg border transition-all duration-500 
                            ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
                            border-t-0`}
                >
                    <ExpandedCourseList roadmap={roadmap} onSelectCourse={onSelectCourse} />
                </div>
            </div>
        </div>
    );
};

// --- UPDATED COMPONENT: Feature Roadmaps Grid to fix the L-shape look ---
const FeaturedRoadmapsGrid = ({ roadmaps, expandedRoadmapId, onToggleExpand, onSelectCourse }) => {
    const { isDark } = useTheme();
    
    // Find the currently expanded roadmap object and its index
    const expandedRoadmap = roadmaps.find(r => r.id === expandedRoadmapId);
    const expandedIndex = roadmaps.findIndex(r => r.id === expandedRoadmapId);

    let roundingClasses = '';

    if (expandedRoadmap) {
        // We ensure the expanded block visually aligns with the cards above.
        // The rounding is only applied to the corners *opposite* the active card's column.
        
        // For LG/MD screens (3-column layout):
        if (expandedIndex === 0) {
            // Left Card: Top-left is square, top-right is rounded.
            roundingClasses = 'lg:rounded-tl-none lg:rounded-tr-2xl'; 
        } else if (expandedIndex === 1) {
            // Center Card: Both top corners are rounded to match the outer shape of the unexpanded cards.
            roundingClasses = 'lg:rounded-tl-2xl lg:rounded-tr-2xl';
        } else if (expandedIndex === 2) {
            // Right Card: Top-left is rounded, top-right is square.
            roundingClasses = 'lg:rounded-tl-2xl lg:rounded-tr-none';
        }
    }
    
    // Create an array of rendered cards, and then insert the expanded content after the cards.
    const renderedCards = roadmaps.map((roadmap) => (
        <FeaturedRoadmapCard 
            key={roadmap.id} 
            roadmap={roadmap} 
            isExpanded={expandedRoadmapId === roadmap.id}
            onToggleExpand={onToggleExpand}
        />
    ));

    // If a card is expanded, we render the full-width content right after the cards.
    const expandedContent = expandedRoadmap ? (
        <div 
            key="dynamic-expanded-content" 
            // Span full 3 columns.
            // CRITICAL FIX: Add margin-top to create the space (gap-8 is 2rem, or 32px)
            className={`col-span-full mt-4 lg:mt-8 featured-expanded-container`} 
            id={`expanded-content-${expandedRoadmap.id}`} // Added ID for scrolling
        >
            <div 
                // CRITICAL FIX: Ensure the outer box has no top rounding, and only bottom rounding.
                // FIX: Use bg-white in light mode for the outer container
                // This is the container that needs the most aggressive background fix
                className={`shadow-xl border transition-all duration-500 overflow-hidden p-0 rounded-b-2xl 
                            ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200 light-theme-bg-override'} 
                            ${roundingClasses}`} // Apply dynamic top rounding/squaring
            >
                {/* Inner container to restore padding and set background color from screenshot */}
                {/* This inner div is what gives the slight color difference */}
                <div className={`p-4 ${isDark ? 'bg-gray-800/50' : 'bg-gray-100/50'}`}>
                    <ExpandedCourseList roadmap={expandedRoadmap} onSelectCourse={onSelectCourse} />
                </div>
            </div>
        </div>
    ) : null;
    
    // Combine cards and expanded content
    const finalContent = [...renderedCards, expandedContent].filter(Boolean);

    return (
        // The main grid container
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
            {finalContent}
        </div>
    );
}

// --- Detailed View Component (RETAINED) ---
const DetailedRoadmapView = ({ roadmap, selectedCourseId, onBackToSelector, onClose }) => {
    const { isLoggedIn } = useAuth();
    const { isDark } = useTheme();
    
    // FIX 1: Ensure feather icons are rendered when this component updates
    useEffect(() => {
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    });

    // Determine which data source to use based on selection state
    const { steps, courseTitle, courseLink } = getSpecializedCourseRoadmap(roadmap.id, selectedCourseId);
    
    // Use the completion from the main roadmap object since that's user state
    const completion = roadmap.completion;
    const nextStepCourse = steps[completion]?.title || 'First Course';
    
    const handleContinue = (stepNumber) => {
        if (isLoggedIn) {
            // Logic to navigate to a specific course page
            alert(`Navigating to the course page for: ${steps[stepNumber-1].title}`);
        } else {
            alert('You must be signed in to continue learning.');
        }
    };
    
    // Determine back button text: if the roadmap has special courses, go back to the list
    const backButtonText = roadmap.requiresSelection || SPECIALIZED_COURSES[roadmap.id] 
        ? `Back to ${roadmap.category} Courses` 
        : 'Back to All Roadmaps';
    
    return (
        <div className={`${isDark ? 'dark-glass border-primary-500/50' : 'bg-white border-primary-200'} rounded-2xl shadow-premium-lg p-8 mb-16 border`}>
            <button 
                onClick={onClose} // Simplified: Always go back to the main list
                className="text-primary-400 hover:text-primary-600 mb-6 flex items-center transition-colors text-sm"
            >
                <i data-feather="arrow-left" className="w-4 h-4 mr-2"></i> {backButtonText}
            </button>
            
            {/* Display the SELECTED COURSE TITLE/ROADMAP */}
            <h2 className={`text-4xl font-bold mb-2 roadmap-title ${isDark ? 'text-white' : 'text-gray-900'}`}>{courseTitle} Roadmap</h2>
            <p className={`mt-2 text-xl roadmap-description border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} pb-4`}>{roadmap.description}</p>

            <div className={`flex items-center justify-between text-sm roadmap-description pt-4 pb-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <i data-feather="book-open" className="w-4 h-4 mr-2 text-primary-400"></i>
                        <span>{roadmap.courses} Courses</span>
                    </div>
                    <div className="flex items-center">
                        <i data-feather="clock" className="w-4 h-4 mr-2 text-primary-400"></i>
                        <span>{roadmap.months} Months</span>
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-bold text-success-400">{roadmap.completionRate}</div>
                    <div className={`text-xs roadmap-description`}>Success Rate</div>
                </div>
            </div>

            {/* Career Focus Section (Displaying general roadmap jobs for context) */}
            {roadmap.careerJobs && (
                <div className={`mt-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} pb-6`}>
                    <h3 className={`text-xl font-semibold roadmap-title mb-3`}>Target Career Paths</h3>
                    <div className="flex flex-wrap gap-3">
                        {roadmap.careerJobs.map((job, i) => (
                            <span key={i} className={`px-4 py-2 rounded-full text-sm font-medium border ${isDark ? 'bg-primary-500/10 text-primary-400 border-primary-400/30' : 'bg-primary-50 text-primary-600 border-primary-200'}`}>
                                {job}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Step-by-Step Roadmap (Single Column) */}
            <div className="mt-8 space-y-6">
                <h3 className={`text-xl font-semibold roadmap-title`}>Learning Modules ({steps.length} Steps)</h3>
                {steps.map((step, index) => (
                    <RoadmapStep 
                        key={index}
                        number={index + 1}
                        title={step.title}
                        description={step.description}
                        status={step.status}
                        // Pass the function to simulate continuing to a course
                        onContinue={() => handleContinue(index + 1)} 
                    />
                ))}
            </div>

            {/* Final CTA to Course */}
            <div className={`mt-10 pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} text-center`}>
                <h3 className={`text-xl font-semibold roadmap-title`}>Ready for the Next Step?</h3>
                <Link
                    to={courseLink} 
                    className={`roadmap-button-primary px-8 py-3 text-lg rounded-lg font-medium transition duration-300 inline-flex items-center`}
                    onClick={(e) => { e.preventDefault(); handleContinue(completion + 1); }}
                >
                    Go to Course: {nextStepCourse}
                    <i data-feather="arrow-right" className="ml-2 w-5 h-5"></i>
                </Link>
            </div>
        </div>
    );
};


const Roadmaps = () => {
    const { isLoggedIn } = useAuth();
    const { isDark } = useTheme(); 
    const [showBackToTop, setShowBackToTop] = useState(false); 
    const [detailedRoadmap, setDetailedRoadmap] = useState(null); 
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    // NEW STATE: To track which roadmaps are expanded
    const [expandedRoadmapId, setExpandedRoadmapId] = useState(null); 

    useEffect(() => {
        if (typeof feather !== 'undefined') {
            feather.replace();
        }

        const toggleVisibility = () => {
            if (window.scrollY > 300) { 
                setShowBackToTop(true);
            } else {
                setShowBackToTop(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        const hash = window.location.hash;
        if (hash && !detailedRoadmap) {
            const element = document.querySelector(hash);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }

        return () => window.removeEventListener('scroll', toggleVisibility);
    }, [detailedRoadmap]);

    // LOGIC RETAINED: Toggle the expanded state 
    const handleToggleExpand = (roadmapId) => {
        const isFeatured = FEATURED_ROADMAPS.some(r => r.id === roadmapId);
        
        setExpandedRoadmapId(prevId => {
            const newId = (prevId === roadmapId ? null : roadmapId);

            // FIX: If opening a roadmap (featured or simple), scroll the card into view
            if (newId) {
                // Determine the correct element ID to scroll to (either the featured content container, or the simple card wrapper)
                const scrollId = isFeatured 
                    ? `featured-card-${roadmapId}` 
                    : `simple-card-${roadmapId}`;
                
                // Wait for the DOM to update with the new content
                setTimeout(() => {
                    const element = document.getElementById(scrollId);
                    if (element) {
                        element.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start',
                            // Offset slightly for padding/header visual effect
                            inline: 'nearest' 
                        });
                    }
                }, 100); // Reduced delay for faster UX
            }
            return newId;
        });
    };

    // LOGIC RETAINED: Handle click on "View Roadmap" inside the expanded course list
    const handleSelectCourse = (roadmap, courseId) => {
        // You can add sign-in check here or rely on the DetailedView
        if (!isLoggedIn) {
            alert('You must be signed in to view a detailed roadmap.');
            return;
        }
        
        // This triggers the DetailedView to show up
        setDetailedRoadmap(roadmap);
        setSelectedCourseId(courseId);
        setExpandedRoadmapId(null); // Collapse the list
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Filter roadmaps
    const allRoadmapsExceptFeatured = ROADMAPS_DATA.filter(r => 
        !FEATURED_ROADMAPS.some(f => f.id === r.id)
    );
    
    const featuredRoadmapsToShow = FEATURED_ROADMAPS;
    const filteredRemainingRoadmaps = allRoadmapsExceptFeatured;

    // --- Conditional Rendering Logic in Render ---
    const renderDetailedView = () => {
        if (!detailedRoadmap) return null;

        // Simplified: always show the detailed view for the selected course
        return <DetailedRoadmapView 
            roadmap={detailedRoadmap} 
            selectedCourseId={selectedCourseId || detailedRoadmap.id} 
            onClose={() => { setDetailedRoadmap(null); setSelectedCourseId(null); }} 
        />;
    };


    return (
        <div className={`min-h-screen ${isDark ? 'dark-gradient-secondary' : 'bg-gray-50'}`}>
            {/* Hero Section */}
            <div className="gradient-bg text-white relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hero-floating hidden lg:block">
                    <i data-feather="target" className="w-40 h-40 text-primary-500 opacity-20"></i>
                </div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
                            <span className="block text-white">Your Personalized</span>
                            <span className="block text-primary-400">Learning Roadmaps</span>
                        </h1>
                        <p className="mt-4 max-w-3xl mx-auto text-xl text-gray-300">
                            Follow structured learning paths to master computer science concepts and land your dream job, step by step.
                        </p>
                        <div className="mt-10 flex justify-center">
                            <div className="inline-flex rounded-md shadow-xl">
                                <button
                                    onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })} 
                                    className={`roadmap-button-primary inline-flex items-center justify-center px-8 py-4 text-lg rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.03]`}
                                >
                                    Explore Roadmaps
                                    <i data-feather="arrow-down" className="w-5 h-5 ml-2"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`absolute bottom-0 left-0 right-0 h-16 ${isDark ? 'bg-gradient-to-t from-dark-gradient-secondary to-transparent' : 'bg-gradient-to-t from-gray-50 to-transparent'} z-0`}></div>
            </div>

            {/* Content Section: Switch between card view and detailed view */}
            <div className={`py-16 ${isDark ? 'dark-gradient-secondary' : 'bg-gray-50'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Render the specialized selection/detailed view logic */}
                    {detailedRoadmap ? (
                        renderDetailedView()
                    ) : (
                        /* Show Grid and List Views */
                        <>
                            {/* Featured Roadmaps Section - (MODIFIED TO USE FeatureRoadmapsGrid) */}
                            {featuredRoadmapsToShow.length > 0 && (
                                <>
                                    <div className="text-center mb-12">
                                        <h2 className="text-base text-primary-500 font-semibold tracking-wide uppercase">Featured</h2>
                                        <p className={`mt-2 text-4xl leading-8 font-extrabold tracking-tight sm:text-5xl roadmap-title`}>
                                            Popular Learning Paths
                                        </p>
                                        <p className={`mt-4 max-w-2xl text-xl roadmap-description mx-auto`}>
                                            Start with these comprehensive roadmaps designed by industry experts
                                        </p>
                                    </div>
                                    
                                    {/* Using the new component to manage the grid and expanded content positioning */}
                                    <FeaturedRoadmapsGrid 
                                        roadmaps={featuredRoadmapsToShow}
                                        expandedRoadmapId={expandedRoadmapId}
                                        onToggleExpand={handleToggleExpand}
                                        onSelectCourse={handleSelectCourse}
                                    />
                                </>
                            )}
                            
                            {/* Remaining Roadmaps Section - Simple Card, One by One (Mobile Optimized) - EXPANSION RETAINED */}
                            {filteredRemainingRoadmaps.length > 0 && (
                                <>
                                    <h2 className={`text-3xl font-extrabold tracking-tight sm:text-4xl text-center mt-16 mb-12 roadmap-title`}>
                                        Other Roadmaps
                                    </h2 >
                                    <div className="space-y-4">
                                        {filteredRemainingRoadmaps.map((roadmap) => (
                                            <SimpleRoadmapCard 
                                                key={roadmap.id} 
                                                roadmap={roadmap} 
                                                isExpanded={expandedRoadmapId === roadmap.id}
                                                onToggleExpand={handleToggleExpand}
                                                onSelectCourse={handleSelectCourse}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
            
            {/* Final CTA (Button color retained from previous update) */}
            <div className={`py-20 ${isDark ? 'dark-gradient-secondary' : 'bg-gray-50'}`}> 
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-premium-lg relative overflow-hidden py-16 px-8"> 
                        <div className="absolute inset-0 bg-black opacity-5"></div>
                        
                        <div className="relative"> 
                            <div className="lg:flex lg:items-center lg:justify-between text-center lg:text-left">
                                <div className="flex-1">
                                    <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                                        <span className="block">Ready to build your career?</span>
                                        <span className="block text-primary-100 mt-2 text-xl">Access the full library, free for 7 days.</span>
                                    </h2 >
                                    <p className="mt-4 max-w-3xl text-lg text-primary-100 mx-auto lg:mx-0">
                                        No credit card required. Cancel anytime.
                                    </p>
                                </div>
                                <div className="mt-8 flex justify-center lg:mt-0 lg:flex-shrink-0">
                                    <div className="inline-flex rounded-md shadow-lg">
                                        <Link 
                                            to={isLoggedIn ? "/problems" : "/signup"} 
                                            className={`inline-flex items-center justify-center px-8 py-4 text-lg rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.03] 
                                                bg-success-600 hover:bg-success-700 text-white`} 
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

            {/* --- Floating Buttons --- */}
            <Link 
                to="/code" 
                id="floating-action-button" 
                // FIX: Added sm:bottom-6 to retain original desktop position, and bottom-20 for mobile offset (h-16 + bottom-4 = bottom-20)
                className="fixed bottom-20 sm:bottom-6 right-6 h-14 w-14 rounded-full dark-gradient-accent text-white flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl z-50"
            >
                <i data-feather="edit-3" className="h-6 w-6"></i>
            </Link>

            {/* Back-to-top button (Scroll logic retained) */}
            <button 
                id="back-to-top" 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                // FIX: Added sm:bottom-24 to retain original desktop position, and bottom-40 for mobile offset (h-16 + bottom-24 = bottom-40)
                className={`fixed bottom-40 sm:bottom-24 right-6 h-12 w-12 rounded-full dark-gradient-accent text-white flex items-center justify-center transition-all duration-300 shadow-lg z-50  ${
                    showBackToTop ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
            >
                <i data-feather="arrow-up" className="h-5 w-5"></i>
            </button>
        </div>
    );
};

export default Roadmaps;