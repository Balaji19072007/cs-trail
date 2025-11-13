// frontend/src/pages/Roadmaps.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import * as feather from 'feather-icons';

// --- MOCK HOOKS FOR DEMONSTRATION (REPLACE WITH REAL useTheme) ---
const useTheme = () => {
    const [theme, setTheme] = useState('dark');
    return { 
        theme, 
        toggleTheme: () => setTheme(prev => prev === 'dark' ? 'light' : 'dark'),
        isDark: theme === 'dark'
    };
};
// -----------------------------------------------------------------

// Simplified roadmap data
const ROADMAP_DATA = {
  "roadmaps": [
    {
      "id": "prog-langs",
      "title": "Programming Languages",
      "description": "Core language tracks to build programming fundamentals and problem-solving skills. Pick one to start; learn others later to broaden capability.",
      "children": [
        {
          "id": "c-lang",
          "title": "C Language",
          "short_description": "Low-level procedural language — great for learning memory, pointers, and fundamentals of computing.",
          "prerequisites": ["Basic computer literacy"],
          "estimated_hours": 80
        },
        {
          "id": "java-lang",
          "title": "Java Language",
          "short_description": "Object-oriented language suited for backend, enterprise apps, and Android foundations.",
          "prerequisites": ["Basic programming concepts (recommended)"],
          "estimated_hours": 100
        },
        {
          "id": "python-lang",
          "title": "Python Language",
          "short_description": "High-level, beginner-friendly language used in web, automation, data science, and AI.",
          "prerequisites": ["Basic computer literacy"],
          "estimated_hours": 90
        }
      ]
    },
    {
      "id": "fullstack",
      "title": "Full Stack Web Development",
      "description": "Build complete web applications: frontend UI, backend APIs, databases, and deployment.",
      "prerequisites": ["HTML basics", "Basic JavaScript recommended"],
      "estimated_hours": 220
    },
    {
      "id": "mobile",
      "title": "Mobile App Development",
      "description": "Design and build cross-platform mobile apps (Android & iOS) using modern frameworks.",
      "prerequisites": ["JavaScript or Dart knowledge recommended"],
      "estimated_hours": 160
    },
    {
      "id": "cybersec",
      "title": "Cyber Security",
      "description": "Learn defensive and offensive security fundamentals for protecting systems and networks.",
      "prerequisites": ["Basic networking knowledge recommended"],
      "estimated_hours": 180
    },
    {
      "id": "devops",
      "title": "DevOps",
      "description": "Automation, CI/CD, containerization and cloud operations to deliver software faster and more reliably.",
      "prerequisites": ["Comfort with command line", "Basic programming knowledge"],
      "estimated_hours": 200
    },
    {
      "id": "ai-ml",
      "title": "AI / Machine Learning",
      "description": "From math foundations to building ML models and deploying them.",
      "prerequisites": ["Python basics", "High-school level math recommended"],
      "estimated_hours": 240
    },
    {
      "id": "data-science",
      "title": "Data Science",
      "description": "Turn raw data into insights using analysis, visualization, and predictive modeling.",
      "prerequisites": ["Python basics", "Basic statistics"],
      "estimated_hours": 200
    }
  ]
};

// Icon mapping for roadmaps
const ROADMAP_ICONS = {
  'prog-langs': 'code',
  'fullstack': 'layout',
  'mobile': 'smartphone',
  'cybersec': 'shield',
  'devops': 'cloud',
  'ai-ml': 'cpu',
  'data-science': 'bar-chart-2'
};

// Color gradients for roadmaps
const ROADMAP_GRADIENTS = {
  'prog-langs': 'from-blue-700 to-blue-600',
  'fullstack': 'from-purple-700 to-purple-600',
  'mobile': 'from-green-700 to-green-600',
  'cybersec': 'from-red-700 to-red-600',
  'devops': 'from-orange-700 to-orange-600',
  'ai-ml': 'from-pink-700 to-pink-600',
  'data-science': 'from-indigo-700 to-indigo-600'
};

