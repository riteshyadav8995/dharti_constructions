const express = require('express');
const router = express.Router();
const { registerUser, authUser, getUserProfile, updateUserProfile, getSiteManagers, createSiteManager } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.route('/sitemanagers')
  .get(protect, admin, getSiteManagers)
  .post(protect, admin, createSiteManager);

module.exports = router;

