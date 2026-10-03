import React, { useState } from 'react';
import { login } from '../api/auth';

const Login = ({ onLoggedIn }) => {
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
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-sub">Enter your password to open EasyKhata</p>
        {error && <div className="form-error">{error}</div>}
        <label className="field">
          <span>Password</span>
          <div className="pw-row">
            <input
              autoFocus
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button type="button" className="pw-toggle" onClick={() => setShow(!show)}>
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>
        <button className="btn btn-brass btn-block" type="submit" disabled={busy || !password}>
          {busy ? 'Checking…' : 'Unlock'}
        </button>
      </form>
    </div>
  );
};

export default Login;
