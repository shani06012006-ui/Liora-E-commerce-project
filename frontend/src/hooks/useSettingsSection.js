import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/api';
 
/**
 * Loads a settings section on mount and exposes a save() function
 * that PATCHes only the changed fields back to the server.
 *
 * Usage:
 *   const { data, setData, loading, saving, save } = useSettingsSection('shipping');
 */
export function useSettingsSection(section) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
 
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminAPI.getSettingsSection(section)
      .then((res) => { if (!cancelled) setData(res.data); })
      .catch(() => { if (!cancelled) toast.error(`Couldn't load ${section} settings`); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [section]);
 
  const save = useCallback(async (updates) => {
    setSaving(true);
    try {
      const res = await adminAPI.updateSettingsSection(section, updates ?? data);
      setData(res.data.data);
      toast.success('Settings saved successfully!');
      return res.data.data;
    } catch (err) {
      toast.error('Failed to save settings');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [section, data]);
 
  const addArrayItem = useCallback(async (arrayField, value) => {
    const res = await adminAPI.addSettingsArrayItem(section, arrayField, value);
    setData(res.data.data);
    return res.data.data;
  }, [section]);
 
  const removeArrayItem = useCallback(async (arrayField, value) => {
    const res = await adminAPI.removeSettingsArrayItem(section, arrayField, value);
    setData(res.data.data);
    return res.data.data;
  }, [section]);
 
  return { data, setData, loading, saving, save, addArrayItem, removeArrayItem };
}