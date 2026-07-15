import { useState } from 'react';
import { FiShield, FiKey, FiLogOut, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SecuritySettings = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    toast.success('Password changed successfully');
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
  };

  const handleTwoFactorToggle = () => {
    setFormData(prev => ({
      ...prev,
      twoFactorEnabled: !prev.twoFactorEnabled
    }));
    toast.success(`Two-factor authentication ${!formData.twoFactorEnabled ? 'enabled' : 'disabled'}`);
  };

  const handleLogoutAll = () => {
    toast.success('Logged out from all devices');
  };

  const handleViewHistory = () => {
    toast.success('Login history loaded');
  };

  return (
    <div className="settings-section">
      <h2 className="section-title">Security Settings</h2>

      <div className="security-grid">
        {/* Change Password */}
        <div className="security-card">
          <div className="security-card-header">
            <FiKey size={20} className="security-icon" />
            <h3>Change Password</h3>
          </div>
          <form onSubmit={handlePasswordChange} className="security-form">
            <div className="form-group">
              <input
                type="password"
                name="currentPassword"
                placeholder="Current Password"
                value={formData.currentPassword}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={formData.newPassword}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm New Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <button type="submit" className="btn-secondary">
              Update Password
            </button>
          </form>
        </div>

        {/* Two Factor Authentication */}
        <div className="security-card">
          <div className="security-card-header">
            <FiShield size={20} className="security-icon" />
            <h3>Two Factor Authentication</h3>
          </div>
          <div className="security-setting">
            <div className="setting-info">
              <span className="setting-label">Enabled</span>
              <span className={`setting-status ${formData.twoFactorEnabled ? 'active' : 'inactive'}`}>
                {formData.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={formData.twoFactorEnabled}
                onChange={handleTwoFactorToggle}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Logout From All Devices */}
        <div className="security-card">
          <div className="security-card-header">
            <FiLogOut size={20} className="security-icon" />
            <h3>Logout From All Devices</h3>
          </div>
          <p className="security-description">This will sign you out from all active sessions</p>
          <button className="btn-danger" onClick={handleLogoutAll}>
            Logout All Devices
          </button>
        </div>

        {/* Login History */}
        <div className="security-card">
          <div className="security-card-header">
            <FiClock size={20} className="security-icon" />
            <h3>Login History</h3>
          </div>
          <div className="login-history">
            <div className="history-item">
              <span className="history-device">Chrome - Windows</span>
              <span className="history-time">Today, 2:30 PM</span>
            </div>
            <div className="history-item">
              <span className="history-device">Safari - iPhone</span>
              <span className="history-time">Yesterday, 10:15 AM</span>
            </div>
            <div className="history-item">
              <span className="history-device">Firefox - Mac</span>
              <span className="history-time">2 days ago, 8:45 PM</span>
            </div>
            <button className="btn-secondary" onClick={handleViewHistory}>
              View All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;