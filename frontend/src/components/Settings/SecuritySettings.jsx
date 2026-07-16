// frontend/src/components/Settings/SecuritySettings.jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiSave, FiRefreshCw, FiClock, FiGlobe, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiHelpCircle } from 'react-icons/fi';
 
const SecuritySettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    two_factor_auth: false,
    session_timeout: 60,
    max_login_attempts: 5,
    password_min_length: 8,
    require_special_char: true,
    require_number: true,
    session_management: {
      max_sessions: 3,
      force_logout_on_password_change: true,
    },
    login_history: [
      { id: 1, device: 'Chrome - Windows', time: '2024-01-15 14:30', ip: '192.168.1.1' },
      { id: 2, device: 'Safari - iPhone', time: '2024-01-14 09:15', ip: '192.168.1.2' },
      { id: 3, device: 'Firefox - Mac', time: '2024-01-13 22:45', ip: '192.168.1.3' },
    ],
    security_questions: [
      { id: 1, text: "What is your mother's maiden name?" },
      { id: 2, text: 'What is the name of your first pet?' },
      { id: 3, text: 'What city were you born in?' },
    ],
  });
 
  // ---- CRUD UI state ----
  const [newQuestion, setNewQuestion] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editingQuestionText, setEditingQuestionText] = useState('');
 
  useEffect(() => {
    let cancelled = false;
 
    const fetchSettings = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (cancelled) return;
      } catch {
        if (!cancelled) toast.error('Failed to load security settings');
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
      toast.success('Security settings saved successfully!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };
 
  // ---- CRUD: Revoke a single login session ----
  const revokeSession = (id) => {
    const entry = settings.login_history.find((h) => h.id === id);
    setSettings({
      ...settings,
      login_history: settings.login_history.filter((h) => h.id !== id),
    });
    toast.success(`Session on ${entry?.device || 'device'} revoked`);
  };
 
  const clearAllHistory = () => {
    setSettings({ ...settings, login_history: [] });
    toast.success('Login history cleared!');
  };
 
  // ---- CRUD: Security Questions ----
  const handleAddQuestion = () => {
    const text = newQuestion.trim();
    if (!text) return;
    setSettings({
      ...settings,
      security_questions: [...settings.security_questions, { id: Date.now(), text }],
    });
    setNewQuestion('');
  };
 
  const startEditingQuestion = (q) => {
    setEditingQuestionId(q.id);
    setEditingQuestionText(q.text);
  };
 
  const cancelEditingQuestion = () => {
    setEditingQuestionId(null);
    setEditingQuestionText('');
  };
 
  const saveEditingQuestion = (id) => {
    const text = editingQuestionText.trim();
    if (!text) {
      cancelEditingQuestion();
      return;
    }
    setSettings({
      ...settings,
      security_questions: settings.security_questions.map((q) =>
        q.id === id ? { ...q, text } : q
      ),
    });
    cancelEditingQuestion();
  };
 
  const deleteQuestion = (id) => {
    setSettings({
      ...settings,
      security_questions: settings.security_questions.filter((q) => q.id !== id),
    });
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
          <h2 className="section-title">Security Settings</h2>
          <p className="section-subtitle">Manage security configurations and authentication</p>
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
            <label className="form-label">Session Timeout (minutes)</label>
            <input
              type="number"
              className="form-input"
              value={settings.session_timeout}
              onChange={(e) => setSettings({ ...settings, session_timeout: parseInt(e.target.value) })}
              min="5"
              max="480"
            />
          </div>
 
          <div className="form-group">
            <label className="form-label">Max Login Attempts</label>
            <input
              type="number"
              className="form-input"
              value={settings.max_login_attempts}
              onChange={(e) => setSettings({ ...settings, max_login_attempts: parseInt(e.target.value) })}
              min="3"
              max="10"
            />
          </div>
 
          <div className="form-group">
            <label className="form-label">Minimum Password Length</label>
            <input
              type="number"
              className="form-input"
              value={settings.password_min_length}
              onChange={(e) => setSettings({ ...settings, password_min_length: parseInt(e.target.value) })}
              min="6"
              max="20"
            />
          </div>
 
          <div className="form-group flex items-end">
            <div className="toggle-group w-full">
              <div className="toggle-label">
                <span>Two-Factor Authentication</span>
                <span className="text-sm text-gray-500">Require 2FA for admin accounts</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.two_factor_auth}
                  onChange={(e) => setSettings({ ...settings, two_factor_auth: e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
 
        <div className="form-section">
          <h3 className="form-section-title">Password Requirements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.require_special_char}
                  onChange={(e) => setSettings({ ...settings, require_special_char: e.target.checked })}
                />
                Require Special Character (!@#$%^&*)
              </label>
            </div>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.require_number}
                  onChange={(e) => setSettings({ ...settings, require_number: e.target.checked })}
                />
                Require Number
              </label>
            </div>
          </div>
        </div>
 
        {/* Session Management */}
        <div className="form-section">
          <h3 className="form-section-title">Session Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Max Active Sessions per User</label>
              <input
                type="number"
                className="form-input"
                value={settings.session_management.max_sessions}
                onChange={(e) => setSettings({
                  ...settings,
                  session_management: {
                    ...settings.session_management,
                    max_sessions: parseInt(e.target.value)
                  }
                })}
                min="1"
                max="10"
              />
            </div>
            <div className="form-group flex items-end">
              <div className="toggle-group w-full">
                <div className="toggle-label">
                  <span>Force Logout on Password Change</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.session_management.force_logout_on_password_change}
                    onChange={(e) => setSettings({
                      ...settings,
                      session_management: {
                        ...settings.session_management,
                        force_logout_on_password_change: e.target.checked
                      }
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
 
        {/* Login History — revoke individually or clear all */}
        <div className="form-section">
          <h3 className="form-section-title flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FiClock size={18} />
              Login History
            </span>
            {settings.login_history.length > 0 && (
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-black transition"
                onClick={clearAllHistory}
              >
                Clear All
              </button>
            )}
          </h3>
 
          {settings.login_history.length === 0 ? (
            <div className="crud-empty">No active sessions.</div>
          ) : (
            <div className="login-history">
              {settings.login_history.map((entry) => (
                <div key={entry.id} className="history-item">
                  <div>
                    <span className="history-device flex items-center gap-2">
                      <FiGlobe size={14} />
                      {entry.device}
                    </span>
                    <span className="text-xs text-gray-400 ml-6">IP: {entry.ip}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="history-time">{entry.time}</span>
                    <button
                      type="button"
                      className="crud-icon-btn danger"
                      onClick={() => revokeSession(entry.id)}
                      aria-label="Revoke session"
                      title="Revoke this session"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
 
        {/* Security Questions — full CRUD (previously tracked in state but never shown) */}
        <div className="form-section">
          <h3 className="form-section-title flex items-center gap-2">
            <FiHelpCircle size={16} />
            Security Questions
          </h3>
 
          {settings.security_questions.length === 0 ? (
            <div className="crud-empty">No security questions set up yet.</div>
          ) : (
            <div className="space-y-2">
              {settings.security_questions.map((q) => (
                <div key={q.id} className="homepage-section">
                  {editingQuestionId === q.id ? (
                    <input
                      className="crud-edit-input"
                      value={editingQuestionText}
                      autoFocus
                      onChange={(e) => setEditingQuestionText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEditingQuestion(q.id);
                        if (e.key === 'Escape') cancelEditingQuestion();
                      }}
                    />
                  ) : (
                    <span className="section-label">{q.text}</span>
                  )}
 
                  <div className="crud-row-actions">
                    {editingQuestionId === q.id ? (
                      <>
                        <button type="button" className="crud-icon-btn" onClick={() => saveEditingQuestion(q.id)} aria-label="Save question">
                          <FiCheck size={15} />
                        </button>
                        <button type="button" className="crud-icon-btn" onClick={cancelEditingQuestion} aria-label="Cancel edit">
                          <FiX size={15} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" className="crud-icon-btn" onClick={() => startEditingQuestion(q)} aria-label="Edit question">
                          <FiEdit2 size={14} />
                        </button>
                        <button type="button" className="crud-icon-btn danger" onClick={() => deleteQuestion(q.id)} aria-label="Delete question">
                          <FiTrash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
 
          <div className="crud-add-row">
            <input
              type="text"
              className="form-input"
              placeholder="New security question"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion()}
            />
            <button
              type="button"
              className="crud-add-btn"
              onClick={handleAddQuestion}
              disabled={!newQuestion.trim()}
            >
              <FiPlus size={15} /> Add Question
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
 
export default SecuritySettings;