import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password });
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Login Failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-dhatri-card p-10 rounded-2xl shadow-xl border border-slate-700/50">
        
        <div className="flex flex-col items-center">
          <div className="bg-dhatri-orange p-3 rounded-xl flex items-center justify-center mb-4">
            <Building2 size={32} className="text-white" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
            Sign in to Dhatri Constructions
          </h2>

        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-slate-600 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-dhatri-orange focus:border-dhatri-orange placeholder-slate-500 transition-colors"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-slate-600 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-dhatri-orange focus:border-dhatri-orange placeholder-slate-500 transition-colors"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-dhatri-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dhatri-dark focus:ring-dhatri-orange transition-colors shadow-lg shadow-orange-500/20"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
