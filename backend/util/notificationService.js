// backend/util/notificationService.js
const Notification = require('../models/Notification');

class NotificationService {
  /**
   * Send notification to a single user
   */
  static async sendNotification(userId, notificationData) {
    try {
      const notification = new Notification({
        userId,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type || 'system',
        link: notificationData.link || '',
        important: notificationData.important || false,
        data: notificationData.data || {}
      });

      await notification.save();

      // Emit real-time event via Socket.IO if needed
      // this.emitRealTimeNotification(userId, notification);

      console.log(`📢 Notification sent to user ${userId}: ${notificationData.title}`);
      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Send notification to multiple users
   */
  static async sendBulkNotifications(userIds, notificationData) {
    try {
      const notifications = userIds.map(userId => ({
        userId,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type || 'system',
        link: notificationData.link || '',
        important: notificationData.important || false,
        data: notificationData.data || {}
      }));

      const result = await Notification.insertMany(notifications);
      
      console.log(`📢 Bulk notifications sent to ${userIds.length} users: ${notificationData.title}`);
      return result;
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      throw error;
    }
  }

  /**
   * Send notification to all users (for admin announcements)
   */
  static async sendToAllUsers(notificationData) {
    try {
      // In a real implementation, you'd fetch all user IDs from the database
      // For now, this is a placeholder that would be called from admin routes
      console.log(`📢 Admin notification to all users: ${notificationData.title}`);
      
      return {
        success: true,
        message: 'Notification scheduled for all users',
        data: notificationData
      };
    } catch (error) {
      console.error('Error sending notification to all users:', error);
      throw error;
    }
  }

  // ==================== SPECIFIC NOTIFICATION TYPES ====================

  /**
   * Course completion notification
   */
  static async sendCourseCompletion(userId, courseName, courseId) {
    return this.sendNotification(userId, {
      title: 'Course Completed! 🎉',
      message: `Congratulations! You've successfully completed "${courseName}"`,
      type: 'course',
      link: `/courses/${courseId}`,
      important: true,
      data: { courseName, courseId }
    });
  }

  /**
   * Progress milestone notification
   */
  static async sendProgressMilestone(userId, milestone, points) {
    return this.sendNotification(userId, {
      title: 'Progress Milestone! ⭐',
      message: `Amazing! You've reached ${milestone} and earned ${points} points!`,
      type: 'progress',
      link: '/my-progress',
      data: { milestone, points }
    });
  }

  /**
   * New challenge available notification
   */
  static async sendNewChallenge(userId, challengeName, challengeId) {
    return this.sendNotification(userId, {
      title: 'New Challenge Available! 🚀',
      message: `A new challenge "${challengeName}" is waiting for you!`,
      type: 'challenge',
      link: `/problems/${challengeId}`,
      data: { challengeName, challengeId }
    });
  }

  /**
   * Achievement unlocked notification
   */
  static async sendAchievementUnlocked(userId, achievementName, description) {
    return this.sendNotification(userId, {
      title: 'Achievement Unlocked! 🏆',
      message: `You unlocked "${achievementName}": ${description}`,
      type: 'achievement',
      link: '/my-progress',
      important: true,
      data: { achievementName, description }
    });
  }

  /**
   * Problem solved notification
   */
  static async sendProblemSolved(userId, problemName, difficulty, points) {
    return this.sendNotification(userId, {
      title: 'Problem Solved! ✅',
      message: `Great job! You solved "${problemName}" (${difficulty}) and earned ${points} points`,
      type: 'progress',
      link: '/problems',
      data: { problemName, difficulty, points }
    });
  }

  /**
   * Streak milestone notification
   */
  static async sendStreakMilestone(userId, streakDays) {
    return this.sendNotification(userId, {
      title: 'Streak Milestone! 🔥',
      message: `You're on fire! ${streakDays}-day coding streak! Keep it up!`,
      type: 'progress',
      link: '/my-progress',
      data: { streakDays }
    });
  }

  /**
   * System announcement
   */
  static async sendSystemAnnouncement(userId, title, message, link = '') {
    return this.sendNotification(userId, {
      title: `System: ${title}`,
      message: message,
      type: 'system',
      link: link,
      important: true
    });
  }

  /**
   * Community interaction notification
   */
  static async sendCommunityNotification(userId, interactionType, userName, postId) {
    const messages = {
      'like': 'liked your post',
      'comment': 'commented on your post',
      'follow': 'started following you',
      'mention': 'mentioned you in a post'
    };

    return this.sendNotification(userId, {
      title: 'Community Update 👥',
      message: `${userName} ${messages[interactionType] || 'interacted with your content'}`,
      type: 'community',
      link: `/community/post/${postId}`,
      data: { interactionType, userName, postId }
    });
  }
}

module.exports = NotificationService;