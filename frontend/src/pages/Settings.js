import React, { useState } from 'react';
import { changePassword } from '../api/auth';

const Settings = ({ onLogout }) => {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setDone(false);
    if (form.next.length < 8) return setError('New password must be at least 8 characters');
    if (form.next !== form.confirm) return setError('New passwords do not match');
    setBusy(true);
    try {
      const res = await changePassword(form.current, form.next);
      localStorage.setItem('ek_token', res.token);
      setForm({ current: '', next: '', confirm: '' });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <h2 className="settings-title">Settings</h2>

      <form className="settings-card form" onSubmit={submit}>
        <h3>Change password</h3>
        {error && <div className="form-error">{error}</div>}
        {done && <div className="form-success">Password changed. Other devices were logged out.</div>}
        <label className="field">
          <span>Current password</span>
          <input type="password" value={form.current} onChange={set('current')} autoComplete="current-password" />
        </label>
        <label className="field">
          <span>New password (8+ characters)</span>
          <input type="password" value={form.next} onChange={set('next')} autoComplete="new-password" />
        </label>
        <label className="field">
          <span>Confirm new password</span>
          <input type="password" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
        </label>
        <button className="btn btn-brass btn-block" type="submit" disabled={busy || !form.current || !form.next}>
          {busy ? 'Saving…' : 'Update password'}
        </button>
      </form>

      <div className="settings-card">
        <h3>Session</h3>
        <button className="btn btn-expense btn-block" onClick={onLogout}>Log out</button>
      </div>
    </div>
  );
};

export default Settings;
