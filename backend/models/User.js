// models/User.js
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
    averageAccuracy: {
        type: Number,
        default: 0
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
    },
    
    // --- RATING TRACKING FIELDS ---
    ratingEligible: {
        type: Boolean,
        default: false
    },
    ratingShown: {
        type: Boolean,
        default: false
    },
    usageStartTime: {
        type: Date,
        default: null
    },
    accumulatedUsageTime: {
        type: Number, // in milliseconds
        default: 0
    },
    lastActivityTime: {
        type: Date,
        default: null
    }
    // --- END RATING TRACKING FIELDS ---
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);