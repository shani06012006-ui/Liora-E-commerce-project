import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import GeneralSettings from '../../components/Settings/GeneralSettings';
import StoreSettings from '../../components/Settings/StoreSettings';
import ShippingSettings from '../../components/Settings/ShippingSettings';
import PaymentSettings from '../../components/Settings/PaymentSettings';
import NotificationSettings from '../../components/Settings/NotificationSettings';
import HomepageSettings from '../../components/Settings/HomepageSettings';
import SecuritySettings from '../../components/Settings/SecuritySettings';
import AdminProfileSettings from '../../components/Settings/AdminProfileSettings';
import { FiSettings, FiShoppingBag, FiTruck, FiCreditCard, FiBell, FiHome, FiShield, FiUser } from 'react-icons/fi';
import './AdminSettings.css';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: <FiSettings /> },
    { id: 'store', label: 'Store', icon: <FiShoppingBag /> },
    { id: 'shipping', label: 'Shipping', icon: <FiTruck /> },
    { id: 'payments', label: 'Payments', icon: <FiCreditCard /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell /> },
    { id: 'homepage', label: 'Homepage', icon: <FiHome /> },
    { id: 'security', label: 'Security', icon: <FiShield /> },
    { id: 'profile', label: 'Admin Profile', icon: <FiUser /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'general': return <GeneralSettings />;
      case 'store': return <StoreSettings />;
      case 'shipping': return <ShippingSettings />;
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