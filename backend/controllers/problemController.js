// controllers/problemController.js
const Problem = require('../models/Problem');
const fs = require('fs').promises;
const path = require('path');

// @route   GET /api/problems
// @desc    Get all problems with filters (for problems.html list)
// @access  Public
exports.getProblems = async (req, res) => {
    try {
        // You would implement filtering logic based on req.query (difficulty, language, etc.) here.
        // For simplicity, we fetch all problems sorted by problemId.
        const problems = await Problem.find()
            .select('problemId title language difficulty examples') // Select only essential fields for the list view
            .sort('problemId'); 

        res.json(problems);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching problems');
    }
};

// @route   GET /api/problems/:id
// @desc    Get single problem by ID (for solve-XX.html)
// @access  Public
exports.getProblemById = async (req, res) => {
    try {
        const problem = await Problem.findOne({ problemId: req.params.id });

        if (!problem) {
            return res.status(404).json({ msg: 'Problem not found' });
        }

        res.json(problem);
    } catch (err) {
        console.error(err.message);
        // Check for invalid ID format (e.g., non-numeric)
        if (err.kind === 'Number') {
            return res.status(400).json({ msg: 'Invalid Problem ID format' });
        }
        res.status(500).send('Server Error fetching single problem');
    }
};

// @route   GET /api/problems/:id/test-cases
// @desc    Get all test cases for a specific problem from problemData.json
// @access  Public
exports.getProblemTestCases = async (req, res) => {
    try {
        const problemId = parseInt(req.params.id);
        
        // Adjust the path according to your project structure
        // Since problemData.json is in backend/utils folder
        const problemDataPath = path.join(__dirname, '../utils/problemData.json');
        
        // Read and parse the problemData.json file
        const problemDataContent = await fs.readFile(problemDataPath, 'utf8');
        const problemData = JSON.parse(problemDataContent);
        
        // Find the problem by ID
        const problem = problemData.find(p => p.id === problemId);
        
        if (!problem) {
            return res.status(404).json({ 
                success: false, 
                message: 'Problem not found in problem data' 
            });
        }
        
        if (!problem.testCases || problem.testCases.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'No test cases found for this problem' 
            });
        }
        
        res.json({
            success: true,
            testCases: problem.testCases
        });
        
    } catch (error) {
        console.error('Error fetching problem test cases:', error);
        
        if (error.code === 'ENOENT') {
            return res.status(500).json({ 
                success: false, 
                message: 'Problem data file not found' 
            });
        }
        
        if (error instanceof SyntaxError) {
            return res.status(500).json({ 
                success: false, 
                message: 'Invalid problem data file format' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching test cases' 
        });
    }
};