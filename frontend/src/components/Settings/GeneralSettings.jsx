import { useState } from 'react';
import { FiKey, FiShield, FiLogOut, FiClock, FiArrowRight, FiInstagram, FiFacebook, FiYoutube } from 'react-icons/fi';
import toast from 'react-hot-toast';

const GeneralSettings = () => {
  const [store, setStore] = useState({
    storeName: 'LIORA',
    supportEmail: 'support@liora.com',
    storeAddress: '123, Fashion Street, Coimbatore,\nTamil Nadu, India - 641001',
    phoneNumber: '+91 98765 43210',
    aboutStore: 'LIORA is a premium girls fashion brand offering timeless style, elegance and quality in every piece. Our collections are designed to make every girl feel confident and beautiful.',
  });
  const [logoPreview, setLogoPreview] = useState(null);

  const [storeSettings, setStoreSettings] = useState({
    currency: 'INR', language: 'English', timezone: 'Asia/Kolkata',
    productsPerPage: 20, maintenanceMode: false,
  });
  const [shipping, setShipping] = useState({
    freeShipping: 999, shippingCharge: 79, estimatedDelivery: '3 - 5 Days',
    codEnabled: true, deliveryAreas: ['Tamil Nadu', 'Kerala', 'Karnataka'],
  });
  const [payments, setPayments] = useState({
    razorpay: true, stripe: true, cod: true, refundDays: 7,
  });
  const [notifications, setNotifications] = useState({
    newOrder: true, orderCancelled: true, lowStockAlert: true,
    newUserRegistered: true, newReview: true, newCouponUsed: true,
  });
  
  const handleStoreChange = (e) => {
    const { name, value } = e.target;
    setStore((p) => ({ ...p, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error('File size must be less than 2MB');
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSaveAll = (e) => {
    e.preventDefault();
    toast.success('Store settings saved successfully!');
  };

  return (
    <div className="settings-section">
      <div className="dashboard-header">
        <div>
          <h2 className="section-title">General Settings</h2>
          <p className="section-subtitle">Manage your store basic information</p>
        </div>
        <button className="btn-primary" onClick={handleSaveAll}>Save Changes</button>
      </div>

      {/* Top info row */}
      <div className="dashboard-top-grid">
        <div className="dashboard-col">
          <div className="form-group">
            <label className="form-label">Store Name</label>
            <input className="form-input" name="storeName" value={store.storeName} onChange={handleStoreChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Support Email</label>
            <input className="form-input" name="supportEmail" value={store.supportEmail} onChange={handleStoreChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Store Address</label>
            <textarea className="form-input" rows={3} name="storeAddress" value={store.storeAddress} onChange={handleStoreChange} />
          </div>
        </div>

        <div className="dashboard-col">
          <div className="form-group">
            <label className="form-label">Store Logo</label>
            <div className="logo-preview-box">
              {logoPreview ? (
                <img src={logoPreview} alt="Store Logo" className="logo-preview-img" />
              ) : (
                <div className="logo-placeholder">
                  <span className="logo-placeholder-text">LIORA</span>
                  <span className="logo-placeholder-sub">AESTHETIC FASHION</span>
                </div>
              )}
            </div>
            <input type="file" id="logo-upload" className="file-input" accept="image/png,image/jpeg" onChange={handleLogoChange} />
            <label htmlFor="logo-upload" className="btn-secondary logo-upload-btn">Upload Logo</label>
            <span className="form-hint">PNG, JPG up to 2MB</span>
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-input" name="phoneNumber" value={store.phoneNumber} onChange={handleStoreChange} />
          </div>
        </div>

        <div className="dashboard-col">
          <div className="form-group">
            <label className="form-label">About Store</label>
            <textarea className="form-input" rows={5} name="aboutStore" value={store.aboutStore} onChange={handleStoreChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Social Links</label>
            <div className="social-links-row">
              <span className="social-icon-btn"><FiInstagram /></span>
              <span className="social-icon-btn"><FiFacebook /></span>
              <span className="social-icon-btn">P</span>
              <span className="social-icon-btn">T</span>
              <span className="social-icon-btn"><FiYoutube /></span>
            </div>
          </div>
        </div>
      </div>

      {/* Promo + Store + Shipping + Payment */}
      <div className="dashboard-grid dashboard-grid-4">

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <span className="dashboard-card-icon">🛍️</span>
            <h3>Store Settings</h3>
          </div>
          <div className="mini-field-row"><span>Currency</span>
            <select className="form-select mini" value={storeSettings.currency} onChange={(e) => setStoreSettings(p => ({ ...p, currency: e.target.value }))}>
              <option value="INR">₹ INR</option><option value="USD">$ USD</option>
            </select></div>
          <div className="mini-field-row"><span>Language</span>
            <select className="form-select mini" value={storeSettings.language} onChange={(e) => setStoreSettings(p => ({ ...p, language: e.target.value }))}>
              <option>English</option><option>Hindi</option><option>Tamil</option>
            </select></div>
          <div className="mini-field-row"><span>Timezone</span>
            <select className="form-select mini" value={storeSettings.timezone} onChange={(e) => setStoreSettings(p => ({ ...p, timezone: e.target.value }))}>
              <option value="Asia/Kolkata">Asia/Kolkata</option>
            </select></div>
          <div className="mini-field-row"><span>Products Per Page</span>
            <input type="number" className="form-input mini" value={storeSettings.productsPerPage} onChange={(e) => setStoreSettings(p => ({ ...p, productsPerPage: e.target.value }))} /></div>
          <div className="mini-field-row"><span>Maintenance Mode</span>
            <label className="toggle-switch small">
              <input type="checkbox" checked={storeSettings.maintenanceMode} onChange={() => setStoreSettings(p => ({ ...p, maintenanceMode: !p.maintenanceMode }))} />
              <span className="toggle-slider"></span>
            </label></div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header"><span className="dashboard-card-icon">🚚</span><h3>Shipping Settings</h3></div>
          <div className="mini-field-row"><span>Free Shipping</span><input className="form-input mini" value={shipping.freeShipping} onChange={(e) => setShipping(p => ({ ...p, freeShipping: e.target.value }))} /></div>
          <div className="mini-field-row"><span>Shipping Charge</span><input className="form-input mini" value={shipping.shippingCharge} onChange={(e) => setShipping(p => ({ ...p, shippingCharge: e.target.value }))} /></div>
          <div className="mini-field-row"><span>Estimated Delivery</span><input className="form-input mini" value={shipping.estimatedDelivery} onChange={(e) => setShipping(p => ({ ...p, estimatedDelivery: e.target.value }))} /></div>
          <div className="mini-field-row"><span>COD</span>
            <label className="toggle-switch small">
              <input type="checkbox" checked={shipping.codEnabled} onChange={() => setShipping(p => ({ ...p, codEnabled: !p.codEnabled }))} />
              <span className="toggle-slider"></span>
            </label></div>
          <div className="mini-field-row"><span>Delivery Areas</span>
            <div className="chip-list">{shipping.deliveryAreas.map(a => <span key={a} className="chip">{a} ×</span>)}</div></div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header"><span className="dashboard-card-icon">💳</span><h3>Payment Settings</h3></div>
          <div className="mini-field-row"><span>Razorpay</span>
            <label className="toggle-switch small"><input type="checkbox" checked={payments.razorpay} onChange={() => setPayments(p => ({ ...p, razorpay: !p.razorpay }))} /><span className="toggle-slider"></span></label></div>
          <div className="mini-field-row"><span>Stripe</span>
            <label className="toggle-switch small"><input type="checkbox" checked={payments.stripe} onChange={() => setPayments(p => ({ ...p, stripe: !p.stripe }))} /><span className="toggle-slider"></span></label></div>
          <div className="mini-field-row"><span>Cash on Delivery</span>
            <label className="toggle-switch small"><input type="checkbox" checked={payments.cod} onChange={() => setPayments(p => ({ ...p, cod: !p.cod }))} /><span className="toggle-slider"></span></label></div>
          <div className="mini-field-row"><span>Refund Days</span><input className="form-input mini" value={payments.refundDays} onChange={(e) => setPayments(p => ({ ...p, refundDays: e.target.value }))} /></div>
        </div>
      </div>

      {/* Tax + Notification + Homepage */}
      <div className="dashboard-grid dashboard-grid-3">


        <div className="dashboard-card">
          <div className="dashboard-card-header"><span className="dashboard-card-icon">🔔</span><h3>Notification Settings</h3></div>
          {Object.entries(notifications).map(([key, val]) => (
            <div className="mini-checkbox-row" key={key}>
              <input type="checkbox" checked={val} onChange={() => setNotifications(p => ({ ...p, [key]: !p[key] }))} />
              <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
            </div>
          ))}
        </div>

      </div>

      {/* Security bar */}
      <div className="security-bar">
        <div className="security-bar-item">
          <FiShield className="security-icon" />
          <div>
            <strong>Security Settings</strong>
            <div className="security-bar-sub"><FiKey size={12} /> Change Password ........ <FiArrowRight size={14} /></div>
          </div>
        </div>
        <div className="security-bar-item">
          <span>Two Factor Authentication</span>
          <span className="setting-status active">Enabled</span>
          <FiArrowRight size={14} />
        </div>
        <div className="security-bar-item">
          <FiLogOut size={16} /><span>Logout From All Devices</span><FiArrowRight size={14} />
        </div>
        <div className="security-bar-item">
          <FiClock size={16} /><span>Login History</span><FiArrowRight size={14} />
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;