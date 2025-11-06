// frontend/src/pages/Courses.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import * as feather from 'feather-icons';

// Comprehensive Course Data matching the HTML structure
const COURSES_DATA = [
    // Programming Fundamentals
    { 
        id: 1, 
        category: 'programming', 
        title: 'C Language for Beginners', 
        lessons: 30, 
        instructorInitials: 'BJ', 
        instructorName: 'Bob Johnson',
        difficulty: 'Beginner', 
        color: 'primary', 
        description: 'Learn C language from scratch with hands-on exercises and projects', 
        duration: '6 weeks', 
        rating: 4.8, 
        students: 12500,
        gradient: 'from-primary-500 to-primary-600',
        iconColor: 'text-primary-400'
    },
    { 
        id: 2, 
        category: 'programming', 
        title: 'Python for Beginners', 
        lessons: 25, 
        instructorInitials: 'AJ', 
        instructorName: 'Alex Johnson',
        difficulty: 'Beginner', 
        color: 'primary', 
        description: 'Learn Python from scratch with hands-on exercises and projects', 
        duration: '5 weeks', 
        rating: 4.9, 
        students: 18750,
        gradient: 'from-primary-500 to-primary-600',
        iconColor: 'text-primary-400'
    },
    { 
        id: 3, 
        category: 'programming', 
        title: 'Java Fundamentals', 
        lessons: 30, 
        instructorInitials: 'PP', 
        instructorName: 'Priya Patel',
        difficulty: 'Intermediate', 
        color: 'primary', 
        description: 'Master object-oriented programming with Java', 
        duration: '6 weeks', 
        rating: 4.7, 
        students: 9800,
        gradient: 'from-primary-500 to-primary-600',
        iconColor: 'text-primary-400'
    },

    // Web Development
    { 
        id: 4, 
        category: 'web', 
        title: 'Modern Frontend Mastery', 
        lessons: 45, 
        instructorInitials: 'ER', 
        instructorName: 'Emma Rodriguez',
        difficulty: 'Beginner', 
        color: 'blue', 
        description: 'Master HTML5, CSS3, JavaScript, and modern frameworks like React and Vue.js', 
        duration: '8 weeks', 
        rating: 4.8, 
        students: 15200,
        gradient: 'from-blue-600 to-blue-500',
        iconColor: 'text-blue-400'
    },
    { 
        id: 5, 
        category: 'web', 
        title: 'Node.js & Express', 
        lessons: 38, 
        instructorInitials: 'JK', 
        instructorName: 'James Kim',
        difficulty: 'Intermediate', 
        color: 'blue', 
        description: 'Build scalable backend services with Node.js, Express, and MongoDB', 
        duration: '7 weeks', 
        rating: 4.7, 
        students: 11200,
        gradient: 'from-blue-600 to-blue-500',
        iconColor: 'text-blue-400'
    },
    { 
        id: 6, 
        category: 'web', 
        title: 'MERN Stack Mastery', 
        lessons: 52, 
        instructorInitials: 'AM', 
        instructorName: 'Aisha Mohammed',
        difficulty: 'Intermediate', 
        color: 'blue', 
        description: 'Build complete web applications with MongoDB, Express, React, and Node.js', 
        duration: '10 weeks', 
        rating: 4.9, 
        students: 8900,
        gradient: 'from-blue-600 to-blue-500',
        iconColor: 'text-blue-400'
    },

    // Data Science
    { 
        id: 7, 
        category: 'data', 
        title: 'Data Science with Python', 
        lessons: 35, 
        instructorInitials: 'DR', 
        instructorName: 'Dr. Rodriguez',
        difficulty: 'Beginner', 
        color: 'purple', 
        description: 'Master data analysis, visualization, and manipulation using pandas, NumPy, and Matplotlib', 
        duration: '7 weeks', 
        rating: 4.7, 
        students: 8900,
        gradient: 'from-purple-600 to-purple-500',
        iconColor: 'text-purple-400'
    },
    { 
        id: 8, 
        category: 'data', 
        title: 'Data Analysis & Visualization', 
        lessons: 28, 
        instructorInitials: 'SM', 
        instructorName: 'Sarah Mitchell',
        difficulty: 'Intermediate', 
        color: 'purple', 
        description: 'Create compelling data visualizations with Tableau, Power BI, and Python libraries', 
        duration: '6 weeks', 
        rating: 4.6, 
        students: 7600,
        gradient: 'from-purple-600 to-purple-500',
        iconColor: 'text-purple-400'
    },
    { 
        id: 9, 
        category: 'data', 
        title: 'Statistics for Data Science', 
        lessons: 32, 
        instructorInitials: 'DW', 
        instructorName: 'Dr. Wilson',
        difficulty: 'Intermediate', 
        color: 'purple', 
        description: 'Master statistical concepts, hypothesis testing, and regression analysis for data insights', 
        duration: '6 weeks', 
        rating: 4.8, 
        students: 5400,
        gradient: 'from-purple-600 to-purple-500',
        iconColor: 'text-purple-400'
    },

    // Algorithms
    { 
        id: 10, 
        category: 'algorithms', 
        title: 'DSA In C', 
        lessons: 35, 
        instructorInitials: 'DW', 
        instructorName: 'Dr. Wong',
        difficulty: 'Intermediate', 
        color: 'green', 
        description: 'Master Data Structures and Algorithms using C with hands-on coding exercises', 
        duration: '7 weeks', 
        rating: 4.7, 
        students: 6200,
        gradient: 'from-green-600 to-green-500',
        iconColor: 'text-green-400'
    },
    { 
        id: 11, 
        category: 'algorithms', 
        title: 'DSA In Java', 
        lessons: 40, 
        instructorInitials: 'DR', 
        instructorName: 'Dr. Rajesh',
        difficulty: 'Intermediate', 
        color: 'green', 
        description: 'Master Data Structures and Algorithms using Java with OOP principles', 
        duration: '8 weeks', 
        rating: 4.8, 
        students: 5800,
        gradient: 'from-green-600 to-green-500',
        iconColor: 'text-green-400'
    },
    { 
        id: 12, 
        category: 'algorithms', 
        title: 'DSA In Python', 
        lessons: 30, 
        instructorInitials: 'DG', 
        instructorName: 'Dr. Garcia',
        difficulty: 'Beginner', 
        color: 'green', 
        description: 'Master Data Structures and Algorithms using Python with clean syntax', 
        duration: '6 weeks', 
        rating: 4.6, 
        students: 7100,
        gradient: 'from-green-600 to-green-500',
        iconColor: 'text-green-400'
    },

    // Mobile Development
    { 
        id: 13, 
        category: 'mobile', 
        title: 'Android with Kotlin', 
        lessons: 35, 
        instructorInitials: 'DW', 
        instructorName: 'Dr. Watson',
        difficulty: 'Beginner', 
        color: 'yellow', 
        description: 'Build native Android apps with Kotlin, Material Design, and modern architecture', 
        duration: '7 weeks', 
        rating: 4.5, 
        students: 4300,
        gradient: 'from-yellow-600 to-yellow-500',
        iconColor: 'text-yellow-400'
    },
    { 
        id: 14, 
        category: 'mobile', 
        title: 'iOS with Swift', 
        lessons: 32, 
        instructorInitials: 'AS', 
        instructorName: 'Anna Smith',
        difficulty: 'Intermediate', 
        color: 'yellow', 
        description: 'Create beautiful iOS apps with Swift, SwiftUI, and Apple\'s latest frameworks', 
        duration: '6 weeks', 
        rating: 4.7, 
        students: 3800,
        gradient: 'from-yellow-600 to-yellow-500',
        iconColor: 'text-yellow-400'
    },
    { 
        id: 15, 
        category: 'mobile', 
        title: 'React Native', 
        lessons: 28, 
        instructorInitials: 'MB', 
        instructorName: 'Mike Brown',
        difficulty: 'Beginner', 
        color: 'yellow', 
        description: 'Build cross-platform mobile apps with React Native and JavaScript', 
        duration: '6 weeks', 
        rating: 4.4, 
        students: 5200,
        gradient: 'from-yellow-600 to-yellow-500',
        iconColor: 'text-yellow-400'
    },

    // AI/ML
    { 
        id: 16, 
        category: 'ai', 
        title: 'Intro to ML', 
        lessons: 35, 
        instructorInitials: 'LW', 
        instructorName: 'Dr. Lisa Wong',
        difficulty: 'Intermediate', 
        color: 'red', 
        description: 'Learn supervised and unsupervised learning with scikit-learn and real-world projects', 
        duration: '7 weeks', 
        rating: 4.8, 
        students: 6700,
        gradient: 'from-red-600 to-red-500',
        iconColor: 'text-red-400'
    },
    { 
        id: 17, 
        category: 'ai', 
        title: 'Neural Networks', 
        lessons: 40, 
        instructorInitials: 'RP', 
        instructorName: 'Dr. Raj Patel',
        difficulty: 'Advanced', 
        color: 'red', 
        description: 'Build deep learning models with TensorFlow, Keras, and PyTorch', 
        duration: '8 weeks', 
        rating: 4.9, 
        students: 4900,
        gradient: 'from-red-600 to-red-500',
        iconColor: 'text-red-400'
    },
    { 
        id: 18, 
        category: 'ai', 
        title: 'NLP Fundamentals', 
        lessons: 30, 
        instructorInitials: 'MG', 
        instructorName: 'Dr. Maria Garcia',
        difficulty: 'Intermediate', 
        color: 'red', 
        description: 'Process and analyze text data with modern NLP techniques and transformers', 
        duration: '6 weeks', 
        rating: 4.7, 
        students: 4100,
        gradient: 'from-red-600 to-red-500',
        iconColor: 'text-red-400'
    },

    // Security
    { 
        id: 19, 
        category: 'security', 
        title: 'Penetration Testing', 
        lessons: 45, 
        instructorInitials: 'KW', 
        instructorName: 'Kevin White',
        difficulty: 'Intermediate', 
        color: 'indigo', 
        description: 'Learn ethical hacking techniques and penetration testing methodologies', 
        duration: '9 weeks', 
        rating: 4.8, 
        students: 3200,
        gradient: 'from-indigo-600 to-indigo-500',
        iconColor: 'text-indigo-400'
    },
    { 
        id: 20, 
        category: 'security', 
        title: 'Network Defense', 
        lessons: 38, 
        instructorInitials: 'SG', 
        instructorName: 'Sarah Green',
        difficulty: 'Intermediate', 
        color: 'indigo', 
        description: 'Master network security protocols, firewalls, and intrusion detection systems', 
        duration: '8 weeks', 
        rating: 4.6, 
        students: 2800,
        gradient: 'from-indigo-600 to-indigo-500',
        iconColor: 'text-indigo-400'
    },
    { 
        id: 21, 
        category: 'security', 
        title: 'Applied Cryptography', 
        lessons: 32, 
        instructorInitials: 'TB', 
        instructorName: 'Tom Black',
        difficulty: 'Advanced', 
        color: 'indigo', 
        description: 'Learn encryption algorithms, digital signatures, and secure communication protocols', 
        duration: '6 weeks', 
        rating: 4.9, 
        students: 2100,
        gradient: 'from-indigo-600 to-indigo-500',
        iconColor: 'text-indigo-400'
    },

    // DevOps
    { 
        id: 22, 
        category: 'devops', 
        title: 'Intro to DevOps', 
        lessons: 22, 
        instructorInitials: 'DG', 
        instructorName: 'Dr. Galesles',
        difficulty: 'Beginner', 
        color: 'pink', 
        description: 'Learn CI/CD, containerization, and infrastructure as code fundamentals', 
        duration: '4 weeks', 
        rating: 4.5, 
        students: 5600,
        gradient: 'from-pink-600 to-pink-500',
        iconColor: 'text-pink-400'
    },
    { 
        id: 23, 
        category: 'devops', 
        title: 'Docker & Kubernetes', 
        lessons: 35, 
        instructorInitials: 'RL', 
        instructorName: 'Rachel Lee',
        difficulty: 'Intermediate', 
        color: 'pink', 
        description: 'Master container orchestration with Docker, Kubernetes, and cloud deployment', 
        duration: '7 weeks', 
        rating: 4.7, 
        students: 4800,
        gradient: 'from-pink-600 to-pink-500',
        iconColor: 'text-pink-400'
    },
    { 
        id: 24, 
        category: 'devops', 
        title: 'AWS Solutions Architect', 
        lessons: 40, 
        instructorInitials: 'MT', 
        instructorName: 'Mark Taylor',
        difficulty: 'Intermediate', 
        color: 'pink', 
        description: 'Design and deploy scalable applications on Amazon Web Services', 
        duration: '8 weeks', 
        rating: 4.8, 
        students: 5200,
        gradient: 'from-pink-600 to-pink-500',
        iconColor: 'text-pink-400'
    }
];

