// frontend/src/components/Settings/NotificationSettings.jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  FiSave, FiRefreshCw, FiBell, FiMail, FiCheck, FiX,
  FiSend, FiUsers, FiShoppingBag, FiCreditCard, FiTruck,
  FiRefreshCw as FiRefreshCcw, FiSmile, FiAlertCircle
} from 'react-icons/fi';

const NotificationSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    email_notifications: {
      order_confirmation: true,
      order_shipped: true,
      order_delivered: true,
      order_cancelled: true,
      payment_received: true,
      refund_processed: true,
      welcome_email: true,
      newsletter: false,
      promotional: false,
    },
    push_notifications: {
      new_order: true,
      new_user: true,
      low_stock: true,
      review_submitted: true,
    },
    notification_email: 'admin@liora.com',
    admin_alert_email: 'alerts@liora.com',
    email_frequency: 'instant',
  });

  useEffect(() => {
    let cancelled = false;
    const fetchSettings = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        if (cancelled) return;
      } catch {
        if (!cancelled) toast.error('Failed to load notification settings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchSettings();
    return () => { cancelled = true; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      toast.success('🔔 Notification settings saved!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleEmail = (key) => {
    setSettings({
      ...settings,
      email_notifications: {
        ...settings.email_notifications,
        [key]: !settings.email_notifications[key]
      }
    });
  };

  const togglePush = (key) => {
    setSettings({
      ...settings,
      push_notifications: {
        ...settings.push_notifications,
        [key]: !settings.push_notifications[key]
      }
    });
  };

  const emailOptions = [
    { key: 'order_confirmation', label: 'Order Confirmation', icon: FiShoppingBag, color: 'blue' },
    { key: 'order_shipped', label: 'Order Shipped', icon: FiTruck, color: 'indigo' },
    { key: 'order_delivered', label: 'Order Delivered', icon: FiCheck, color: 'green' },
    { key: 'order_cancelled', label: 'Order Cancelled', icon: FiX, color: 'red' },
    { key: 'payment_received', label: 'Payment Received', icon: FiCreditCard, color: 'emerald' },
    { key: 'refund_processed', label: 'Refund Processed', icon: FiRefreshCcw, color: 'amber' },
    { key: 'welcome_email', label: 'Welcome Email', icon: FiSmile, color: 'purple' },
    { key: 'newsletter', label: 'Newsletter', icon: FiSend, color: 'pink' },
    { key: 'promotional', label: 'Promotional', icon: FiMail, color: 'orange' },
  ];

  const pushOptions = [
    { key: 'new_order', label: 'New Order', icon: FiShoppingBag, color: 'blue' },
    { key: 'new_user', label: 'New User', icon: FiUsers, color: 'green' },
    { key: 'low_stock', label: 'Low Stock Alert', icon: FiAlertCircle, color: 'red' },
    { key: 'review_submitted', label: 'Review Submitted', icon: FiMail, color: 'purple' },
  ];

  const getColorClass = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      amber: 'bg-amber-50 text-amber-600 border-amber-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      pink: 'bg-pink-50 text-pink-600 border-pink-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto"></div>
          <div className="mt-4 text-sm text-gray-500 font-medium">Loading notification settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-section animate-fadeIn">
      {/* Header - ✅ NO 'block' class */}
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <FiBell size={24} className="text-gray-700" />
            Notification Settings
          </h2>
          <p className="text-sm text-gray-500 mt-1">Configure email and push notification preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium text-sm hover:shadow-xl transition-all duration-300 flex items-center gap-3 disabled:opacity-70 whitespace-nowrap"
        >
          {saving ? (
            <>
              <FiRefreshCw className="animate-spin" size={18} />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <FiSave size={18} className="group-hover:scale-110 transition-transform" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-6">
        {/* Email Configuration */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
                <FiMail size={16} className="text-gray-400" />
                Notification Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                value={settings.notification_email}
                onChange={(e) => setSettings({ ...settings, notification_email: e.target.value })}
              />
            </div>
            <div>
              <label className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ">
                <FiAlertCircle size={16} className="text-gray-400" />
                Admin Alert Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                value={settings.admin_alert_email}
                onChange={(e) => setSettings({ ...settings, admin_alert_email: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Email Notifications */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
            <FiMail size={20} className="text-blue-600" />
            Email Notifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {emailOptions.map((option) => {
              const Icon = option.icon;
              const isEnabled = settings.email_notifications[option.key];
              const colorClass = getColorClass(option.color);
              
              return (
                <div
                  key={option.key}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                    isEnabled ? colorClass : 'bg-gray-50 border-gray-200'
                  }`}
                  onClick={() => toggleEmail(option.key)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${isEnabled ? 'bg-white/50' : 'bg-gray-200'}`}>
                      <Icon size={16} className={isEnabled ? 'text-current' : 'text-gray-400'} />
                    </div>
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                  <div className={`w-10 h-5 rounded-full transition-all duration-300 ${
                    isEnabled ? 'bg-current' : 'bg-gray-300'
                  } relative`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${
                      isEnabled ? 'right-0.5' : 'left-0.5'
                    }`}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Push Notifications */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
            <FiBell size={20} className="text-purple-600" />
            Push Notifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pushOptions.map((option) => {
              const Icon = option.icon;
              const isEnabled = settings.push_notifications[option.key];
              const colorClass = getColorClass(option.color);
              
              return (
                <div
                  key={option.key}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                    isEnabled ? colorClass : 'bg-gray-50 border-gray-200'
                  }`}
                  onClick={() => togglePush(option.key)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${isEnabled ? 'bg-white/50' : 'bg-gray-200'}`}>
                      <Icon size={16} className={isEnabled ? 'text-current' : 'text-gray-400'} />
                    </div>
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                  <div className={`w-10 h-5 rounded-full transition-all duration-300 ${
                    isEnabled ? 'bg-current' : 'bg-gray-300'
                  } relative`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${
                      isEnabled ? 'right-0.5' : 'left-0.5'
                    }`}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Email Frequency - ✅ NO 'block' class */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-800">Email Frequency</h4>
              <p className="text-xs text-gray-500">How often to send notification emails</p>
            </div>
            <select
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none w-full sm:w-auto"
              value={settings.email_frequency}
              onChange={(e) => setSettings({ ...settings, email_frequency: e.target.value })}
            >
              <option value="instant">⚡ Instant</option>
              <option value="hourly">🕐 Hourly</option>
              <option value="daily">📅 Daily</option>
              <option value="weekly">📆 Weekly</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;