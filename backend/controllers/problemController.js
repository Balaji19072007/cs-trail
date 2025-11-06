// controllers/problemController.js
const Problem = require('../models/Problem');
const User = require('../models/User'); 
const Progress = require('../models/Progress'); 
const fs = require('fs').promises;
const path = require('path');
const { runCodeTest } = require('../server'); // Import the new test runner utility

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
        const problemDataPath = path.join(__dirname, '../util/problemData.json');
        
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


// @route   POST /api/problems/:id/run-tests
// @desc    Execute user code against visible and hidden test cases
// @access  Private (requires authMiddleware)
exports.runTestCases = async (req, res) => {
    const { code, language } = req.body;
    const problemId = parseInt(req.params.id);
    const userId = req.user.id; // From authMiddleware

    if (!code || !language) {
        return res.status(400).json({ msg: 'Code and language are required' });
    }

    try {
        // 1. Get all test cases for the problem from JSON
        const problemDataPath = path.join(__dirname, '../util/problemData.json');
        const problemDataContent = await fs.readFile(problemDataPath, 'utf8');
        const allProblems = JSON.parse(problemDataContent);
        const problemFromJSON = allProblems.find(p => p.id === problemId);

        if (!problemFromJSON || !problemFromJSON.testCases || problemFromJSON.testCases.length === 0) {
            return res.status(404).json({ success: false, message: 'Problem or test cases not found' });
        }

        // Fetch problem from database to get official examples list (needed to determine visibility)
        const problemFromDB = await Problem.findOne({ problemId });
        // Normalize examples input to match the normalization done during output check
        const normalize = (str) => str ? str.trim().replace(/[\r\n]/g, ' ').replace(/\s+/g, ' ') : '';
        const visibleExampleInputs = problemFromDB && problemFromDB.examples ? problemFromDB.examples.map(e => normalize(e.input)) : [];


        // 2. Prepare test results
        const results = [];
        let passedCount = 0;
        
        // 3. Run code against each test case sequentially
        for (const [index, test] of problemFromJSON.testCases.entries()) {
            const result = await runCodeTest(language, code, test.input);
            
            const normalizedExpected = normalize(test.expected);
            const normalizedOutput = normalize(result.stdout);
            
            // CRITICAL FIX: Determine failure if there is compilation/runtime error (result.stderr)
            const hasError = !!result.stderr;
            const isPassed = !hasError && result.exitCode === 0 && normalizedOutput === normalizedExpected;

            if (isPassed) {
                passedCount++;
            }
            
            // Determine visibility: Check if the test input matches one of the known visible example inputs
            const normalizedTestInput = normalize(test.input);
            const isVisible = visibleExampleInputs.some(input => normalize(input) === normalizedTestInput);
            
            results.push({
                testCase: index + 1,
                status: isPassed ? 'pass' : (hasError ? 'error' : 'fail'),
                // Pass full input, frontend can decide to hide
                input: test.input, 
                // Only show expected output if it's a visible example
                expectedOutput: isVisible ? test.expected : 'Hidden',
                codeOutput: isVisible ? result.stdout : (hasError ? result.stderr.trim() : 'Execution Failed'),
                error: result.stderr ? result.stderr.trim() : null,
                isVisible: isVisible,
            });
        }
        
        const totalTests = problemFromJSON.testCases.length;
        const accuracy = (passedCount / totalTests) * 100;

        // 4. Update user's progress (Only update best accuracy)
        await Progress.findOneAndUpdate(
            { userId, problemId },
            { 
                $set: { lastSubmission: new Date(), status: 'attempted' },
                $max: { bestAccuracy: accuracy } // Only update if new accuracy is higher
            },
            { upsert: true, new: true } // Create if not exists, return updated document
        );

        res.json({
            success: true,
            results,
            passedCount,
            totalTests,
            accuracy: Math.floor(accuracy),
        });

    } catch (err) {
        // Catch catastrophic errors (like file system failure or general API crash)
        console.error('Catastrophic error running test cases:', err.message);
        res.status(500).json({ msg: 'Server error during test execution', error: err.message });
    }
};

// @route   POST /api/problems/:id/submit
// @desc    Submit final solution, run against all tests, update progress/stats
// @access  Private (requires authMiddleware)
exports.submitProblem = async (req, res) => {
    const { code, language } = req.body;
    const problemId = parseInt(req.params.id);
    const userId = req.user.id; // From authMiddleware
    const problemPoints = 10; // Assign static points for simplicity (adjust as needed)

    if (!code || !language) {
        return res.status(400).json({ msg: 'Code and language are required' });
    }

    try {
        // 1. Run all tests to determine final accuracy 
        const problemDataPath = path.join(__dirname, '../util/problemData.json');
        const problemDataContent = await fs.readFile(problemDataPath, 'utf8');
        const allProblems = JSON.parse(problemDataContent);
        const problemFromJSON = allProblems.find(p => p.id === problemId);

        if (!problemFromJSON || !problemFromJSON.testCases || problemFromJSON.testCases.length === 0) {
            return res.status(404).json({ success: false, message: 'Problem test cases not found for submission validation' });
        }
        
        let passedCount = 0;
        const totalTests = problemFromJSON.testCases.length;
        
        const normalize = (str) => str ? str.trim().replace(/[\r\n]/g, ' ').replace(/\s+/g, ' ') : '';
        
        // This process runs against all hidden and visible test cases
        for (const test of problemFromJSON.testCases) {
            const result = await runCodeTest(language, code, test.input);
            const normalizedExpected = normalize(test.expected);
            const normalizedOutput = normalize(result.stdout);
            
            const hasError = !!result.stderr;
            
            if (!hasError && result.exitCode === 0 && normalizedOutput === normalizedExpected) {
                passedCount++;
            }
        }
        
        const accuracy = (passedCount / totalTests) * 100;
        const isSolved = accuracy === 100;
        
        // 2. Update Progress
        const status = isSolved ? 'solved' : 'attempted';
        
        const existingProgress = await Progress.findOne({ userId, problemId });
        
        // Update status and ensure bestAccuracy is maintained
        await Progress.findOneAndUpdate(
            { userId, problemId },
            { 
                $set: { 
                    status, 
                    lastSubmission: new Date(),
                    // Update accuracy only if it's the best score yet
                    bestAccuracy: Math.max(existingProgress?.bestAccuracy || 0, accuracy)
                }
            },
            { upsert: true, new: true }
        );

        // 3. Update User Stats (only if successfully solved for the first time)
        let pointsAwarded = 0;
        if (isSolved && (existingProgress?.status !== 'solved' || !existingProgress)) {
            // Only reward points and increment solved count if it was NOT solved previously
            await User.findByIdAndUpdate(userId, {
                $inc: { 
                    totalPoints: problemPoints,
                    problemsSolved: 1 
                }
            });
            pointsAwarded = problemPoints;
        }
        
        res.json({
            success: true,
            isSolved: isSolved,
            accuracy: Math.floor(accuracy),
            totalTests,
            passedCount,
            message: isSolved ? (existingProgress?.status === 'solved' ? 'Problem already solved. Great job!' : 'Solution accepted! Problem solved!') : 'Solution failed some test cases. Keep trying!',
            pointsAwarded: pointsAwarded,
            newStatus: status
        });

    } catch (err) {
        console.error('Catastrophic error submitting problem:', err.message);
        res.status(500).json({ msg: 'Server error during submission', error: err.message });
    }
};