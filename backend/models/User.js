const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the User Schema
const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    // --- Leaderboard Fields ---
    totalPoints: {
        type: Number,
        default: 0
    },
    currentStreak: {
        type: Number,
        default: 0
    },
    problemsSolved: {
        type: Number,
        default: 0
    },
    averageAccuracy: { // Added for leaderboard display
        type: Number,
        default: 0, // Stored as a percentage (0-100)
    },
    // --- End Leaderboard Fields ---

    photoUrl: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    googleId: {
        type: String,
        sparse: true
    }
    // Removed: score (redundant with totalPoints)
    // Removed: rank (should be calculated, not stored)
}, {
    timestamps: true // This automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('User', UserSchema);