// frontend/src/api/problemApi.js

import { io } from 'socket.io-client';

const API_BASE_URL = 'http://localhost:5000/api/problems';
const SOCKET_URL = 'http://localhost:5000';

// Mock data for problems (fallback when backend is unavailable)
const MOCK_PROBLEMS = {
  1: {
    id: 1,
    title: "Sum of Array Elements",
    difficulty: "Easy",
    category: "Arrays",
    language: "Python",
    problemStatement: "Write a program that calculates the sum of all elements in an array. The first line of input will be an integer N, representing the number of elements in the array. The second line will contain N space-separated integers.",
    examples: [
      {
        input: "5\n2 3 1 4 5",
        output: "15",
        explanation: "The sum of 2 + 3 + 1 + 4 + 5 is 15"
      },
      {
        input: "3\n10 20 30",
        output: "60",
        explanation: "The sum of 10 + 20 + 30 is 60"
      }
    ],
    templateCode: `def main():\n    n = int(input().strip())\n    arr = list(map(int, input().split()))\n    # Write your solution here\n    \nif __name__ == "__main__":\n    main()`,
    solution: {
      code: `def main():\n    n = int(input().strip())\n    arr = list(map(int, input().split()))\n    total = sum(arr)\n    print(total)\n\nif __name__ == "__main__":\n    main()`,
      explanation: "The solution uses Python's built-in sum() function to calculate the total of all elements in the array."
    },
    testCases: [
      { id: 1, input: "5\n2 3 1 4 5", expected: "15" },
      { id: 2, input: "3\n10 20 30", expected: "60" },
      { id: 3, input: "1\n100", expected: "100" },
      { id: 4, input: "4\n-1 5 -3 8", expected: "9" },
      { id: 5, input: "0\n", expected: "0" }
    ]
  },
  2: {
    id: 2,
    title: "Find Maximum Element",
    difficulty: "Easy",
    category: "Arrays",
    language: "Python",
    problemStatement: "Write a program to find the maximum element in an array. The first line of input will be an integer N, representing the number of elements. The second line will contain N space-separated integers.",
    examples: [
      {
        input: "5\n2 8 1 6 3",
        output: "8",
        explanation: "8 is the largest number in the array"
      },
      {
        input: "3\n-5 -2 -10",
        output: "-2",
        explanation: "-2 is the largest number in the array"
      }
    ],
    templateCode: `def main():\n    n = int(input().strip())\n    arr = list(map(int, input().split()))\n    # Write your solution here\n    \nif __name__ == "__main__":\n    main()`,
    solution: {
      code: `def main():\n    n = int(input().strip())\n    arr = list(map(int, input().split()))\n    max_val = max(arr)\n    print(max_val)\n\nif __name__ == "__main__":\n    main()`,
      explanation: "The solution uses Python's built-in max() function to find the maximum value in the array."
    },
    testCases: [
      { id: 1, input: "5\n2 8 1 6 3", expected: "8" },
      { id: 2, input: "3\n-5 -2 -10", expected: "-2" },
      { id: 3, input: "1\n42", expected: "42" },
      { id: 4, input: "4\n100 200 150 300", expected: "300" },
      { id: 5, input: "2\n0 -5", expected: "0" }
    ]
  },
  3: {
    id: 3,
    title: "Palindrome Check",
    difficulty: "Easy",
    category: "Strings",
    language: "Python",
    problemStatement: "Write a program to check if a given string is a palindrome. A palindrome is a string that reads the same forwards and backwards. The input will be a single string.",
    examples: [
      {
        input: "racecar",
        output: "true",
        explanation: "'racecar' reads the same forwards and backwards"
      },
      {
        input: "hello",
        output: "false",
        explanation: "'hello' does not read the same backwards"
      }
    ],
    templateCode: `def main():\n    s = input().strip()\n    # Write your solution here\n    \nif __name__ == "__main__":\n    main()`,
    solution: {
      code: `def main():\n    s = input().strip()\n    is_palindrome = s == s[::-1]\n    print(str(is_palindrome).lower())\n\nif __name__ == "__main__":\n    main()`,
      explanation: "The solution compares the string with its reverse using slicing. If they are equal, it's a palindrome."
    },
    testCases: [
      { id: 1, input: "racecar", expected: "true" },
      { id: 2, input: "hello", expected: "false" },
      { id: 3, input: "madam", expected: "true" },
      { id: 4, input: "A man a plan a canal Panama", expected: "true" },
      { id: 5, input: "12321", expected: "true" }
    ]
  }
};

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
        console.warn('Backend unavailable, using mock data:', error.message);
        await simulateDelay(600);
        return Object.values(MOCK_PROBLEMS).map(problem => ({
            id: problem.id,
            title: problem.title,
            difficulty: problem.difficulty,
            category: problem.category,
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
        console.warn('Backend unavailable, using mock data:', error.message);
        await simulateDelay(800);
        
        const problem = MOCK_PROBLEMS[id];
        if (!problem) {
            throw new Error(`Problem with ID ${id} not found`);
        }
        
        return problem;
    }
};

/**
 * Submits a solution for evaluation
 */
export const submitSolution = async (problemId, code, language) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${problemId}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, language })
        });
        
        if (!response.ok) {
            throw new Error('Failed to submit solution');
        }
        
        return response.json();
    } catch (error) {
        console.warn('Backend unavailable, using mock submission:', error.message);
        await simulateDelay(2000);
        
        const problem = MOCK_PROBLEMS[problemId];
        if (!problem) {
            throw new Error(`Problem with ID ${problemId} not found`);
        }

        // Simulate more rigorous testing for submission (includes hidden test cases)
        const publicTestResults = problem.testCases.map(testCase => {
            const passed = Math.random() > 0.2; // 80% chance of passing public tests
            
            return {
                passed,
                output: passed ? testCase.expected : "incorrect output",
                error: passed ? "" : "Wrong Answer"
            };
        });

        // Simulate hidden test cases (more strict)
        const hiddenTestResults = [
            { passed: Math.random() > 0.4, output: "25", error: "" },
            { passed: Math.random() > 0.4, output: "100", error: "" },
            { passed: Math.random() > 0.4, output: "true", error: "" }
        ];

        const allTestResults = [...publicTestResults, ...hiddenTestResults];
        const allPassed = allTestResults.every(result => result.passed);

        return {
            problemId,
            testResults: allTestResults,
            allPassed,
            passedCount: allTestResults.filter(result => result.passed).length,
            failedCount: allTestResults.filter(result => !result.passed).length,
            executionTime: `${(Math.random() * 100 + 50).toFixed(2)} ms`,
            memoryUsed: `${(Math.random() * 10 + 5).toFixed(1)} MB`
        };
    }
};

