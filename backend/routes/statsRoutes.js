// routes/statsRoutes.js
const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/user-stats', statsController.getUserStats);

// Protected routes
router.post('/submit-rating', authMiddleware, statsController.submitRating);
router.get('/rating-eligibility', authMiddleware, statsController.checkRatingEligibility);

module.exports = router;