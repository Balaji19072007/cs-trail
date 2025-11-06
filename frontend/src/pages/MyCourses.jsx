// src/pages/MyCourses.jsx
import React, { useState, useEffect } from 'react';
import * as feather from 'feather-icons';
import { useAuth } from '../hooks/useAuth.jsx';
import Loader from '../components/common/Loader.jsx';

const MOCK_COURSES = [
  { 
    id: 1, 
    title: "Introduction to C Programming", 
    description: "Master the fundamentals of C programming language",
    status: "Completed", 
    progress: 100, 
    lastAccessed: "2 days ago",
    duration: "8 weeks",
    category: "Programming Fundamentals",
    level: "Beginner",
    image: "📘"
  },
  { 
    id: 2, 
    title: "Python Data Structures", 
    description: "Advanced data structures and algorithms in Python",
    status: "In Progress", 
    progress: 65, 
    lastAccessed: "Today",
    duration: "6 weeks",
    category: "Data Structures",
    level: "Intermediate",
    image: "🐍"
  },
  { 
    id: 3, 
    title: "Advanced JavaScript ES6+", 
    description: "Modern JavaScript features and best practices",
    status: "Not Started", 
    progress: 0, 
    lastAccessed: "Never",
    duration: "4 weeks",
    category: "Web Development",
    level: "Advanced",
    image: "⚡"
  },
  { 
    id: 4, 
    title: "Machine Learning Fundamentals", 
    description: "Introduction to ML concepts and implementations",
    status: "In Progress", 
    progress: 30, 
    lastAccessed: "1 week ago",
    duration: "10 weeks",
    category: "Data Science",
    level: "Intermediate",
    image: "🤖"
  },
];

const MyCourses = () => {
  const { isLoggedIn, user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const enrolledCourses = MOCK_COURSES.filter(course => course.status !== 'Not Started');
      setCourses(enrolledCourses);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    feather.replace();
  }, [loading, courses]);

  const filteredCourses = filter === 'all' 
    ? courses 
    : courses.filter(course => course.status.toLowerCase().includes(filter.toLowerCase()));

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen dark-gradient-secondary flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i data-feather="lock" className="w-10 h-10 text-red-400"></i>
          </div>
          <h1 className="text-3xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-gray-400 text-lg">Please sign in to view your enrolled courses.</p>
        </div>
      </div>
    );
  }

  if (loading) return <Loader message="Loading your courses..." size="lg" />;

  return (
    <div className="min-h-screen dark-gradient-secondary pt-20 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <i data-feather="book-open" className="w-8 h-8 text-white"></i>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            My Learning Journey
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Continue your learning adventure and track your progress across all enrolled courses
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon="book" 
            value={courses.length} 
            label="Enrolled Courses" 
            color="text-blue-400" 
            bgColor="bg-blue-500/20"
          />
          <StatCard 
            icon="check-circle" 
            value={courses.filter(c => c.progress === 100).length} 
            label="Completed" 
            color="text-green-400" 
            bgColor="bg-green-500/20"
          />
          <StatCard 
            icon="trending-up" 
            value={courses.filter(c => c.progress > 0 && c.progress < 100).length} 
            label="In Progress" 
            color="text-yellow-400" 
            bgColor="bg-yellow-500/20"
          />
          <StatCard 
            icon="clock" 
            value={`${Math.round(courses.reduce((acc, course) => acc + course.progress, 0) / courses.length || 0)}%`} 
            label="Avg. Progress" 
            color="text-purple-400" 
            bgColor="bg-purple-500/20"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
          {['all', 'in progress', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-6 py-3 rounded-xl font-medium capitalize transition-all duration-300 whitespace-nowrap ${
                filter === tab
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <i data-feather="book" className="w-12 h-12 text-gray-500"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No courses found</h3>
            <p className="text-gray-500">Try changing your filter or explore new courses.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, value, label, color, bgColor }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-primary-400 transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        <p className="text-gray-400 text-sm">{label}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}>
        <i data-feather={icon} className={`w-6 h-6 ${color}`}></i>
      </div>
    </div>
  </div>
);

const CourseCard = ({ course }) => {
  const statusColor = course.status === 'Completed' 
    ? 'bg-green-500/20 text-green-400 border-green-500/30' 
    : 'bg-blue-500/20 text-blue-400 border-blue-500/30';

  const levelColor = {
    Beginner: 'bg-green-500/20 text-green-400',
    Intermediate: 'bg-yellow-500/20 text-yellow-400',
    Advanced: 'bg-red-500/20 text-red-400'
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-primary-400 transition-all duration-300 group hover:transform hover:scale-[1.02]">
      {/* Course Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-2xl shadow-lg">
          {course.image}
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusColor}`}>
          {course.status}
        </span>
      </div>

      {/* Course Info */}
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
        {course.title}
      </h3>
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
        {course.description}
      </p>

      {/* Meta Info */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <span className="flex items-center">
          <i data-feather="clock" className="w-3 h-3 mr-1"></i>
          {course.duration}
        </span>
        <span className={`px-2 py-1 rounded-full ${levelColor[course.level]}`}>
          {course.level}
        </span>
      </div>

      {/* Progress Section */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Progress</span>
          <span className="font-semibold text-white">{course.progress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-1000 ease-out"
            style={{ width: `${course.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
        <span className="text-xs text-gray-500">
          Last accessed: {course.lastAccessed}
        </span>
        <button className="text-primary-400 hover:text-primary-300 transition-colors text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform">
          Continue
          <i data-feather="arrow-right" className="w-4 h-4 ml-1"></i>
        </button>
      </div>
    </div>
  );
};

export default MyCourses;