const CourseCard = ({ course }) => {
    const { isLoggedIn } = useAuth();
    
    // Use the color definitions from Tailwind.config.js for badge classes
    const difficultyClasses = {
        'Beginner': 'bg-success-100 text-success-800',
        'Intermediate': 'bg-warning-100 text-warning-800',
        'Advanced': 'bg-error-100 text-error-800'
    };

    const categoryColors = {
        'programming': { badge: 'bg-primary-100 text-primary-800', gradient: 'from-primary-500 to-primary-600', iconColor: 'text-primary-400' },
        'web': { badge: 'bg-blue-100 text-blue-800', gradient: 'from-blue-600 to-blue-500', iconColor: 'text-blue-400' },
        'data': { badge: 'bg-purple-100 text-purple-800', gradient: 'from-purple-600 to-purple-500', iconColor: 'text-purple-400' },
        'algorithms': { badge: 'bg-green-100 text-green-800', gradient: 'from-green-600 to-green-500', iconColor: 'text-green-400' },
        'mobile': { badge: 'bg-yellow-100 text-yellow-800', gradient: 'from-yellow-600 to-yellow-500', iconColor: 'text-yellow-400' },
        'ai': { badge: 'bg-red-100 text-red-800', gradient: 'from-red-600 to-red-500', iconColor: 'text-red-400' },
        'security': { badge: 'bg-indigo-100 text-indigo-800', gradient: 'from-indigo-600 to-indigo-500', iconColor: 'text-indigo-400' },
        'devops': { badge: 'bg-pink-100 text-pink-800', gradient: 'from-pink-600 to-pink-500', iconColor: 'text-pink-400' }
    };

    const handleStartClick = (e) => {
        if (!isLoggedIn) {
            e.preventDefault();
            window.location.href = '/signup';
        }
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'programming': 'code',
            'web': 'layout',
            'data': 'database',
            'algorithms': 'cpu',
            'mobile': 'smartphone',
            'ai': 'activity',
            'security': 'shield',
            'devops': 'server'
        };
        return icons[category] || 'book-open';
    };
    
    // Note: The card-hover h3 selector in index.css will handle the text color based on theme
    const iconColor = categoryColors[course.category]?.iconColor || 'text-white';


    return (
        // Changed styling to use card-hover for dark theme compatibility
        <div className="card-hover rounded-2xl shadow-md overflow-hidden transition-all duration-300">
            <div className="relative">
                {/* Background Image/Gradient Area */}
                <div className={`bg-gradient-to-br ${course.gradient} h-40 flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black opacity-30"></div>
                    <div className="text-center p-4 z-10">
                        {/* Course Icon */}
                        <div className={`w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                            <i data-feather={getCategoryIcon(course.category)} className="w-7 h-7 text-white"></i>
                        </div>
                        <p className="text-white font-medium text-sm mt-1">
                            {course.category.charAt(0).toUpperCase() + course.category.slice(1)}
                        </p>
                    </div>
                </div>
                
                {/* Badges */}
                <div className="course-badge absolute top-4 right-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[course.category].badge}`}>
                        {course.lessons} Lessons
                    </span>
                </div>
                <div className="difficulty-badge absolute top-4 left-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyClasses[course.difficulty]}`}>
                        {course.difficulty}
                    </span>
                </div>
            </div>
            
            {/* Card Content */}
            <div className="p-6">
                {/* FIX: Use theme-aware class "text-white" for title (resolved in index.css to proper contrast color) */}
                <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                <p className="mt-2 text-sm text-gray-400 h-10 overflow-hidden">
                    {course.description}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-gray-700 dark:border-gray-200/20 pt-4">
                    <div className="flex items-center">
                        <div className={`h-8 w-8 rounded-full bg-gradient-to-r ${course.gradient} flex items-center justify-center text-white text-xs font-bold shadow-md`}>
                            {course.instructorInitials}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-white">{course.instructorName}</p>
                            <p className="text-xs text-gray-400">Duration: {course.duration}</p>
                        </div>
                    </div>
                    
                    {/* FIX: Use dark-btn-secondary for consistent secondary button style */}
                    <button 
                        onClick={handleStartClick}
                        className={`dark-btn-secondary flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition duration-300`}
                    >
                        {isLoggedIn ? 'Start' : 'Sign Up'}
                        <i data-feather="chevron-right" className="w-4 h-4 ml-1"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

const Courses = () => {
    const { isLoggedIn } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Initialize feather icons
        if (window.feather) {
            window.feather.replace();
        }

        // Back to top visibility
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Group courses by category
    const coursesByCategory = COURSES_DATA.reduce((acc, course) => {
        if (!acc[course.category]) {
            acc[course.category] = [];
        }
        acc[course.category].push(course);
        return acc;
    }, {});

    // Filter courses based on selected category and search query
    const filteredCourses = COURSES_DATA.filter(course => {
        const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            course.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const categories = [
        { id: 'all', name: 'All Courses', icon: 'grid', count: COURSES_DATA.length, color: 'primary' },
        { id: 'programming', name: 'Programming', icon: 'code', count: coursesByCategory.programming?.length || 0, color: 'primary' },
        { id: 'web', name: 'Web Dev', icon: 'layout', count: coursesByCategory.web?.length || 0, color: 'blue' },
        { id: 'data', name: 'Data Science', icon: 'database', count: coursesByCategory.data?.length || 0, color: 'purple' },
        { id: 'algorithms', name: 'Algorithms', icon: 'cpu', count: coursesByCategory.algorithms?.length || 0, color: 'green' },
        { id: 'mobile', name: 'Mobile Dev', icon: 'smartphone', count: coursesByCategory.mobile?.length || 0, color: 'yellow' },
        { id: 'ai', name: 'AI/ML', icon: 'activity', count: coursesByCategory.ai?.length || 0, color: 'red' },
        { id: 'security', name: 'Security', icon: 'shield', count: coursesByCategory.security?.length || 0, color: 'indigo' },
        { id: 'devops', name: 'DevOps', icon: 'server', count: coursesByCategory.devops?.length || 0, color: 'pink' },
    ];

    const categorySections = [
        { id: 'programming', title: 'Programming Fundamentals', description: 'Core concepts using C, Python, and Java', count: 8, color: 'primary' },
        { id: 'web', title: 'Web Development', description: 'Build modern, responsive web applications', count: 6, color: 'blue' },
        { id: 'data', title: 'Data Science', description: 'Statistical analysis, visualization, and machine learning', count: 5, color: 'purple' },
        { id: 'algorithms', title: 'Data Structures & Algorithms', description: 'Master the fundamentals of efficient problem solving', count: 4, color: 'green' },
        { id: 'mobile', title: 'Mobile App Development', description: 'Build cross-platform and native mobile applications', count: 3, color: 'yellow' },
        { id: 'ai', title: 'Artificial Intelligence & Machine Learning', description: 'Build intelligent systems and predictive models', count: 5, color: 'red' },
        { id: 'security', title: 'Cybersecurity', description: 'Protect systems and networks from digital attacks', count: 3, color: 'indigo' },
        { id: 'devops', title: 'DevOps & Cloud Computing', description: 'Automate workflows and deploy scalable applications', count: 4, color: 'pink' },
    ];

    return (
        <div className="min-h-screen dark-gradient-secondary">
            {/* Hero Section */}
            <div className="gradient-bg text-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hero-floating hidden lg:block">
                        <i data-feather="book-open" className="w-40 h-40 text-primary-500 opacity-20"></i>
                    </div>
                    
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
                            <span className="block text-white">Explore Our</span>
                            <span className="block text-primary-400">Course Catalog</span>
                        </h1>
                        <p className="mt-4 max-w-3xl mx-auto text-xl text-gray-300">
                            Master computer science with our comprehensive curriculum covering all key areas from fundamental coding to advanced AI.
                        </p>
                        <div className="mt-10 flex justify-center">
                            <div className="inline-flex rounded-md shadow-xl">
                                {/* FIX: CTA Button style changed to match Home.jsx */}
                                <button 
                                    onClick={() => scrollToSection('categories')}
                                    className="dark-btn inline-flex items-center justify-center px-8 py-4 text-lg rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.03]"
                                >
                                    Start Learning Now
                                    <i data-feather="arrow-right" className="ml-2 w-5 h-5"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Base for section below */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-dark-gradient-secondary to-transparent z-0"></div>
            </div>

            {/* Category Filter Bar (Uses dark-gradient-secondary for separation) */}
            <div className="dark-gradient-secondary py-8 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="dark-glass p-4 rounded-lg shadow-lg">
                        {/* FIX: Added overflow-x-auto for smooth mobile scrolling of buttons */}
                        <div className="flex overflow-x-auto whitespace-nowrap space-x-2 pb-2 lg:justify-center">
                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    // FIX: Uses theme-aware button classes for unselected state
                                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 border ${
                                        selectedCategory === category.id
                                            ? 'bg-primary-500 text-white border-primary-500 shadow-md' // Selected: Primary color
                                            : 'category-button-default' // Unselected: Uses custom CSS variables for light/dark theme contrast
                                    }`}
                                >
                                    {category.name} ({category.count})
                                </button>
                            ))}
                        </div>
                        {/* Search Box Integration */}
                        <div className="w-full sm:w-64 mt-4 mx-auto">
                            <input 
                                type="text"
                                placeholder="Search courses..."
                                className="form-input w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-primary-500"
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>


            {/* Course Sections (Filtered based on selection) */}
            <div className="py-16 dark-gradient-secondary">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Render sections if 'all' is selected or only the selected section */}
                    {categorySections
                        .filter(section => selectedCategory === 'all' || section.id === selectedCategory)
                        .map(section => (
                            <div key={section.id} id={section.id} className={`pb-16`}>
                                <div className="flex items-center justify-between mb-12">
                                    <div>
                                        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                                            {section.title}
                                        </h2>
                                        <p className="mt-2 text-lg text-gray-400">
                                            {section.description}
                                        </p>
                                    </div>
                                    <Link to="/roadmaps" className="text-primary-400 hover:text-white transition-colors duration-200 text-sm font-medium hidden sm:flex items-center">
                                        View Full Roadmap
                                        <i data-feather="arrow-right" className="w-4 h-4 ml-1"></i>
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                    {COURSES_DATA.filter(course => 
                                        course.category === section.id && (
                                            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            course.description.toLowerCase().includes(searchQuery.toLowerCase())
                                        )
                                    ).map(course => (
                                        <CourseCard key={course.id} course={course} />
                                    ))}
                                </div>
                                {/* No results message for a section */}
                                {COURSES_DATA.filter(course => 
                                    course.category === section.id && (
                                        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        course.description.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                ).length === 0 && searchQuery.length > 0 && (
                                    <div className="mt-8 text-center p-6 dark-glass border border-gray-700">
                                        <p className="text-gray-400">No courses found matching "{searchQuery}" in {section.title}.</p>
                                    </div>
                                )}
                            </div>
                    ))}
                    
                    {/* General No Results Message */}
                    {filteredCourses.length === 0 && searchQuery.length > 0 && selectedCategory === 'all' && (
                        <div className="text-center p-12 dark-glass border border-gray-700">
                            <i data-feather="search" className="w-10 h-10 text-gray-500 mx-auto mb-4"></i>
                            <h3 className="text-xl font-semibold text-white mb-2">No courses match your search.</h3>
                            <p className="text-gray-400">Try a different keyword or check other categories.</p>
                        </div>
                    )}
                </div>
            </div>
            

            {/* Final CTA Container - FIX: Styled to match Home.jsx container */}
            <div className="py-20 dark-gradient-secondary"> 
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* The primary CTA box is now contained here, respecting max-width and screen padding */}
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-premium-lg relative overflow-hidden py-16 px-8"> 
                        <div className="absolute inset-0 bg-black opacity-5"></div>
                        
                        <div className="relative"> 
                            <div className="lg:flex lg:items-center lg:justify-between text-center lg:text-left">
                                <div className="flex-1">
                                    <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                                        <span className="block">Ready to build your career?</span>
                                        {/* FIX: Reduced the size of the secondary text */}
                                        <span className="block text-primary-100 mt-2 text-xl">Access the full library, free for 7 days.</span>
                                    </h2>
                                    <p className="mt-4 max-w-3xl text-lg text-primary-100 mx-auto lg:mx-0">
                                        No credit card required. Cancel anytime.
                                    </p>
                                </div>
                                <div className="mt-8 flex justify-center lg:mt-0 lg:flex-shrink-0">
                                    <div className="inline-flex rounded-md shadow-lg">
                                        {/* FIX: CTA Button style changed to match Home.jsx */}
                                        <Link 
                                            to={isLoggedIn ? "/problems" : "/signup"} 
                                            className="dark-btn inline-flex items-center justify-center px-8 py-4 text-lg rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.03]"
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

            <button 
                id="back-to-top" 
                onClick={scrollToTop}
                // FIX: Added sm:bottom-24 to retain original desktop position, and bottom-40 for mobile offset (h-16 + bottom-24 = bottom-40)
                className={`fixed bottom-40 sm:bottom-24 right-6 h-12 w-12 rounded-full dark-gradient-accent text-white flex items-center justify-center transition-all duration-300 shadow-lg z-50 ${
                    isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
            >
                <i data-feather="arrow-up" className="h-5 w-5"></i>
            </button>
        </div>
    );
};

export default Courses;