import { useState } from 'react';
import toast from 'react-hot-toast';

const StoreSettings = () => {
  const [formData, setFormData] = useState({
    currency: 'INR',
    language: 'English',
    timezone: 'Asia/Kolkata',
    productsPerPage: 20,
    maintenanceMode: false,
    gstRate: 18,
    applyTax: true,
    invoicePrefix: 'LIORA-',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Store settings saved successfully!');
  };

  return (
    <div className="settings-section">
      <h2 className="section-title">Store Settings</h2>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Currency</label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="form-select"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Language</label>
            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="form-select"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Tamil">Tamil</option>
              <option value="Kannada">Kannada</option>
              <option value="Malayalam">Malayalam</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Timezone</label>
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              className="form-select"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (UTC+5:30)</option>
              <option value="Asia/Dubai">Asia/Dubai (UTC+4)</option>
              <option value="America/New_York">America/New_York (UTC-5)</option>
              <option value="Europe/London">Europe/London (UTC+0)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Products Per Page</label>
            <input
              type="number"
              name="productsPerPage"
              value={formData.productsPerPage}
              onChange={handleChange}
              className="form-input"
              min="10"
              max="100"
            />
          </div>
        </div>

        <div className="form-group">
          <div className="toggle-group">
            <label className="toggle-label">
              <span>Maintenance Mode</span>
              <span className={`toggle-status ${formData.maintenanceMode ? 'active' : 'inactive'}`}>
                {formData.maintenanceMode ? 'Under Maintenance' : 'Website is live'}
              </span>
            </label>
            <label className="toggle-switch">
              <input
                type="checkbox"
                name="maintenanceMode"
                checked={formData.maintenanceMode}
                onChange={handleChange}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Tax Settings</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">GST (%)</label>
              <input
                type="number"
                name="gstRate"
                value={formData.gstRate}
                onChange={handleChange}
                className="form-input"
                min="0"
                max="100"
              />
            </div>

            <div className="form-group">
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="applyTax"
                    checked={formData.applyTax}
                    onChange={handleChange}
                  />
                  <span>Apply Tax</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Invoice Prefix</label>
          <input
            type="text"
            name="invoicePrefix"
            value={formData.invoicePrefix}
            onChange={handleChange}
            className="form-input"
            placeholder="INV-"
          />
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

export default StoreSettings;