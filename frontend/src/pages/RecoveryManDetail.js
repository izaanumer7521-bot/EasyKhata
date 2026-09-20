import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TransactionRow from '../components/TransactionRow';
import AddTransactionModal from '../components/AddTransactionModal';
import ShareEntryModal from '../components/ShareEntryModal';
import { fetchLedger, deleteRecoveryMan } from '../api/services';
import { formatMoney, initials, avatarColor } from '../utils';

const RecoveryManDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recoveryMan, setRecoveryMan] = useState(null);
  const [entries, setEntries] = useState([]);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [totals, setTotals] = useState({ totalIncome: 0, totalExpense: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalType, setModalType] = useState(null); // 'income' | 'expense' | null
  const [shareEntry, setShareEntry] = useState(null); // { txn, balance } after a save

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchLedger(id);
      setRecoveryMan(res.recoveryMan);
      setEntries(res.data);
      setCurrentBalance(res.currentBalance);
      setTotals({ totalIncome: res.totalIncome, totalExpense: res.totalExpense });
      return res;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDeleteRecoveryMan = async () => {
    if (!window.confirm(`Delete ${recoveryMan.name} and all their entries? This cannot be undone.`)) return;
    try {
      await deleteRecoveryMan(id);
      navigate('/');
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredEntries = entries.filter((e) =>
    e.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="page empty-state">Loading…</div>;
  if (error || !recoveryMan) return <div className="page empty-state empty-state-error">{error || 'Not found'}</div>;

  const isGet = currentBalance > 0;
  const isSettled = currentBalance === 0;

  return (
    <div className="page page-detail">
      <section className="rm-header">
        <span className="rm-avatar rm-avatar-lg" style={{ background: avatarColor(recoveryMan.name) }}>
          {initials(recoveryMan.name)}
        </span>
        <div className="rm-header-info">
          <h2>{recoveryMan.name}</h2>
          <span className="rm-header-meta">
            {recoveryMan.area || 'No area'} {recoveryMan.phone ? `· ${recoveryMan.phone}` : ''}
          </span>
        </div>
        <button className="icon-btn danger" onClick={handleDeleteRecoveryMan} title="Delete recovery man">
          🗑
        </button>
      </section>

      <section className={`balance-banner ${isSettled ? 'balance-settled' : isGet ? 'balance-get' : 'balance-give'}`}>
        {isSettled ? (
          <span>All settled up</span>
        ) : (
          <>
            <span className="mono balance-amount">{formatMoney(Math.abs(currentBalance))}</span>
            <span className="balance-caption">{isGet ? 'Income · net received from ' + recoveryMan.name : 'Expense · net given to ' + recoveryMan.name}</span>
          </>
        )}
      </section>

      <section className="totals-row">
        <div>
          <span className="totals-label">Total income</span>
          <span className="mono text-income">{formatMoney(totals.totalIncome)}</span>
        </div>
        <div>
          <span className="totals-label">Total expense</span>
          <span className="mono text-expense">{formatMoney(totals.totalExpense)}</span>
        </div>
      </section>

      <div className="search-bar">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search entries"
        />
      </div>

      <section className="txn-table">
        <div className="txn-table-head">
          <span>Entries</span>
          <span className="txn-table-head-expense">Expense</span>
          <span className="txn-table-head-income">Income</span>
        </div>

        {filteredEntries.length === 0 && (
          <div className="empty-state">
            <p>No entries yet.</p>
            <p className="empty-state-sub">Add an income or expense entry below to start the ledger.</p>
          </div>
        )}

        <div className="txn-list scroll-thin">
          {filteredEntries.map((txn) => (
            <TransactionRow
              key={txn._id}
              txn={txn}
              onDeleted={() => load()}
            />
          ))}
        </div>
      </section>

      <section className="ledger-actions">
        <button className="btn btn-expense btn-half" onClick={() => setModalType('expense')}>
          − Expense
        </button>
        <button className="btn btn-income btn-half" onClick={() => setModalType('income')}>
          + Income
        </button>
      </section>

      {modalType && (
        <AddTransactionModal
          recoveryManId={id}
          type={modalType}
          onClose={() => setModalType(null)}
          onCreated={async (txn) => {
            setModalType(null);
            const res = await load();
            // Show the WhatsApp / SMS popup with the freshly recalculated net total
            setShareEntry({ txn, balance: res ? res.currentBalance : 0 });
          }}
        />
      )}

      {shareEntry && recoveryMan && (
        <ShareEntryModal
          recoveryMan={recoveryMan}
          txn={shareEntry.txn}
          balance={shareEntry.balance}
          onClose={() => setShareEntry(null)}
        />
      )}
    </div>
  );
};

export default RecoveryManDetail;
