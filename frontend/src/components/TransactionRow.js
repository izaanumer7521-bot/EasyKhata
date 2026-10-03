import React, { useState } from 'react';
import { formatMoney, formatDate, formatTime } from '../utils';
import { deleteTransaction } from '../api/services';

const TransactionRow = ({ txn, onDeleted, onEdit }) => {
  const [busy, setBusy] = useState(false);
  const isIncome = txn.type === 'income';

  const handleDelete = async () => {
    if (!window.confirm('Delete this entry? This cannot be undone.')) return;
    setBusy(true);
    try {
      await deleteTransaction(txn._id);
      onDeleted(txn._id);
    } catch (err) {
      alert(err.message);
      setBusy(false);
    }
  };

  return (
    <div className={`txn-row ${busy ? 'txn-row-busy' : ''}`}>
      <div className="txn-when">
        <span className="txn-date">{formatDate(txn.date)}</span>
        <span className="txn-time">{formatTime(txn.date)}</span>
      </div>

      <div className="txn-desc">
        <span>{txn.description || (isIncome ? 'Income entry' : 'Expense entry')}</span>
        <span className="txn-balance mono">Bal. {formatMoney(Math.abs(txn.balanceAfter))}</span>
      </div>

      <div className="txn-expense mono">
        {!isIncome && <span className="text-expense">{formatMoney(txn.amount)}</span>}
      </div>
      <div className="txn-income mono">
        {isIncome && <span className="text-income">{formatMoney(txn.amount)}</span>}
      </div>

      <div className="txn-actions">
        <button
          className="txn-edit"
          onClick={() => onEdit(txn)}
          title="Edit entry"
          aria-label="Edit entry"
        >
          ✎
        </button>
        <button
          className="txn-delete"
          onClick={handleDelete}
          title="Delete entry"
          aria-label="Delete entry"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default TransactionRow;
