import React, { useState } from 'react';
import axios from 'axios';
import { Plus, X } from 'lucide-react';

const AdminProjects = ({ userInfo, projects, clients, fetchProjects }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '', description: '', client: '', status: 'Planning', location: '', projectManager: '', startDate: '', endDate: '', budget: ''
  });

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post('http://localhost:5000/api/projects', newProject, config);
      setShowAddModal(false);
      setNewProject({ name: '', description: '', client: '', status: 'Planning', location: '', projectManager: '', startDate: '', endDate: '', budget: '' });
      fetchProjects();
    } catch (error) {
      console.error('Error adding project:', error);
      alert(error.response?.data?.message || 'Failed to add project');
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center">
          <Plus size={16} className="mr-2" /> Add Project
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
        {projects.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No projects found. Create one to get started.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">Project Name</th>
                <th className="pb-3 font-medium">Client</th>
                <th className="pb-3 font-medium">Location</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Budget</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-4 text-gray-900 font-medium">{p.name}</td>
                  <td className="py-4 text-gray-600">{p.client?.name || 'N/A'}</td>
                  <td className="py-4 text-gray-600">{p.location || 'N/A'}</td>
                  <td className="py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wider">{p.status}</span>
                  </td>
                  <td className="py-4 text-gray-600">${p.budget?.toLocaleString() || 0}</td>
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
              <h2 className="text-xl font-bold text-gray-900">Add New Project</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddProject} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input type="text" required value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <select required value={newProject.client} onChange={e => setNewProject({...newProject, client: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white">
                    <option value="" disabled>Select a client</option>
                    {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input type="text" required value={newProject.location} onChange={e => setNewProject({...newProject, location: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Manager</label>
                  <input type="text" required value={newProject.projectManager} onChange={e => setNewProject({...newProject, projectManager: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Budget ($)</label>
                  <input type="number" required value={newProject.budget} onChange={e => setNewProject({...newProject, budget: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select required value={newProject.status} onChange={e => setNewProject({...newProject, status: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white">
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" value={newProject.startDate} onChange={e => setNewProject({...newProject, startDate: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input type="date" value={newProject.endDate} onChange={e => setNewProject({...newProject, endDate: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows="2" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg"></textarea>
                </div>
              </div>
              <div className="mt-8 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminProjects;
