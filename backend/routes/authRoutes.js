const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

// Helper to get the upload middleware instance and Cloudinary object from the app
const getUploadMiddleware = (req, res, next) => {
  // Get the configured multer instance
  req.upload = req.app.get('upload'); 
  // Pass the configured Cloudinary instance to the controller
  req.cloudinary = req.app.get('cloudinary');
  next();
};

// --- POST /api/auth/signup ---
router.post('/signup', authController.signUpUser);

// --- POST /api/auth/signin ---
router.post('/signin', authController.signInUser);

// --- POST /api/auth/send-otp ---
router.post('/send-otp', authController.sendOTP);

// --- POST /api/auth/verify-otp ---
router.post('/verify-otp', authController.verifyOTP);

// --- GET /api/auth/me (Protected Route - Get Current User) ---
router.get('/me', authMiddleware, authController.getCurrentUser);

// --- PUT /api/auth/profile (Protected Route - Update User Profile) ---
// 1. Authenticate the user (authMiddleware)
// 2. Load the Cloudinary/Multer config onto the request (getUploadMiddleware)
// 3. Process the incoming file (req.upload.single('profilePicture'))
router.put(
  '/profile', 
  authMiddleware, 
  getUploadMiddleware, 
  // IMPORTANT: 'profilePicture' must match the key used in the FormData in Settings.jsx
  (req, res, next) => req.upload.single('profilePicture')(req, res, next), 
  authController.updateProfile
);

module.exports = router;