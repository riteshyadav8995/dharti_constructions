import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Calendar, Flag, CheckCircle2, Clock, AlertCircle, MessageSquare, Plus, Edit2, X } from 'lucide-react';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [progresses, setProgresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for updating project status
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [projectUpdate, setProjectUpdate] = useState({ status: '', completionPercentage: 0 });

  // States for milestones
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({
    milestone: '',
    completionPercent: 0,
    status: 'pending',
    dueDate: '',
    note: ''
  });

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const [projRes, progRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/projects/${id}`, config),
        axios.get(`${import.meta.env.VITE_API_URL}/progress/project/${id}`, config)
      ]);
      setProject(projRes.data);
      setProjectUpdate({ status: projRes.data.status, completionPercentage: projRes.data.completionPercentage });
      setProgresses(progRes.data);
    } catch (error) {
      console.error('Error fetching project details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL}/projects/${id}`, projectUpdate, config);
      setShowStatusModal(false);
      fetchProjectData();
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project status');
    }
  };

  const handleSaveMilestone = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(`${import.meta.env.VITE_API_URL}/progress`, { ...milestoneForm, project: id }, config);
      setShowMilestoneModal(false);
      setMilestoneForm({ milestone: '', completionPercent: 0, status: 'pending', dueDate: '', note: '' });
      fetchProjectData();
    } catch (error) {
      console.error('Error saving milestone:', error);
      alert('Failed to save milestone');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'on track': 
      case 'completed': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'at risk': 
      case 'in progress': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'delayed': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  if (loading) return <div className="text-center py-10 text-slate-400">Loading Project Details...</div>;
  if (!project) return <div className="text-center py-10 text-red-400">Project not found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Back link */}
      <Link to="/projects" className="inline-flex items-center text-dhatri-orange hover:text-orange-400 transition-colors font-medium">
        <ChevronLeft size={16} className="mr-1" />
        Back to Project Workspace
      </Link>

      {/* Project Header Card */}
      <div className="bg-dhatri-card rounded-2xl border border-slate-700/50 shadow-xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-dhatri-orange/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>
            <p className="text-slate-400 flex items-center mb-0 md:mb-6">
              <span className="w-2 h-2 rounded-full bg-slate-600 mr-2"></span>
              Client: {project.clientName || (project.client && project.client.name) || 'Unknown'}
            </p>
          </div>
          {userInfo.role === 'admin' && (
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={async () => {
                  if (window.confirm('Are you sure you want to archive this project?')) {
                    try {
                      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                      await axios.put(`${import.meta.env.VITE_API_URL}/projects/${id}`, { isArchived: true }, config);
                      window.location.href = '/projects';
                    } catch (err) {
                      alert('Failed to archive');
                    }
                  }
                }}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg flex items-center transition-colors border border-red-500/20 text-sm md:text-base"
              >
                Archive Project
              </button>
              <button 
                onClick={() => setShowStatusModal(true)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg flex items-center transition-colors border border-slate-600 text-sm md:text-base"
              >
                <Edit2 size={16} className="mr-2" />
                Update Status
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Overall Status</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border capitalize ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Completion</p>
            <div className="flex items-end">
              <span className="text-2xl font-bold text-white leading-none mr-2">{project.completionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
              <div className="bg-dhatri-orange h-1.5 rounded-full" style={{ width: `${project.completionPercentage}%` }}></div>
            </div>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Start Date</p>
            <div className="text-white font-medium flex items-center">
              <Calendar size={14} className="mr-2 text-slate-400" />
              {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
            </div>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Expected Completion</p>
            <div className="text-white font-medium flex items-center">
              <Flag size={14} className="mr-2 text-slate-400" />
              {project.expectedCompletionDate ? new Date(project.expectedCompletionDate).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline & Milestones */}
      <div className="bg-dhatri-card rounded-2xl border border-slate-700/50 shadow-xl p-8">
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
            <CheckCircle2 size={24} className="mr-2 shrink-0 text-dhatri-orange" />
            Project Timeline & Milestones
          </h2>
          <button 
            onClick={() => {
              setMilestoneForm({ milestone: '', completionPercent: 0, status: 'pending', dueDate: '', note: '' });
              setShowMilestoneModal(true);
            }}
            className="bg-dhatri-orange hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-lg shadow-orange-500/20 font-medium"
          >
            <Plus size={16} className="mr-2" />
            Add Milestone
          </button>
        </div>

        <div className="space-y-8">
          {progresses.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No milestones tracked for this project yet.</p>
          ) : (
            <div className="relative border-l-2 border-slate-800 ml-4 space-y-8 pb-4">
              {progresses.map((prog, index) => (
                <div key={prog._id} className="relative pl-8">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${
                    prog.status === 'completed' ? 'bg-green-500 border-green-500' :
                    prog.status === 'in progress' ? 'bg-dhatri-orange border-dhatri-orange' :
                    prog.status === 'delayed' ? 'bg-red-500 border-red-500' : 'bg-slate-800 border-slate-600'
                  }`}></div>
                  
                  <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4 md:p-5">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                      <div className="w-full sm:w-auto">
                        <h3 className="text-lg font-bold text-white mb-2">{prog.milestone}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded uppercase text-xs font-bold ${getStatusColor(prog.status)}`}>
                            {prog.status}
                          </span>
                          <span className="text-slate-400 flex items-center">
                            <Clock size={14} className="mr-1" />
                            Due: {prog.dueDate ? new Date(prog.dueDate).toLocaleDateString() : 'No date set'}
                          </span>
                        </div>
                      </div>
                      <div className="text-left sm:text-right mt-2 sm:mt-0">
                        <span className="text-xl font-bold text-white">{prog.completionPercent}%</span>
                        <p className="text-xs text-slate-500 uppercase">Complete</p>
                      </div>
                    </div>

                    {/* Progress Notes */}
                    {prog.timestampedNotes && prog.timestampedNotes.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
                        <h4 className="text-sm font-medium text-slate-300 flex items-center mb-2">
                          <MessageSquare size={14} className="mr-2 text-slate-500" /> Progress Notes
                        </h4>
                        {prog.timestampedNotes.map((note, idx) => (
                          <div key={idx} className="bg-slate-800/50 rounded-lg p-3 text-sm">
                            <p className="text-slate-300 mb-1">{note.note}</p>
                            <p className="text-xs text-slate-500">{new Date(note.timestamp).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    )}

                      <button 
                        onClick={() => {
                          setMilestoneForm({ 
                            milestone: prog.milestone, 
                            completionPercent: prog.completionPercent, 
                            status: prog.status, 
                            dueDate: prog.dueDate ? prog.dueDate.split('T')[0] : '', 
                            note: '' 
                          });
                          setShowMilestoneModal(true);
                        }}
                        className="mt-4 text-sm text-dhatri-orange hover:text-orange-400 font-medium"
                      >
                        + Update Progress or Add Note
                      </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Update Project Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-dhatri-card rounded-2xl border border-slate-700 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-700/50">
              <h2 className="text-xl font-bold text-white">Update Overall Status</h2>
              <button onClick={() => setShowStatusModal(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleUpdateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Project Status</label>
                <select 
                  value={projectUpdate.status} 
                  onChange={e => setProjectUpdate({...projectUpdate, status: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-dhatri-orange"
                >
                  <option value="on track">On Track</option>
                  <option value="at risk">At Risk</option>
                  <option value="delayed">Delayed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Overall Completion %</label>
                <input 
                  type="number" 
                  min="0" max="100"
                  value={projectUpdate.completionPercentage} 
                  onChange={e => setProjectUpdate({...projectUpdate, completionPercentage: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-dhatri-orange"
                />
              </div>
              <div className="mt-8 flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowStatusModal(false)} className="px-4 py-2 border border-slate-600 text-slate-300 hover:bg-slate-700 rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-dhatri-orange text-white rounded-lg font-medium hover:bg-orange-600 transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Update Milestone Modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-dhatri-card rounded-2xl border border-slate-700 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-700/50">
              <h2 className="text-xl font-bold text-white">Milestone Progress</h2>
              <button onClick={() => setShowMilestoneModal(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveMilestone} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Milestone Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Foundation, Ground Floor"
                  value={milestoneForm.milestone} 
                  onChange={e => setMilestoneForm({...milestoneForm, milestone: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-dhatri-orange"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                  <select 
                    value={milestoneForm.status} 
                    onChange={e => setMilestoneForm({...milestoneForm, status: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-dhatri-orange"
                  >
                    <option value="pending">Pending</option>
                    <option value="in progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Completion %</label>
                  <input 
                    type="number" 
                    min="0" max="100"
                    value={milestoneForm.completionPercent} 
                    onChange={e => setMilestoneForm({...milestoneForm, completionPercent: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-dhatri-orange"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Due Date</label>
                <input 
                  type="date" 
                  value={milestoneForm.dueDate} 
                  onChange={e => setMilestoneForm({...milestoneForm, dueDate: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-slate-300 focus:outline-none focus:border-dhatri-orange [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Add Note (Optional)</label>
                <textarea 
                  rows="3" 
                  placeholder="E.g., Waiting for concrete curing..."
                  value={milestoneForm.note} 
                  onChange={e => setMilestoneForm({...milestoneForm, note: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-dhatri-orange"
                ></textarea>
              </div>
              <div className="mt-8 flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowMilestoneModal(false)} className="px-4 py-2 border border-slate-600 text-slate-300 hover:bg-slate-700 rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-dhatri-orange text-white rounded-lg font-medium hover:bg-orange-600 transition-colors">Save Milestone</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;
