import * as XLSX from 'xlsx';
import { formatMoney } from './utils';

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

// Normalise: oldest first, with period totals and closing balance
export const prepare = (rm, entries, from, to, currentBalance) => {
  const f = from ? new Date(from + 'T00:00:00') : null;
  const e = to ? new Date(to + 'T23:59:59') : null;
  const rows = [...entries]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .filter((x) => (!f || new Date(x.date) >= f) && (!e || new Date(x.date) <= e));
  const income = rows.filter((r) => r.type === 'income').reduce((s, r) => s + r.amount, 0);
  const expense = rows.filter((r) => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
  const closing = rows.length ? Math.abs(rows[rows.length - 1].balanceAfter) : Math.abs(currentBalance);
  return { rm, rows, income, expense, closing, from, to };
};

const period = (s, t) =>
  s.from || s.to ? `${s.from ? fmtDate(s.from) : '…'} – ${s.to ? fmtDate(s.to) : '…'}` : '';
const fileName = (s, ext) => `${s.rm.name.replace(/[^\p{L}\p{N}]+/gu, '_')}_statement.${ext}`;

export const openPdf = (s, t, rtl, lang) => {
  const w = window.open('', '_blank');
  if (!w) return alert('Please allow pop-ups to create the PDF');
  const body = s.rows.length
    ? s.rows.map((r) => `<tr><td>${fmtDate(r.date)}</td><td>${esc(r.description)}</td>
        <td class="e">${r.type === 'expense' ? formatMoney(r.amount) : ''}</td>
        <td class="i">${r.type === 'income' ? formatMoney(r.amount) : ''}</td>
        <td>${formatMoney(Math.abs(r.balanceAfter))}</td></tr>`).join('')
    : `<tr><td colspan="5" style="text-align:center">${t('st_empty')}</td></tr>`;
  w.document.write(`<!doctype html><html lang="${lang}" dir="${rtl ? 'rtl' : 'ltr'}"><head><meta charset="utf-8">
<title>${esc(s.rm.name)} – ${t('st_title')}</title><style>
body{font-family:'Segoe UI',Tahoma,'Noto Naskh Arabic','Nirmala UI',Arial,sans-serif;color:#111;margin:32px}
h1{margin:0;font-size:22px}.sub{color:#555;margin:4px 0 18px;font-size:13px}
table{width:100%;border-collapse:collapse;font-size:13px}th{background:#ff6a00;color:#fff;padding:8px;text-align:start}
td{padding:7px 8px;border-bottom:1px solid #e5e5e5}.i{color:#0a8f3c;font-weight:600}.e{color:#d62828;font-weight:600}
.tot{margin-top:18px;display:flex;gap:24px;font-size:14px}.tot b{display:block;font-size:16px}
.foot{margin-top:28px;color:#888;font-size:11px}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}
</style></head><body>
<h1>${esc(s.rm.name)}</h1>
<div class="sub">${t('st_title')} ${period(s) ? '· ' + period(s) : ''} ${s.rm.phone ? '· ' + esc(s.rm.phone) : ''}</div>
<table><thead><tr><th>${t('st_date')}</th><th>${t('st_desc')}</th><th>${t('expense')}</th><th>${t('income')}</th><th>${t('st_balance')}</th></tr></thead><tbody>${body}</tbody></table>
<div class="tot"><div>${t('st_tincome')}<b class="i">${formatMoney(s.income)}</b></div>
<div>${t('st_texpense')}<b class="e">${formatMoney(s.expense)}</b></div>
<div>${t('st_closing')}<b>${formatMoney(s.closing)}</b></div></div>
<div class="foot">${t('st_generated')} · ${fmtDate(new Date())}</div>
<script>window.onload=function(){setTimeout(function(){window.print()},300)}</script></body></html>`);
  w.document.close();
};

const workbook = (s, t) => {
  const aoa = [
    [s.rm.name], [t('st_title'), period(s)], [],
    [t('st_date'), t('st_desc'), t('expense'), t('income'), t('st_balance')],
    ...s.rows.map((r) => [fmtDate(r.date), r.description || '', r.type === 'expense' ? r.amount : '', r.type === 'income' ? r.amount : '', Math.abs(r.balanceAfter)]),
    [], [t('st_tincome'), '', '', s.income], [t('st_texpense'), '', s.expense], [t('st_closing'), '', '', '', s.closing],
  ];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [{ wch: 16 }, { wch: 34 }, { wch: 14 }, { wch: 14 }, { wch: 16 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Statement');
  return wb;
};

export const downloadExcel = (s, t) => XLSX.writeFile(workbook(s, t), fileName(s, 'xlsx'));

export const whatsappText = (s, t) =>
  [`*${s.rm.name}* – ${t('st_title')}`, period(s), '',
   `${t('st_tincome')}: ${formatMoney(s.income)}`, `${t('st_texpense')}: ${formatMoney(s.expense)}`,
   `*${t('st_closing')}: ${formatMoney(s.closing)}*`, '', t('st_generated')].filter((x) => x !== undefined).join('\n');

// Mobile: share the .xlsx file itself; desktop: send the summary text to the person's chat
export const shareWhatsApp = async (s, t) => {
  const text = whatsappText(s, t);
  try {
    const data = XLSX.write(workbook(s, t), { type: 'array', bookType: 'xlsx' });
    const file = new File([data], fileName(s, 'xlsx'), {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], text });
      return;
    }
  } catch (err) {
    if (err.name === 'AbortError') return;
  }
  let phone = (s.rm.phone || '').replace(/\D/g, '');
  if (phone.startsWith('0')) phone = '92' + phone.slice(1);
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
};
