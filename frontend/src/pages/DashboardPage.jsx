import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, DollarSign, AlertCircle, LayoutDashboard } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const res = await axios.get('http://localhost:5000/api/analytics/dashboard', config);
        setData(res.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };
    if (userInfo) fetchAnalytics();
  }, [userInfo]);

  if (!data) return <div className="text-center py-10 text-slate-400">Loading Dashboard...</div>;

  const barChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue',
        data: Array.from({length: 12}, (_, i) => {
          const item = data.monthlyRevenue.find(d => d._id === i + 1);
          return item ? item.total : 0;
        }),
        backgroundColor: 'rgba(249, 115, 22, 0.8)', // orange
      },
      {
        label: 'Expenses',
        data: Array.from({length: 12}, (_, i) => {
          const item = data.monthlyExpenses.find(d => d._id === i + 1);
          return item ? item.total : 0;
        }),
        backgroundColor: 'rgba(148, 163, 184, 0.5)', // slate
      }
    ],
  };

  const doughnutData = {
    labels: data.expenseByCategory.map(e => e._id),
    datasets: [
      {
        label: 'Expenses by Category',
        data: data.expenseByCategory.map(e => e.total),
        backgroundColor: [
          '#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#64748b'
        ],
        borderWidth: 0,
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center text-slate-400 mb-8 text-sm">
        <LayoutDashboard size={16} className="mr-2" />
        <span>&gt;</span>
        <span className="ml-2 text-white font-medium">Dashboard Overview</span>
      </div>

      <h1 className="text-3xl font-bold text-white mb-8">Financial & Project Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-dhatri-card p-6 rounded-2xl border border-slate-700/50 shadow-lg flex items-center space-x-4">
          <div className="p-4 bg-blue-500/10 text-blue-400 rounded-xl"><Activity size={24} /></div>
          <div><p className="text-sm text-slate-400 font-medium">Active Projects</p><h3 className="text-2xl font-bold text-white">{data.activeProjectsCount}</h3></div>
        </div>
        <div className="bg-dhatri-card p-6 rounded-2xl border border-slate-700/50 shadow-lg flex items-center space-x-4">
          <div className="p-4 bg-green-500/10 text-green-400 rounded-xl"><DollarSign size={24} /></div>
          <div><p className="text-sm text-slate-400 font-medium">Total Revenue</p><h3 className="text-2xl font-bold text-white">${data.totalRevenue.toLocaleString()}</h3></div>
        </div>
        <div className="bg-dhatri-card p-6 rounded-2xl border border-slate-700/50 shadow-lg flex items-center space-x-4">
          <div className="p-4 bg-red-500/10 text-red-400 rounded-xl"><DollarSign size={24} /></div>
          <div><p className="text-sm text-slate-400 font-medium">Total Expenses</p><h3 className="text-2xl font-bold text-white">${data.totalExpenses.toLocaleString()}</h3></div>
        </div>
        <div className="bg-dhatri-card p-6 rounded-2xl border border-slate-700/50 shadow-lg flex items-center space-x-4">
          <div className="p-4 bg-orange-500/10 text-orange-400 rounded-xl"><AlertCircle size={24} /></div>
          <div><p className="text-sm text-slate-400 font-medium">Pending Dues</p><h3 className="text-2xl font-bold text-white">${data.pendingDues.toLocaleString()}</h3></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-dhatri-card p-6 rounded-2xl border border-slate-700/50 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-6">Revenue vs Expenses (Monthly)</h2>
          <div className="h-[300px] flex items-center justify-center">
            <Bar 
              data={barChartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { 
                  legend: { labels: { color: '#94a3b8' } } 
                },
                scales: {
                  y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
                  x: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } }
                }
              }} 
            />
          </div>
        </div>
        <div className="bg-dhatri-card p-6 rounded-2xl border border-slate-700/50 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-6">Expenses by Category</h2>
          <div className="h-[300px] flex items-center justify-center">
            {data.expenseByCategory.length > 0 ? (
              <Doughnut 
                data={doughnutData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } }
                }}
              />
            ) : (
               <p className="text-slate-500 text-center">No expenses logged yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
