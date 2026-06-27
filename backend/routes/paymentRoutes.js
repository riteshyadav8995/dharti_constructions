const express = require('express');
const router = express.Router();
const { createPayment, getPaymentsByClient, getAllPayments } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getAllPayments)
  .post(protect, createPayment);

router.route('/client/:clientId')
  .get(protect, getPaymentsByClient);

module.exports = router;
