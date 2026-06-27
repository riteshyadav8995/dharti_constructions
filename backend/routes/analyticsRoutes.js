const express = require('express');
const router = express.Router();
const { getDashboardAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.route('/dashboard')
  .get(protect, getDashboardAnalytics);

module.exports = router;
