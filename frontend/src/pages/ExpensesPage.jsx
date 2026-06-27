import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, FileText, Plus, X, PieChart, Activity } from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const ExpensesPage = () => {
  const [projects, setProjects] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [newExpense, setNewExpense] = useState({
    project: '',
    category: 'Materials',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const [projectsRes, expensesRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/projects`, config),
        axios.get(`${import.meta.env.VITE_API_URL}/expenses`, config)
      ]);
      setProjects(projectsRes.data);
      setExpenses(expensesRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(`${import.meta.env.VITE_API_URL}/expenses`, newExpense, config);
      setShowAddModal(false);
      setNewExpense({
        project: '', category: 'Materials', amount: '', date: new Date().toISOString().split('T')[0], description: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error adding expense:', error);
      alert(error.response?.data?.message || 'Failed to record expense');
    }
  };

  // Calculations
  const projectCosts = projects.map(proj => {
    const projExpenses = expenses.filter(e => e.project && e.project._id === proj._id);
    const totalCost = Number(projExpenses.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2));
    return {
      ...proj,
      totalCost,
      expenseCount: projExpenses.length
    };
  });

  const totalRunningCost = Number(projectCosts.reduce((acc, curr) => acc + curr.totalCost, 0).toFixed(2));

  // Category Breakdown Data
  const categories = ['Labour', 'Materials', 'Machinery', 'Subcontractor', 'Miscellaneous'];
  const categoryColors = ['#F97316', '#3B82F6', '#10B981', '#8B5CF6', '#F43F5E'];
  
  const categoryTotals = categories.map(cat => {
    return Number(expenses.filter(e => e.category === cat).reduce((acc, curr) => acc + curr.amount, 0).toFixed(2));
  });

  const chartData = React.useMemo(() => ({
    labels: categories,
    datasets: [{
      data: categoryTotals,
      backgroundColor: categoryColors,
      borderWidth: 0,
      hoverOffset: 4
    }]
  }), [categoryTotals.join(',')]);

  const chartOptions = React.useMemo(() => ({
    plugins: {
      legend: { position: 'right', labels: { color: '#94a3b8', font: { family: 'sans-serif' } } }
    },
    cutout: '70%',
    animation: { animateScale: false, animateRotate: true }
  }), []);

  if (loading) return <div className="text-center py-10 text-slate-400">Loading Expense Data...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center text-slate-400 text-sm">
          <Activity size={16} className="mr-2" />
          <span>&gt;</span>
          <span className="ml-2 text-white font-medium">Cost & Expense Management</span>
        </div>
        {userInfo.role === 'admin' && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-dhatri-orange hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-lg shadow-orange-500/20 font-medium"
          >
            <Plus size={16} className="mr-2" />
            Log Expense
          </button>
        )}
      </div>

      <h1 className="text-3xl font-bold text-white mb-8">Expense Overview</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Total Cost KPI & Chart */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-dhatri-card p-6 rounded-2xl border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
            <p className="text-sm text-orange-400 font-medium mb-1">Total Running Cost (All Projects)</p>
            <h3 className="text-4xl font-bold text-white">${totalRunningCost.toLocaleString()}</h3>
          </div>
          
          <div className="bg-dhatri-card p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
              <PieChart size={18} className="mr-2 text-dhatri-orange" />
              Expense Breakdown by Category
            </h3>
            <div className="relative h-64 flex justify-center items-center">
              {totalRunningCost > 0 ? (
                <Doughnut data={chartData} options={chartOptions} />
              ) : (
                <p className="text-slate-500">No expenses recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Project Running Costs */}
        <div className="lg:col-span-2 bg-dhatri-card rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-700/50">
            <h2 className="text-xl font-bold text-white">Running Cost Total Per Project</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/80 bg-slate-800/30 text-slate-400 text-sm">
                  <th className="py-3 px-6 font-medium">Project Name</th>
                  <th className="py-3 px-6 font-medium text-center">Logged Expenses</th>
                  <th className="py-3 px-6 font-medium text-right">Total Running Cost</th>
                  <th className="py-3 px-6 font-medium text-right">Budget Limit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {projectCosts.map(p => (
                  <tr key={p._id} className="hover:bg-slate-800/40 transition-colors text-white">
                    <td className="py-4 px-6 font-medium">{p.name}</td>
                    <td className="py-4 px-6 text-center text-slate-400">
                      <span className="bg-slate-700 px-2 py-1 rounded-full text-xs">{p.expenseCount}</span>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-red-400">${p.totalCost.toLocaleString()}</td>
                    <td className="py-4 px-6 text-right text-slate-400">${p.budget.toLocaleString()}</td>
                  </tr>
                ))}
                {projectCosts.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-500">No active projects found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Expense Log */}
      <div className="bg-dhatri-card rounded-2xl border border-slate-700/50 shadow-xl p-6 mt-8">
        <h2 className="text-xl font-bold text-white mb-6">Recent Expense Log</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/80 bg-slate-800/30 text-slate-400 text-sm">
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium">Project</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Description</th>
                <th className="py-3 px-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {expenses.map(e => (
                <tr key={e._id} className="hover:bg-slate-800/40 transition-colors text-white">
                  <td className="py-3 px-4 text-slate-300">{new Date(e.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4">{e.project?.name || 'Unknown'}</td>
                  <td className="py-3 px-4">
                    <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">
                      {e.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 max-w-xs truncate" title={e.description}>{e.description || '-'}</td>
                  <td className="py-3 px-4 text-right font-bold text-red-400">${e.amount.toLocaleString()}</td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">No expenses logged yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-dhatri-card rounded-2xl border border-slate-700 shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-700/50">
              <h2 className="text-xl font-bold text-white flex items-center">
                <DollarSign size={20} className="mr-2 text-dhatri-orange" />
                Log New Expense
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddExpense} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Project</label>
                  <select 
                    required 
                    value={newExpense.project} 
                    onChange={e => setNewExpense({...newExpense, project: e.target.value})} 
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-dhatri-orange"
                  >
                    <option value="" disabled>Select a project</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                  <select 
                    required 
                    value={newExpense.category} 
                    onChange={e => setNewExpense({...newExpense, category: e.target.value})} 
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-dhatri-orange"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Amount ($)</label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    step="0.01"
                    value={newExpense.amount} 
                    onChange={e => setNewExpense({...newExpense, amount: e.target.value})} 
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-dhatri-orange" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Date</label>
                  <input 
                    type="date" 
                    required 
                    value={newExpense.date} 
                    onChange={e => setNewExpense({...newExpense, date: e.target.value})} 
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-slate-300 focus:outline-none focus:border-dhatri-orange [color-scheme:dark]" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Description (Optional)</label>
                  <textarea 
                    rows="2" 
                    value={newExpense.description} 
                    onChange={e => setNewExpense({...newExpense, description: e.target.value})} 
                    placeholder="Details about this expense..."
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-dhatri-orange"
                  ></textarea>
                </div>
              </div>
              <div className="mt-8 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-slate-600 text-slate-300 hover:bg-slate-700 rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-dhatri-orange text-white rounded-lg font-medium hover:bg-orange-600 shadow-md transition-colors">Log Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;
