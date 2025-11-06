// routes/predictionRoutes.js

const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');
const authMiddleware = require('../middleware/authMiddleware'); // Use existing middleware

// @route   POST /predict
// We protect this route as AI/Prediction features should generally be authenticated.
router.post('/', authMiddleware, predictionController.handlePrediction);

module.exports = router;