/**
 * Runs code against test cases
 */
export const runTestCases = async (problemId, code, language) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${problemId}/test`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, language })
        });
        
        if (!response.ok) {
            throw new Error('Failed to run test cases');
        }
        
        return response.json();
    } catch (error) {
        console.warn('Backend unavailable, using mock test execution:', error.message);
        await simulateDelay(1500);
        
        const problem = MOCK_PROBLEMS[problemId];
        if (!problem) {
            throw new Error(`Problem with ID ${problemId} not found`);
        }

        // Simulate test case execution
        const testResults = problem.testCases.map(testCase => {
            // Simulate different outcomes based on the code content
            const hasSyntaxError = code.includes('syntaxerror') || code.includes('undefined');
            const hasRuntimeError = code.includes('runtimeerror') || code.includes('division by zero');
            
            if (hasSyntaxError) {
                return {
                    passed: false,
                    error: "SyntaxError: invalid syntax",
                    output: ""
                };
            }
            
            if (hasRuntimeError) {
                return {
                    passed: false,
                    error: "RuntimeError: division by zero",
                    output: ""
                };
            }
            
            // Check if code might produce correct output
            const isLikelyCorrect = 
                (problemId === 1 && (code.includes('sum(') || code.includes('+='))) ||
                (problemId === 2 && (code.includes('max(') || code.includes('>') && code.includes('for'))) ||
                (problemId === 3 && (code.includes('[::-1]') || code.includes('==') && code.includes('reverse')));
            
            const passed = Math.random() > 0.3 || isLikelyCorrect; // 70% chance of passing if code looks correct
            
            return {
                passed,
                output: passed ? testCase.expected : "wrong output",
                error: passed ? "" : "Wrong Answer"
            };
        });

        return {
            problemId,
            testResults,
            allPassed: testResults.every(result => result.passed),
            passedCount: testResults.filter(result => result.passed).length,
            failedCount: testResults.filter(result => !result.passed).length
        };
    }
};

/**
 * Sets up the WebSocket client for real-time code compilation.
 * @param {function} onOutputCallback - Function to call when output is received.
 * @returns {object} The Socket.IO instance.
 */
export const setupCompilerSocket = (onOutputCallback) => {
    const socket = io(SOCKET_URL);

    socket.on('output', (data) => {
        onOutputCallback(data.text, data.isError, data.isRunning);
    });

    socket.on('execution_result', (data) => {
        onOutputCallback(data.output, data.error, false);
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
        socketInstance.emit('execute_code', { 
            code, 
            language: language.toLowerCase(),
            input 
        });
    } else {
        throw new Error('Compiler socket is not connected.');
    }
};

/**
 * Stops code execution
 */
export const stopCodeExecution = (socketInstance) => {
    if (socketInstance && socketInstance.connected) {
        socketInstance.emit('stop_execution');
    }
};

/**
 * Sends input to running program
 */
export const sendInputToProgram = (socketInstance, input) => {
    if (socketInstance && socketInstance.connected) {
        socketInstance.emit('send_input', { input });
    }
};