// problemRoutes.js
const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');
const authMiddleware = require('../middleware/authMiddleware'); // NEW: Import auth middleware

// @route   GET /api/problems
router.get('/', problemController.getProblems);

// @route   GET /api/problems/:id
router.get('/:id', problemController.getProblemById);

// @route   GET /api/problems/:id/test-cases
router.get('/:id/test-cases', problemController.getProblemTestCases);

// --- NEW PROTECTED ROUTES (Requires authentication) ---

// @route   POST /api/problems/:id/run-tests
// Runs the user code against all test cases and returns results (Run All button)
router.post('/:id/run-tests', authMiddleware, problemController.runTestCases);

// @route   POST /api/problems/:id/submit
// Final submission: validates, updates progress status to 'solved', and updates user stats (Submit button)
router.post('/:id/submit', authMiddleware, problemController.submitProblem);

module.exports = router;