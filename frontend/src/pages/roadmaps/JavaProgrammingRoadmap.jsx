// frontend/src/pages/roadmaps/JavaProgrammingRoadmap.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';

// Java Language Roadmap Data
const JAVA_LANGUAGE_ROADMAP = {
  "id": "java-lang",
  "title": "☕ Java Language Learning Roadmap",
  "description": "Master Java from scratch — learn OOP, data structures, and build console & real-world applications.",
  "short_description": "Master Java from scratch — learn OOP, data structures, and build console & real-world applications.",
  "prerequisites": ["Basic computer literacy"],
  "estimated_hours": 100,
  "difficulty": "Beginner to Intermediate",
  "category": "Programming Languages",
  "phases": [
    {
      "phase": 1,
      "title": "Setup & Basics",
      "goal": "Learn how Java works and set up your environment",
      "weeks": "Week 1",
      "topics": [
        "Installing JDK and IntelliJ IDEA / VS Code",
        "Writing first Java program (public class Main)",
        "Understanding JVM, JRE, JDK",
        "Syntax, Semicolons, Curly braces",
        "Comments and naming conventions"
      ],
      "practice": [
        "Hello World program",
        "Print your name and age",
        "Add two numbers"
      ],
     
    },
    {
      "phase": 2,
      "title": "Variables, Data Types & Operators",
      "goal": "Learn Java's strong typing system",
      "weeks": "Week 2",
      "topics": [
        "Variables and data types (int, float, double, char, boolean)",
        "Type casting (implicit & explicit)",
        "Operators (Arithmetic, Logical, Relational)",
        "Input using Scanner class",
        "Constants (final keyword)"
      ],
      "practice": [
        "Simple interest calculator",
        "Unit converter",
        "Area of circle"
      ]
    },
    {
      "phase": 3,
      "title": "Control Flow",
      "goal": "Learn decision-making and loops",
      "weeks": "Week 3",
      "topics": [
        "if, else if, else",
        "switch statements",
        "Loops: for, while, do-while",
        "break and continue",
        "Nested loops"
      ],
      "practice": [
        "Even/Odd checker",
        "Factorial of a number",
        "Number pattern generator"
      ],
     
    },
    {
      "phase": 4,
      "title": "Methods & OOP",
      "goal": "Learn object-oriented principles",
      "weeks": "Week 4-5",
      "topics": [
        "Defining and calling methods",
        "Method overloading",
        "Classes and objects",
        "Constructors",
        "this keyword",
        "Access modifiers (public, private, protected)"
      ],
      "practice": [
        "Student class with marks",
        "Bank account class",
        "Calculator class using OOP"
      ]
    },
    {
      "phase": 5,
      "title": "Arrays & Strings",
      "goal": "Work with collections of data",
      "weeks": "Week 6",
      "topics": [
        "Single & multidimensional arrays",
        "Enhanced for loops",
        "Common String methods (length(), charAt(), substring())",
        "StringBuilder and immutability"
      ],
      "practice": [
        "Find largest element in array",
        "Reverse string",
        "Palindrome checker"
      ]
    },
    {
      "phase": 6,
      "title": "Inheritance & Polymorphism",
      "goal": "Deepen your OOP understanding",
      "weeks": "Week 7-8",
      "topics": [
        "Inheritance",
        "Method overriding",
        "Abstract classes",
        "Interfaces",
        "Polymorphism"
      ],
      "practice": [
        "Employee management hierarchy",
        "Shape area calculator using inheritance"
      ]
    },
    {
      "phase": 7,
      "title": "Collections & Exception Handling",
      "goal": "Learn advanced Java utilities",
      "weeks": "Week 9",
      "topics": [
        "ArrayList, HashMap, Set",
        "Enhanced for-each",
        "Exception handling (try, catch, finally, throw)",
        "Custom exceptions"
      ],
      "practice": [
        "Inventory manager",
        "Simple login system with exceptions"
      ]
    },
    {
      "phase": 8,
      "title": "File Handling & Packages",
      "goal": "Learn modular and persistent programming",
      "weeks": "Week 10",
      "topics": [
        "File read/write (FileReader, BufferedReader)",
        "Creating and importing packages",
        "Accessing classes from other files",
        "Command-line arguments"
      ],
      "practice": [
        "Library management system",
        "File-based to-do app"
      ],
      
    }
  ],
  "mini_projects": [
    {
      "name": "Calculator App",
      "description": "Build a functional calculator application using OOP",
      "technologies": ["OOP", "Methods", "Basic I/O"],
      "type": "java",
      "difficulty": "Beginner"
    },
    {
      "name": "Quiz Game",
      "description": "Interactive quiz game with scoring system",
      "technologies": ["Control Structures", "Arrays", "Methods"],
      "type": "java",
      "difficulty": "Beginner"
    },
    {
      "name": "Student Management System",
      "description": "Manage student records with CRUD operations",
      "technologies": ["OOP", "File Handling", "Collections"],
      "type": "java",
      "difficulty": "Intermediate"
    },
    {
      "name": "Banking App",
      "description": "OOP-based banking application with accounts and transactions",
      "technologies": ["OOP", "Inheritance", "File Handling"],
      "type": "java",
      "difficulty": "Intermediate"
    },
    {
      "name": "Number Guessing Game",
      "description": "Interactive game with random number generation",
      "technologies": ["Control Structures", "Methods", "Random Numbers"],
      "type": "java",
      "difficulty": "Beginner"
    }
  ],
  "daily_plan": [
    {
      "time": "0-30 mins",
      "task": "Learn a new topic",
      "example": "Watch tutorial + take notes"
    },
    {
      "time": "30-90 mins",
      "task": "Practice",
      "example": "Solve coding problems"
    },
    {
      "time": "90-120 mins",
      "task": "Project work",
      "example": "Build mini console apps"
    }
  ],
  "tools": [
    "IDE: IntelliJ IDEA / Eclipse / VS Code",
    "Compiler: Java SE (JDK 17+)",
    "Practice Platforms: HackerRank Java, W3Schools Java"
  ],
  "outcome": "By the end of this roadmap, you'll master Object-Oriented Programming, build console and file-based projects, and be ready for Android Development or Java DSA.",
  "career_paths": [
    "Java Developer",
    "Android Developer",
    "Backend Developer",
    "Enterprise Application Developer",
    "Software Engineer",
    "Full Stack Developer (with additional skills)"
  ]
};

