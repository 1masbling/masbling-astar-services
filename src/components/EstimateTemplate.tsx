import { forwardRef } from 'react';
import { formatCurrency, formatDate } from '@/lib/format';
import { COMPANY } from '@/lib/constants';
import type { Estimate, EstimateLineItem, Customer } from '@/lib/types';

interface EstimateTemplateProps {
  estimate: Estimate;
  items: EstimateLineItem[];
  customer?: Customer;
}

const EstimateTemplate = forwardRef<HTMLDivElement, EstimateTemplateProps>(
  ({ estimate, items, customer }, ref) => {
    const taxAmount = estimate.total - estimate.subtotal;

    return (
      <div ref={ref} className="estimate-print-root bg-white text-neutral-900 font-sans" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            .estimate-print-root, .estimate-print-root * { visibility: visible; }
            .estimate-print-root { position: absolute; left: 0; top: 0; width: 100%; max-width: none; }
            @page { margin: 0.5in; }
          }
          .estimate-print-root .ep-header { border-bottom: 3px solid #1e3a8a; }
          .estimate-print-root .ep-total-row { border-top: 2px solid #1e3a8a; }
        `}</style>

        {/* Header */}
        <div className="ep-header flex items-start justify-between pb-5 mb-6">
          <div className="flex items-center gap-3">
            <img src={COMPANY.logoUrl} alt={COMPANY.name} className="w-14 h-14 rounded-lg object-contain bg-neutral-100 p-1" />
            <div>
              <h1 className="text-xl font-bold text-blue-900 leading-tight">{COMPANY.name}</h1>
              <p className="text-xs text-neutral-500">{COMPANY.tagline}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{COMPANY.phone} · {COMPANY.email}</p>
              <p className="text-xs text-neutral-500">{COMPANY.hq}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-blue-900">ESTIMATE</h2>
            <p className="text-sm font-semibold text-neutral-700 mt-1">{estimate.number}</p>
            <p className="text-xs text-neutral-500 mt-0.5">Date: {formatDate(estimate.created_at)}</p>
            {estimate.expires_at && <p className="text-xs text-neutral-500">Valid Until: {formatDate(estimate.expires_at)}</p>}
          </div>
        </div>

        {/* Bill To */}
        <div className="flex justify-between mb-6 gap-6">
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-1.5">Prepared For</p>
            <p className="text-sm font-bold text-neutral-900">{estimate.customer_name}</p>
            {customer && (
              <>
                {customer.address && <p className="text-xs text-neutral-600">{customer.address}</p>}
                {customer.phone && <p className="text-xs text-neutral-600">{customer.phone}</p>}
                {customer.email && <p className="text-xs text-neutral-600">{customer.email}</p>}
              </>
            )}
          </div>
          <div className="flex-1 text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-1.5">Estimate Summary</p>
            <div className="inline-block text-left">
              <div className="flex justify-between gap-8 text-xs">
                <span className="text-neutral-500">Subtotal</span>
                <span className="font-semibold text-neutral-800">{formatCurrency(estimate.subtotal)}</span>
              </div>
              <div className="flex justify-between gap-8 text-xs">
                <span className="text-neutral-500">Tax ({estimate.tax_rate}%)</span>
                <span className="font-semibold text-neutral-800">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between gap-8 ep-total-row pt-1.5 mt-1.5">
                <span className="text-sm font-bold text-blue-900">Total</span>
                <span className="text-lg font-bold text-blue-900">{formatCurrency(estimate.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <table className="w-full mb-6 border-collapse">
          <thead>
            <tr className="bg-blue-900 text-white">
              <th className="text-left text-xs font-bold uppercase tracking-wider py-2.5 px-3 rounded-l-lg">Description</th>
              <th className="text-center text-xs font-bold uppercase tracking-wider py-2.5 px-3 w-16">Qty</th>
              <th className="text-right text-xs font-bold uppercase tracking-wider py-2.5 px-3 w-24">Unit Price</th>
              <th className="text-right text-xs font-bold uppercase tracking-wider py-2.5 px-3 w-28 rounded-r-lg">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id} className={i % 2 === 0 ? 'bg-neutral-50' : 'bg-white'}>
                <td className="text-sm text-neutral-800 py-2.5 px-3 border-b border-neutral-200">{item.description}</td>
                <td className="text-center text-sm text-neutral-700 py-2.5 px-3 border-b border-neutral-200">{item.quantity}</td>
                <td className="text-right text-sm text-neutral-700 py-2.5 px-3 border-b border-neutral-200">{formatCurrency(item.unit_price)}</td>
                <td className="text-right text-sm font-semibold text-neutral-900 py-2.5 px-3 border-b border-neutral-200">{formatCurrency(item.quantity * item.unit_price)}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={4} className="text-center text-sm text-neutral-400 py-6">No line items</td></tr>
            )}
          </tbody>
        </table>

        {/* Notes */}
        {estimate.notes && (
          <div className="mb-6 rounded-lg bg-neutral-100 border border-neutral-200 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-1.5">Project Notes</p>
            <p className="text-sm text-neutral-700 leading-relaxed">{estimate.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="ep-total-row border-t-2 border-blue-900 pt-5 mt-8">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">Acceptance</p>
              <p className="text-xs text-neutral-600 mb-3 max-w-xs">
                By signing below, I authorize Masbling Astar Services to proceed with the work described above at the stated price.
              </p>
              <div className="flex gap-6">
                <div>
                  <div className="border-b border-neutral-400 w-40 mb-1" />
                  <p className="text-[10px] text-neutral-500">Customer Signature</p>
                </div>
                <div>
                  <div className="border-b border-neutral-400 w-24 mb-1" />
                  <p className="text-[10px] text-neutral-500">Date</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-blue-900">{COMPANY.name}</p>
              <p className="text-xs text-neutral-500">{COMPANY.phone}</p>
              <p className="text-xs text-neutral-500">{COMPANY.website}</p>
              <p className="text-[10px] text-neutral-400 mt-1.5">Licensed & Insured · Brampton, ON</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

EstimateTemplate.displayName = 'EstimateTemplate';
export default EstimateTemplate;
