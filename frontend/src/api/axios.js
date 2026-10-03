import axios from 'axios';

// In production, set REACT_APP_API_URL to your deployed backend's URL.
// Locally, requests go through the CRA dev server proxy to /api instead.
const baseURL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the login token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ek_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Token missing/expired/revoked -> send the user back to the login screen
    if (err.response?.status === 401) {
      localStorage.removeItem('ek_token');
      window.dispatchEvent(new Event('ek-logout'));
    }
    const message = err.response?.data?.message || err.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