// Floating Animation Component
const FloatingAnimation = ({ fromPhase, toPhase, isVisible, onComplete }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-float">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
  );
};

// Separated Number Component with Enhanced Animation
const PhaseNumber = ({ number, isCompleted, isActive, isDark, isLast, isExpanded, showProgressAnimation }) => {
  return (
    <div className="flex flex-col items-center mr-4 md:mr-8 relative">
      <div className={`relative w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-lg md:text-xl font-bold border-4 transition-all duration-500 ${
        isCompleted
          ? 'bg-green-500 border-green-500 text-white shadow-lg scale-110'
          : isActive
            ? 'bg-primary-500 border-primary-500 text-white shadow-lg scale-110'
            : isDark
              ? 'bg-gray-800 border-gray-700 text-gray-400'
              : 'bg-white border-gray-300 text-gray-600'
      }`}>
        {number}
        
        {/* Completion Checkmark */}
        {isCompleted && (
          <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white animate-ping">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
              <svg className="w-2 h-2 md:w-3 md:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
        
        {/* Active Phase Indicator */}
        {isActive && !isCompleted && (
          <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-primary-500 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
            <svg className="w-2 h-2 md:w-3 md:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Enhanced Connecting Line */}
      {!isLast && (
        <div className={`w-1 h-full mt-2 transition-all duration-700 relative overflow-hidden ${
          isCompleted 
            ? 'bg-green-500' 
            : isActive
              ? 'bg-primary-500'
              : isDark 
                ? 'bg-gray-700' 
                : 'bg-gray-300'
        }`}>
          {/* Animated progress line */}
          {isCompleted && (
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-green-400 to-green-600 animate-pulse"></div>
          )}
          {showProgressAnimation && (
            <div className="absolute top-0 left-0 w-full h-0 bg-green-500 animate-lineFill"></div>
          )}
          {isActive && !isCompleted && (
            <div className="absolute top-0 left-0 w-full h-2 bg-primary-400 animate-bounce"></div>
          )}
        </div>
      )}
    </div>
  );
};

// Progress tracking component
const ProgressTracker = ({ currentStep, totalSteps, isDark }) => {
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Your Progress
        </h3>
        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {currentStep}/{totalSteps} phases completed
        </span>
      </div>
      <div className={`w-full rounded-full h-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <div 
          className="bg-primary-500 h-3 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

// Phase Header Component
const PhaseHeader = ({ phase, isExpanded, onToggle, isCompleted, isActive, isDark, index, isLast, showProgressAnimation }) => {
  return (
    <div className="flex items-start">
      <PhaseNumber 
        number={phase.phase} 
        isCompleted={isCompleted}
        isActive={isActive}
        isDark={isDark}
        isLast={isLast}
        isExpanded={isExpanded}
        showProgressAnimation={showProgressAnimation}
      />
      
      <div 
        className={`flex-1 p-4 md:p-6 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
          isExpanded 
            ? 'bg-primary-500 text-white shadow-lg border-primary-500 transform -translate-y-1' 
            : isCompleted
              ? 'bg-green-50 border-green-500 hover:border-green-600'
              : isActive
                ? 'bg-primary-50 border-primary-500 hover:border-primary-600'
                : isDark
                  ? 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:bg-gray-750'
                  : 'bg-white border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0 mb-3">
              <h3 className={`text-lg md:text-xl font-bold ${isExpanded ? 'text-white' : isDark ? 'text-white' : 'text-gray-900'}`}>
                {phase.title}
              </h3>
              <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium self-start md:self-auto ${
                isExpanded 
                  ? 'bg-white/20 text-white' 
                  : isCompleted
                    ? 'bg-green-500 text-white'
                    : isActive
                      ? 'bg-primary-500 text-white'
                      : isDark 
                        ? 'bg-gray-700 text-primary-400' 
                        : 'bg-primary-100 text-primary-700'
              }`}>
                {phase.weeks}
              </span>
            </div>
            <p className={`text-sm md:text-base font-medium ${isExpanded ? 'text-white/90' : isCompleted ? 'text-green-700' : isActive ? 'text-primary-700' : isDark ? 'text-primary-400' : 'text-primary-600'}`}>
              🎯 {phase.goal}
            </p>
          </div>

          {/* Arrow Button */}
          <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} ml-2`}>
            <svg 
              className={`w-5 h-5 md:w-6 md:h-6 ${isExpanded ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-600'}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

// Phase Content Component
const PhaseContent = ({ phase, isCompleted, onToggle, isDark, index, isExpanded, canMarkComplete, onMarkComplete }) => {
  if (!isExpanded) return null;

  const handleMarkComplete = () => {
    if (canMarkComplete && onMarkComplete) {
      onMarkComplete(index);
    }
  };

  return (
    <div className="flex">
      {/* Enhanced Connecting Line Space - Now properly connects */}
      <div className="w-16 md:w-24 mr-4 md:mr-8 flex flex-col items-center">
        {/* Extended connecting line when content is expanded */}
        <div className={`w-1 flex-1 transition-all duration-500 ${
          isCompleted 
            ? 'bg-green-500' 
            : isDark 
              ? 'bg-gray-700' 
              : 'bg-gray-300'
        }`}></div>
      </div>
      
      <div className={`flex-1 mt-2 p-4 md:p-6 rounded-xl border-2 transition-all duration-300 ${
        isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'
      }`}>
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Topics */}
          <div>
            <h4 className={`font-semibold mb-4 flex items-center text-base md:text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <span className="w-2 h-2 md:w-3 md:h-3 bg-primary-500 rounded-full mr-2 md:mr-3"></span>
              Topics Covered
            </h4>
            <ul className={`space-y-2 md:space-y-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {phase.topics.map((topic, topicIndex) => (
                <li key={topicIndex} className="flex items-start group transition-all duration-200 hover:translate-x-1 md:hover:translate-x-2">
                  <div className={`w-1 h-1 md:w-2 md:h-2 rounded-full mt-2 mr-3 md:mr-4 flex-shrink-0 transition-all duration-300 ${
                    isCompleted ? 'bg-primary-500' : isDark ? 'bg-gray-600 group-hover:bg-primary-500' : 'bg-gray-400 group-hover:bg-primary-500'
                  }`}></div>
                  <span className="text-sm md:text-base group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {topic}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Practice */}
          <div>
            <h4 className={`font-semibold mb-4 flex items-center text-base md:text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <span className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full mr-2 md:mr-3"></span>
              Hands-on Practice
            </h4>
            <ul className={`space-y-2 md:space-y-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {phase.practice.map((item, practiceIndex) => (
                <li key={practiceIndex} className="flex items-start group transition-all duration-200 hover:translate-x-1 md:hover:translate-x-2">
                  <div className={`w-1 h-1 md:w-2 md:h-2 rounded-full mt-2 mr-3 md:mr-4 flex-shrink-0 transition-all duration-300 ${
                    isCompleted ? 'bg-green-500' : isDark ? 'bg-gray-600 group-hover:bg-green-500' : 'bg-gray-400 group-hover:bg-green-500'
                  }`}></div>
                  <span className="text-sm md:text-base group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* YouTube Resource */}
        {phase.youtube_resource && (
          <div className="mt-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
            <h4 className={`font-semibold mb-2 flex items-center text-base md:text-lg text-yellow-800`}>
              <span className="mr-2">📺</span>
              YouTube Resource
            </h4>
            <p className="text-yellow-700 text-sm md:text-base">
              👉 {phase.youtube_resource}
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-700 flex justify-end">
          <button
            onClick={handleMarkComplete}
            className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold transition-all duration-300 transform text-sm md:text-base ${
              canMarkComplete ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed opacity-50'
            } ${
              isCompleted
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg animate-pulse'
                : isDark
                  ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg'
                  : 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg'
            }`}
            disabled={!canMarkComplete}
          >
            {isCompleted ? '✓ Phase Completed' : canMarkComplete ? 'Mark as Complete' : 'Complete Previous Phase First'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Outcome Section Component
const OutcomeSection = ({ isDark }) => {
  return (
    <div className="mt-12 space-y-8">
      {/* Learning Outcome */}
      <div className={`p-6 rounded-xl border-2 ${isDark ? 'border-primary-500/50 bg-primary-900/30' : 'border-primary-300 bg-primary-50/80'}`}>
        <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-primary-200' : 'text-primary-800'}`}>
          Learning Outcome
        </h2>
        <p className={`text-lg leading-relaxed ${isDark ? 'text-primary-100' : 'text-primary-700'}`}>
          {JAVA_LANGUAGE_ROADMAP.outcome}
        </p>
      </div>

      {/* Career Paths */}
      <div>
        <h3 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          🚀 Career Paths After Learning Java
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {JAVA_LANGUAGE_ROADMAP.career_paths.map((path, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                isDark ? 'border-gray-600 bg-gray-800 hover:bg-gray-750' : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <span className="w-3 h-3 bg-primary-500 rounded-full mr-3 flex-shrink-0"></span>
                <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{path}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Java Programming Roadmap Component
const JavaProgrammingRoadmap = () => {
  const { isLoggedIn } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [completedPhases, setCompletedPhases] = useState([]);
  const [expandedPhases, setExpandedPhases] = useState([0]);
  const [showFloatingAnimation, setShowFloatingAnimation] = useState(false);
  const [animationPhase, setAnimationPhase] = useState({ from: null, to: null });
  const [showProgressAnimation, setShowProgressAnimation] = useState(false);

  useEffect(() => {
    // Load progress from localStorage
    const savedProgress = localStorage.getItem('java-roadmap-progress');
    if (savedProgress) {
      try {
        const parsedProgress = JSON.parse(savedProgress);
        if (Array.isArray(parsedProgress)) {
          setCompletedPhases(parsedProgress);
        } else {
          setCompletedPhases([]);
          localStorage.setItem('java-roadmap-progress', JSON.stringify([]));
        }
      } catch (error) {
        console.error('Error parsing saved progress:', error);
        setCompletedPhases([]);
        localStorage.setItem('java-roadmap-progress', JSON.stringify([]));
      }
    } else {
      setCompletedPhases([]);
      localStorage.setItem('java-roadmap-progress', JSON.stringify([]));
    }
  }, []);

  const handleMarkComplete = (phaseIndex) => {
    const canMarkComplete = phaseIndex === 0 || completedPhases.includes(phaseIndex - 1);
    
    if (!canMarkComplete) {
      return;
    }

    const newCompletedPhases = [...completedPhases];
    if (!newCompletedPhases.includes(phaseIndex)) {
      // Show floating animation
      setAnimationPhase({ from: phaseIndex, to: phaseIndex + 1 });
      setShowFloatingAnimation(true);
      
      // Add to completed
      newCompletedPhases.push(phaseIndex);
      setCompletedPhases(newCompletedPhases);

      // Show progress animation
      setShowProgressAnimation(true);
      setTimeout(() => setShowProgressAnimation(false), 2000);

      // Hide floating animation after delay
      setTimeout(() => {
        setShowFloatingAnimation(false);
      }, 1500);
    }
  };

  // Save to localStorage whenever completedPhases changes
  useEffect(() => {
    localStorage.setItem('java-roadmap-progress', JSON.stringify(completedPhases));
  }, [completedPhases]);

  const handleExpandToggle = (phaseIndex) => {
    setExpandedPhases(prev => 
      prev.includes(phaseIndex) 
        ? prev.filter(phase => phase !== phaseIndex)
        : [...prev, phaseIndex]
    );
  };

  const isPhaseCompleted = (phaseIndex) => completedPhases.includes(phaseIndex);
  const isPhaseExpanded = (phaseIndex) => expandedPhases.includes(phaseIndex);
  const isPhaseActive = (phaseIndex) => {
    if (isPhaseExpanded(phaseIndex)) return true;
    const firstIncomplete = JAVA_LANGUAGE_ROADMAP.phases.findIndex((_, index) => !isPhaseCompleted(index));
    return phaseIndex === firstIncomplete;
  };

  const canMarkPhaseComplete = (phaseIndex) => {
    return phaseIndex === 0 || completedPhases.includes(phaseIndex - 1);
  };

  const completedCount = completedPhases.length;
  const totalPhases = JAVA_LANGUAGE_ROADMAP.phases.length;

  return (
    <div className={`min-h-screen ${isDark ? 'dark-gradient-secondary' : 'bg-gray-50'}`}>
      {/* Floating Animation */}
      <FloatingAnimation 
        fromPhase={animationPhase.from}
        toPhase={animationPhase.to}
        isVisible={showFloatingAnimation}
        onComplete={() => setShowFloatingAnimation(false)}
      />

      {/* Header */}
      <div className="gradient-bg text-white py-8 md:py-12 lg:py-16 relative">
        {/* Back Button - Fixed at top left */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
          <Link 
            to="/roadmaps" 
            className={`inline-flex items-center px-4 py-2 md:px-5 md:py-2.5 rounded-lg transition-all duration-300 border-2 font-semibold text-sm md:text-base ${
              isDark 
                ? 'bg-white/20 hover:bg-white/30 text-white border-white/40 hover:border-white/60 shadow-lg' 
                : 'bg-white/30 hover:bg-white/40 text-gray-800 border-white/50 hover:border-white/70 shadow-lg'
            } hover:scale-105`}
          >
            <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Roadmaps
          </Link>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6 lg:gap-8">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">{JAVA_LANGUAGE_ROADMAP.title}</h1>
              <p className="text-base md:text-lg lg:text-xl text-gray-300 mb-6 max-w-3xl">
                {JAVA_LANGUAGE_ROADMAP.description}
              </p>
              
              <div className="flex flex-wrap gap-3 md:gap-4 lg:gap-6 text-xs md:text-sm">
                <div className="flex items-center text-gray-300">
                  <span className="w-2 h-2 bg-primary-400 rounded-full mr-2"></span>
                  <span>{Math.ceil(JAVA_LANGUAGE_ROADMAP.estimated_hours / 20)} weeks • {JAVA_LANGUAGE_ROADMAP.estimated_hours} hours</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  <span>{JAVA_LANGUAGE_ROADMAP.difficulty}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  <span>{JAVA_LANGUAGE_ROADMAP.prerequisites.length} prerequisites</span>
                </div>
              </div>
            </div>
            
            <div className={`p-4 md:p-6 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-white/10'} backdrop-blur-sm w-full lg:w-auto`}>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-primary-400 mb-2">
                  {completedCount}/{totalPhases}
                </div>
                <div className="text-gray-300 text-xs md:text-sm mb-4">Phases Completed</div>
                <button 
                  onClick={() => document.getElementById('learning-path').scrollIntoView({ behavior: 'smooth' })}
                  className="w-full px-4 py-2 md:px-6 md:py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 text-sm md:text-base"
                >
                  Start Learning Journey
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
        <div id="learning-path">
          <ProgressTracker 
            currentStep={completedCount} 
            totalSteps={totalPhases}
            isDark={isDark}
          />
          
          <div className="mb-8">
            <h2 className={`text-xl md:text-2xl lg:text-3xl font-bold mb-6 md:mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Learning Path - 10 Weeks Journey
            </h2>
            <div className="space-y-6 md:space-y-8">
              {JAVA_LANGUAGE_ROADMAP.phases.map((phase, index) => (
                <div key={index}>
                  <PhaseHeader
                    phase={phase}
                    isExpanded={isPhaseExpanded(index)}
                    onToggle={() => handleExpandToggle(index)}
                    isCompleted={isPhaseCompleted(index)}
                    isActive={isPhaseActive(index)}
                    isDark={isDark}
                    index={index}
                    isLast={index === JAVA_LANGUAGE_ROADMAP.phases.length - 1}
                    showProgressAnimation={showProgressAnimation && index === completedCount}
                  />
                  <PhaseContent
                    phase={phase}
                    isCompleted={isPhaseCompleted(index)}
                    onToggle={handleMarkComplete}
                    isDark={isDark}
                    index={index}
                    isExpanded={isPhaseExpanded(index)}
                    canMarkComplete={canMarkPhaseComplete(index)}
                    onMarkComplete={handleMarkComplete}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Outcome Section at the end */}
        <OutcomeSection isDark={isDark} />
      </div>

      {/* Add custom animations to global styles */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px) scale(1); opacity: 1; }
          50% { transform: translateY(-20px) scale(1.1); opacity: 0.8; }
          100% { transform: translateY(-40px) scale(1.2); opacity: 0; }
        }
        @keyframes lineFill {
          0% { height: 0%; }
          100% { height: 100%; }
        }
        .animate-float {
          animation: float 1.5s ease-in-out forwards;
        }
        .animate-lineFill {
          animation: lineFill 2s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default JavaProgrammingRoadmap;