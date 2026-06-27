import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, AlertCircle, FileText, TrendingUp, CreditCard, Clock } from 'lucide-react';

const AnalyticsPage = () => {
  const [projects, setProjects] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const [projectsRes, paymentsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/projects', config),
        axios.get('http://localhost:5000/api/payments', config)
      ]);
      setProjects(projectsRes.data);
      setPayments(paymentsRes.data);
    } catch (err) {
      console.error('Error fetching financial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    project: '',
    client: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    status: 'completed',
    paymentMode: 'Bank Transfer',
    reference: ''
  });

  if (loading) return <div className="text-center py-10 text-slate-400">Loading Financials...</div>;

  // Analytics Calculations
  const overduePayments = payments.filter(p => p.status === 'overdue');
  
  const projectFinancials = projects.map(proj => {
    const projPayments = payments.filter(p => p.project && p.project._id === proj._id && p.status === 'completed');
    const amountReceived = Number(projPayments.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2));
    const outstanding = Number(Math.max(0, proj.contractValue - amountReceived).toFixed(2));
    return {
      ...proj,
      amountReceived,
      outstanding
    };
  });

  const totalOutstanding = Number(projectFinancials.reduce((acc, curr) => acc + curr.outstanding, 0).toFixed(2));
  const totalReceived = Number(projectFinancials.reduce((acc, curr) => acc + curr.amountReceived, 0).toFixed(2));
  const totalContractValue = Number(projectFinancials.reduce((acc, curr) => acc + curr.contractValue, 0).toFixed(2));

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      // find client from project selection
      const selectedProject = projects.find(p => p._id === newPayment.project);
      const clientId = selectedProject ? (selectedProject.client?._id || selectedProject.client) : '';
      
      const paymentData = { ...newPayment, client: clientId };
      await axios.post('http://localhost:5000/api/payments', paymentData, config);
      setShowPaymentModal(false);
      setNewPayment({
        project: '', client: '', amount: '', paymentDate: new Date().toISOString().split('T')[0], status: 'completed', paymentMode: 'Bank Transfer', reference: ''
      });
      fetchData();
    } catch (err) {
      console.error('Error logging payment:', err);
      alert('Failed to log payment');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center text-slate-400 text-sm">
          <TrendingUp size={16} className="mr-2" />
          <span>&gt;</span>
          <span className="ml-2 text-white font-medium">Revenue & Payment Tracking</span>
        </div>
        {userInfo.role === 'admin' && (
          <button 
            onClick={() => setShowPaymentModal(true)}
            className="bg-dhatri-orange hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-lg shadow-orange-500/20 font-medium"
          >
            <DollarSign size={16} className="mr-2" />
            Log Payment
          </button>
        )}
      </div>

      <h1 className="text-3xl font-bold text-white mb-8">Financial Overview</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-dhatri-card p-6 rounded-2xl border border-slate-700/50 shadow-lg flex items-center space-x-4">
          <div className="p-4 bg-blue-500/10 text-blue-400 rounded-xl"><FileText size={24} /></div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Total Contract Value</p>
            <h3 className="text-2xl font-bold text-white">${totalContractValue.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-dhatri-card p-6 rounded-2xl border border-slate-700/50 shadow-lg flex items-center space-x-4">
          <div className="p-4 bg-green-500/10 text-green-400 rounded-xl"><DollarSign size={24} /></div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Total Amount Received</p>
            <h3 className="text-2xl font-bold text-white">${totalReceived.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-dhatri-card p-6 rounded-2xl border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.1)] flex items-center space-x-4">
          <div className="p-4 bg-orange-500/10 text-orange-400 rounded-xl"><AlertCircle size={24} /></div>
          <div>
            <p className="text-sm text-orange-400 font-medium">Consolidated Outstanding Dues</p>
            <h3 className="text-2xl font-bold text-white">${totalOutstanding.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Overdue Alerts */}
      {overduePayments.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center text-red-400 mb-4 font-bold text-lg">
            <AlertCircle size={20} className="mr-2" />
            Overdue Payment Alerts ({overduePayments.length})
          </div>
          <div className="space-y-3">
            {overduePayments.map(p => (
              <div key={p._id} className="flex justify-between items-center bg-slate-900/50 p-4 rounded-lg border border-red-500/20">
                <div>
                  <div className="text-white font-medium">Project: {p.project?.name || 'Unknown'}</div>
                  <div className="text-sm text-slate-400">Client: {p.client?.name || 'Unknown'} - Expected: {new Date(p.paymentDate).toLocaleDateString()}</div>
                </div>
                <div className="text-red-400 font-bold text-lg">${p.amount.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per Project Breakdown */}
      <div className="bg-dhatri-card rounded-2xl border border-slate-700/50 shadow-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Revenue Breakdown Per Project</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/80 text-slate-400 text-sm">
                <th className="pb-3 font-medium">Project Name</th>
                <th className="pb-3 font-medium text-right">Contract Value</th>
                <th className="pb-3 font-medium text-right">Amount Received</th>
                <th className="pb-3 font-medium text-right">Outstanding Balance</th>
                <th className="pb-3 font-medium text-center">Collection %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {projectFinancials.map(p => {
                const percentage = p.contractValue > 0 ? ((p.amountReceived / p.contractValue) * 100).toFixed(0) : 0;
                return (
                  <tr key={p._id} className="hover:bg-slate-800/40 transition-colors text-white">
                    <td className="py-4 font-medium">{p.name}</td>
                    <td className="py-4 text-right">${p.contractValue.toLocaleString()}</td>
                    <td className="py-4 text-right text-green-400">${p.amountReceived.toLocaleString()}</td>
                    <td className="py-4 text-right text-orange-400">${p.outstanding.toLocaleString()}</td>
                    <td className="py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-xs text-slate-400 w-8">{percentage}%</span>
                        <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-dhatri-orange h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Log */}
      <div className="bg-dhatri-card rounded-2xl border border-slate-700/50 shadow-xl p-6">
        <div className="flex items-center text-white font-bold text-xl mb-6">
          <CreditCard size={20} className="mr-2 text-dhatri-orange" />
          Master Payment Log
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/80 bg-slate-800/30 text-slate-400 text-sm">
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium">Project</th>
                <th className="py-3 px-4 font-medium">Payment Mode</th>
                <th className="py-3 px-4 font-medium">Reference / TXN ID</th>
                <th className="py-3 px-4 font-medium text-right">Amount</th>
                <th className="py-3 px-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {payments.map(p => (
                <tr key={p._id} className="hover:bg-slate-800/40 transition-colors text-white">
                  <td className="py-3 px-4 text-slate-300">{new Date(p.paymentDate).toLocaleDateString()}</td>
                  <td className="py-3 px-4">{p.project?.name || 'N/A'}</td>
                  <td className="py-3 px-4 text-slate-300 capitalize">{p.paymentMode || 'N/A'}</td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-sm">{p.reference || 'N/A'}</td>
                  <td className="py-3 px-4 text-right font-bold">${p.amount.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase ${
                      p.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      p.status === 'overdue' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">No payment records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Add Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-dhatri-card rounded-2xl border border-slate-700 shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-700/50">
              <h2 className="text-xl font-bold text-white flex items-center">
                <DollarSign size={20} className="mr-2 text-dhatri-orange" />
                Log New Payment
              </h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
            </div>
            <form onSubmit={handleAddPayment} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Project</label>
                  <select 
                    required 
                    value={newPayment.project} 
                    onChange={e => setNewPayment({...newPayment, project: e.target.value})} 
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-dhatri-orange"
                  >
                    <option value="" disabled>Select a project</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Amount ($)</label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    step="0.01"
                    value={newPayment.amount} 
                    onChange={e => setNewPayment({...newPayment, amount: e.target.value})} 
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-dhatri-orange" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Date</label>
                  <input 
                    type="date" 
                    required 
                    value={newPayment.paymentDate} 
                    onChange={e => setNewPayment({...newPayment, paymentDate: e.target.value})} 
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-slate-300 focus:outline-none focus:border-dhatri-orange [color-scheme:dark]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                  <select 
                    required 
                    value={newPayment.status} 
                    onChange={e => setNewPayment({...newPayment, status: e.target.value})} 
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-dhatri-orange"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Payment Mode</label>
                  <select 
                    required 
                    value={newPayment.paymentMode} 
                    onChange={e => setNewPayment({...newPayment, paymentMode: e.target.value})} 
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-dhatri-orange"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Reference / TXN ID</label>
                  <input 
                    type="text" 
                    value={newPayment.reference} 
                    onChange={e => setNewPayment({...newPayment, reference: e.target.value})} 
                    placeholder="e.g. TXN123456"
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-dhatri-orange" 
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="px-4 py-2 border border-slate-600 text-slate-300 hover:bg-slate-700 rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-dhatri-orange text-white rounded-lg font-medium hover:bg-orange-600 shadow-md transition-colors">Log Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
