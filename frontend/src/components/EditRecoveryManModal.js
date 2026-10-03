import React, { useState } from 'react';
import Modal from './Modal';
import { updateRecoveryMan } from '../api/services';

const EditRecoveryManModal = ({ recoveryMan, onClose, onSaved }) => {
  const [form, setForm] = useState({
    name: recoveryMan.name || '',
    phone: recoveryMan.phone || '',
    area: recoveryMan.area || '',
    notes: recoveryMan.notes || '',
    openingBalance: recoveryMan.openingBalance ?? 0,
    openingBalanceType: recoveryMan.openingBalanceType || 'collect',
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
      const res = await updateRecoveryMan(recoveryMan._id, {
        ...form,
        name: form.name.trim(),
        openingBalance: Number(form.openingBalance) || 0,
      });
      onSaved(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Edit recovery man" onClose={onClose}>
      <form onSubmit={submit} className="form">
        {error && <div className="form-error">{error}</div>}

        <label className="field">
          <span>Name</span>
          <input autoFocus value={form.name} onChange={update('name')} />
        </label>

        <label className="field">
          <span>Phone number</span>
          <input value={form.phone} onChange={update('phone')} placeholder="03xx-xxxxxxx" />
        </label>

        <label className="field">
          <span>Area / route</span>
          <input value={form.area} onChange={update('area')} />
        </label>

        <label className="field">
          <span>Notes</span>
          <input value={form.notes} onChange={update('notes')} placeholder="Optional" />
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
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </Modal>
  );
};

export default EditRecoveryManModal;
