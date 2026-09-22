import axios from 'axios';

// In production, set REACT_APP_API_URL to your deployed backend's URL
// (e.g. https://easykhata-backend.onrender.com). Locally, this is left
// unset and requests go through the CRA dev server proxy to /api instead.
const baseURL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Normalize error messages coming back from the Express error handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message || err.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
