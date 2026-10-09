import { useState, useMemo } from 'react';
import {
  Users, Plus, X, Phone, Mail, MapPin, FileText,
  Search, ChevronRight, Trash2, Edit3, Briefcase, DollarSign,
} from 'lucide-react';
import { useData } from '@/lib/data';
import { formatCurrency, formatDate } from '@/lib/format';
import { SERVICE_ICONS } from '@/lib/constants';
import ServiceIcon from '@/components/ServiceIcon';
import type { Customer } from '@/lib/types';

export default function Customers() {
  const { customers, jobs, invoices, addCustomer, updateCustomer, deleteCustomer } = useData();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const selected = customers.find(c => c.id === selectedId);

  const stats = useMemo(() => {
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
    const activeCustomers = new Set(jobs.filter(j => j.status !== 'complete' && j.customer_id).map(j => j.customer_id)).size;
    return { total: customers.length, totalRevenue, activeCustomers };
  }, [customers, invoices, jobs]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-bold text-navy-50 font-display">Customers</h2>
        <button onClick={() => setShowAdd(true)} className="btn-primary"><Plus className="w-4 h-4" /> New Customer</button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="card p-3"><div className="flex items-center gap-1.5 mb-1"><Users className="w-4 h-4 text-gold-400" /><span className="text-xs text-navy-300">Total</span></div><p className="text-base font-bold text-navy-50 font-display">{stats.total}</p></div>
        <div className="card p-3"><div className="flex items-center gap-1.5 mb-1"><Briefcase className="w-4 h-4 text-teal-400" /><span className="text-xs text-navy-300">Active</span></div><p className="text-base font-bold text-navy-50 font-display">{stats.activeCustomers}</p></div>
        <div className="card p-3"><div className="flex items-center gap-1.5 mb-1"><DollarSign className="w-4 h-4 text-success-400" /><span className="text-xs text-navy-300">Revenue</span></div><p className="text-base font-bold text-success-300 font-display">{formatCurrency(stats.totalRevenue)}</p></div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
        <input
          className="input pl-9"
          placeholder="Search by name, phone, email, or address..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        {filtered.map(c => {
          const jobCount = jobs.filter(j => j.customer_id === c.id).length;
          const invTotal = invoices.filter(i => i.customer_id === c.id).reduce((s, i) => s + i.amount, 0);
          return (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className="card card-hover p-3 w-full text-left group"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-navy-700 shrink-0">
                    <span className="text-sm font-bold text-gold-400">{c.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-navy-50 truncate">{c.name}</p>
                    <p className="text-xs text-navy-300 truncate">{c.phone || 'No phone'} · {jobCount} job{jobCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-gold-400">{formatCurrency(invTotal)}</span>
                  <ChevronRight className="w-4 h-4 text-navy-500 group-hover:text-gold-400 transition-all" />
                </div>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="card p-8 text-center"><Users className="w-8 h-8 text-navy-600 mx-auto mb-2" /><p className="text-sm text-navy-300">{search ? 'No customers match your search.' : 'No customers yet. Add your first customer.'}</p></div>
        )}
      </div>

      {selected && (
        <CustomerDetailDrawer
          customer={selected}
          jobs={jobs.filter(j => j.customer_id === selected.id)}
          invoices={invoices.filter(i => i.customer_id === selected.id)}
          onClose={() => setSelectedId(null)}
          onEdit={() => { setEditing(selected); setSelectedId(null); }}
          onDelete={async () => { await deleteCustomer(selected.id); setSelectedId(null); }}
        />
      )}

      {showAdd && (
        <CustomerFormModal
          onClose={() => setShowAdd(false)}
          onSave={async (c) => { await addCustomer(c); setShowAdd(false); }}
        />
      )}

      {editing && (
        <CustomerFormModal
          customer={editing}
          onClose={() => setEditing(null)}
          onSave={async (c) => { await updateCustomer(editing.id, c); setEditing(null); }}
        />
      )}
    </div>
  );
}

function CustomerDetailDrawer({ customer, jobs, invoices, onClose, onEdit, onDelete }: {
  customer: Customer;
  jobs: { id: string; service_key: string; status: string; value: number; scheduled_date: string | null; rating: number | null }[];
  invoices: { id: string; number: string; amount: number; status: string; paid_at: string | null }[];
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const totalOutstanding = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-navy-950/80 backdrop-blur-sm p-0 md:p-4" onClick={onClose}>
      <div className="card w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-b-none md:rounded-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-navy-800/95 backdrop-blur-sm border-b border-navy-700 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold-400/20">
              <span className="text-base font-bold text-gold-400">{customer.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-50">{customer.name}</h3>
              <p className="text-xs text-navy-300">Customer since {formatDate(customer.created_at)}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost p-2"><X className="w-4 h-4" /></button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="space-y-2">
            {customer.phone && <a href={`tel:${customer.phone}`} className="flex items-center gap-2 text-sm text-navy-100 hover:text-gold-400"><Phone className="w-4 h-4 text-navy-400" /> {customer.phone}</a>}
            {customer.email && <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-sm text-navy-100 hover:text-gold-400"><Mail className="w-4 h-4 text-navy-400" /> {customer.email}</a>}
            {customer.address && <p className="flex items-start gap-2 text-sm text-navy-100"><MapPin className="w-4 h-4 text-navy-400 shrink-0 mt-0.5" /> {customer.address}</p>}
            {customer.notes && <p className="flex items-start gap-2 text-sm text-navy-100"><FileText className="w-4 h-4 text-navy-400 shrink-0 mt-0.5" /> {customer.notes}</p>}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-success-900/30 border border-success-700/30 p-3"><p className="text-xs text-navy-300">Total Paid</p><p className="text-lg font-bold text-success-300 font-display">{formatCurrency(totalPaid)}</p></div>
            <div className="rounded-xl bg-gold-900/30 border border-gold-700/30 p-3"><p className="text-xs text-navy-300">Outstanding</p><p className="text-lg font-bold text-gold-300 font-display">{formatCurrency(totalOutstanding)}</p></div>
          </div>

          <div>
            <h4 className="section-title mb-2">Job History ({jobs.length})</h4>
            <div className="space-y-1.5">
              {jobs.map(job => (
                <div key={job.id} className="flex items-center gap-2.5 rounded-lg bg-navy-900 p-2.5">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-navy-700 shrink-0">
                    <ServiceIcon name={SERVICE_ICONS[job.service_key] || 'Wrench'} className="w-4 h-4 text-gold-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-navy-100 capitalize">{job.service_key.replace(/-/g, ' ')}</p>
                    <p className="text-xs text-navy-400">{job.status} · {job.scheduled_date ? formatDate(job.scheduled_date) : 'Unscheduled'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gold-400">{formatCurrency(job.value)}</p>
                    {job.rating !== null && <p className="text-xs text-gold-300">{job.rating}★</p>}
                  </div>
                </div>
              ))}
              {jobs.length === 0 && <p className="text-xs text-navy-400 text-center py-3">No jobs yet.</p>}
            </div>
          </div>

          <div>
            <h4 className="section-title mb-2">Invoices ({invoices.length})</h4>
            <div className="space-y-1.5">
              {invoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between rounded-lg bg-navy-900 p-2.5">
                  <div><p className="text-sm font-medium text-navy-100">{inv.number}</p><p className="text-xs text-navy-400 capitalize">{inv.status}</p></div>
                  <p className="text-sm font-bold text-gold-400">{formatCurrency(inv.amount)}</p>
                </div>
              ))}
              {invoices.length === 0 && <p className="text-xs text-navy-400 text-center py-3">No invoices yet.</p>}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-navy-700">
            <button onClick={onEdit} className="btn-secondary flex-1"><Edit3 className="w-4 h-4" /> Edit</button>
            {confirmDelete ? (
              <button onClick={onDelete} className="btn-primary flex-1 !bg-error-600 hover:!bg-error-500">Confirm Delete</button>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="btn-ghost flex-1 text-error-400 hover:text-error-300"><Trash2 className="w-4 h-4" /> Delete</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomerFormModal({ customer, onClose, onSave }: {
  customer?: Customer;
  onClose: () => void;
  onSave: (c: Omit<Customer, 'id' | 'created_at'>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    address: customer?.address || '',
    notes: customer?.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Customer name is required'); return; }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        notes: form.notes.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save customer');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-navy-950/80 backdrop-blur-sm p-0 md:p-4" onClick={onClose}>
      <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto rounded-b-none md:rounded-2xl p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-navy-50">{customer ? 'Edit Customer' : 'New Customer'}</h3>
          <button onClick={onClose} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><label className="label">Name *</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Smith" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="416-555-0100" /></div>
            <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@email.com" /></div>
          </div>
          <div><label className="label">Address</label><input className="input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="123 Main St, Toronto ON" /></div>
          <div><label className="label">Notes</label><textarea className="input min-h-[60px]" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Customer preferences, access notes, etc." /></div>
          {error && <p className="text-xs text-error-400">{error}</p>}
          <div className="flex items-center gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : customer ? 'Save Changes' : 'Add Customer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
