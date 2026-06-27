const Project = require('../models/Project');
const Expense = require('../models/Expense');
const Payment = require('../models/Payment');
const User = require('../models/User');

const getDashboardAnalytics = async (req, res) => {
  try {
    const activeProjectsCount = await Project.countDocuments();
    
    const expenses = await Expense.aggregate([
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
    ]);
    const totalExpenses = expenses.length > 0 ? expenses[0].totalAmount : 0;

    const payments = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
    ]);
    const totalRevenue = payments.length > 0 ? payments[0].totalAmount : 0;

    const projects = await Project.find({});
    let totalContractValue = 0;
    projects.forEach(p => {
      totalContractValue += (p.contractValue || 0);
    });
    const pendingDues = totalContractValue - totalRevenue > 0 ? totalContractValue - totalRevenue : 0;

    // Monthly data for charts
    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: {
          _id: { $month: '$paymentDate' },
          total: { $sum: '$amount' }
      }},
      { $sort: { _id: 1 } }
    ]);

    const monthlyExpenses = await Expense.aggregate([
      { $group: {
          _id: { $month: '$date' },
          total: { $sum: '$amount' }
      }},
      { $sort: { _id: 1 } }
    ]);

    const expenseByCategory = await Expense.aggregate([
      { $group: {
          _id: '$category',
          total: { $sum: '$amount' }
      }}
    ]);

    res.json({
      activeProjectsCount,
      totalExpenses,
      totalRevenue,
      pendingDues,
      monthlyRevenue,
      monthlyExpenses,
      expenseByCategory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardAnalytics };
