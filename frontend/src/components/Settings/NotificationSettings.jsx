import { useState } from 'react';
import toast from 'react-hot-toast';

const NotificationSettings = () => {
  const [notifications, setNotifications] = useState({
    newOrder: true,
    orderCancelled: false,
    lowStockAlert: true,
    newUserRegistered: false,
    newReview: true,
    newCouponUsed: false,
  });

  const handleToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Notification settings saved successfully!');
  };

  const notificationItems = [
    { key: 'newOrder', label: 'New Order' },
    { key: 'orderCancelled', label: 'Order Cancelled' },
    { key: 'lowStockAlert', label: 'Low Stock Alert' },
    { key: 'newUserRegistered', label: 'New User Registered' },
    { key: 'newReview', label: 'New Review' },
    { key: 'newCouponUsed', label: 'New Coupon Used' },
  ];

  return (
    <div className="settings-section">
      <h2 className="section-title">Notification Settings</h2>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="notification-list">
          {notificationItems.map((item) => (
            <div key={item.key} className="notification-item">
              <span className="notification-label">{item.label}</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications[item.key]}
                  onChange={() => handleToggle(item.key)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotificationSettings;