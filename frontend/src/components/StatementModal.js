import React, { useState } from 'react';
import Modal from './Modal';
import { useLang } from '../i18n/LanguageContext';
import { prepare, openPdf, downloadExcel, shareWhatsApp } from '../statement';

const StatementModal = ({ recoveryMan, entries, currentBalance, onClose }) => {
  const { t, rtl, lang } = useLang();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const build = () => prepare(recoveryMan, entries, from, to, currentBalance);

  return (
    <Modal title={`${t('statement')} – ${recoveryMan.name}`} onClose={onClose}>
      <div className="form">
        <div className="field-row">
          <label className="field"><span>{t('st_from')}</span>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
          <label className="field"><span>{t('st_to')}</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
        </div>
        <button className="btn btn-brass btn-block" onClick={() => openPdf(build(), t, rtl, lang)}>📄 {t('st_pdf')}</button>
        <button className="btn btn-income btn-block" onClick={() => downloadExcel(build(), t)}>📊 {t('st_excel')}</button>
        <button className="btn btn-block wa-btn" onClick={() => shareWhatsApp(build(), t)}>💬 {t('st_wa')}</button>
        <p className="modal-hint">{t('st_hint')}</p>
      </div>
    </Modal>
  );
};

export default StatementModal;
