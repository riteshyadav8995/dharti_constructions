import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Settings } from 'lucide-react';

const ProfilePage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      setName(userInfo.name || '');
      setEmail(userInfo.email || '');
      setCompany(userInfo.company || '');
      setPhone(userInfo.phone || '');
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.put(
        'http://localhost:5000/api/auth/profile',
        { name, password, company, phone },
        config
      );

      setMessage({ type: 'success', text: 'Profile Updated Successfully' });
      localStorage.setItem('userInfo', JSON.stringify(data));
      // Force reload or update state if needed, here just set message
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center text-slate-400 mb-8 text-sm">
        <Settings size={16} className="mr-2" />
        <span>&gt;</span>
        <span className="ml-2 text-white font-medium">Profile Settings</span>
      </div>

      <div className="bg-dhatri-card rounded-2xl p-8 border border-slate-700/50 shadow-xl">
        <div className="flex items-center mb-8">
          <div className="h-16 w-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mr-4">
            <User size={32} className="text-dhatri-orange" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Your Profile</h2>
            <p className="text-slate-400">Manage your account settings and preferences.</p>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'}`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={submitHandler} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-dhatri-orange transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full bg-slate-800/50 border border-slate-700 text-slate-500 rounded-lg px-4 py-3 cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-dhatri-orange transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-dhatri-orange transition-colors"
              />
            </div>
          </div>

          <div className="border-t border-slate-700/50 pt-6 mt-6">
            <h3 className="text-lg font-medium text-white mb-4">Security</h3>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="w-full max-w-md bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-dhatri-orange transition-colors placeholder-slate-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-dhatri-orange hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg shadow-orange-500/20"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
