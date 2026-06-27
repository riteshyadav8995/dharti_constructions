import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building2, ChevronDown, User, LogOut, AlertTriangle } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userInfo, setUserInfo] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const user = localStorage.getItem('userInfo');
    if (user) {
      setUserInfo(JSON.parse(user));
    } else {
      setUserInfo(null);
    }
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAuthenticated = !!userInfo;

  const confirmLogout = () => {
    localStorage.removeItem('userInfo');
    setUserInfo(null);
    setShowLogoutModal(false);
    navigate('/login');
  };

  const navLinkStyle = (path) => {
    if (location.pathname === path) return "text-blue-600 font-medium transition-colors";
    return "text-gray-600 hover:text-blue-600 font-medium transition-colors";
  };

  const dashboardPath = userInfo?.role === 'admin' ? '/admin' : '/client';
  const isDashboardActive = location.pathname.startsWith('/admin') || location.pathname.startsWith('/client');

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-md shadow-sm fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl tracking-tight text-gray-900">Dharti Construction</span>
            </Link>
            
            <div className="hidden md:flex space-x-8 items-center">
              <Link to="/" className={navLinkStyle('/')}>Home</Link>
              {(!isAuthenticated || userInfo?.role !== 'admin') && (
                <a href="/#projects" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Projects</a>
              )}
              <a href="/#services" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Services</a>
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link 
                    to={dashboardPath} 
                    className={isDashboardActive ? "text-blue-600 font-medium transition-colors" : "text-gray-600 hover:text-blue-600 font-medium transition-colors"}
                  >
                    Dashboard
                  </Link>
                  
                  <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors focus:outline-none"
                    >
                      <span>{userInfo.name.split(' ')[0]}</span>
                      <ChevronDown size={16} />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 py-1 z-50">
                        <Link 
                          to="/profile" 
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                        >
                          <User size={16} className="mr-2" />
                          Profile Update
                        </Link>
                        <button 
                          onClick={() => {
                            setDropdownOpen(false);
                            setShowLogoutModal(true);
                          }}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={16} className="mr-2" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <Link to="/login" className={navLinkStyle('/login') + " px-4 py-2"}>Login</Link>
                  <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">Get Started</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Are you really sure?</h3>
              <p className="text-gray-500 mb-6 text-sm">Do you really want to sign out from your account?</p>
              
              <div className="flex w-full space-x-3">
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  No, cancel
                </button>
                <button 
                  onClick={confirmLogout}
                  className="flex-1 bg-red-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                  Yes, sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

