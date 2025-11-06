const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProgressSchema = new Schema({
    // Link to the User model
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Link to the Problem model via its custom problemId (Number)
    problemId: {
        type: Number,
        ref: 'Problem', // Reference Problem model
        required: true
    },
    status: {
        type: String,
        enum: ['todo', 'attempted', 'solved'],
        default: 'todo'
    },
    // Track the best score achieved
    bestAccuracy: {
        type: Number, // Percentage of test cases passed (0-100)
        default: 0
    },
    lastSubmission: {
        type: Date,
        default: Date.now
    }
}, { 
    // Ensure that a user can only have one progress entry per problem
    timestamps: true,
    index: { unique: true, fields: ['userId', 'problemId'] } 
});

module.exports = mongoose.model('Progress', ProgressSchema);