const Expense = require('../models/Expense');

const createExpense = async (req, res) => {
  try {
    const { project, category, vendor, amount, date, description, invoiceUrl } = req.body;
    const expense = new Expense({
      project, category, vendor, amount, date, description, invoiceUrl
    });
    const createdExpense = await expense.save();
    res.status(201).json(createdExpense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getExpensesByProject = async (req, res) => {
  try {
    const expenses = await Expense.find({ project: req.params.projectId }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().populate('project', 'name').sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createExpense, getExpensesByProject, getAllExpenses };
