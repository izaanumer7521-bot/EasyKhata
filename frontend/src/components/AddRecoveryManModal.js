import React, { useState } from 'react';
import Modal from './Modal';
import { createRecoveryMan } from '../api/services';

const AddRecoveryManModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    area: '',
    openingBalance: '',
    openingBalanceType: 'collect',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await createRecoveryMan({
        ...form,
        openingBalance: Number(form.openingBalance) || 0,
      });
      onCreated(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Add recovery man" onClose={onClose}>
      <form onSubmit={submit} className="form">
        {error && <div className="form-error">{error}</div>}

        <label className="field">
          <span>Name</span>
          <input
            autoFocus
            value={form.name}
            onChange={update('name')}
            placeholder="e.g. Ayub Shah"
          />
        </label>

        <label className="field">
          <span>Phone number</span>
          <input
            value={form.phone}
            onChange={update('phone')}
            placeholder="03xx-xxxxxxx"
          />
        </label>

        <label className="field">
          <span>Area / route</span>
          <input
            value={form.area}
            onChange={update('area')}
            placeholder="e.g. Faisal Town"
          />
        </label>

        <div className="field-row">
          <label className="field">
            <span>Opening balance</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.openingBalance}
              onChange={update('openingBalance')}
              placeholder="0"
            />
          </label>
          <label className="field">
            <span>Balance type</span>
            <select value={form.openingBalanceType} onChange={update('openingBalanceType')}>
              <option value="collect">They owe me (I&apos;ll get)</option>
              <option value="pay">I owe them (I&apos;ll give)</option>
            </select>
          </label>
        </div>

        <button className="btn btn-brass btn-block" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Add recovery man'}
        </button>
      </form>
    </Modal>
  );
};

export default AddRecoveryManModal;
