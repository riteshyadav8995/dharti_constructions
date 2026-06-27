import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import UserManagement from './pages/UserManagement';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ExpensesPage from './pages/ExpensesPage';
import ReportsPage from './pages/ReportsPage';
import { Menu, X } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  if (!userInfo || !userInfo.token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppLayout = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-dhatri-dark text-dhatri-text font-sans relative">
      {!isAuthPage && (
        <>
          {/* Mobile Header Toggle */}
          <div className="md:hidden fixed top-0 left-0 w-full bg-dhatri-sidebar p-4 z-50 flex justify-between items-center border-b border-slate-700/50 shadow-md">
            <span className="text-white font-bold tracking-wider text-sm">DHATRI CONSTRUCTIONS</span>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white focus:outline-none">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          
          {/* Sidebar with mobile toggle */}
          <div className={`fixed inset-y-0 left-0 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition duration-200 ease-in-out z-40 md:w-64 bg-dhatri-sidebar w-64`}>
            <Sidebar onClose={() => setMobileMenuOpen(false)} />
          </div>

          {/* Overlay for mobile when sidebar is open */}
          {mobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            ></div>
          )}
        </>
      )}
      
      <main className={`flex-grow ${!isAuthPage ? 'md:ml-64 pt-20 md:pt-8 p-4 md:p-8' : ''} transition-all duration-300 w-full overflow-x-hidden`}>
        <Routes>
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/admin" element={<Navigate to="/projects" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
