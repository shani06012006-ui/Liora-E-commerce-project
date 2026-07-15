import { useState } from 'react';
import toast from 'react-hot-toast';

const ShippingSettings = () => {
  const [formData, setFormData] = useState({
    freeShipping: 999,
    shippingCharge: 79,
    estimatedDelivery: '3 - 5 Days',
    codEnabled: false,
    deliveryAreas: 'Tamil Nadu, Kerala, Karnataka',
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
    toast.success('Shipping settings saved successfully!');
  };

  return (
    <div className="settings-section">
      <h2 className="section-title">Shipping Settings</h2>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Free Shipping</label>
            <div className="input-with-symbol">
              <span className="input-symbol">₹</span>
              <input
                type="number"
                name="freeShipping"
                value={formData.freeShipping}
                onChange={handleChange}
                className="form-input"
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Shipping Charge</label>
            <div className="input-with-symbol">
              <span className="input-symbol">₹</span>
              <input
                type="number"
                name="shippingCharge"
                value={formData.shippingCharge}
                onChange={handleChange}
                className="form-input"
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Estimated Delivery</label>
          <input
            type="text"
            name="estimatedDelivery"
            value={formData.estimatedDelivery}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g., 3 - 5 Days"
          />
        </div>

        <div className="form-group">
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="codEnabled"
                checked={formData.codEnabled}
                onChange={handleChange}
              />
              <span>Cash on Delivery (COD)</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Delivery Areas</label>
          <input
            type="text"
            name="deliveryAreas"
            value={formData.deliveryAreas}
            onChange={handleChange}
            className="form-input"
            placeholder="Comma separated states/cities"
          />
          <span className="form-hint">Comma separated list of delivery areas</span>
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

export default ShippingSettings;