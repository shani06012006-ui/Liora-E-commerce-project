import { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiCamera } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminProfileSettings = () => {
  const [formData, setFormData] = useState({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@liora.com',
    phone: '+91 98765 43210',
    role: 'Super Admin',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Profile updated successfully!');
  };

  return (
    <div className="settings-section">
      <h2 className="section-title">Admin Profile</h2>
      <p className="section-subtitle">Manage your administrator profile information</p>

      <div className="profile-container">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            <div className="avatar-circle">
              <span className="avatar-text">AU</span>
            </div>
            <button className="avatar-upload-btn">
              <FiCamera size={16} />
            </button>
          </div>
          <div className="profile-name-display">
            <h3>{formData.firstName} {formData.lastName}</h3>
            <span className="role-badge">{formData.role}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <div className="input-with-icon">
                <FiUser size={18} className="input-icon" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Last Name</label>
              <div className="input-with-icon">
                <FiUser size={18} className="input-icon" />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <FiMail size={18} className="input-icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div className="input-with-icon">
              <FiPhone size={18} className="input-icon" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-select"
            >
              <option value="Super Admin">Super Admin</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Editor">Editor</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfileSettings;