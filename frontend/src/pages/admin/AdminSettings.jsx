import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import GeneralSettings from '../../components/Settings/GeneralSettings';
import StoreSettings from '../../components/Settings/StoreSettings';
import PaymentSettings from '../../components/Settings/PaymentSettings';
import NotificationSettings from '../../components/Settings/NotificationSettings';
import HomepageSettings from '../../components/Settings/HomepageSettings';
import SecuritySettings from '../../components/Settings/SecuritySettings';
import AdminProfileSettings from '../../components/Settings/AdminProfileSettings';
import ThemeSettings from '../../components/Settings/ThemeSettings';
import { FiSettings, FiShoppingBag, FiCreditCard, FiBell, FiHome, FiShield, FiUser, FiDroplet } from 'react-icons/fi';
 
// ============================================================
// Styles are embedded directly here (instead of an external
// AdminSettings.css import) so they can never fail to load due
// to a wrong file path, stale cache, or import resolution issue.
// If you'd rather keep this in a separate file, you can move the
// string below back into AdminSettings.css and re-add the import
// — just make sure the .css file sits in this exact folder.
// ============================================================
const SETTINGS_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');
 
/* ============================================================
   LIORA Settings — design tokens
   ink: sidebar / headings / primary buttons
   brass: the one accent — active states, focus rings, toggle-on
   canvas: page background, paper: card surfaces
   ============================================================ */
:root {
  --settings-ink: #14141a;
  --settings-paper: #ffffff;
  --settings-canvas: #f5f6f8;
  --settings-line: #e8e8ec;
  --settings-brass: #b08968;
  --settings-brass-light: #f4ece4;
  --settings-muted: #8a8d94;
  --settings-text: #1f2024;
  --settings-danger: #d94f4f;
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'Inter', -apple-system, sans-serif;
}
 
/* ============================================================
   PAGE LAYOUT
   ============================================================ */
.settings-page-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;
  align-items: start;
  font-family: var(--font-body);
  color: var(--settings-text);
}
 
@media (max-width: 900px) {
  .settings-page-layout { grid-template-columns: 1fr; }
}
 
/* ---- Left settings sub-nav ---- */
.settings-sidebar {
  background: var(--settings-paper);
  border: 1px solid var(--settings-line);
  border-radius: 14px;
  padding: 20px 14px;
  position: sticky;
  top: 24px;
}
 
.settings-sidebar-title {
  display: block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--settings-muted);
  padding: 0 10px 12px;
  text-transform: uppercase;
}
 
.settings-sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
 
.settings-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: 9px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  color: #55575e;
  text-align: left;
  cursor: pointer;
  position: relative;
  transition: background 0.18s ease, color 0.18s ease, padding-left 0.18s ease;
}
 
.settings-nav-item:hover {
  background: var(--settings-canvas);
  color: var(--settings-ink);
}
 
.settings-nav-item.active {
  background: var(--settings-brass-light);
  color: var(--settings-ink);
  font-weight: 600;
  padding-left: 16px;
}
 
.settings-nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  background: var(--settings-brass);
  border-radius: 0 3px 3px 0;
}
 
.settings-nav-icon {
  display: flex;
  align-items: center;
  font-size: 16px;
  color: inherit;
  flex-shrink: 0;
}
 
/* ---- Right content area ---- */
.settings-main {
  background: var(--settings-paper);
  border: 1px solid var(--settings-line);
  border-radius: 14px;
  padding: 32px 36px;
  min-width: 0;
}
 
@media (max-width: 640px) {
  .settings-main { padding: 22px 18px; }
}
 
/* ============================================================
   SECTION HEADER
   ============================================================ */
.settings-section {
  animation: settingsFadeIn 0.25s ease;
}
 
@keyframes settingsFadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
 
.section-title {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  color: var(--settings-ink);
  margin: 0 0 6px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--settings-ink);
  display: inline-block;
}
 
.section-subtitle {
  font-size: 13.5px;
  color: var(--settings-muted);
  margin: 10px 0 0;
}
 
/* ============================================================
   PRIMARY BUTTON
   ============================================================ */
.btn-primary {
  background: var(--settings-ink);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 11px 22px;
  font-family: var(--font-body);
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: 0.3px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 1px 2px rgba(0,0,0,0.08);
}
 
.btn-primary:hover:not(:disabled) {
  background: #2a2a33;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(20,20,26,0.18);
}
 
.btn-primary:active:not(:disabled) { transform: translateY(0); }
 
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
 
.btn-primary:focus-visible {
  outline: 2px solid var(--settings-brass);
  outline-offset: 2px;
}
 
/* ============================================================
   FORM ELEMENTS
   ============================================================ */
.settings-form { margin-top: 28px; }
 
.form-group { display: flex; flex-direction: column; gap: 7px; }
 
.form-label {
  font-size: 12.5px;
  font-weight: 600;
  color: #45474d;
  letter-spacing: 0.2px;
}
 
.form-input,
.form-select,
textarea.form-input {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--settings-text);
  background: var(--settings-canvas);
  border: 1.5px solid transparent;
  border-radius: 10px;
  padding: 11px 14px;
  width: 100%;
  transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
}
 
.form-input::placeholder { color: #a3a5ab; }
 
.form-input:hover,
.form-select:hover { background: #eef0f2; }
 
.form-input:focus,
.form-select:focus,
textarea.form-input:focus {
  outline: none;
  background: #fff;
  border-color: var(--settings-brass);
  box-shadow: 0 0 0 3px var(--settings-brass-light);
}
 
textarea.form-input { resize: vertical; min-height: 60px; }
 
.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238a8d94' stroke-width='2'%3e%3cpath d='M6 9l6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 36px;
  cursor: pointer;
}
 
/* ---- Sub-section inside a page (e.g. "Branding", "Store Features") ---- */
.form-section {
  margin-top: 34px;
  padding-top: 26px;
  border-top: 1px solid var(--settings-line);
}
 
.form-section-title {
  font-family: var(--font-body);
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: var(--settings-muted);
  margin: 0 0 18px;
}
 
/* ============================================================
   TOGGLE SWITCHES
   ============================================================ */
.toggle-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  background: var(--settings-canvas);
  border-radius: 12px;
  transition: background 0.15s ease;
}
 
.toggle-group:hover { background: #eef0f2; }
 
.toggle-label { display: flex; flex-direction: column; gap: 3px; }
 
.toggle-label > span:first-child {
  font-size: 14px;
  font-weight: 600;
  color: var(--settings-text);
}
 
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 42px;
  height: 24px;
  flex-shrink: 0;
}
 
.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
 
.toggle-slider {
  position: absolute;
  inset: 0;
  background: #d5d6da;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s ease;
}
 
.toggle-slider::before {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  left: 3px;
  top: 3px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0,0,0,0.25);
  transition: transform 0.2s ease;
}
 
.toggle-switch input:checked + .toggle-slider {
  background: var(--settings-ink);
}
 
.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(18px);
  background: var(--settings-brass);
}
 
.toggle-switch input:focus-visible + .toggle-slider {
  outline: 2px solid var(--settings-brass);
  outline-offset: 2px;
}
 
/* ============================================================
   LOGO / IMAGE UPLOAD BLOCKS
   ============================================================ */
.logo-upload-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}
 
.logo-preview-box {
  width: 100%;
  height: 96px;
  border-radius: 12px;
  background: var(--settings-ink);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}
 
.logo-preview-img { width: 100%; height: 100%; object-fit: cover; }
 
.logo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
 
.logo-placeholder-text {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #fff;
}
 
.logo-placeholder-sub {
  font-size: 8px;
  letter-spacing: 1.5px;
  color: #9ca3af;
}
 
.upload-area { width: 100%; }
 
.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
  padding: 18px 12px;
  border: 1.5px dashed #d5d6da;
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}
 
.upload-label:hover {
  border-color: var(--settings-brass);
  background: var(--settings-brass-light);
}
 
.upload-icon { font-size: 18px; }
 
.upload-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--settings-text);
}
 
.upload-hint {
  font-size: 11px;
  color: var(--settings-muted);
}
 
.file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  overflow: hidden;
}
 
/* ============================================================
   MOTION PREFERENCES
   ============================================================ */
/* ============================================================
   PAYMENT GATEWAY ROWS (PaymentSettings)
   ============================================================ */
.payment-method {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  background: var(--settings-canvas);
  border-radius: 12px;
  margin-bottom: 10px;
  transition: background 0.15s ease;
}
 
.payment-method:hover { background: #eef0f2; }
 
.method-info {
  display: flex;
  align-items: center;
  gap: 14px;
}
 
.method-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--settings-ink);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
 
.method-name {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--settings-text);
}
 
/* ============================================================
   HOMEPAGE SECTION ROWS (HomepageSettings)
   ============================================================ */
.homepage-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 13px 16px;
  background: var(--settings-canvas);
  border-radius: 12px;
  transition: background 0.15s ease;
}
 
.homepage-section:hover { background: #eef0f2; }
 
.section-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
 
.section-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--settings-text);
}
 
/* ============================================================
   CHECKBOXES (SecuritySettings password requirements)
   ============================================================ */
.checkbox-group { display: flex; align-items: center; }
 
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--settings-text);
  cursor: pointer;
}
 
.checkbox-label input[type='checkbox'] {
  width: 17px;
  height: 17px;
  accent-color: var(--settings-ink);
  cursor: pointer;
}
 
/* ============================================================
   LOGIN HISTORY (SecuritySettings)
   ============================================================ */
