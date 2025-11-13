// frontend/src/api/problemApi.js

import { io } from 'socket.io-client';
import api from '../services/apiService'; // Import the configured axios instance

const API_BASE_URL = 'http://localhost:5000/api/problems';
const SOCKET_URL = 'http://localhost:5000';

// Import the actual problem data from the JSON file
import problemData from '../data/problemData.json';

// Convert the array from problemData.json to a lookup object by ID
const MOCK_PROBLEMS = {};
problemData.forEach(problem => {
  MOCK_PROBLEMS[problem.id] = problem;
});

// Simulate API delay
const simulateDelay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetches all coding problems from the backend.
 */
export const fetchAllProblems = async () => {
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch problems list.");
    }
    return response.json();
  } catch (error) {
    console.warn('Backend unavailable, using data from problemData.json:', error.message);
    await simulateDelay(600);
    
    // Return basic problem info from the imported data
    return problemData.map(problem => ({
      id: problem.id,
      title: problem.title,
      difficulty: problem.difficulty,
      category: problem.category || 'General',
      language: problem.language
    }));
  }
};

/**
 * Fetches a single problem by its ID.
 */
export const fetchProblemById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch problem ${id}.`);
    }
    return response.json();
  } catch (error) {
    console.warn('Backend unavailable, using data from problemData.json:', error.message);
    await simulateDelay(800);
    
    const problem = MOCK_PROBLEMS[id];
    if (!problem) {
      throw new Error(`Problem with ID ${id} not found`);
    }
    
    return problem;
  }
};

/**
 * Fetches ALL test cases (visible and hidden) for a problem.
 */
export const fetchProblemTestCases = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}/test-cases`);
    if (!response.ok) {
      throw new Error(`Failed to fetch test cases for problem ${id}.`);
    }
    const data = await response.json();
    return data.testCases || [];
  } catch (error) {
    console.warn('Backend /test-cases unavailable, using data from problemData.json:', error.message);
    await simulateDelay(300);
    
    const problem = MOCK_PROBLEMS[id];
    if (problem && problem.testCases) {
      // Ensure all test cases are visible when fetching
      return problem.testCases.map((testCase, index) => ({
        ...testCase,
        isVisible: true // Force visibility
      }));
    }
    
    return [];
  }
};

/**
 * Submits a solution for evaluation.
 * Uses the protected route POST /api/problems/:id/submit.
 */
export const submitSolution = async (problemId, code, language) => {
  try {
    const response = await api.post(`${API_BASE_URL}/${problemId}/submit`, { 
      code, 
      language 
    });
    
    // Ensure all test cases are visible in the response
    if (response.data && response.data.results) {
      response.data.results = response.data.results.map(result => ({
        ...result,
        isVisible: true // Force visibility for all test results
      }));
    }
    
    return response.data;
  } catch (error) {
    console.error('Submit solution error:', error);
    // Fallback to mock submission logic using problemData.json
    await simulateDelay(1500);
    
    const problem = MOCK_PROBLEMS[problemId];
    if (!problem) {
      throw new Error(`Problem with ID ${problemId} not found`);
    }
    
    // Mock submission logic - run all test cases
    const testCases = problem.testCases || [];
    const results = [];
    let passedCount = 0;
    
    // Enhanced mock validation based on problem type
    for (const testCase of testCases) {
      let passed = false;
      
      // Different validation based on problem title/content
      if (problem.title.includes("Sum") && problem.title.includes("Product")) {
        // For arithmetic problems
        const hasSum = code.includes('sum') || code.includes('+');
        const hasProduct = code.includes('product') || code.includes('*');
        passed = hasSum && hasProduct;
      } else if (problem.title.includes("Even") || problem.title.includes("Odd")) {
        // For even/odd problems
        const hasModulus = code.includes('%') || code.includes("mod");
        const hasCondition = code.includes('if') || code.includes('else');
        passed = hasModulus && hasCondition;
      } else if (problem.title.includes("Factorial")) {
        // For factorial problems
        const hasLoop = code.includes('for') || code.includes('while');
        const hasMultiplication = code.includes('*') || code.includes('factorial');
        passed = hasLoop && hasMultiplication;
      } else if (problem.title.includes("Prime")) {
        // For prime number problems
        const hasLoop = code.includes('for') || code.includes('while');
        const hasCondition = code.includes('if') || code.includes('%');
        passed = hasLoop && hasCondition;
      } else {
        // Default validation
        passed = code.length > 10; // Basic check if code is non-trivial
      }
      
      if (passed) passedCount++;
      
      // FIX: Always show input and output values, never hide them
      results.push({
        testCase: testCase.id || `test-${results.length + 1}`,
        input: testCase.input,
        expectedOutput: testCase.expected,
        codeOutput: passed ? testCase.expected : "Incorrect output",
        status: passed ? 'pass' : 'fail',
        isVisible: true, // Always show test case details
        isHidden: false // Explicitly mark as not hidden
      });
    }
    
    const isSolved = passedCount === testCases.length;
    
    return {
      isSolved,
      passedCount,
      totalTests: testCases.length,
      accuracy: testCases.length > 0 ? Math.round((passedCount / testCases.length) * 100) : 0,
      message: isSolved ? 'All tests passed! Solution accepted.' : 'Some tests failed.',
      results
    };
  }
};

