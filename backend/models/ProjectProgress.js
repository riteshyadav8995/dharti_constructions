const mongoose = require('mongoose');

const projectProgressSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  milestone: {
    type: String, // e.g., 'Excavation', 'Foundation', 'Structure', 'Painting'
    required: true,
  },
  completionPercent: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'in progress', 'completed', 'delayed'],
    default: 'pending',
  },
  dueDate: {
    type: Date,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  timestampedNotes: [{
    note: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, {
  timestamps: true,
});

const ProjectProgress = mongoose.model('ProjectProgress', projectProgressSchema);
module.exports = ProjectProgress;
