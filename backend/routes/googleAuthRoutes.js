const express = require('express');
const router = express.Router();
// FIX: Explicitly import the Google Auth Controller
const googleAuthController = require('../controllers/googleAuthController'); 

// @route   POST /api/auth/google
// @desc    Unified route for Sign in/Sign up with Google token
router.post('/', googleAuthController.googleAuth); 

module.exports = router;