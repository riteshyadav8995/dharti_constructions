const express = require('express');
const router = express.Router();
const { createExpense, getExpensesByProject, getAllExpenses } = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getAllExpenses)
  .post(protect, createExpense);

router.route('/project/:projectId')
  .get(protect, getExpensesByProject);

module.exports = router;
