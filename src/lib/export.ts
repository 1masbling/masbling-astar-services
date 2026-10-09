import type { Job, Invoice } from './types';
import { formatCurrency, formatDate } from './format';

export function exportJobsCsv(jobs: Job[]) {
  const headers = ['Customer', 'Service', 'Status', 'Value', 'Scheduled', 'Address', 'Phone', 'Urgent', 'Notes'];
  const rows = jobs.map(j => [
    j.customer_name, j.service_key, j.status, j.value.toString(),
    j.scheduled_date || '', j.address, j.customer_phone,
    j.urgent ? 'Yes' : 'No', j.notes.replace(/"/g, '""'),
  ]);
  download([headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n'), 'masbling-jobs.csv');
}

export function exportInvoicesCsv(invoices: Invoice[]) {
  const headers = ['Invoice #', 'Customer', 'Amount', 'Status', 'Sent', 'Paid'];
  const rows = invoices.map(i => [
    i.number, i.customer_name, i.amount.toString(), i.status,
    i.sent_at ? formatDate(i.sent_at) : '', i.paid_at ? formatDate(i.paid_at) : '',
  ]);
  download([headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n'), 'masbling-invoices.csv');
}

function download(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export { formatCurrency, formatDate };
