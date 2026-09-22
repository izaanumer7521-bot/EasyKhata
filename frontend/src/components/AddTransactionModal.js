import React, { useState } from 'react';
import Modal from './Modal';
import { addTransaction } from '../api/services';
import { toDateTimeLocalValue } from '../utils';

const AddTransactionModal = ({ recoveryManId, type, onClose, onCreated }) => {
  const isIncome = type === 'income';
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(toDateTimeLocalValue());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Enter an amount greater than 0');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await addTransaction({
        recoveryMan: recoveryManId,
        type,
        amount: Number(amount),
        description,
        date,
      });
      onCreated(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isIncome ? 'Add income' : 'Add expense'} onClose={onClose}>
      <form onSubmit={submit} className="form">
        {error && <div className="form-error">{error}</div>}

        <p className="modal-hint">
          {isIncome
            ? 'Money you received from this recovery man.'
            : 'Money you gave to this recovery man.'}
        </p>

        <label className="field">
          <span>Amount (Rs)</span>
          <input
            autoFocus
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
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
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        <button
          className={`btn btn-block ${isIncome ? 'btn-income' : 'btn-expense'}`}
          type="submit"
          disabled={saving}
        >
          {saving ? 'Saving…' : isIncome ? 'Save income' : 'Save expense'}
        </button>
      </form>
    </Modal>
  );
};

export default AddTransactionModal;
