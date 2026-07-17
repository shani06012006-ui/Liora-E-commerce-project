// frontend/src/context/NotificationProvider.jsx
import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { DEMO_NOTIFICATIONS } from '../utils/demoNotifications';
import { NotificationContext } from './NotificationContext';

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await adminAPI.getNotifications();
      const data = res.data || [];

      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);

      setNotifications(DEMO_NOTIFICATIONS);
      setUnreadCount(
        DEMO_NOTIFICATIONS.filter((n) => !n.read).length
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = async (id) => {
    try {
      await adminAPI.markNotificationRead(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );

    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    try {
      await adminAPI.markAllNotificationsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }

    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        read: true,
      }))
    );

    setUnreadCount(0);
    toast.success('All notifications marked as read');
  };

  const clearAll = async () => {
    if (
      !window.confirm(
        'Are you sure you want to clear all notifications?'
      )
    )
      return;

    try {
      for (const notification of notifications) {
        await adminAPI.deleteNotification(notification.id);
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }

    setNotifications([]);
    setUnreadCount(0);
    toast.success('All notifications cleared');
  };

  const deleteNotification = async (id) => {
    try {
      await adminAPI.deleteNotification(id);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }

    setNotifications((prev) =>
      prev.filter((n) => n.id !== id)
    );

    toast.success('Notification deleted');
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      read: false,
      created_at: new Date().toISOString(),
      ...notification,
    };

    setNotifications((prev) => [
      newNotification,
      ...prev,
    ]);

    setUnreadCount((prev) => prev + 1);
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    showDropdown,
    setShowDropdown,
    markAsRead,
    markAllAsRead,
    clearAll,
    deleteNotification,
    addNotification,
    fetchNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};