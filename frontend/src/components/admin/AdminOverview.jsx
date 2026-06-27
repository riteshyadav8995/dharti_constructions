import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, DollarSign, Users, AlertCircle } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminOverview = ({ userInfo }) => {
  const [data, setData] = useState(null);

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
    fetchAnalytics();
  }, [userInfo.token]);

  if (!data) return <div className="text-center py-10">Loading...</div>;

  const barChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue',
        data: Array.from({length: 12}, (_, i) => {
          const item = data.monthlyRevenue.find(d => d._id === i + 1);
          return item ? item.total : 0;
        }),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
      {
        label: 'Expenses',
        data: Array.from({length: 12}, (_, i) => {
          const item = data.monthlyExpenses.find(d => d._id === i + 1);
          return item ? item.total : 0;
        }),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
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
          '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#6366F1', '#8B5CF6', '#EC4899', '#6B7280'
        ],
      }
    ]
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-full"><Activity size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Active Projects</p><h3 className="text-2xl font-bold text-gray-900">{data.activeProjectsCount}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-green-100 text-green-600 rounded-full"><DollarSign size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Total Revenue</p><h3 className="text-2xl font-bold text-gray-900">${data.totalRevenue.toLocaleString()}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-red-100 text-red-600 rounded-full"><DollarSign size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Total Expenses</p><h3 className="text-2xl font-bold text-gray-900">${data.totalExpenses.toLocaleString()}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-orange-100 text-orange-600 rounded-full"><AlertCircle size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Pending Dues</p><h3 className="text-2xl font-bold text-gray-900">${data.pendingDues.toLocaleString()}</h3></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue vs Expenses (Monthly)</h2>
          <Bar data={barChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Expenses by Category</h2>
          {data.expenseByCategory.length > 0 ? (
            <Doughnut data={doughnutData} />
          ) : (
             <p className="text-gray-500 text-center py-8">No expenses logged yet.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminOverview;
