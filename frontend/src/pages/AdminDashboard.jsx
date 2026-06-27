import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Users, FileText, DollarSign, PieChart, CreditCard } from 'lucide-react';
import AdminOverview from '../components/admin/AdminOverview';
import AdminProjects from '../components/admin/AdminProjects';
import AdminClients from '../components/admin/AdminClients';
import AdminExpenses from '../components/admin/AdminExpenses';
import AdminPayments from '../components/admin/AdminPayments';
import AdminReports from '../components/admin/AdminReports';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const [projectsRes, clientsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/projects`, config),
        axios.get(`${import.meta.env.VITE_API_URL}/auth/clients`, config)
      ]);
      setProjects(projectsRes.data);
      setClients(clientsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [navigate, userInfo?.token]);

  const navItemClass = (tab) => 
    `flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
      activeTab === tab 
        ? 'bg-blue-50 text-blue-700 font-bold' 
        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
    }`;

  return (
    <div className="flex h-screen bg-gray-50 pt-16">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-6 hidden md:block overflow-y-auto">
        <div className="space-y-2">
          <div onClick={() => setActiveTab('dashboard')} className={navItemClass('dashboard')}>
            <LayoutDashboard size={20} /><span>Dashboard</span>
          </div>
          <div onClick={() => setActiveTab('projects')} className={navItemClass('projects')}>
            <FileText size={20} /><span>Projects</span>
          </div>
          <div onClick={() => setActiveTab('clients')} className={navItemClass('clients')}>
            <Users size={20} /><span>Clients</span>
          </div>
          <div onClick={() => setActiveTab('payments')} className={navItemClass('payments')}>
            <CreditCard size={20} /><span>Payments</span>
          </div>
          <div onClick={() => setActiveTab('expenses')} className={navItemClass('expenses')}>
            <DollarSign size={20} /><span>Expenses</span>
          </div>
          <div onClick={() => setActiveTab('reports')} className={navItemClass('reports')}>
            <PieChart size={20} /><span>Reports & Analytics</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        {activeTab === 'dashboard' && <AdminOverview userInfo={userInfo} />}
        {activeTab === 'projects' && <AdminProjects userInfo={userInfo} projects={projects} clients={clients} fetchProjects={fetchData} />}
        {activeTab === 'clients' && <AdminClients userInfo={userInfo} clients={clients} fetchClients={fetchData} />}
        {activeTab === 'payments' && <AdminPayments userInfo={userInfo} projects={projects} clients={clients} />}
        {activeTab === 'expenses' && <AdminExpenses userInfo={userInfo} projects={projects} />}
        {activeTab === 'reports' && <AdminReports userInfo={userInfo} />}
      </div>
    </div>
  );
};

export default AdminDashboard;
