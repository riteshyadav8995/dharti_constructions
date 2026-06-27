import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, X, Upload } from 'lucide-react';

const AdminExpenses = ({ userInfo, projects }) => {
  const [expenses, setExpenses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    project: '', category: 'Material', vendor: '', amount: '', date: '', description: ''
  });
  const [invoiceFile, setInvoiceFile] = useState(null);

  const fetchExpenses = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/expenses', config);
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [userInfo.token]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      let invoiceUrl = '';
      if (invoiceFile) {
        const formData = new FormData();
        formData.append('file', invoiceFile);
        const uploadRes = await axios.post('http://localhost:5000/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        invoiceUrl = uploadRes.data;
      }

      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post('http://localhost:5000/api/expenses', { ...newExpense, invoiceUrl }, config);
      
      setShowAddModal(false);
      setNewExpense({ project: '', category: 'Material', vendor: '', amount: '', date: '', description: '' });
      setInvoiceFile(null);
      fetchExpenses();
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense');
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
        <button onClick={() => setShowAddModal(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center">
          <Plus size={16} className="mr-2" /> Log Expense
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
        {expenses.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No expenses logged yet.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Project</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Vendor</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-4 text-gray-900">{new Date(e.date).toLocaleDateString()}</td>
                  <td className="py-4 text-gray-600">{e.project?.name || 'N/A'}</td>
                  <td className="py-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{e.category}</span></td>
                  <td className="py-4 text-gray-600">{e.vendor}</td>
                  <td className="py-4 font-bold text-gray-900">${e.amount.toLocaleString()}</td>
                  <td className="py-4">
                    {e.invoiceUrl ? (
                      <a href={`http://localhost:5000${e.invoiceUrl}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">View</a>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Log New Expense</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddExpense} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                  <select required value={newExpense.project} onChange={e => setNewExpense({...newExpense, project: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white">
                    <option value="" disabled>Select a project</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select required value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white">
                    {['Material', 'Labor', 'Transport', 'Electrical', 'Plumbing', 'Legal', 'Marketing', 'Misc', 'Land Cost'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                  <input type="text" required value={newExpense.vendor} onChange={e => setNewExpense({...newExpense, vendor: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                  <input type="number" required value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" required value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Upload</label>
                  <div className="flex items-center space-x-2">
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center text-sm font-medium text-gray-700 border border-gray-300">
                      <Upload size={16} className="mr-2" /> {invoiceFile ? 'Change File' : 'Upload File'}
                      <input type="file" className="hidden" onChange={e => setInvoiceFile(e.target.files[0])} />
                    </label>
                    <span className="text-sm text-gray-500">{invoiceFile?.name}</span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows="2" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg"></textarea>
                </div>
              </div>
              <div className="mt-8 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 shadow-md">Log Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminExpenses;
