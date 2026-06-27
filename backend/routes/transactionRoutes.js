const express = require('express');
const router = express.Router();
const { createTransaction, getTransactionsByProject, getAllTransactions } = require('../controllers/transactionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, admin, getAllTransactions)
  .post(protect, admin, createTransaction);

router.route('/project/:projectId')
  .get(protect, getTransactionsByProject);

module.exports = router;
