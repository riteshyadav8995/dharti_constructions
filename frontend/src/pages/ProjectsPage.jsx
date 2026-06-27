import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, Search, Filter, Plus, ChevronRight, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/projects`, config);
      setProjects(res.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredProjects = projects.filter(p => {
    let match = true;
    if (statusFilter && p.status !== statusFilter) match = false;
    if (clientFilter && !p.clientName.toLowerCase().includes(clientFilter.toLowerCase())) match = false;
    
    if (startDateFilter && p.startDate) {
      if (new Date(p.startDate) < new Date(startDateFilter)) match = false;
    }
    if (endDateFilter && p.expectedCompletionDate) {
      if (new Date(p.expectedCompletionDate) > new Date(endDateFilter)) match = false;
    }
    return match;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'on track': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'at risk': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'delayed': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'on track': return <CheckCircle2 size={14} className="mr-1" />;
      case 'at risk': return <AlertCircle size={14} className="mr-1" />;
      case 'delayed': return <Clock size={14} className="mr-1" />;
      default: return null;
    }
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    clientName: '',
    startDate: '',
    expectedCompletionDate: '',
    contractValue: '',
    budget: '',
    description: ''
  });

  if (loading) return <div className="text-center py-10 text-slate-400">Loading Projects...</div>;

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      // Note: for this quick demo we use clientName as string. Backend might expect an ObjectId if it refs 'User'.
      // If backend expects ObjectId for client, this might fail unless backend falls back to string or we have a dropdown of clients.
      // Assuming backend expects client objectId. If so, we need clients list.
      await axios.post(`${import.meta.env.VITE_API_URL}/projects`, newProject, config);
      setShowAddModal(false);
      fetchProjects();
    } catch (err) {
      console.error('Error adding project:', err);
      alert('Failed to add project');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center text-slate-400 text-sm">
          <Briefcase size={16} className="mr-2" />
          <span>&gt;</span>
          <span className="ml-2 text-white font-medium">Project Workspace</span>
        </div>
        {userInfo.role === 'admin' && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-dhatri-orange hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-lg shadow-orange-500/20 font-medium"
          >
            <Plus size={16} className="mr-2" />
            New Project
          </button>
        )}
      </div>

      <h1 className="text-3xl font-bold text-white mb-8">Active Projects</h1>

      {/* Filters */}
      <div className="bg-dhatri-card rounded-2xl p-6 border border-slate-700/50 shadow-xl mb-8">
        <div className="flex items-center text-slate-300 mb-4 font-medium">
          <Filter size={18} className="mr-2 text-dhatri-orange" />
          Filter Projects
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider">Status</label>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-dhatri-orange"
            >
              <option value="">All Statuses</option>
              <option value="on track">On Track</option>
              <option value="at risk">At Risk</option>
              <option value="delayed">Delayed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider">Client Name</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search client..." 
                value={clientFilter}
                onChange={e => setClientFilter(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-dhatri-orange"
              />
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider">From Date</label>
            <input 
              type="date" 
              value={startDateFilter}
              onChange={e => setStartDateFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-dhatri-orange [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider">To Date</label>
            <input 
              type="date" 
              value={endDateFilter}
              onChange={e => setEndDateFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-dhatri-orange [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {/* Project List */}
      <div className="bg-dhatri-card rounded-2xl border border-slate-700/50 shadow-xl overflow-x-auto">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No projects found matching your criteria.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/80 bg-slate-800/30 text-slate-400 text-sm">
                <th className="py-4 px-6 font-medium">Project Details</th>
                <th className="py-4 px-6 font-medium">Timeline</th>
                <th className="py-4 px-6 font-medium">Status</th>
                <th className="py-4 px-6 font-medium">Progress</th>
                <th className="py-4 px-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredProjects.map((p) => (
                <tr key={p._id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="py-5 px-6">
                    <div className="font-bold text-white text-base mb-1">{p.name}</div>
                    <div className="text-sm text-slate-400 flex items-center">
                      <span className="w-2 h-2 rounded-full bg-slate-600 mr-2"></span>
                      {p.clientName || (p.client && p.client.name) || 'Unknown Client'}
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="text-sm text-slate-300 mb-1">
                      Start: {p.startDate ? new Date(p.startDate).toLocaleDateString('en-GB') : 'N/A'}
                    </div>
                    <div className="text-sm text-slate-400">
                      End: {p.expectedCompletionDate ? new Date(p.expectedCompletionDate).toLocaleDateString('en-GB') : 'N/A'}
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border capitalize ${getStatusColor(p.status)}`}>
                      {getStatusIcon(p.status)}
                      {p.status}
                    </span>
                  </td>
                  <td className="py-5 px-6 w-1/4">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-sm font-medium text-slate-300">Completion</span>
                      <span className="text-xs font-bold text-white">{p.completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 border border-slate-700/50 overflow-hidden">
                      <div 
                        className="bg-dhatri-orange h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${p.completionPercentage}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <Link 
                      to={`/projects/${p._id}`}
                      className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-dhatri-orange transition-colors group-hover:shadow-md"
                    >
                      <ChevronRight size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-dhatri-card rounded-2xl border border-slate-700 shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-700/50">
              <h2 className="text-xl font-bold text-white">Create New Project</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddProject} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Project Name</label>
                  <input required value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Client Name</label>
                  <input required value={newProject.clientName} onChange={e => setNewProject({...newProject, clientName: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Start Date</label>
                  <input type="date" required value={newProject.startDate} onChange={e => setNewProject({...newProject, startDate: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">End Date</label>
                  <input type="date" required value={newProject.expectedCompletionDate} onChange={e => setNewProject({...newProject, expectedCompletionDate: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Contract Value</label>
                  <input type="number" required value={newProject.contractValue} onChange={e => setNewProject({...newProject, contractValue: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Budget</label>
                  <input type="number" required value={newProject.budget} onChange={e => setNewProject({...newProject, budget: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white" />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-dhatri-orange text-white rounded">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
