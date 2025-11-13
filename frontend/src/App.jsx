// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ThemeProvider, useTheme } from './contexts/ThemeContext.jsx'; // Correct import
import { useAuth } from './hooks/useAuth.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';

// Page imports
import Home from './pages/Home.jsx';
import SignIn from './pages/SignIn.jsx';
import SignUp from './pages/SignUp.jsx';
import Problems from './pages/Problems.jsx';
import Courses from './pages/Courses.jsx';
import Roadmaps from './pages/Roadmaps.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Community from './pages/Community.jsx';
import Settings from './pages/Settings.jsx';
import Code from './pages/Code.jsx'; 
import SolveProblem from './pages/SolveProblem.jsx';
import MyCourses from './pages/MyCourses.jsx';
import MyProgress from './pages/MyProgress.jsx';
import CProgrammingRoadmap from './pages/roadmaps/CProgrammingRoadmap.jsx';
import PythonProgrammingRoadmap from './pages/roadmaps/PythonProgrammingRoadmap.jsx';
import JavaProgrammingRoadmap from './pages/roadmaps/JavaProgrammingRoadmap.jsx';

// NEW IMPORT - ProjectPage from project folder
import ProjectPage from './pages/projects/ProjectPage.jsx';

import RatingPopup from './components/common/RatingPopup.jsx';

import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <AuthProvider>
          <ThemeProvider> 
            <AppContent />
          </ThemeProvider> 
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

// Separate component to use hooks
function AppContent() {
  const { isDark } = useTheme();
  
  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar />
      
      <main className="flex-grow pt-16" style={{ minHeight: '60vh' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/roadmaps" element={<Roadmaps />} />
          <Route path="/roadmaps/c-programming" element={<CProgrammingRoadmap />} />
          <Route path="/roadmaps/python-programming" element={<PythonProgrammingRoadmap />} />
          <Route path="/roadmaps/java-programming" element={<JavaProgrammingRoadmap />} />
          
          {/* NEW PROJECT ROUTE */}
          <Route path="/project/:projectId" element={<ProjectPage />} />
          
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/community" element={<Community />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Protected Routes */}
          <Route 
            path="/solve" 
            element={
              <ProtectedRoute>
                <SolveProblem />
              </ProtectedRoute>
            } 
          />

          <Route
            path="/code"
            element={
              <ProtectedRoute>
                <Code />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-courses"
            element={
              <ProtectedRoute>
                <MyCourses />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-progress"
            element={
              <ProtectedRoute>
                <MyProgress />
              </ProtectedRoute>
            }
          />

          {/* Catch-all route - 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      <RatingPopup />
      
      <Footer />
    </div>
  );
}

// Protected Route Component using useAuth hook
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  
  if (!isLoggedIn) {
    return <Navigate to="/signin" replace />;
  }
  
  return children;
};

export default App;