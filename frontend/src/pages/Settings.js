import React, { useState } from 'react';
import { changePassword } from '../api/auth';
import { useLang } from '../i18n/LanguageContext';
import { LANGUAGES } from '../i18n/translations';

const Settings = ({ onLogout }) => {
  const { t, lang, setLang } = useLang();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const langs = LANGUAGES.filter((l) => (l.name + l.native).toLowerCase().includes(q.trim().toLowerCase()));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setDone(false);
    if (form.next.length < 8) return setError(t('pw_short'));
    if (form.next !== form.confirm) return setError(t('pw_mismatch'));
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
      <h2 className="settings-title">{t('settings')}</h2>

      <div className="settings-card">
        <h3>{t('language')}</h3>
        <input className="lang-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search_lang')} />
        <div className="lang-list">
          {langs.map((l) => (
            <button key={l.code} className={`lang-item ${l.code === lang ? 'lang-active' : ''}`} onClick={() => setLang(l.code)}>
              <span className="lang-native">{l.native}</span>
              <span className="lang-name">{l.name}</span>
              {l.code === lang && <span className="lang-tick">✓</span>}
            </button>
          ))}
          {langs.length === 0 && <div className="lang-empty">{t('no_lang')}</div>}
        </div>
      </div>

      <form className="settings-card form" onSubmit={submit}>
        <h3>{t('change_pw')}</h3>
        {error && <div className="form-error">{error}</div>}
        {done && <div className="form-success">{t('pw_changed')}</div>}
        <label className="field"><span>{t('current_pw')}</span>
          <input type="password" value={form.current} onChange={set('current')} autoComplete="current-password" /></label>
        <label className="field"><span>{t('new_pw')}</span>
          <input type="password" value={form.next} onChange={set('next')} autoComplete="new-password" /></label>
        <label className="field"><span>{t('confirm_pw')}</span>
          <input type="password" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" /></label>
        <button className="btn btn-brass btn-block" type="submit" disabled={busy || !form.current || !form.next}>
          {busy ? t('saving') : t('update_pw')}
        </button>
      </form>

      <div className="settings-card">
        <h3>{t('session')}</h3>
        <button className="btn btn-expense btn-block" onClick={onLogout}>{t('logout')}</button>
      </div>
    </div>
  );
};

export default Settings;
