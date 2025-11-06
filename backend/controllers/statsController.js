// controllers/statsController.js
const User = require('../models/User');
const Rating = require('../models/Rating');

exports.getUserStats = async (req, res) => {
  try {
    console.log('📊 Fetching user stats...');
    
    // Get total user count
    const totalUsers = await User.countDocuments();
    console.log('Total users found:', totalUsers);
    
    // Get average satisfaction rating
    let ratingStats = [];
    try {
      ratingStats = await Rating.aggregate([
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalRatings: { $sum: 1 }
          }
        }
      ]);
    } catch (ratingError) {
      console.log('No ratings found:', ratingError.message);
    }

    let satisfactionRate = 96;
    
    if (ratingStats.length > 0 && ratingStats[0].totalRatings > 0) {
      satisfactionRate = Math.round((ratingStats[0].averageRating / 5) * 100);
    }

    res.json({
      totalUsers,
      satisfactionRate,
      totalRatings: ratingStats[0]?.totalRatings || 0
    });
  } catch (err) {
    console.error('Get user stats error:', err.message);
    res.status(500).json({ 
      msg: 'Server error while fetching stats',
      error: err.message 
    });
  }
};

exports.submitRating = async (req, res) => {
  const { rating } = req.body;
  const userId = req.user.id;

  try {
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ msg: 'Rating must be between 1 and 5' });
    }

    const existingRating = await Rating.findOne({ userId });
    if (existingRating) {
      return res.status(400).json({ msg: 'You have already rated our application' });
    }

    const newRating = new Rating({
      userId,
      rating,
      timestamp: new Date()
    });

    await newRating.save();
    console.log('New rating saved:', { userId, rating });

    res.json({ 
      msg: 'Thank you for your feedback!',
      rating 
    });
  } catch (err) {
    console.error('Submit rating error:', err.message);
    res.status(500).json({ msg: 'Server error while submitting rating' });
  }
};

exports.checkRatingEligibility = async (req, res) => {
  const userId = req.user.id;

  try {
    const existingRating = await Rating.findOne({ userId });
    if (existingRating) {
      return res.json({ eligible: false, reason: 'already_rated' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const accountCreationTime = user.createdAt || user.dateCreated;
    const accountAge = Date.now() - accountCreationTime.getTime();
    const twoHours = 2 * 60 * 60 * 1000;

    const eligible = accountAge >= twoHours;

    res.json({ 
      eligible,
      accountCreated: accountCreationTime,
      timeUntilEligible: eligible ? 0 : twoHours - accountAge
    });
  } catch (err) {
    console.error('Check rating eligibility error:', err.message);
    res.status(500).json({ msg: 'Server error while checking rating eligibility' });
  }
};