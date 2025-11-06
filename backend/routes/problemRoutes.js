// problemRoutes.js
const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');

// @route   GET /api/problems
router.get('/', problemController.getProblems);

// @route   GET /api/problems/:id
router.get('/:id', problemController.getProblemById);

// @route   GET /api/problems/:id/test-cases
router.get('/:id/test-cases', problemController.getProblemTestCases);

module.exports = router;