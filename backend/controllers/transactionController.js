const Transaction = require('../models/Transaction');
const Project = require('../models/Project');

const createTransaction = async (req, res) => {
  try {
    const { project, type, amount, date, description, status } = req.body;
    
    // Ensure the project exists
    const projExists = await Project.findById(project);
    if (!projExists) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const transaction = new Transaction({
      project, type, amount, date, description, status
    });
    
    const createdTransaction = await transaction.save();
    res.status(201).json(createdTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getTransactionsByProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Ensure client can only see their project's transactions
    if (req.user.role !== 'admin' && project.client.toString() !== req.user._id.toString()) {
       return res.status(401).json({ message: 'Not authorized' });
    }

    const transactions = await Transaction.find({ project: projectId }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate('project', 'name').sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTransaction, getTransactionsByProject, getAllTransactions };
