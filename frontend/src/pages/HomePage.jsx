import React, { useEffect, useState } from 'react';
import { Home, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('userInfo');
    if (user) {
      setUserInfo(JSON.parse(user));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Get current date formatted like "Saturday, 27 June 2026"
  const today = new Date();
  const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-GB', dateOptions);

  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (!userInfo) return null;

  return (
    <div className="h-full flex flex-col">
      {/* Top Header */}
      <div className="flex items-center text-slate-400 mb-8 text-sm">
        <Home size={16} className="mr-2" />
        <span>&gt;</span>
        <span className="ml-2 text-white font-medium">Home</span>
      </div>

      {/* Main Content Card */}
      <div className="bg-dhatri-card rounded-2xl p-10 border border-slate-700/50 shadow-xl max-w-4xl mt-4 relative overflow-hidden">
        
        {/* Date */}
        <div className="flex items-center text-slate-400 mb-6">
          <Calendar size={18} className="mr-2" />
          <span>{formattedDate}</span>
        </div>

        {/* Greeting */}
        <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">
          {getGreeting()}, <span className="text-dhatri-orange">{userInfo.name.split(' ')[0]}</span>
        </h1>

        {/* Subtext */}
        <p className="text-slate-300 text-lg leading-relaxed mb-10 max-w-2xl">
          Welcome to <span className="font-semibold text-white">ProjectTrack</span> — the centralized command centre for Dhatri Constructions. Monitor active sites, track financial health, and manage project milestones from one unified platform.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <Link 
            to="/admin" 
            className="bg-dhatri-orange hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center shadow-lg shadow-orange-500/20"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            OPEN DASHBOARD
          </Link>
          <Link 
            to="/analytics" 
            className="border border-slate-600 hover:border-slate-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center bg-slate-800/50"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            VIEW ANALYTICS
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
