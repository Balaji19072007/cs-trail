// controllers/leaderboardController.js
const User = require('../models/User'); 

// @route   GET /api/leaderboard
// @desc    Get top users sorted by points
// @access  Public
exports.getGlobalLeaderboard = async (req, res) => {
    try {
        // 1. Fetch Users sorted by totalPoints
        // .select('-password') prevents sending the hashed password
        const topUsers = await User.find()
            .select('username firstName lastName totalPoints currentStreak')
            .sort({ totalPoints: -1 }) // Sort descending by points
            .limit(50); // Limit to top 50 users

        // 2. Format data for the front-end table
        const leaderboardData = topUsers.map(user => ({
            id: user._id,
            name: `${user.firstName} ${user.lastName}`, // Combine names
            username: user.username,
            // Mock solved count and accuracy since Progress tracking is complex (simplicity is key for now)
            solved: user.totalPoints > 0 ? Math.floor(user.totalPoints / 10) + 1 : 0, 
            accuracy: Math.floor(Math.random() * 10) + 80, 
            streak: user.currentStreak,
            points: user.totalPoints
        }));

        res.json(leaderboardData);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching leaderboard');
    }
};