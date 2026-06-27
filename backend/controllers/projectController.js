const Project = require('../models/Project');

const createProject = async (req, res) => {
  try {
    const { name, description, client, status, startDate, endDate, budget } = req.body;
    
    const project = new Project({
      name,
      description,
      client,
      status,
      startDate,
      endDate,
      budget,
    });
    
    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getProjects = async (req, res) => {
  try {
    const filter = (req.user.role === 'admin' || req.user.role === 'site_manager') ? {} : { client: req.user._id };
    
    if (req.query.archived === 'true') {
      filter.isArchived = true;
    } else {
      filter.isArchived = { $ne: true };
    }

    let projects = await Project.find(filter).populate('client', 'name email company').lean();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    projects = projects.map(p => {
      if (p.expectedCompletionDate) {
        const end = new Date(p.expectedCompletionDate);
        end.setHours(0, 0, 0, 0);
        if (today > end && p.completionPercentage < 100) {
          p.status = 'delayed';
        }
      }
      return p;
    });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id).populate('client', 'name email company').lean();
    if (project) {
      if (req.user.role === 'client' && project.client._id.toString() !== req.user._id.toString()) {
         return res.status(401).json({ message: 'Not authorized to view this project' });
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (project.expectedCompletionDate) {
        const end = new Date(project.expectedCompletionDate);
        end.setHours(0, 0, 0, 0);
        if (today > end && project.completionPercentage < 100) {
          project.status = 'delayed';
        }
      }

      res.json(project);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { name, description, status, startDate, endDate, budget, completionPercentage, isArchived } = req.body;
    const project = await Project.findById(req.params.id);

    if (project) {
      project.name = name || project.name;
      project.description = description || project.description;
      if (status) project.status = status;
      project.startDate = startDate || project.startDate;
      project.endDate = endDate || project.endDate;
      project.budget = budget !== undefined ? budget : project.budget;
      if (completionPercentage !== undefined) project.completionPercentage = completionPercentage;
      if (isArchived !== undefined) project.isArchived = isArchived;

      const updatedProject = await project.save();
      res.json(updatedProject);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createProject, getProjects, getProjectById, updateProject };
