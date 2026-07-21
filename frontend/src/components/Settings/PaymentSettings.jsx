// frontend/src/components/Settings/PaymentSettings.jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiSave, FiRefreshCw, FiCreditCard, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
 
const PaymentSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    payment_gateways: [
      { id: 'stripe', name: 'Stripe', enabled: true, config: { api_key: 'pk_test_***', secret_key: 'sk_test_***' } },
      { id: 'paypal', name: 'PayPal', enabled: true, config: { client_id: '***', secret: '***' } },
      { id: 'razorpay', name: 'Razorpay', enabled: false, config: { key_id: '***', key_secret: '***' } },
    ],
    default_gateway: 'stripe',
    currency_code: 'INR',
    currency_symbol: '₹',
    tax_rate: 0.0,
    tax_included: false,
  });
 
  // ---- CRUD UI state ----
  const [newGatewayName, setNewGatewayName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
 
  useEffect(() => {
    let cancelled = false;
 
    const fetchSettings = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (cancelled) return;
      } catch {
        if (!cancelled) toast.error('Failed to load payment settings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
 
    fetchSettings();
 
    return () => {
      cancelled = true;
    };
  }, []);
 
  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Payment settings saved successfully!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };
 
  const toggleGateway = (id) => {
    setSettings({
      ...settings,
      payment_gateways: settings.payment_gateways.map(g =>
        g.id === id ? { ...g, enabled: !g.enabled } : g
      )
    });
  };
 
  // ---- CRUD: Add a new gateway ----
  const handleAddGateway = () => {
    const name = newGatewayName.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || `gateway_${Date.now()}`;
    if (settings.payment_gateways.some((g) => g.id === id)) {
      toast.error('A gateway with that name already exists');
      return;
    }
    setSettings({
      ...settings,
      payment_gateways: [
        ...settings.payment_gateways,
        { id, name, enabled: false, config: {} },
      ],
    });
    setNewGatewayName('');
    toast.success(`${name} added`);
  };
 
  // ---- CRUD: Rename a gateway ----
  const startEditing = (gateway) => {
    setEditingId(gateway.id);
    setEditingName(gateway.name);
  };
 
  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };
 
  const saveEditing = (id) => {
    const name = editingName.trim();
    if (!name) {
      cancelEditing();
      return;
    }
    setSettings({
      ...settings,
      payment_gateways: settings.payment_gateways.map((g) =>
        g.id === id ? { ...g, name } : g
      ),
    });
    cancelEditing();
  };
 
  // ---- CRUD: Delete a gateway ----
  const deleteGateway = (id) => {
    const gateway = settings.payment_gateways.find((g) => g.id === id);
    setSettings({
      ...settings,
      payment_gateways: settings.payment_gateways.filter((g) => g.id !== id),
      default_gateway: settings.default_gateway === id ? '' : settings.default_gateway,
    });
    toast.success(`${gateway?.name || 'Gateway'} removed`);
  };
 
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }
 
  return (
    <div className="settings-section">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="section-title">Payment Settings</h2>
          <p className="section-subtitle">Configure payment gateways and currency settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? <FiRefreshCw className="animate-spin" size={16} /> : <FiSave size={16} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
 
      <form className="settings-form">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label">Currency Code</label>
            <select
              className="form-select"
              value={settings.currency_code}
              onChange={(e) => setSettings({ ...settings, currency_code: e.target.value })}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
            </select>
          </div>
 
          <div className="form-group">
            <label className="form-label">Currency Symbol</label>
            <input
              type="text"
              className="form-input"
              value={settings.currency_symbol}
              onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
              placeholder="e.g., ₹, €, £"
              maxLength="3"
            />
          </div>
 
          <div className="form-group">
            <label className="form-label">Tax Rate (%)</label>
            <input
              type="number"
              className="form-input"
              value={settings.tax_rate}
              onChange={(e) => setSettings({ ...settings, tax_rate: parseFloat(e.target.value) })}
              step="0.01"
              min="0"
              max="100"
            />
          </div>
 
          <div className="form-group flex items-end">
            <div className="toggle-group w-full">
              <div className="toggle-label">
                <span>Tax Included in Price</span>
                <span className="text-sm text-gray-500">Prices shown include tax</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.tax_included}
                  onChange={(e) => setSettings({ ...settings, tax_included: e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
 
        {/* Payment Gateways — full CRUD */}
        <div className="form-section">
          <h3 className="form-section-title">Payment Gateways</h3>
 
          {settings.payment_gateways.length === 0 ? (
            <div className="crud-empty">No payment gateways yet. Add one below.</div>
          ) : (
            <div>
              {settings.payment_gateways.map((gateway) => (
                <div key={gateway.id} className="payment-method">
                  <div className="method-info">
                    <div className="method-icon">
                      <FiCreditCard size={20} />
                    </div>
 
                    {editingId === gateway.id ? (
                      <input
                        className="crud-edit-input"
                        value={editingName}
                        autoFocus
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEditing(gateway.id);
                          if (e.key === 'Escape') cancelEditing();
                        }}
                      />
                    ) : (
                      <div>
                        <span className="method-name">{gateway.name}</span>
                        <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                          gateway.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {gateway.enabled ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    )}
                  </div>
 
                  <div className="flex items-center gap-3">
                    {editingId === gateway.id ? (
                      <div className="crud-row-actions">
                        <button type="button" className="crud-icon-btn" onClick={() => saveEditing(gateway.id)} aria-label="Save name">
                          <FiCheck size={15} />
                        </button>
                        <button type="button" className="crud-icon-btn" onClick={cancelEditing} aria-label="Cancel edit">
                          <FiX size={15} />
                        </button>
                      </div>
                    ) : (
                      <>
                        {gateway.enabled && (
                          <button
                            type="button"
                            onClick={() => setSettings({ ...settings, default_gateway: gateway.id })}
                            className={`text-xs font-medium px-2 py-1 rounded ${
                              settings.default_gateway === gateway.id
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {settings.default_gateway === gateway.id ? 'Default' : 'Set Default'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleGateway(gateway.id)}
                          className={`px-3 py-1 text-sm rounded transition ${
                            gateway.enabled
                              ? 'bg-green-50 text-green-600 hover:bg-green-100'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {gateway.enabled ? 'Disable' : 'Enable'}
                        </button>
                        <div className="crud-row-actions">
                          <button type="button" className="crud-icon-btn" onClick={() => startEditing(gateway)} aria-label="Rename gateway">
                            <FiEdit2 size={14} />
                          </button>
                          <button type="button" className="crud-icon-btn danger" onClick={() => deleteGateway(gateway.id)} aria-label="Delete gateway">
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
 
          {/* Add new gateway */}
          <div className="crud-add-row">
            <input
              type="text"
              className="form-input"
              placeholder="New gateway name (e.g. Google Pay)"
              value={newGatewayName}
              onChange={(e) => setNewGatewayName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddGateway()}
            />
            <button
              type="button"
              className="crud-add-btn"
              onClick={handleAddGateway}
              disabled={!newGatewayName.trim()}
            >
              <FiPlus size={15} /> Add Gateway
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
 
export default PaymentSettings;