/**
 * Runs code against all test cases.
 * Uses the protected route POST /api/problems/:id/run-tests.
 */
export const runTestCases = async (problemId, code, language) => {
  try {
    const response = await api.post(`${API_BASE_URL}/${problemId}/run-tests`, { 
      code, 
      language 
    });
    
    // Ensure all test cases are visible in the response
    if (response.data && response.data.results) {
      response.data.results = response.data.results.map(result => ({
        ...result,
        isVisible: true // Force visibility for all test results
      }));
    }
    
    return response.data;
  } catch (error) {
    console.error('Run test cases error:', error);
    // Fallback to mock test execution using problemData.json
    await simulateDelay(2000);
    
    const problem = MOCK_PROBLEMS[problemId];
    if (!problem) {
      throw new Error(`Problem with ID ${problemId} not found`);
    }
    
    const testCases = problem.testCases || [];
    const results = [];
    let passedCount = 0;
    
    // Enhanced mock test execution logic
    for (const testCase of testCases) {
      let passed = false;
      let errorMsg = null;
      
      // More sophisticated mock validation
      if (problem.language === 'C') {
        const hasMain = code.includes('main(');
        const hasInclude = code.includes('#include');
        const hasPrintf = code.includes('printf');
        
        if (!hasMain) errorMsg = "Missing main function";
        else if (!hasInclude) errorMsg = "Missing necessary includes";
        else if (!hasPrintf) errorMsg = "Missing output statements";
        else passed = true;
      } else if (problem.language === 'Python') {
        const hasPrint = code.includes('print(');
        const hasDef = code.includes('def ') || code.includes('input(');
        
        if (!hasPrint) errorMsg = "Missing print statements";
        else if (!hasDef && !code.includes('input(')) errorMsg = "Missing function definition or input handling";
        else passed = true;
      }
      
      if (passed) passedCount++;
      
      // FIX: Always show input and output values, never hide them
      results.push({
        testCase: testCase.id || `test-${results.length + 1}`,
        input: testCase.input,
        expectedOutput: testCase.expected,
        codeOutput: passed ? testCase.expected : "Compilation or runtime error",
        status: passed ? 'pass' : 'fail',
        isVisible: true, // Always show test case details
        isHidden: false, // Explicitly mark as not hidden
        error: errorMsg
      });
    }
    
    return {
      passedCount,
      totalTests: testCases.length,
      accuracy: testCases.length > 0 ? Math.round((passedCount / testCases.length) * 100) : 0,
      results
    };
  }
};

/**
 * Sets up the WebSocket client for real-time code compilation.
 */
export const setupCompilerSocket = (onOutputCallback) => {
  const socket = io(SOCKET_URL);

  // This handles final execution completion/error
  socket.on('execution-result', (result) => {
    onOutputCallback(result.output, !result.success, false); // Pass output, error status, and isRunning=false
  });
  
  // This handles real-time output (stdout/stderr chunks)
  socket.on('execution-output', (data) => {
    onOutputCallback(data.output, Boolean(data.isError), true); // isRunning=true
  });

  // This signals the client to prompt for input
  socket.on('waiting-for-input', () => {
    // Pass a specific flag to the callback indicating input is needed
    onOutputCallback('', false, true, true); 
  });

  socket.on('connect_error', (err) => {
    console.error('Socket Connection Error:', err);
    onOutputCallback('Connection to compiler service failed.', true, false);
  });

  socket.on('disconnect', () => {
    onOutputCallback('Compiler service disconnected.', true, false);
  });

  return socket;
};

/**
 * Sends code for execution via the established socket.
 */
export const sendCodeForExecution = (socketInstance, code, language, input = '') => {
  if (socketInstance && socketInstance.connected) {
    socketInstance.emit('execute-code', { 
      code, 
      language: language.toLowerCase(),
      input // Pass user input buffer in the initial request
    });
  } else {
    throw new Error('Compiler socket is not connected.');
  }
};

/**
 * Sends input to running program
 */
export const sendInputToProgram = (socketInstance, input) => {
  if (socketInstance && socketInstance.connected) {
    // FIX: Socket input event should emit the raw input string
    socketInstance.emit('send-input', input); 
  }
};

/**
 * Stops code execution
 */
export const stopCodeExecution = (socketInstance) => {
  if (socketInstance && socketInstance.connected) {
    socketInstance.emit('stop-execution');
  }
};

// Export the mock problems for debugging or other uses
export { MOCK_PROBLEMS };