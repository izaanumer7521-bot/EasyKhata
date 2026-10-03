import React, { useState } from 'react';
import Modal from './Modal';
import { updateTransaction } from '../api/services';
import { toDateTimeLocalValue } from '../utils';

const EditTransactionModal = ({ txn, onClose, onSaved }) => {
  const [type, setType] = useState(txn.type);
  const [amount, setAmount] = useState(String(txn.amount));
  const [description, setDescription] = useState(txn.description || '');
  const [date, setDate] = useState(toDateTimeLocalValue(txn.date));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isIncome = type === 'income';

  const submit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Enter an amount greater than 0');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await updateTransaction(txn._id, {
        type,
        amount: Number(amount),
        description,
        date: new Date(date).toISOString(),
      });
      onSaved(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Edit entry" onClose={onClose}>
      <form onSubmit={submit} className="form">
        {error && <div className="form-error">{error}</div>}

        <label className="field">
          <span>Type</span>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="income">Income (money I received)</option>
            <option value="expense">Expense (money I gave)</option>
          </select>
        </label>

        <label className="field">
          <span>Amount (Rs)</span>
          <input
            autoFocus
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>

        <label className="field">
          <span>Description</span>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Note (optional)"
          />
        </label>

        <label className="field">
          <span>Date &amp; time</span>
          <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>

        <button
          className={`btn btn-block ${isIncome ? 'btn-income' : 'btn-expense'}`}
          type="submit"
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </Modal>
  );
};

export default EditTransactionModal;
