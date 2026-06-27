import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, X, Upload } from 'lucide-react';

const AdminPayments = ({ userInfo, projects, clients }) => {
  const [payments, setPayments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    client: '', project: '', amount: '', paymentDate: '', status: 'completed', installmentType: 'Booking'
  });
  const [receiptFile, setReceiptFile] = useState(null);

  const fetchPayments = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/payments`, config);
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [userInfo.token]);

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      let receiptUrl = '';
      if (receiptFile) {
        const formData = new FormData();
        formData.append('file', receiptFile);
        const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        receiptUrl = uploadRes.data;
      }

      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(`${import.meta.env.VITE_API_URL}/payments`, { ...newPayment, receiptUrl }, config);
      
      setShowAddModal(false);
      setNewPayment({ client: '', project: '', amount: '', paymentDate: '', status: 'completed', installmentType: 'Booking' });
      setReceiptFile(null);
      fetchPayments();
    } catch (error) {
      console.error('Error adding payment:', error);
      alert('Failed to record payment');
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Client Payments</h1>
        <button onClick={() => setShowAddModal(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center">
          <Plus size={16} className="mr-2" /> Record Payment
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
        {payments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No payments recorded yet.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Client</th>
                <th className="pb-3 font-medium">Project</th>
                <th className="pb-3 font-medium">Installment</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-4 text-gray-900">{new Date(p.paymentDate).toLocaleDateString()}</td>
                  <td className="py-4 text-gray-600">{p.client?.name || 'N/A'}</td>
                  <td className="py-4 text-gray-600">{p.project?.name || 'N/A'}</td>
                  <td className="py-4 text-gray-600">{p.installmentType}</td>
                  <td className="py-4 font-bold text-gray-900">${p.amount.toLocaleString()}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-xs uppercase font-semibold ${p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-4">
                    {p.receiptUrl ? (
                      <a href={`http://localhost:5000${p.receiptUrl}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">View</a>
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
              <h2 className="text-xl font-bold text-gray-900">Record Payment</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddPayment} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <select required value={newPayment.client} onChange={e => setNewPayment({...newPayment, client: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white">
                    <option value="" disabled>Select a client</option>
                    {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                  <select required value={newPayment.project} onChange={e => setNewPayment({...newPayment, project: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white">
                    <option value="" disabled>Select a project</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Installment Type</label>
                  <input type="text" placeholder="e.g., Booking, Foundation" required value={newPayment.installmentType} onChange={e => setNewPayment({...newPayment, installmentType: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                  <input type="number" required value={newPayment.amount} onChange={e => setNewPayment({...newPayment, amount: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" required value={newPayment.paymentDate} onChange={e => setNewPayment({...newPayment, paymentDate: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Upload</label>
                  <div className="flex items-center space-x-2">
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center text-sm font-medium text-gray-700 border border-gray-300">
                      <Upload size={16} className="mr-2" /> {receiptFile ? 'Change File' : 'Upload File'}
                      <input type="file" className="hidden" onChange={e => setReceiptFile(e.target.files[0])} />
                    </label>
                    <span className="text-sm text-gray-500">{receiptFile?.name}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select required value={newPayment.status} onChange={e => setNewPayment({...newPayment, status: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white">
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-md">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPayments;
