import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserPlus, Mail, Phone, Shield } from 'lucide-react';

const UserManagement = () => {
  const [managers, setManagers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'site_manager',
    company: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Note: Assuming userInfo is stored in localStorage
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/sitemanagers`, config);
      setManagers(res.data);
    } catch (err) {
      console.error('Error fetching site managers:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateManager = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/sitemanagers`, formData, config);
      setSuccess('User created successfully.');
      setFormData({ name: '', email: '', password: '', phone: '', role: 'site_manager', company: '' });
      fetchManagers();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center text-slate-400 mb-8 text-sm">
        <Users size={16} className="mr-2" />
        <span>&gt;</span>
        <span className="ml-2 text-white font-medium">User Management</span>
      </div>

      <h1 className="text-3xl font-bold text-white mb-8">System Users</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="bg-dhatri-card rounded-2xl p-6 border border-slate-700/50 shadow-xl lg:col-span-1 h-fit">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <UserPlus size={20} className="mr-2 text-dhatri-orange" />
            Add New User
          </h2>

          {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</div>}
          {success && <div className="bg-green-500/10 border border-green-500 text-green-500 p-3 rounded-lg mb-4 text-sm">{success}</div>}

          <form onSubmit={handleCreateManager} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-dhatri-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-dhatri-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-dhatri-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-dhatri-orange"
              >
                <option value="site_manager">Site Manager</option>
                <option value="client">Client</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-dhatri-orange"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-dhatri-orange hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-4"
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>

        {/* Manager List */}
        <div className="bg-dhatri-card rounded-2xl p-6 border border-slate-700/50 shadow-xl lg:col-span-2">
          <h2 className="text-xl font-bold text-white mb-6">Active Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-sm">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Role</th>
                </tr>
              </thead>
              <tbody>
                {managers.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-slate-400">
                      No site managers found.
                    </td>
                  </tr>
                ) : (
                  managers.map((manager) => (
                    <tr key={manager._id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium text-white">{manager.name}</div>
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-300">
                        <div className="flex items-center mb-1"><Mail size={14} className="mr-2 text-slate-500" />{manager.email}</div>
                        {manager.phone && <div className="flex items-center"><Phone size={14} className="mr-2 text-slate-500" />{manager.phone}</div>}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${manager.role === 'site_manager' ? 'bg-blue-900/50 text-blue-300 border-blue-800' : 'bg-green-900/50 text-green-300 border-green-800'}`}>
                          <Shield size={12} className="mr-1" />
                          {manager.role === 'site_manager' ? 'Site Manager' : 'Client'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
