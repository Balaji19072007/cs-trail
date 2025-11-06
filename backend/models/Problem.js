const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the structure for a single test case
const ExampleSchema = new Schema({
    input: {
        type: String,
        required: true
    },
    output: {
        type: String,
        required: true
    },
    explanation: {
        type: String
    }
}, { _id: false }); // Don't create a separate ID for subdocuments

// Define the Problem Schema
const ProblemSchema = new Schema({
    // Matches the ID in problemData.json
    problemId: {
        type: Number,
        required: true,
        unique: true,
        alias: 'id'
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    language: {
        type: String, // e.g., 'C', 'Python', 'Java'
        required: true
    },
    difficulty: {
        type: String, // e.g., 'Easy', 'Medium', 'Hard'
        required: true
    },
    problemStatement: {
        type: String,
        required: true
    },
    inputFormat: String,
    outputFormat: String,
    // Store examples directly in the problem document
    examples: [ExampleSchema],
    // Store the solution code/explanation (used for teaching/evaluation)
    solution: {
        explanation: String,
        code: String 
    }
    // In a full app, you'd add:
    // testCases: [{ input: String, expectedOutput: String }], 
    // initialCodeSnippet: String
});

module.exports = mongoose.model('Problem', ProblemSchema);