.login-history {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
 
.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 13px 16px;
  border-radius: 10px;
  transition: background 0.15s ease;
}
 
.history-item:hover { background: var(--settings-canvas); }
 
.history-device {
  font-size: 14px;
  font-weight: 600;
  color: var(--settings-text);
}
 
.history-time {
  font-size: 12.5px;
  color: var(--settings-muted);
  white-space: nowrap;
}
 
.profile-container {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}
 
@media (max-width: 720px) {
  .profile-container { flex-direction: column; align-items: center; }
}
 
.profile-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  width: 160px;
}
 
.profile-avatar {
  position: relative;
  width: 96px;
  height: 96px;
}
 
.avatar-circle {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: var(--settings-ink);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
 
.avatar-text {
  font-family: var(--font-display);
  font-size: 34px;
  font-weight: 700;
}
 
.avatar-upload-btn {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--settings-brass);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 3px solid var(--settings-paper);
  transition: background 0.15s ease, transform 0.15s ease;
}
 
.avatar-upload-btn:hover {
  background: #9c7554;
  transform: scale(1.06);
}
 
.profile-name-display {
  text-align: center;
}
 
.profile-name-display h3 {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 700;
  color: var(--settings-ink);
  margin: 0 0 6px;
}
 
.role-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--settings-brass);
  background: var(--settings-brass-light);
  padding: 4px 10px;
  border-radius: 999px;
}
 
.profile-form { flex: 1; min-width: 0; }
 
.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}
 
.input-with-icon .input-icon {
  position: absolute;
  left: 14px;
  color: var(--settings-muted);
  pointer-events: none;
}
 
.input-with-icon .form-input {
  padding-left: 42px;
}
 
/* ============================================================
   CRUD CONTROLS (add / edit / delete rows — used across
   Payment Gateways, Featured Categories, Login History, Security Qs)
   ============================================================ */
.crud-add-row {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}
 
.crud-add-row .form-input { flex: 1; }
 
.crud-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--settings-ink);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
  white-space: nowrap;
}
 
.crud-add-btn:hover { background: #2a2a33; }
.crud-add-btn:disabled { opacity: 0.5; cursor: not-allowed; }
 
.crud-row-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
 
.crud-icon-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--settings-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
 
.crud-icon-btn:hover { background: rgba(0,0,0,0.06); color: var(--settings-ink); }
 
.crud-icon-btn.danger:hover { background: #fdeceb; color: var(--settings-danger); }
 
.crud-edit-input {
  flex: 1;
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--settings-text);
  background: #fff;
  border: 1.5px solid var(--settings-brass);
  border-radius: 8px;
  padding: 7px 10px;
}
 
.crud-empty {
  text-align: center;
  padding: 24px 12px;
  color: var(--settings-muted);
  font-size: 13.5px;
  background: var(--settings-canvas);
  border-radius: 12px;
}
 
@media (prefers-reduced-motion: reduce) {
  .settings-section,
  .btn-primary,
  .form-input,
  .toggle-slider,
  .toggle-slider::before,
  .upload-label,
  .settings-nav-item,
  .payment-method,
  .homepage-section,
  .history-item,
  .avatar-upload-btn,
  .crud-add-btn,
  .crud-icon-btn {
    animation: none !important;
    transition: none !important;
  }
}
`;
 
const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
 
  const tabs = [
    { id: 'general', label: 'General', icon: <FiSettings /> },
    { id: 'theme', label: 'Theme', icon: <FiDroplet /> },
    { id: 'store', label: 'Store', icon: <FiShoppingBag /> },
    { id: 'payments', label: 'Payments', icon: <FiCreditCard /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell /> },
    { id: 'homepage', label: 'Homepage', icon: <FiHome /> },
    { id: 'security', label: 'Security', icon: <FiShield /> },
    { id: 'profile', label: 'Admin Profile', icon: <FiUser /> },
  ];
 
  const renderContent = () => {
    switch (activeTab) {
      case 'general': return <GeneralSettings />;
      case 'theme': return <ThemeSettings />;
      case 'store': return <StoreSettings />;
      case 'payments': return <PaymentSettings />;
      case 'notifications': return <NotificationSettings />;
      case 'homepage': return <HomepageSettings />;
      case 'security': return <SecuritySettings />;
      case 'profile': return <AdminProfileSettings />;
      default: return <GeneralSettings />;
    }
  };
 
  return (
    <AdminLayout title="Settings">
      <style>{SETTINGS_STYLES}</style>
      <div className="settings-page-layout">
        <div className="settings-sidebar">
          <span className="settings-sidebar-title">SETTINGS</span>
          <div className="settings-sidebar-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="settings-nav-icon">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
 
        <div className="settings-main">
          {renderContent()}
        </div>
      </div>
    </AdminLayout>
  );
};
 
export default AdminSettings;