// Footer Component
const Footer = () => {
  const { isDark } = useTheme();
  
  return (
    <footer className={`${isDark ? 'bg-gray-900' : 'bg-gray-800'} text-white py-12`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* LEARN */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-300">LEARN</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Courses</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Danks</a></li>
            </ul>
          </div>
          
          {/* PRACTICE */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-300">PRACTICE</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Problems</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Challenges</a></li>
            </ul>
          </div>
          
          {/* COMMUNITY */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-300">COMMUNITY</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Forums</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Leaderboard</a></li>
            </ul>
          </div>
          
          {/* COMPANY */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-300">COMPANY</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Capsers</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            &copy; 2024 CodingPlatform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

// --- Roadmap Category Card ---
const RoadmapCategoryCard = ({ roadmap, isExpanded, onToggleExpand }) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (typeof feather !== 'undefined') {
      feather.replace();
    }
  });

  const handleToggle = (e) => {
    e.stopPropagation();
    onToggleExpand(roadmap.id);
  };

  const handleViewRoadmap = (e, roadmap, child = null) => {
    e.stopPropagation();
    
      if (child) {
    switch(child.id) {
      case 'c-lang':
        navigate('/roadmaps/c-programming');
        break;
      case 'python-lang':
        navigate('/roadmaps/python-programming');
        break;
      case 'java-lang':
        navigate('/roadmaps/java-programming'); 
        break;
      default:
        // For other roadmaps, show a message or navigate to general roadmap page
        const roadmapName = child.title;
        alert(`Viewing roadmap for: ${roadmapName}`);
    }
  } else {
    // For parent roadmap categories without children
    const roadmapName = roadmap.title;
    alert(`Viewing roadmap for: ${roadmapName}`);
  }
};

  const handleCardClick = (e) => {
    // Only toggle if the click is not on a button or link
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
      return;
    }
    onToggleExpand(roadmap.id);
  };

  const estimatedWeeks = Math.ceil(roadmap.estimated_hours / 20);

  return (
    <div className={`my-4 rounded-xl overflow-hidden border transition-all duration-300 ${
      isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
    } ${isExpanded ? 'shadow-lg' : 'shadow-md'}`}>
      
      {/* Header - Clickable */}
      <div 
        className="cursor-pointer p-6"
        onClick={handleCardClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${ROADMAP_GRADIENTS[roadmap.id]} flex items-center justify-center flex-shrink-0`}>
              <i data-feather={ROADMAP_ICONS[roadmap.id]} className="w-6 h-6 text-white"></i>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {roadmap.title}
              </h3>
              <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {roadmap.description}
              </p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <i data-feather="clock" className="w-4 h-4 mr-1 text-primary-400"></i>
                  <span>{estimatedWeeks} weeks • {roadmap.estimated_hours} hours</span>
                </div>
                
                {roadmap.prerequisites && (
                  <div className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <i data-feather="book-open" className="w-4 h-4 mr-1 text-primary-400"></i>
                    <span>{roadmap.prerequisites.length} prerequisites</span>
                  </div>
                )}
                
                {roadmap.children && (
                  <div className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <i data-feather="layers" className="w-4 h-4 mr-1 text-primary-400"></i>
                    <span>{roadmap.children.length} specializations</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleToggle}
            className={`text-primary-400 hover:text-primary-500 p-2 rounded-full transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          >
            <i data-feather="chevron-down" className="w-6 h-6"></i>
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          {/* Prerequisites */}
          {roadmap.prerequisites && (
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Prerequisites
              </h4>
              <div className="flex flex-wrap gap-2">
                {roadmap.prerequisites.map((prereq, index) => (
                  <span 
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm ${
                      isDark 
                        ? 'bg-gray-800 text-gray-300 border border-gray-700' 
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                  >
                    {prereq}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Children Roadmaps (Specializations) */}
          {roadmap.children ? (
            <div className="p-6">
              <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Choose Your Specialization
              </h4>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {roadmap.children.map((child) => (
                  <div 
                    key={child.id}
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <h5 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {child.title}
                    </h5>
                    <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {child.short_description}
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        {Math.ceil(child.estimated_hours / 20)} weeks
                      </span>
                      <button 
                        onClick={(e) => handleViewRoadmap(e, roadmap, child)}
                        className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
                      >
                        View Roadmap
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Regular roadmap CTA */
            <div className="p-6 text-center">
              <button 
                onClick={(e) => handleViewRoadmap(e, roadmap)}
                className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors duration-200 text-lg"
              >
                View Full Roadmap
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- Main Roadmaps Component ---
const Roadmaps = () => {
  const { isLoggedIn } = useAuth();
  const { isDark } = useTheme();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [expandedRoadmapId, setExpandedRoadmapId] = useState(null);

  useEffect(() => {
    if (typeof feather !== 'undefined') {
      feather.replace();
    }

    const toggleVisibility = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const handleToggleExpand = (roadmapId) => {
    setExpandedRoadmapId(prev => prev === roadmapId ? null : roadmapId);
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
              <span className="block text-white">Structured Learning</span>
              <span className="block text-primary-400">Roadmaps</span>
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-xl text-gray-300">
              Follow expert-designed paths to master in-demand skills. Each roadmap includes step-by-step guidance, projects, and clear outcomes.
            </p>
            <div className="mt-10 flex justify-center">
              <button
                onClick={() => document.getElementById('roadmaps-list').scrollIntoView({ behavior: 'smooth' })}
                className="roadmap-button-primary inline-flex items-center justify-center px-8 py-4 text-lg rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.03]"
              >
                Explore Roadmaps
                <i data-feather="arrow-down" className="w-5 h-5 ml-2"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-16" id="roadmaps-list">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-base text-primary-500 font-semibold tracking-wide uppercase">LEARNING PATHS</h2>
            <p className={`mt-2 text-4xl leading-8 font-extrabold tracking-tight sm:text-5xl ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Choose Your Career Path
            </p>
            <p className={`mt-4 max-w-2xl text-xl ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            } mx-auto`}>
              Comprehensive roadmaps designed by industry experts with real-world projects
            </p>
          </div>

          <div className="space-y-6">
            {ROADMAP_DATA.roadmaps.map((roadmap) => (
              <RoadmapCategoryCard
                key={roadmap.id}
                roadmap={roadmap}
                isExpanded={expandedRoadmapId === roadmap.id}
                onToggleExpand={handleToggleExpand}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className={`py-20 ${isDark ? 'dark-gradient-secondary' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-premium-lg relative overflow-hidden py-16 px-8">
            <div className="relative">
              <div className="lg:flex lg:items-center lg:justify-between text-center lg:text-left">
                <div className="flex-1">
                  <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                    <span className="block">Ready to start your journey?</span>
                    <span className="block text-primary-100 mt-2 text-xl">
                      Join thousands of learners building their careers
                    </span>
                  </h2>
                </div>
                <div className="mt-8 flex justify-center lg:mt-0 lg:flex-shrink-0">
                  <Link 
                    to={isLoggedIn ? "/problems" : "/signup"}
                    className="inline-flex items-center justify-center px-8 py-4 text-lg rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.03] bg-success-600 hover:bg-success-700 text-white"
                  >
                    {isLoggedIn ? 'Continue Learning' : 'Start Free Trial'}
                    <i data-feather="arrow-right" className="ml-2 w-5 h-5"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Floating Buttons */}
      <Link 
        to="/code" 
        className="fixed bottom-20 sm:bottom-6 right-6 h-14 w-14 rounded-full dark-gradient-accent text-white flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl z-50"
      >
        <i data-feather="edit-3" className="h-6 w-6"></i>
      </Link>

      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-40 sm:bottom-24 right-6 h-12 w-12 rounded-full dark-gradient-accent text-white flex items-center justify-center transition-all duration-300 shadow-lg z-50 ${
          showBackToTop ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <i data-feather="arrow-up" className="h-5 w-5"></i>
      </button>
    </div>
  );
};

export default Roadmaps;