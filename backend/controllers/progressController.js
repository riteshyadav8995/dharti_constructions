const ProjectProgress = require('../models/ProjectProgress');

const createProgress = async (req, res) => {
  try {
    const { project, milestone, completionPercent, status, dueDate, note } = req.body;
    
    // Check if milestone exists for this project
    let progress = await ProjectProgress.findOne({ project, milestone });
    
    if (progress) {
      if (completionPercent !== undefined) progress.completionPercent = completionPercent;
      if (status) progress.status = status;
      if (dueDate) progress.dueDate = dueDate;
      if (note) {
        progress.timestampedNotes.push({ note, timestamp: Date.now() });
      }
      progress.lastUpdated = Date.now();
      await progress.save();
    } else {
      progress = new ProjectProgress({ 
        project, 
        milestone, 
        completionPercent: completionPercent || 0,
        status: status || 'pending',
        dueDate
      });
      if (note) {
        progress.timestampedNotes.push({ note, timestamp: Date.now() });
      }
      await progress.save();
    }
    
    res.status(201).json(progress);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getProgressByProject = async (req, res) => {
  try {
    const progress = await ProjectProgress.find({ project: req.params.projectId }).sort({ createdAt: 1 });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createProgress, getProgressByProject };
