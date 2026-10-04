import React, { useState } from 'react';
import { login } from '../api/auth';
import { useLang } from '../i18n/LanguageContext';

const Login = ({ onLoggedIn }) => {
  const { t } = useLang();
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!password) return;
    setBusy(true);
    setError('');
    try {
      const res = await login(password);
      localStorage.setItem('ek_token', res.token);
      onLoggedIn();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="auth-card form" onSubmit={submit}>
        <img src={`${process.env.PUBLIC_URL}/logo.svg`} alt="" width="56" height="56" className="auth-logo" />
        <h2 className="auth-title">{t('welcome')}</h2>
        <p className="auth-sub">{t('login_sub')}</p>
        {error && <div className="form-error">{error}</div>}
        <label className="field">
          <span>{t('password')}</span>
          <div className="pw-row">
            <input
              autoFocus
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button type="button" className="pw-toggle" onClick={() => setShow(!show)}>
              {show ? t('hide') : t('show')}
            </button>
          </div>
        </label>
        <button className="btn btn-brass btn-block" type="submit" disabled={busy || !password}>
          {busy ? t('checking') : t('unlock')}
        </button>
      </form>
    </div>
  );
};

export default Login;
