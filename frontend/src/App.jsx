// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
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
// CRITICAL: Import both Code Playground and dedicated Solve page
import Code from './pages/Code.jsx'; 
import SolveProblem from './pages/SolveProblem.jsx'; // NEW IMPORT
// NEW: Import MyCourses and MyProgress pages
import MyCourses from './pages/MyCourses.jsx';
import MyProgress from './pages/MyProgress.jsx';

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
          {/* CRITICAL: The wrapper must be min-h-screen and flex-col for correct vertical layout */}
          <div className="App min-h-screen flex flex-col" style={{ backgroundColor: '#101827' }}>
            <Navbar />
            
            {/* CRITICAL FIX: pt-16 (4rem) clears the fixed navbar. flex-grow pushes Footer down. */}
            <main className="flex-grow pt-16" style={{ minHeight: '60vh' }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/problems" element={<Problems />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/roadmaps" element={<Roadmaps />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/community" element={<Community />} />
                <Route path="/settings" element={<Settings />} />
                
                {/* DEDICATED SOLVE ROUTE: Handles URL with a problemId */}
                <Route 
                  path="/solve" 
                  element={
                      <ProtectedRoute>
                          <SolveProblem />
                      </ProtectedRoute>
                  } 
                />

                {/* CODE PLAYGROUND ROUTE: Handles Freeform Code Editor /code */}
                <Route
                  path="/code"
                  element={
                    <ProtectedRoute>
                      <Code />
                    </ProtectedRoute>
                  }
                />

                {/* NEW: My Courses Route - User's enrolled courses */}
                <Route
                  path="/my-courses"
                  element={
                    <ProtectedRoute>
                      <MyCourses />
                    </ProtectedRoute>
                  }
                />

                {/* NEW: My Progress Route - User's coding progress */}
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
            {/* Footer remains outside of <main> */}
            <Footer />
          </div>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/signin" replace />;
  }
  
  return children;
};

export default App;