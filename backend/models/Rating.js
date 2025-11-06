// models/Rating.js
const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

ratingSchema.index({ userId: 1 });
ratingSchema.index({ timestamp: 1 });

module.exports = mongoose.model('Rating', ratingSchema);