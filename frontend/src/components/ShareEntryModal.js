import React, { useState } from 'react';
import Modal from './Modal';
import { formatMoney, formatDate, formatTime } from '../utils';

// Turns a locally-typed number into an international format WhatsApp accepts.
// 03001234567 -> 923001234567 ; +92 300 1234567 -> 923001234567
export const normalizePhone = (raw = '', countryCode = '92') => {
  let digits = String(raw).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = countryCode + digits.slice(1);
  return digits;
};

// Builds the message text sent over WhatsApp / SMS
export const buildMessage = ({ recoveryMan, txn, balance }) => {
  const isIncome = txn.type === 'income';
  const lines = [];

  lines.push(`EasyKhata — ${recoveryMan.name}`);
  lines.push('');
  lines.push(
    isIncome
      ? `Income received: ${formatMoney(txn.amount)}`
      : `Expense given: ${formatMoney(txn.amount)}`
  );

  if (txn.description && txn.description.trim()) {
    lines.push(`Note: ${txn.description.trim()}`);
  }

  lines.push(`Date: ${formatDate(txn.date)} ${formatTime(txn.date)}`);
  lines.push('');

  const net = Number(balance) || 0;
  if (net > 0) {
    lines.push(`Net total: ${formatMoney(Math.abs(net))} (Income)`);
  } else if (net < 0) {
    lines.push(`Net total: ${formatMoney(Math.abs(net))} (Expense)`);
  } else {
    lines.push('Net total: Rs 0 (Settled)');
  }

  return lines.join('\n');
};

const ShareEntryModal = ({ recoveryMan, txn, balance, onClose }) => {
  const [copied, setCopied] = useState(false);
  const isIncome = txn.type === 'income';

  const message = buildMessage({ recoveryMan, txn, balance });
  const phone = normalizePhone(recoveryMan.phone);
  const hasPhone = Boolean(phone);

  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  const smsUrl = `sms:${recoveryMan.phone || ''}?body=${encodeURIComponent(message)}`;

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      window.prompt('Copy this message:', message);
    }
  };

  return (
    <Modal title="Entry saved" onClose={onClose}>
      <div className="share-wrap">
        <div className={`share-badge ${isIncome ? 'share-badge-income' : 'share-badge-expense'}`}>
          <span className="share-badge-label">{isIncome ? 'Income added' : 'Expense added'}</span>
          <span className="share-badge-amount mono">{formatMoney(txn.amount)}</span>
        </div>

        <div className="share-preview">
          <span className="share-preview-label">Message preview</span>
          <pre className="share-preview-text">{message}</pre>
        </div>

        {!hasPhone && (
          <div className="share-warning">
            No phone number saved for {recoveryMan.name}. Add one to send directly, or copy the
            message below.
          </div>
        )}

        <div className="share-actions">
          <a
            className={`btn btn-whatsapp ${!hasPhone ? 'btn-disabled' : ''}`}
            href={hasPhone ? whatsappUrl : undefined}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => !hasPhone && e.preventDefault()}
          >
            Send on WhatsApp
          </a>
          <a
            className={`btn btn-sms ${!hasPhone ? 'btn-disabled' : ''}`}
            href={hasPhone ? smsUrl : undefined}
            onClick={(e) => !hasPhone && e.preventDefault()}
          >
            Send SMS
          </a>
        </div>

        <div className="share-secondary">
          <button className="btn-link" onClick={copyMessage}>
            {copied ? 'Copied ✓' : 'Copy message'}
          </button>
          <button className="btn-link" onClick={onClose}>
            Skip
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ShareEntryModal;
