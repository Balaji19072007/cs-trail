// backend/routes/leaderboardRoutes.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * @route GET /api/leaderboard
 * @desc Fetches and ranks users based on points and solved problems.
 * @access Public (or protected if you require login)
 */
router.get('/', async (req, res) => {
    try {
        // 1. Fetch users: Sort by totalPoints (desc), then problemsSolved (desc), then currentStreak (desc)
        // We select only the necessary fields for the leaderboard display.
        const topUsers = await User.find()
            .sort({ totalPoints: -1, problemsSolved: -1, currentStreak: -1 })
            .limit(50) // Limit to top 50 users
            .select('firstName lastName username totalPoints problemsSolved averageAccuracy currentStreak photoUrl');

        // 2. Map and Rank the data
        const leaderboardData = topUsers.map((user, index) => {
            // Calculate initials for the avatar display
            const name = `${user.firstName} ${user.lastName}`;
            const parts = name.trim().split(/\s+/);
            const initials = parts.map(n => n[0]).join('').toUpperCase().substring(0, 2);

            return {
                rank: index + 1,
                name: name,
                initials: initials,
                username: user.username,
                solved: user.problemsSolved,
                accuracy: Math.floor(user.averageAccuracy), // Assuming averageAccuracy is stored as 0-100
                streak: user.currentStreak,
                points: user.totalPoints,
                photoUrl: user.photoUrl,
                // isCurrentUser status must be checked on the frontend
            };
        });

        // 3. Send the response
        res.json(leaderboardData);

    } catch (error) {
        console.error('❌ Leaderboard Fetch Error:', error.message);
        res.status(500).json({ success: false, msg: 'Error retrieving leaderboard data.' });
    }
});

module.exports = router;