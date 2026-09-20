import React, { useEffect, useState, useCallback } from 'react';
import RecoveryManCard from '../components/RecoveryManCard';
import AddRecoveryManModal from '../components/AddRecoveryManModal';
import { fetchRecoveryMen } from '../api/services';
import { formatMoney } from '../utils';

const Dashboard = () => {
  const [recoveryMen, setRecoveryMen] = useState([]);
  const [summary, setSummary] = useState({ youWillGive: 0, youWillGet: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async (q = '') => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchRecoveryMen(q);
      setRecoveryMen(res.data);
      setSummary(res.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="page">
      <section className="summary-row">
        <div className="summary-card summary-give">
          <span className="summary-label">Expense</span>
          <span className="summary-amount mono">{formatMoney(summary.youWillGive)}</span>
        </div>
        <div className="summary-card summary-get">
          <span className="summary-label">Income</span>
          <span className="summary-amount mono">{formatMoney(summary.youWillGet)}</span>
        </div>
      </section>

      <section className="section-header">
        <span className="section-title">Recovery Men</span>
        <span className="section-count">{recoveryMen.length}</span>
      </section>

      <div className="search-bar">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search recovery men by name, phone or area"
        />
      </div>

      {loading && <div className="empty-state">Loading…</div>}
      {!loading && error && <div className="empty-state empty-state-error">{error}</div>}

      {!loading && !error && recoveryMen.length === 0 && (
        <div className="empty-state">
          <p>No recovery men yet.</p>
          <p className="empty-state-sub">Add your first recovery man to start tracking income and expenses.</p>
        </div>
      )}

      {!loading && !error && (
        <div className="rm-list">
          {recoveryMen.map((rm) => (
            <RecoveryManCard key={rm._id} recoveryMan={rm} />
          ))}
        </div>
      )}

      <button className="fab" onClick={() => setShowAdd(true)}>
        <span className="fab-icon">+</span>
        Add Recovery Man
      </button>

      {showAdd && (
        <AddRecoveryManModal
          onClose={() => setShowAdd(false)}
          onCreated={(rm) => {
            setShowAdd(false);
            setRecoveryMen((prev) => [{ ...rm, balance: { netBalance: rm.openingBalance || 0, status: 'settled' } }, ...prev]);
            load(search);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
