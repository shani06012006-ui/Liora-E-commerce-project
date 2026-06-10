import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { BellIcon,  CheckCircleIcon, TruckIcon, ShoppingBagIcon,  HeartIcon,  TagIcon,  UserIcon,  CreditCardIcon,  XMarkIcon,  EyeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Notifications = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('notifications');
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    const savedNotifications = localStorage.getItem('user_notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    } else {
      generateDemoNotifications();
    }
    setLoading(false);
  };

  const generateDemoNotifications = () => {
    const demoNotifications = [
      {
        id: 1,
        type: 'order',
        title: 'Order Confirmed',
        message: 'Your order #ORD-123456 has been confirmed and will be processed soon.',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        iconName: 'CheckCircleIcon',
        iconColor: 'text-gray-700',
        bgColor: 'bg-gray-100',
        actionLink: '/orders'
      },
      {
        id: 2,
        type: 'order',
        title: 'Order Shipped',
        message: 'Your order #ORD-123455 has been shipped and is on the way!',
        time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        read: false,
        iconName: 'TruckIcon',
        iconColor: 'text-gray-700',
        bgColor: 'bg-gray-100',
        actionLink: '/orders'
      },
      {
        id: 3,
        type: 'order',
        title: 'Order Delivered',
        message: 'Your order #ORD-123454 has been delivered successfully. Thank you for shopping with Liora!',
        time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        iconName: 'ShoppingBagIcon',
        iconColor: 'text-gray-500',
        bgColor: 'bg-gray-50',
        actionLink: '/orders'
      },
      {
        id: 4,
        type: 'wishlist',
        title: 'Back in Stock',
        message: 'The "Floral Summer Dress" in your wishlist is back in stock!',
        time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        read: false,
        iconName: 'HeartIcon',
        iconColor: 'text-gray-700',
        bgColor: 'bg-gray-100',
        actionLink: '/wishlist'
      },
      {
        id: 5,
        type: 'offer',
        title: 'Price Drop Alert',
        message: 'The "Silk Saree" in your wishlist is now 20% OFF!',
        time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        read: false,
        iconName: 'TagIcon',
        iconColor: 'text-gray-700',
        bgColor: 'bg-gray-100',
        actionLink: '/wishlist'
      },
      {
        id: 6,
        type: 'account',
        title: 'Profile Updated',
        message: 'Your profile information was successfully updated.',
        time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        iconName: 'UserIcon',
        iconColor: 'text-gray-500',
        bgColor: 'bg-gray-50',
        actionLink: '/profile'
      },
      {
        id: 7,
        type: 'payment',
        title: 'Payment Successful',
        message: 'Your payment of ₹2,499 for order #ORD-123456 was successful.',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        iconName: 'CreditCardIcon',
        iconColor: 'text-gray-700',
        bgColor: 'bg-gray-100',
        actionLink: '/orders'
      }
    ];
    
    setNotifications(demoNotifications);
    localStorage.setItem('user_notifications', JSON.stringify(demoNotifications));
  };

  const getIconComponent = (iconName) => {
    switch(iconName) {
      case 'CheckCircleIcon': return CheckCircleIcon;
      case 'TruckIcon': return TruckIcon;
      case 'ShoppingBagIcon': return ShoppingBagIcon;
      case 'HeartIcon': return HeartIcon;
      case 'TagIcon': return TagIcon;
      case 'UserIcon': return UserIcon;
      case 'CreditCardIcon': return CreditCardIcon;
      default: return BellIcon;
    }
  };

  const markAsRead = (id) => {
    const updatedNotifications = notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('user_notifications', JSON.stringify(updatedNotifications));
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
    setNotifications(updatedNotifications);
    localStorage.setItem('user_notifications', JSON.stringify(updatedNotifications));
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (id) => {
    const updatedNotifications = notifications.filter(notif => notif.id !== id);
    setNotifications(updatedNotifications);
    localStorage.setItem('user_notifications', JSON.stringify(updatedNotifications));
    toast.success('Notification removed');
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.setItem('user_notifications', JSON.stringify([]));
    toast.success('All notifications cleared');
  };

  const getFilteredNotifications = () => {
    if (filter === 'all') return notifications;
    return notifications.filter(n => n.type === filter);
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const filters = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'order', label: 'Orders', count: notifications.filter(n => n.type === 'order').length },
    { id: 'offer', label: 'Offers', count: notifications.filter(n => n.type === 'offer').length },
    { id: 'wishlist', label: 'Wishlist', count: notifications.filter(n => n.type === 'wishlist').length },
    { id: 'account', label: 'Account', count: notifications.filter(n => n.type === 'account').length },
    { id: 'payment', label: 'Payment', count: notifications.filter(n => n.type === 'payment').length },
  ];

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = getUnreadCount();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto" />
          <p className="text-gray-500 mt-4 text-sm">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-6 flex-col md:flex-row">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          

          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <BellIcon className="w-6 h-6 text-gray-900" />
                      <h1 className="text-2xl font-serif text-gray-900">Notifications</h1>
                      {unreadCount > 0 && (
                        <span className="bg-gray-900 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount} new</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Stay updated with your orders and offers</p>
                  </div>
                  <div className="flex gap-2">
                    {notifications.length > 0 && (
                      <>
                        <button
                          onClick={markAllAsRead}
                          className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 transition border border-gray-300 rounded-lg"
                        >
                          Mark all read
                        </button>
                        <button
                          onClick={clearAll}
                          className="px-3 py-1.5 text-xs text-gray-600 hover:text-red-500 transition border border-gray-300 rounded-lg"
                        >
                          Clear all
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

    
              <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
                <div className="flex flex-wrap gap-2">
                  {filters.map((filterItem) => (
                    <button
                      key={filterItem.id}
                      onClick={() => setFilter(filterItem.id)}
                      className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                        filter === filterItem.id
                          ? 'bg-gray-900 text-white shadow-sm'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <span>{filterItem.label}</span>
                      {filterItem.count > 0 && (
                        <span className={`ml-1 text-xs ${filter === filterItem.id ? 'text-white/70' : 'text-gray-400'}`}>
                          ({filterItem.count})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications List */}
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="p-12 text-center">
                    <BellIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No notifications yet</p>
                    <p className="text-sm text-gray-400 mt-1">When you have notifications, they'll appear here</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => {
                    const IconComponent = getIconComponent(notification.iconName);
                    const timeAgo = formatTime(notification.time);
                    
                    return (
                      <div
                        key={notification.id}
                        className={`p-5 hover:bg-gray-50 transition group ${!notification.read ? 'bg-gray-50' : ''}`}
                      >
                        <div className="flex gap-4">
                  
                          <div className={`${notification.bgColor} w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`}>
                            <IconComponent className={`w-5 h-5 ${notification.iconColor}`} />
                          </div>
                          
             
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                  {notification.title}
                                </h3>
                                <p className="text-gray-500 text-sm mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-2">{timeAgo}</p>
                              </div>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                {!notification.read && (
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    className="text-gray-400 hover:text-gray-700 transition"
                                    title="Mark as read"
                                  >
                                    <EyeIcon className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteNotification(notification.id)}
                                  className="text-gray-400 hover:text-red-500 transition"
                                  title="Delete"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                         
                            {notification.actionLink && (
                              <Link
                                to={notification.actionLink}
                                className="inline-block mt-2 text-xs text-gray-600 hover:text-gray-900 font-medium"
                                onClick={() => markAsRead(notification.id)}
                              >
                                View Details →
                              </Link>
                            )}
                          </div>
                          
                       
                          {!notification.read && (
                            <div className="w-2 h-2 bg-gray-900 rounded-full mt-2 flex-shrink-0"></div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

          
              {notifications.length > 0 && (
                <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-center">
                  <p className="text-xs text-gray-400">
                    {unreadCount} unread • {notifications.length} total notifications
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;