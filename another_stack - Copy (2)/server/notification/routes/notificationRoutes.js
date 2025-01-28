const express = require('express');
const { getUnreadNotifications, markNotificationAsRead, createNotification } = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();


router.post('/create', authMiddleware, createNotification);
router.get('/unread', authMiddleware, getUnreadNotifications);
router.patch('/:notificationId/read', authMiddleware, markNotificationAsRead);


module.exports = router;
