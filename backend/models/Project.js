const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  clientName: {
    type: String,
    required: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  location: {
    type: String,
  },
  projectManager: {
    type: String,
  },
  status: {
    type: String,
    enum: ['on track', 'at risk', 'delayed'],
    default: 'on track',
  },
  startDate: {
    type: Date,
  },
  expectedCompletionDate: {
    type: Date,
  },
  contractValue: {
    type: Number,
    required: true,
    default: 0,
  },
  completionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  budget: {
    type: Number,
    required: true,
    default: 0,
  },
  estimatedBudget: [{
    category: {
      type: String,
      enum: ['Land Cost', 'Materials', 'Labor', 'Electrical', 'Plumbing', 'Marketing', 'Misc'],
    },
    amount: {
      type: Number,
      default: 0,
    }
  }],
}, {
  timestamps: true,
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
