import api from './axios';

// ---- Recovery Men ----
export const fetchRecoveryMen = (search = '') =>
  api.get('/recoverymen', { params: { search } }).then((r) => r.data);

export const fetchRecoveryMan = (id) =>
  api.get(`/recoverymen/${id}`).then((r) => r.data);

export const createRecoveryMan = (payload) =>
  api.post('/recoverymen', payload).then((r) => r.data);

export const updateRecoveryMan = (id, payload) =>
  api.put(`/recoverymen/${id}`, payload).then((r) => r.data);

export const deleteRecoveryMan = (id) =>
  api.delete(`/recoverymen/${id}`).then((r) => r.data);

// ---- Transactions (Income / Expense entries) ----
export const fetchLedger = (recoveryManId) =>
  api.get(`/transactions/${recoveryManId}`).then((r) => r.data);

export const addTransaction = (payload) =>
  api.post('/transactions', payload).then((r) => r.data);

export const updateTransaction = (id, payload) =>
  api.put(`/transactions/${id}`, payload).then((r) => r.data);

export const deleteTransaction = (id) =>
  api.delete(`/transactions/${id}`).then((r) => r.data);

// ---- Dashboard ----
export const fetchDashboardSummary = () =>
  api.get('/dashboard/summary').then((r) => r.data);
