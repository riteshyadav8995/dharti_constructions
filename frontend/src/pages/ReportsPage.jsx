import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Download, TrendingUp, AlertCircle, DollarSign, BarChart2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTablePlugin from 'jspdf-autotable';

const ReportsPage = () => {
  const [projects, setProjects] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pnl');

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const [projRes, payRes, expRes] = await Promise.all([
        axios.get('http://localhost:5000/api/projects', config),
        axios.get('http://localhost:5000/api/payments', config),
        axios.get('http://localhost:5000/api/expenses', config)
      ]);
      setProjects(projRes.data);
      setPayments(payRes.data);
      setExpenses(expRes.data);
    } catch (err) {
      console.error('Error fetching report data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculations for Reports
  const generatePnLData = () => {
    return projects.map(proj => {
      const projPayments = payments.filter(p => p.project && p.project._id === proj._id && p.status === 'completed');
      const projExpenses = expenses.filter(e => e.project && e.project._id === proj._id);
      
      const revenue = Number(projPayments.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2));
      const expenseTotal = Number(projExpenses.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2));
      const profitLoss = Number((revenue - expenseTotal).toFixed(2));
      
      return {
        name: proj.name,
        revenue,
        expenseTotal,
        profitLoss,
        status: profitLoss >= 0 ? 'Profit' : 'Loss'
      };
    });
  };

  const generateMonthlyRevenue = () => {
    const monthlyMap = {};
    payments.filter(p => p.status === 'completed').forEach(p => {
      const date = new Date(p.paymentDate);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthlyMap[monthYear]) {
        monthlyMap[monthYear] = { monthYear, dateObj: date, total: 0 };
      }
      monthlyMap[monthYear].total += p.amount;
    });
    
    // Sort chronologically and round totals
    return Object.values(monthlyMap)
      .sort((a, b) => b.dateObj - a.dateObj)
      .map(m => ({ ...m, total: Number(m.total.toFixed(2)) }));
  };

  const generateOutstandingDues = () => {
    return projects.map(proj => {
      const projPayments = payments.filter(p => p.project && p.project._id === proj._id && p.status === 'completed');
      const amountPaid = Number(projPayments.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2));
      const outstanding = Number(Math.max(0, proj.contractValue - amountPaid).toFixed(2));
      return {
        name: proj.name,
        client: proj.clientName,
        contractValue: proj.contractValue,
        amountPaid,
        outstanding
      };
    }).filter(p => p.outstanding > 0);
  };

  const pnlData = generatePnLData();
  const monthlyRevenueData = generateMonthlyRevenue();
  const outstandingData = generateOutstandingDues();

  // Helper to safely execute autotable regardless of ESM wrapping
  const generateTable = (doc, options) => {
    const fn = typeof autoTablePlugin === 'function' ? autoTablePlugin : (autoTablePlugin.default || autoTablePlugin.autoTable);
    if (typeof fn === 'function') {
      fn(doc, options);
    } else {
      throw new Error('autoTable function could not be resolved from import');
    }
  };

  // Export functions
  const exportPnLPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text('Project-wise P&L Report', 14, 15);
      const tableData = pnlData.map(p => [
        p.name, 
        `$${p.revenue.toLocaleString()}`, 
        `$${p.expenseTotal.toLocaleString()}`, 
        `$${p.profitLoss.toLocaleString()}`
      ]);
      generateTable(doc, {
        head: [['Project', 'Revenue Received', 'Total Expenses', 'Profit/Loss']],
        body: tableData,
        startY: 25,
      });
      doc.save('PnL_Report.pdf');
    } catch (e) {
      console.error('PDF Export Error:', e);
      alert(`Export Error: ${e.message}`);
    }
  };

  const exportMonthlyPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text('Monthly Revenue Summary', 14, 15);
      const tableData = monthlyRevenueData.map(m => [m.monthYear, `$${m.total.toLocaleString()}`]);
      generateTable(doc, {
        head: [['Month', 'Total Revenue']],
        body: tableData,
        startY: 25,
      });
      doc.save('Monthly_Revenue_Report.pdf');
    } catch (e) {
      console.error('PDF Export Error:', e);
      alert(`Export Error: ${e.message}`);
    }
  };

  const exportOutstandingPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text('Outstanding Dues Report', 14, 15);
      const tableData = outstandingData.map(o => [
        o.name, 
        o.client, 
        `$${o.contractValue.toLocaleString()}`, 
        `$${o.amountPaid.toLocaleString()}`, 
        `$${o.outstanding.toLocaleString()}`
      ]);
      generateTable(doc, {
        head: [['Project', 'Client', 'Contract Value', 'Amount Paid', 'Outstanding Balance']],
        body: tableData,
        startY: 25,
      });
      doc.save('Outstanding_Dues_Report.pdf');
    } catch (e) {
      console.error('PDF Export Error:', e);
      alert(`Export Error: ${e.message}`);
    }
  };

  if (loading) return <div className="text-center py-10 text-slate-400">Loading Reports...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center text-slate-400 text-sm mb-4">
        <FileText size={16} className="mr-2" />
        <span>&gt;</span>
        <span className="ml-2 text-white font-medium">Project Reports</span>
      </div>
      <h1 className="text-3xl font-bold text-white mb-8">Financial Reports & Analytics</h1>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-700/50 mb-8">
        <button
          onClick={() => setActiveTab('pnl')}
          className={`flex items-center px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'pnl' ? 'border-dhatri-orange text-dhatri-orange' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BarChart2 size={18} className="mr-2" /> Project-wise P&L
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`flex items-center px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'monthly' ? 'border-dhatri-orange text-dhatri-orange' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp size={18} className="mr-2" /> Monthly Revenue
        </button>
        <button
          onClick={() => setActiveTab('outstanding')}
          className={`flex items-center px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'outstanding' ? 'border-dhatri-orange text-dhatri-orange' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <AlertCircle size={18} className="mr-2" /> Outstanding Dues
        </button>
      </div>

      {/* Content - PnL */}
      {activeTab === 'pnl' && (
        <div className="bg-dhatri-card rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/30">
            <h2 className="text-xl font-bold text-white">Project-wise Profit & Loss</h2>
            <button 
              onClick={exportPnLPDF}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors font-medium border border-slate-600"
            >
              <Download size={16} className="mr-2" /> Export PDF
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/80 text-slate-400 text-sm">
                  <th className="py-4 px-6 font-medium">Project Name</th>
                  <th className="py-4 px-6 font-medium text-right text-green-400">Revenue Received</th>
                  <th className="py-4 px-6 font-medium text-right text-red-400">Total Expenses</th>
                  <th className="py-4 px-6 font-medium text-right">Profit / Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {pnlData.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors text-white">
                    <td className="py-4 px-6 font-medium">{p.name}</td>
                    <td className="py-4 px-6 text-right">${p.revenue.toLocaleString()}</td>
                    <td className="py-4 px-6 text-right">${p.expenseTotal.toLocaleString()}</td>
                    <td className={`py-4 px-6 text-right font-bold ${p.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${p.profitLoss.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content - Monthly */}
      {activeTab === 'monthly' && (
        <div className="bg-dhatri-card rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/30">
            <h2 className="text-xl font-bold text-white">Monthly Revenue Summary</h2>
            <button 
              onClick={exportMonthlyPDF}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors font-medium border border-slate-600"
            >
              <Download size={16} className="mr-2" /> Export PDF
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/80 text-slate-400 text-sm">
                  <th className="py-4 px-6 font-medium">Month / Year</th>
                  <th className="py-4 px-6 font-medium text-right">Total Revenue Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {monthlyRevenueData.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors text-white">
                    <td className="py-4 px-6 font-medium text-slate-300">{m.monthYear}</td>
                    <td className="py-4 px-6 text-right font-bold text-green-400">${m.total.toLocaleString()}</td>
                  </tr>
                ))}
                {monthlyRevenueData.length === 0 && (
                  <tr><td colSpan="2" className="py-8 text-center text-slate-500">No revenue data available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content - Outstanding */}
      {activeTab === 'outstanding' && (
        <div className="bg-dhatri-card rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/30">
            <h2 className="text-xl font-bold text-white flex items-center">
              <AlertCircle size={20} className="mr-2 text-dhatri-orange" /> Outstanding Dues Report
            </h2>
            <button 
              onClick={exportOutstandingPDF}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors font-medium border border-slate-600"
            >
              <Download size={16} className="mr-2" /> Export PDF
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/80 text-slate-400 text-sm">
                  <th className="py-4 px-6 font-medium">Project</th>
                  <th className="py-4 px-6 font-medium">Client</th>
                  <th className="py-4 px-6 font-medium text-right">Contract Value</th>
                  <th className="py-4 px-6 font-medium text-right text-green-400">Amount Paid</th>
                  <th className="py-4 px-6 font-medium text-right text-orange-400">Outstanding Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {outstandingData.map((o, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors text-white">
                    <td className="py-4 px-6 font-medium">{o.name}</td>
                    <td className="py-4 px-6 text-slate-300">{o.client}</td>
                    <td className="py-4 px-6 text-right">${o.contractValue.toLocaleString()}</td>
                    <td className="py-4 px-6 text-right">${o.amountPaid.toLocaleString()}</td>
                    <td className="py-4 px-6 text-right font-bold text-orange-400">${o.outstanding.toLocaleString()}</td>
                  </tr>
                ))}
                {outstandingData.length === 0 && (
                  <tr><td colSpan="5" className="py-8 text-center text-slate-500">No outstanding dues across projects.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
