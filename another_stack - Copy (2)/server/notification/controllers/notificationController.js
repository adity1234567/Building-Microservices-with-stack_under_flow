const Notification = require('../models/Notification');
const axios = require('axios');
exports.createNotification = async (req, res) => {
  try {
    const { notifications } = req.body;

    if (!Array.isArray(notifications) || notifications.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input: notifications must be a non-empty array',
      });
    }

    // Filter out invalid entries (missing userId or postId)
    const validNotifications = notifications
      .filter(({ userId, postId }) => userId && postId)
      .map(({ userId, postId, read }) => ({
        userId,
        postId,
        read: read || false,
      }));

    if (validNotifications.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid notifications to create',
      });
    }

    // Bulk insert valid notifications
    console.log('Bulk Notification Data:', validNotifications);
    const createdNotifications = await Notification.insertMany(validNotifications);

    return res.status(201).json({
      success: true,
      count: createdNotifications.length,
      notifications: createdNotifications,
    });
  } catch (error) {
    console.error("Error creating notifications:", error);
    return res.status(500).json({
      success: false,
      error: 'Server error creating notifications',
      details: error.message,
    });
  }
};


exports.getUnreadNotifications = async (req, res) => {
  console.log("Get Unread Notifications");
  const token = req.header('Authorization')?.split(' ')[1];
  try {
    if (!req.userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
    }

    // Get basic notification data
    const notifications = await Notification.find({ 
      userId: req.userId, 
      read: false 
    });

    // Fetch post and author details for each notification
    const notificationsWithDetails = await Promise.all(
      notifications.map(async (notification) => {
        try {
          // Get post details from the post service
          const postResponse = await axios.get(
            `http://localhost:8000/api/posts/${notification.postId}`,{
              headers: { Authorization: `Bearer ${token}` }
            }
          );

        //  console.log("Total Post Response for notifications:",postResponse.length );
          const postData = postResponse.data;
          
          return {
            _id: notification._id,
            userId: notification.userId,
            postId: notification.postId,
            read: notification.read,
            createdAt: notification.createdAt,
            post: {
              _id: postData._id,
              title: postData.title,
              author: postData.author
            }
          };
        } catch (error) {
          console.error(`Error fetching details for notification ${notification._id}:`, error);
          // Return notification with placeholder data if fetch fails
          return {
            _id: notification._id,
            userId: notification.userId,
            postId: notification.postId,
            read: notification.read,
            createdAt: notification.createdAt,
            post: {
              title: 'Post not available',
              author: { username: 'Unknown' }
            }
          };
        }
      })
    );

    return res.json({
      success: true,
      count: notificationsWithDetails.length,
      notifications: notificationsWithDetails
    });
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error fetching notifications',
      details: error.message 
    });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    if (!notificationId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Notification ID is required' 
      });
    }

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        error: 'Notification not found' 
      });
    }

    return res.json({
      success: true,
      notification
    });
    console.log("ok")
    } catch (error) {
    console.error("Error marking notification as read:", error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error marking notification as read',
      details: error.message 
    });
  }
};