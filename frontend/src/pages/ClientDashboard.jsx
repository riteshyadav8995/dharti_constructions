import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, AlertCircle, CheckCircle, X, Download } from 'lucide-react';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [payments, setPayments] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [clientProfile, setClientProfile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const [profileRes, projectsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/auth/profile', config),
          axios.get('http://localhost:5000/api/projects', config)
        ]);
        setClientProfile(profileRes.data);
        setProjects(projectsRes.data);

        // Fetch progress for each project
        const progressObj = {};
        for (let p of projectsRes.data) {
          const progRes = await axios.get(`http://localhost:5000/api/progress/project/${p._id}`, config);
          progressObj[p._id] = progRes.data;
        }
        setProgressData(progressObj);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, [navigate, userInfo?.token]);

  const fetchFinancials = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`http://localhost:5000/api/payments/client/me`, config);
      setPayments(data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching payments:', error);
      alert('Could not load financial details');
    }
  };

  const totalPaid = payments.filter(p => p.status === 'completed').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <LayoutDashboard size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {clientProfile?.name || userInfo?.name}</h1>
              <p className="text-gray-600">Track your property, progress, and payments.</p>
            </div>
          </div>
          {clientProfile?.purchasedUnit && (
             <div className="bg-white px-6 py-3 rounded-2xl border border-gray-200 shadow-sm">
               <p className="text-sm text-gray-500">Your Property</p>
               <p className="text-lg font-bold text-gray-900">Unit {clientProfile.purchasedUnit}</p>
             </div>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-100 shadow-sm text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No active projects</h3>
            <p className="text-gray-500">You do not have any properties assigned to you yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {projects.map((project) => (
              <div key={project._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
                    <p className="text-gray-500 mt-1">{project.location || project.description}</p>
                  </div>
                  <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold uppercase tracking-wide">
                    {project.status}
                  </span>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Progress Tracking */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                      <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                      Construction Progress
                    </h3>
                    <div className="space-y-6">
                      {!progressData[project._id] || progressData[project._id].length === 0 ? (
                        <p className="text-gray-500 text-sm">No progress updates available yet.</p>
                      ) : (
                        progressData[project._id].map(prog => (
                          <div key={prog._id}>
                            <div className="flex justify-between text-sm font-medium mb-1">
                              <span className="text-gray-700">{prog.milestone}</span>
                              <span className="text-blue-600">{prog.completionPercent}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${prog.completionPercent}%` }}></div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  
                  {/* Financial Summary */}
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Summary</h3>
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between border-b border-blue-100 pb-2">
                        <span className="text-gray-600">Total Property Value</span>
                        <span className="font-bold text-gray-900">${clientProfile?.totalAmount?.toLocaleString() || 'TBD'}</span>
                      </div>
                      <div className="flex justify-between pb-2 text-sm">
                        <span className="text-gray-600">Payment Plan</span>
                        <span className="font-medium text-gray-900">{clientProfile?.paymentPlan || 'Standard'}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => fetchFinancials()}
                      className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      View Payment History & Dues
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Financials Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            {/* Payment Summary Header */}
            <div className="grid grid-cols-3 divide-x border-b border-gray-100">
               <div className="p-6 text-center">
                 <p className="text-sm text-gray-500 mb-1">Property Price</p>
                 <p className="text-2xl font-bold text-gray-900">
                   {clientProfile?.totalAmount ? `$${clientProfile.totalAmount.toLocaleString()}` : 'Not Set'}
                 </p>
               </div>
               <div className="p-6 text-center">
                 <p className="text-sm text-gray-500 mb-1">Total Paid</p>
                 <p className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString()}</p>
               </div>
               <div className="p-6 text-center">
                 <p className="text-sm text-gray-500 mb-1">Pending Dues</p>
                 <p className="text-2xl font-bold text-red-600">
                   {clientProfile?.totalAmount ? `$${(clientProfile.totalAmount - totalPaid).toLocaleString()}` : 'Not Set'}
                 </p>
               </div>
            </div>

            <div className="p-6 max-h-[50vh] overflow-y-auto">
              {payments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No payment history found.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-100 text-sm">
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Installment Type</th>
                      <th className="pb-3 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-4 text-gray-900">{new Date(p.paymentDate).toLocaleDateString()}</td>
                        <td className="py-4 text-gray-600 font-medium">{p.installmentType}</td>
                        <td className="py-4 text-gray-900 font-bold">${p.amount.toLocaleString()}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          {p.receiptUrl ? (
                            <a href={`http://localhost:5000${p.receiptUrl}`} download target="_blank" rel="noreferrer" className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium transition-colors">
                              <Download size={14} className="mr-1" /> Download
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">Unavailable</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
