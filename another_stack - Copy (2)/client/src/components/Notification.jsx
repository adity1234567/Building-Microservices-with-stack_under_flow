import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Notification = ({ onNotificationClick }) => {
  const [notifications, setNotifications] = useState([]);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  const checkForNewNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/notifications/unread', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Assuming token is stored in localStorage
        },
      });

      // Debugging the response to check the data structure
      console.log("API Response:", response.data);

      // Check if the response data contains notifications and is an array
      if (Array.isArray(response.data.notifications)) {
        setNotifications(response.data.notifications);

        // Sort notifications by createdAt if necessary
        const unreadNotifications = response.data.notifications.filter(notification => !notification.read);
        if (unreadNotifications.length > 0) {
          setHasNewNotification(true);
        } else {
          setHasNewNotification(false);
        }
      } else {
        console.error("Received data is not an array:", response.data);
        setHasNewNotification(false);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    // Check for notifications every 10 seconds
    const intervalId = setInterval(checkForNewNotifications, 10000);

    return () => {
      clearInterval(intervalId); // Clean up interval on component unmount
    };
  }, []);

  const handleClick = () => {
    setHasNewNotification(false); // Clear notification indicator
    onNotificationClick(); // Call the handler to show notifications
  };

  return (
    <button onClick={handleClick} className="notification-button">
      Notification {hasNewNotification && <span className="dot">•</span>}
    </button>
  );
};

export default Notification;
