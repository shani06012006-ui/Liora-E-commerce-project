import { useState } from 'react';
import toast from 'react-hot-toast';

const PaymentSettings = () => {
  const [formData, setFormData] = useState({
    razorpayEnabled: true,
    stripeEnabled: false,
    codEnabled: true,
    refundDays: 7,
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
    toast.success('Payment settings saved successfully!');
  };

  return (
    <div className="settings-section">
      <h2 className="section-title">Payment Settings</h2>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="payment-methods">
          <div className="payment-method">
            <div className="method-info">
              <span className="method-icon">💳</span>
              <span className="method-name">Razorpay</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                name="razorpayEnabled"
                checked={formData.razorpayEnabled}
                onChange={handleChange}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="payment-method">
            <div className="method-info">
              <span className="method-icon">💳</span>
              <span className="method-name">Stripe</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                name="stripeEnabled"
                checked={formData.stripeEnabled}
                onChange={handleChange}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="payment-method">
            <div className="method-info">
              <span className="method-icon">💵</span>
              <span className="method-name">Cash on Delivery</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                name="codEnabled"
                checked={formData.codEnabled}
                onChange={handleChange}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Refund Days</label>
          <div className="input-with-suffix">
            <input
              type="number"
              name="refundDays"
              value={formData.refundDays}
              onChange={handleChange}
              className="form-input"
              min="1"
              max="30"
            />
            <span className="input-suffix">Days</span>
          </div>
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

export default PaymentSettings;