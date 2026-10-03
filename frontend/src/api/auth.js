import api from './axios';

export const login = (password) => api.post('/auth/login', { password }).then((r) => r.data);

export const changePassword = (currentPassword, newPassword) =>
  api.post('/auth/change-password', { currentPassword, newPassword }).then((r) => r.data);
