const User = require('../models/User');
const Rating = require('../models/Rating');

exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    
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
      console.log('No ratings found');
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

exports.checkRatingStatus = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }

    const existingRating = await Rating.findOne({ userId });
    if (existingRating) {
      return res.json({ 
        success: true,
        showRating: false,
        reason: 'already_rated'
      });
    }

    if (user.ratingShown) {
      return res.json({
        success: true,
        showRating: false,
        reason: 'already_shown'
      });
    }

    const oneHour = 60 * 60 * 1000; // 1 hour
    
    let accumulatedTime = user.accumulatedUsageTime || 0;

    if (user.usageStartTime) {
      const currentSessionTime = Date.now() - new Date(user.usageStartTime).getTime();
      accumulatedTime += currentSessionTime;
    }

    const showRating = accumulatedTime >= oneHour && !user.ratingShown;

    res.json({ 
      success: true,
      showRating,
      accumulatedTime,
      timeRequired: oneHour,
      timeRemaining: Math.max(0, oneHour - accumulatedTime)
    });
  } catch (err) {
    console.error('Check rating status error:', err.message);
    res.status(500).json({ success: false, msg: 'Server error while checking rating status' });
  }
};

exports.startUsageTracking = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }

    const existingRating = await Rating.findOne({ userId });
    if (existingRating || user.ratingShown) {
      return res.json({ success: true, tracking: false, reason: 'already_rated' });
    }

    if (!user.usageStartTime) {
      await User.findByIdAndUpdate(userId, {
        usageStartTime: new Date(),
        lastActivityTime: new Date()
      });
    } else {
      await User.findByIdAndUpdate(userId, {
        lastActivityTime: new Date()
      });
    }

    res.json({ success: true, tracking: true });
  } catch (err) {
    console.error('Start usage tracking error:', err.message);
    res.status(500).json({ success: false, msg: 'Server error while starting usage tracking' });
  }
};

exports.stopUsageTracking = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user || !user.usageStartTime) {
      return res.json({ success: true, tracking: false });
    }

    const sessionTime = Date.now() - new Date(user.usageStartTime).getTime();
    const newAccumulatedTime = (user.accumulatedUsageTime || 0) + sessionTime;

    await User.findByIdAndUpdate(userId, {
      accumulatedUsageTime: newAccumulatedTime,
      usageStartTime: null,
      lastActivityTime: new Date()
    });

    res.json({ success: true, sessionTime, accumulatedTime: newAccumulatedTime });
  } catch (err) {
    console.error('Stop usage tracking error:', err.message);
    res.status(500).json({ success: false, msg: 'Server error while stopping usage tracking' });
  }
};

exports.submitRating = async (req, res) => {
  const { rating, feedback } = req.body;
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
      feedback: feedback || '',
      timestamp: new Date()
    });

    await newRating.save();
    
    await User.findByIdAndUpdate(userId, {
      ratingShown: true,
      ratingEligible: false
    });

    res.json({ 
      success: true,
      msg: 'Thank you for your feedback!',
      rating,
      feedback: feedback || ''
    });
  } catch (err) {
    console.error('Submit rating error:', err.message);
    res.status(500).json({ success: false, msg: 'Server error while submitting rating' });
  }
};

exports.markRatingShown = async (req, res) => {
  const userId = req.user.id;

  try {
    await User.findByIdAndUpdate(userId, {
      ratingShown: true
    });

    res.json({ success: true, message: 'Rating marked as shown' });
  } catch (err) {
    console.error('Mark rating shown error:', err.message);
    res.status(500).json({ success: false, msg: 'Server error while marking rating as shown' });
  }
};