// src/pages/MyProgress.jsx
import React, { useState, useEffect } from 'react';
import * as feather from 'feather-icons';
import { ProblemManager } from '../utils/problemManager.js';
import { useAuth } from '../hooks/useAuth.jsx';
import Loader from '../components/common/Loader.jsx';

// --- Utilities ---
const formatTime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

const MyProgress = () => {
  const { user, isLoggedIn } = useAuth();
  const [progress, setProgress] = useState(ProblemManager.getGlobalProgress());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock weekly activity data
  const weeklyActivity = [65, 45, 80, 60, 75, 90, 50];
  const dailyProblems = [3, 5, 2, 6, 4, 7, 3];

  useEffect(() => {
    const updateProgress = () => {
      const globalProgress = ProblemManager.getGlobalProgress();
      setProgress(globalProgress);
      setLoading(false);
    };
    
    const timer = setTimeout(updateProgress, 800);
    window.addEventListener('storage', updateProgress);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', updateProgress);
    };
  }, []);

  useEffect(() => {
    feather.replace();
  }, [loading, activeTab]);

  const totalSolved = progress.solvedProblems;
  const totalTotal = progress.totalProblems;
  const completionRate = totalTotal > 0 ? (totalSolved / totalTotal) * 100 : 0;
  const displayName = user?.name || user?.email || 'Coder';

  // Calculate skill distribution
  const skillData = [
    { name: 'Problem Solving', level: 85, icon: 'target' },
    { name: 'Data Structures', level: 72, icon: 'database' },
    { name: 'Algorithms', level: 68, icon: 'code' },
    { name: 'Optimization', level: 60, icon: 'zap' },
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen dark-gradient-secondary flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i data-feather="lock" className="w-10 h-10 text-red-400"></i>
          </div>
          <h1 className="text-3xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-gray-400 text-lg">Please sign in to view your progress.</p>
        </div>
      </div>
    );
  }

  if (loading) return <Loader message="Analyzing your progress..." size="lg" />;

  return (
    <div className="min-h-screen dark-gradient-secondary pt-20 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <i data-feather="activity" className="w-8 h-8 text-white"></i>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            My Coding Progress
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Welcome back, {displayName}. Track your journey and celebrate your achievements.
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatBox 
            icon="award" 
            value={user?.totalPoints || 1250} 
            label="Total Points" 
            color="text-yellow-400" 
            change="+45 this week"
          />
          <StatBox 
            icon="zap" 
            value={`${user?.currentStreak || 7} Days`} 
            label="Current Streak" 
            color="text-red-400" 
            change="🔥 Keep going!"
          />
          <StatBox 
            icon="check-circle" 
            value={totalSolved} 
            label="Problems Solved" 
            color="text-green-400" 
            change={`${Math.round(completionRate)}% completion`}
          />
          <StatBox 
            icon="clock" 
            value={formatTime(progress.totalTimeSpent)} 
            label="Time Invested" 
            color="text-blue-400" 
            change="+2h today"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800/50 rounded-2xl p-2 max-w-md mx-auto">
          {['overview', 'analytics', 'achievements'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-6 rounded-xl font-medium capitalize transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overall Progress Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Overall Completion</h2>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{completionRate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-400">{totalSolved}/{totalTotal} problems</div>
                </div>
              </div>
              
              <div className="relative pt-1">
                <div className="overflow-hidden h-4 text-xs flex rounded-full bg-gray-700">
                  <div 
                    style={{ width: `${completionRate}%` }} 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-1000 ease-out rounded-full"
                  ></div>
                </div>
              </div>

              {/* Difficulty Progress */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-gray-700/50">
                {['Easy', 'Medium', 'Hard'].map(difficulty => {
                  const { solved, total } = progress.problemsByDifficulty[difficulty];
                  const rate = total > 0 ? (solved / total) * 100 : 0;
                  const color = {
                    Easy: 'from-green-500 to-green-400',
                    Medium: 'from-yellow-500 to-yellow-400',
                    Hard: 'from-red-500 to-red-400'
                  }[difficulty];

                  return (
                    <div key={difficulty} className="text-center">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">{difficulty}</span>
                        <span className="font-semibold text-white">{solved}/{total}</span>
                      </div>
                      <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-700">
                        <div 
                          style={{ width: `${rate}%` }} 
                          className={`shadow-none flex flex-col text-center whitespace-nowrap justify-center bg-gradient-to-r ${color} transition-all duration-700 rounded-full`}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{rate.toFixed(1)}%</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weekly Activity */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-2xl font-bold text-white mb-6">Weekly Activity</h2>
              <div className="grid grid-cols-7 gap-2">
                {weeklyActivity.map((score, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-400 mb-2">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'][index]}
                    </div>
                    <div 
                      className="w-full bg-gradient-to-t from-primary-500 to-primary-600 rounded-t-lg transition-all duration-500 ease-out hover:opacity-80 cursor-pointer"
                      style={{ height: `${score}%`, minHeight: '20px' }}
                      title={`${dailyProblems[index]} problems on ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}`}
                    ></div>
                    <div className="text-xs text-gray-500 mt-1">{dailyProblems[index]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Skills Breakdown */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-2xl font-bold text-white mb-6">Skills Breakdown</h2>
              <div className="space-y-4">
                {skillData.map((skill, index) => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <i data-feather={skill.icon} className="w-4 h-4 text-primary-400"></i>
                        <span className="text-sm font-medium text-white">{skill.name}</span>
                      </div>
                      <span className="text-sm text-gray-400">{skill.level}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-1000 ease-out"
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-2xl font-bold text-white mb-6">Recent Achievements</h2>
              <div className="space-y-4">
                <Achievement 
                  icon="star" 
                  title="Problem Solver" 
                  description="Solved 50+ problems" 
                  unlocked={true}
                  date="2 days ago"
                />
                <Achievement 
                  icon="trending-up" 
                  title="Weekly Warrior" 
                  description="7-day streak" 
                  unlocked={true}
                  date="Today"
                />
                <Achievement 
                  icon="clock" 
                  title="Time Master" 
                  description="10+ hours coding" 
                  unlocked={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ icon, value, label, color, change }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-primary-400 transition-all duration-300 group">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center`}>
        <i data-feather={icon} className={`w-6 h-6 ${color}`}></i>
      </div>
    </div>
    <div className="space-y-1">
      <div className="text-2xl font-bold text-white group-hover:scale-105 transition-transform">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-xs text-primary-400 font-medium">{change}</div>
    </div>
  </div>
);

const Achievement = ({ icon, title, description, unlocked, date }) => (
  <div className={`flex items-center space-x-4 p-3 rounded-xl transition-all duration-300 ${
    unlocked 
      ? 'bg-green-500/10 border border-green-500/20' 
      : 'bg-gray-700/30 border border-gray-600/20 opacity-60'
  }`}>
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
      unlocked ? 'bg-green-500/20 text-green-400' : 'bg-gray-600 text-gray-400'
    }`}>
      <i data-feather={icon} className="w-4 h-4"></i>
    </div>
    <div className="flex-1">
      <div className={`font-semibold ${unlocked ? 'text-white' : 'text-gray-400'}`}>
        {title}
      </div>
      <div className="text-sm text-gray-400">{description}</div>
      {unlocked && date && (
        <div className="text-xs text-green-400 mt-1">{date}</div>
      )}
    </div>
    {unlocked ? (
      <i data-feather="check-circle" className="w-5 h-5 text-green-400"></i>
    ) : (
      <i data-feather="lock" className="w-4 h-4 text-gray-500"></i>
    )}
  </div>
);

export default MyProgress;