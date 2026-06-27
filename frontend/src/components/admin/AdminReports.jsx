import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';

const AdminReports = ({ userInfo }) => {
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

  const profitLossData = {
    labels: ['Financial Overview'],
    datasets: [
      {
        label: 'Total Revenue',
        data: [data.totalRevenue],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
      },
      {
        label: 'Total Expenses',
        data: [data.totalExpenses],
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
      },
      {
        label: 'Net Profit',
        data: [data.totalRevenue - data.totalExpenses],
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
      }
    ]
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Reports & Analytics</h1>
      
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 max-w-3xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Profit & Loss Overview</h2>
        <Bar data={profitLossData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
      </div>
    </>
  );
};

export default AdminReports;
