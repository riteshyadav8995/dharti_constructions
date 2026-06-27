import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  LayoutDashboard, 
  Briefcase, 
  BarChart2, 
  FileText, 
  AlertCircle, 
  Users,
  User,
  Building2,
  LogOut
} from 'lucide-react';

const Sidebar = ({ onClose }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  const navItems = [
    { name: 'Project Dashboard', path: '/projects', icon: <Briefcase size={20} /> },
    { name: 'Revenue & Payments', path: '/analytics', icon: <BarChart2 size={20} /> },
    { name: 'Cost & Expenses', path: '/expenses', icon: <FileText size={20} /> },
    { name: 'Financial Reports', path: '/reports', icon: <FileText size={20} /> },
    { name: 'My Profile', path: '/profile', icon: <User size={20} /> },
  ];

  if (userInfo.role === 'admin') {
    navItems.push({ name: 'User Management', path: '/users', icon: <Users size={20} /> });
  }

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setShowLogoutModal(false);
    navigate('/login');
  };

  return (
    <>
      <div className="w-64 bg-dhatri-sidebar h-screen flex flex-col fixed left-0 top-0 text-slate-300 z-40">
        {/* Logo Area */}
        <div className="flex items-center p-6 border-b border-slate-700/50">
          <div className="bg-dhatri-orange p-2 rounded-lg flex items-center justify-center mr-3">
            <Building2 size={24} className="text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-white font-bold tracking-wider text-sm">DHATRI</span>
            <span className="text-dhatri-orange font-bold text-xs mb-1">CONSTRUCTIONS</span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 bg-slate-800 px-2 py-0.5 rounded w-fit border border-slate-700">
              {userInfo.role === 'site_manager' ? 'Site Manager' : userInfo.role}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-dhatri-orange text-white font-medium'
                    : 'hover:bg-slate-700/50 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-700/50">
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-dhatri-card border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Logout Confirmation</h3>
            <p className="text-slate-300 mb-8">Are you really want to logout?</p>
            <div className="flex space-x-4">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
              >
                No
              </button>
              <button 
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
