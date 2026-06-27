import React, { useState } from 'react';
import axios from 'axios';
import { Edit, X } from 'lucide-react';

const AdminClients = ({ clients, fetchClients, userInfo }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    purchasedUnit: '', totalAmount: '', paymentPlan: ''
  });

  const handleEditClick = (client) => {
    setEditingClient(client);
    setFormData({
      purchasedUnit: client.purchasedUnit || '',
      totalAmount: client.totalAmount || '',
      paymentPlan: client.paymentPlan || ''
    });
    setShowModal(true);
  };

  const handleUpdateClient = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`http://localhost:5000/api/auth/clients/${editingClient._id}`, formData, config);
      setShowModal(false);
      setEditingClient(null);
      if (fetchClients) {
        fetchClients();
      } else {
        // Quick fallback if fetchClients wasn't passed down initially
        window.location.reload(); 
      }
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Failed to update client details');
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
        {clients.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No clients found.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Property Details</th>
                <th className="pb-3 font-medium">Total Amount</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-4 text-gray-900 font-medium">{c.name}</td>
                  <td className="py-4 text-gray-600">{c.email}</td>
                  <td className="py-4 text-gray-600">
                    {c.purchasedUnit ? `Unit: ${c.purchasedUnit} (${c.paymentPlan || 'Standard'})` : 'Not assigned'}
                  </td>
                  <td className="py-4 text-gray-900 font-bold">
                    {c.totalAmount ? `$${c.totalAmount.toLocaleString()}` : '-'}
                  </td>
                  <td className="py-4 text-right">
                    <button 
                      onClick={() => handleEditClick(c)} 
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Edit Client Details"
                    >
                      <Edit size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Update Client Details</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleUpdateClient} className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-4">Updating details for <span className="font-bold text-gray-900">{editingClient?.name}</span></p>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchased Unit</label>
                <input 
                  type="text" 
                  placeholder="e.g. A-101"
                  value={formData.purchasedUnit} 
                  onChange={e => setFormData({...formData, purchasedUnit: e.target.value})} 
                  className="w-full px-4 py-2 border rounded-lg" 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Property Amount ($)</label>
                <input 
                  type="number" 
                  value={formData.totalAmount} 
                  onChange={e => setFormData({...formData, totalAmount: e.target.value})} 
                  className="w-full px-4 py-2 border rounded-lg" 
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Plan</label>
                <input 
                  type="text" 
                  placeholder="e.g. 20-30-50 Plan"
                  value={formData.paymentPlan} 
                  onChange={e => setFormData({...formData, paymentPlan: e.target.value})} 
                  className="w-full px-4 py-2 border rounded-lg" 
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminClients;
