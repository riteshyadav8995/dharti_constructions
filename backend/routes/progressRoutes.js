const express = require('express');
const router = express.Router();
const { createProgress, getProgressByProject } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createProgress);

router.route('/project/:projectId')
  .get(protect, getProgressByProject);

module.exports = router;
