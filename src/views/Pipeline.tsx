import { useState, useMemo } from 'react';
import {
  ChevronRight, Phone, MapPin, AlertTriangle, ArrowRight, Plus, Calendar, X,
  Wrench, Users, Receipt, CheckSquare, Repeat, Megaphone,
  Headphones, Camera, FileText, Clock, Star, Bell, Smartphone, CreditCard,
  HardHat, Grid3x3, List, DollarSign, CheckCircle2, Mail, MessageSquare,
} from 'lucide-react';
import { useData } from '@/lib/data';
import { formatCurrency, formatShortDate, formatDuration } from '@/lib/format';
import {
  JOB_STATUSES, JOB_STATUS_FLOW, INVOICE_STATUSES, ESTIMATE_STATUSES,
  REVIEW_STATUSES, CAMPAIGN_STATUSES, TICKET_PRIORITIES, SERVICE_ICONS, SERVICE_FEE,
} from '@/lib/constants';
import { JobStatusBadge } from '@/components/StatusBadges';
import ServiceIcon from '@/components/ServiceIcon';
import type {
  Job, JobStatus, Invoice, Estimate, Payment, ReviewRequest, CsrTicket, Campaign,
  Checklist, Notification, ViewKey,
} from '@/lib/types';

interface PipelineProps {
  serviceFilter: string | null;
  onClearFilter: () => void;
  onNavigate: (view: ViewKey) => void;
}

type CategoryKey =
  | 'jobs' | 'estimates' | 'invoices' | 'payments'
  | 'customers' | 'reviews' | 'tickets' | 'notifications'
  | 'schedules' | 'checklists' | 'time' | 'photos'
  | 'campaigns' | 'services' | 'technicians' | 'lineItems';

const CATEGORIES: { key: CategoryKey; label: string; icon: typeof Wrench }[] = [
  { key: 'jobs', label: 'Jobs', icon: Wrench },
  { key: 'estimates', label: 'Estimates', icon: FileText },
  { key: 'invoices', label: 'Invoices', icon: Receipt },
  { key: 'payments', label: 'Payments', icon: CreditCard },
  { key: 'customers', label: 'Customers', icon: Users },
  { key: 'reviews', label: 'Reviews', icon: Star },
  { key: 'tickets', label: 'Support', icon: Headphones },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'schedules', label: 'Schedules', icon: Repeat },
  { key: 'checklists', label: 'Checklists', icon: CheckSquare },
  { key: 'time', label: 'Time', icon: Clock },
  { key: 'photos', label: 'Photos', icon: Camera },
  { key: 'campaigns', label: 'Campaigns', icon: Megaphone },
  { key: 'services', label: 'Services', icon: Grid3x3 },
  { key: 'technicians', label: 'Techs', icon: HardHat },
  { key: 'lineItems', label: 'Line Items', icon: List },
];

export default function Pipeline({ serviceFilter, onClearFilter }: PipelineProps) {
  const data = useData();
  const [category, setCategory] = useState<CategoryKey>('jobs');

  const counts: Record<CategoryKey, number> = {
    jobs: data.jobs.length,
    estimates: data.estimates.length,
    invoices: data.invoices.length,
    payments: data.payments.length,
    customers: data.customers.length,
    reviews: data.reviews.length,
    tickets: data.tickets.length,
    notifications: data.notifications.length,
    schedules: data.schedules.length,
    checklists: data.checklists.length,
    time: data.timeEntries.length,
    photos: data.photos.length,
    campaigns: data.campaigns.length,
    services: data.services.length,
    technicians: data.technicians.length,
    lineItems: data.lineItems.length,
  };

  const serviceLabel = (key: string) => data.services.find(s => s.key === key)?.label || key;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-navy-50 font-display">Pipeline</h2>
          {serviceFilter && category === 'jobs' && (
            <button onClick={onClearFilter} className="inline-flex items-center gap-1 rounded-full bg-gold-900/40 px-2.5 py-1 text-xs font-semibold text-gold-300 hover:bg-gold-900/60">
              {serviceLabel(serviceFilter)} <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Category selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              category === cat.key ? 'bg-gold-400 text-navy-950' : 'bg-navy-800 text-navy-300 hover:bg-navy-700'
            }`}
          >
            <cat.icon className="w-3.5 h-3.5" /> {cat.label}
            <span className={`text-[10px] ${category === cat.key ? 'text-navy-700' : 'text-navy-500'}`}>{counts[cat.key]}</span>
          </button>
        ))}
      </div>

      {category === 'jobs' && <JobsBoard data={data} serviceFilter={serviceFilter} serviceLabel={serviceLabel} />}
      {category === 'estimates' && <EstimatesBoard data={data} />}
      {category === 'invoices' && <InvoicesBoard data={data} />}
      {category === 'payments' && <PaymentsBoard data={data} />}
      {category === 'customers' && <CustomersList data={data} />}
      {category === 'reviews' && <ReviewsBoard data={data} />}
      {category === 'tickets' && <TicketsBoard data={data} />}
      {category === 'notifications' && <NotificationsBoard data={data} />}
      {category === 'schedules' && <SchedulesList data={data} serviceLabel={serviceLabel} />}
      {category === 'checklists' && <ChecklistsList data={data} />}
      {category === 'time' && <TimeList data={data} />}
      {category === 'photos' && <PhotosGallery data={data} />}
      {category === 'campaigns' && <CampaignsBoard data={data} />}
      {category === 'services' && <ServicesGrid data={data} />}
      {category === 'technicians' && <TechniciansGrid data={data} />}
      {category === 'lineItems' && <LineItemsList data={data} />}
    </div>
  );
}

// ── Shared board components ────────────────────────────────

function BoardColumn({ title, count, color, bg, border, children }: {
  title: string; count: number; color: string; bg: string; border: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className={`flex items-center justify-between rounded-xl ${bg} border ${border} px-3 py-2`}>
        <span className={`text-xs font-bold ${color}`}>{title}</span>
        <span className={`text-xs font-bold ${color}`}>{count}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function EmptyColumn() {
  return <div className="rounded-xl border border-dashed border-navy-700 p-4 text-center"><p className="text-xs text-navy-400">None</p></div>;
}

function DetailRow({ icon: Icon, children }: { icon: typeof Phone; children: React.ReactNode }) {
  return <p className="flex items-start gap-1.5 text-xs text-navy-200"><Icon className="w-3.5 h-3.5 text-navy-400 shrink-0 mt-0.5" /> {children}</p>;
}

// ── 1. Jobs Board ──────────────────────────────────────────
function JobsBoard({ data, serviceFilter, serviceLabel }: {
  data: ReturnType<typeof useData>;
  serviceFilter: string | null;
  serviceLabel: (key: string) => string;
}) {
  const { jobs, services, updateJobStatus, addJob } = data;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');

  const filteredJobs = useMemo(() => jobs
    .filter(j => {
      if (serviceFilter && j.service_key !== serviceFilter) return false;
      if (statusFilter !== 'all' && j.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), [jobs, serviceFilter, statusFilter]);

  const jobsByStatus = useMemo(() => {
    const groups: Record<JobStatus, Job[]> = { estimate: [], scheduled: [], 'in-progress': [], complete: [] };
    filteredJobs.forEach(j => groups[j.status]?.push(j));
    return groups;
  }, [filteredJobs]);

  const advanceStatus = async (job: Job) => {
    const idx = JOB_STATUS_FLOW.indexOf(job.status);
    if (idx < JOB_STATUS_FLOW.length - 1) await updateJobStatus(job.id, JOB_STATUS_FLOW[idx + 1]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button onClick={() => setStatusFilter('all')} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${statusFilter === 'all' ? 'bg-navy-600 text-navy-50' : 'bg-navy-800 text-navy-300 hover:bg-navy-700'}`}>All ({jobs.length})</button>
          {JOB_STATUSES.map(s => (
            <button key={s.key} onClick={() => setStatusFilter(s.key)} className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${statusFilter === s.key ? `${s.bg} ${s.color}` : 'bg-navy-800 text-navy-300 hover:bg-navy-700'}`}>{s.label} ({jobsByStatus[s.key].length})</button>
          ))}
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-xs py-2"><Plus className="w-3.5 h-3.5" /> New Job</button>
      </div>

      <div className="hidden md:grid grid-cols-4 gap-3">
        {JOB_STATUSES.map(col => (
          <BoardColumn key={col.key} title={col.label} count={jobsByStatus[col.key].length} color={col.color} bg={col.bg} border={col.border}>
            {jobsByStatus[col.key].map(job => <JobCard key={job.id} job={job} serviceLabel={serviceLabel(job.service_key)} onAdvance={advanceStatus} expanded={false} onToggle={() => {}} />)}
            {jobsByStatus[col.key].length === 0 && <EmptyColumn />}
          </BoardColumn>
        ))}
      </div>

      <div className="md:hidden space-y-2">
        {filteredJobs.map(job => <JobCard key={job.id} job={job} serviceLabel={serviceLabel(job.service_key)} onAdvance={advanceStatus} expanded={expandedId === job.id} onToggle={() => setExpandedId(prev => prev === job.id ? null : job.id)} />)}
        {filteredJobs.length === 0 && <div className="card p-8 text-center"><p className="text-sm text-navy-300">No jobs match this filter.</p></div>}
      </div>

      {showAdd && <AddJobModal services={services} onClose={() => setShowAdd(false)} onAdd={async (job) => { await addJob(job); setShowAdd(false); }} />}
    </div>
  );
}

function JobCard({ job, serviceLabel, onAdvance, expanded, onToggle }: {
  job: Job; serviceLabel: string; onAdvance: (job: Job) => void; expanded: boolean; onToggle: () => void;
}) {
  const canAdvance = job.status !== 'complete';
  const nextIdx = JOB_STATUS_FLOW.indexOf(job.status) + 1;
  const nextStatus = nextIdx < JOB_STATUS_FLOW.length ? JOB_STATUS_FLOW[nextIdx] : null;
  const nextLabel = JOB_STATUSES.find(s => s.key === nextStatus)?.label;
  const isNew = (Date.now() - new Date(job.created_at).getTime()) < 48 * 60 * 60 * 1000;

  return (
    <div className={`card card-hover overflow-hidden ${job.urgent ? 'border-accent-700/50' : ''}`}>
      <button onClick={onToggle} className="w-full p-3 text-left">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-navy-700 shrink-0"><ServiceIcon name={SERVICE_ICONS[job.service_key] || 'Wrench'} className="w-4 h-4 text-gold-400" /></div>
            <div className="min-w-0"><p className="text-sm font-semibold text-navy-50 truncate">{job.customer_name}</p><p className="text-xs text-navy-300 truncate">{serviceLabel}</p></div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {isNew && <span className="inline-flex items-center gap-0.5 rounded-full bg-success-900/50 px-1.5 py-0.5 text-[10px] font-bold text-success-300 ring-1 ring-success-700/40 animate-pulse-soft">NEW</span>}
            {job.urgent && <span className="inline-flex items-center gap-0.5 rounded-full bg-accent-900/40 px-1.5 py-0.5 text-[10px] font-bold text-accent-300"><AlertTriangle className="w-3 h-3" /> URGENT</span>}
            <JobStatusBadge status={job.status} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gold-400">{formatCurrency(job.value)}</span>
          {job.scheduled_date && <span className="inline-flex items-center gap-1 text-xs text-navy-300"><Calendar className="w-3 h-3" /> {formatShortDate(job.scheduled_date)}</span>}
        </div>
      </button>
      {expanded && (
        <div className="border-t border-navy-700 px-3 py-3 space-y-2 animate-slide-up">
          {job.address && <DetailRow icon={MapPin}>{job.address}</DetailRow>}
          {job.customer_phone && <a href={`tel:${job.customer_phone}`} className="flex items-center gap-1.5 text-xs text-navy-200 hover:text-gold-400"><Phone className="w-3.5 h-3.5 text-navy-400" /> {job.customer_phone}</a>}
          {job.notes && <p className="text-xs text-navy-200 bg-navy-900 rounded-lg p-2">{job.notes}</p>}
          {job.rating !== null && <p className="text-xs text-gold-300">Rating: {job.rating}★</p>}
          {canAdvance && nextStatus && <button onClick={(e) => { e.stopPropagation(); onAdvance(job); }} className="btn-primary w-full text-xs py-2"><ArrowRight className="w-3.5 h-3.5" /> Advance to {nextLabel}</button>}
        </div>
      )}
      <div className="hidden md:block border-t border-navy-700 px-3 py-2">
        {canAdvance && nextStatus ? (
          <button onClick={() => onAdvance(job)} className="text-xs font-semibold text-gold-400 hover:text-gold-300 inline-flex items-center gap-1 transition-all">Advance to {nextLabel} <ChevronRight className="w-3 h-3" /></button>
        ) : <span className="text-xs text-navy-400">Completed</span>}
      </div>
    </div>
  );
}

// ── 2. Estimates Board ─────────────────────────────────────
function EstimatesBoard({ data }: { data: ReturnType<typeof useData> }) {
  const { estimates, lineItems } = data;
  const byStatus = useMemo(() => {
    const groups: Record<string, Estimate[]> = { draft: [], sent: [], approved: [], declined: [], expired: [] };
    estimates.forEach(e => groups[e.status]?.push(e));
    return groups;
  }, [estimates]);

  return (
    <div className="hidden md:grid grid-cols-5 gap-3">
      {ESTIMATE_STATUSES.map(col => (
        <BoardColumn key={col.key} title={col.label} count={byStatus[col.key].length} color={col.color} bg={col.bg} border="border-navy-700">
          {byStatus[col.key].map(est => (
            <div key={est.id} className="card card-hover p-3">
              <p className="text-sm font-semibold text-navy-50 truncate">{est.number}</p>
              <p className="text-xs text-navy-300 truncate mb-2">{est.customer_name}</p>
              <p className="text-sm font-bold text-gold-400">{formatCurrency(est.total)}</p>
              {est.expires_at && <p className="text-xs text-navy-400 mt-1">Expires {formatShortDate(est.expires_at)}</p>}
              {(lineItems.filter(li => li.estimate_id === est.id)).length > 0 && <p className="text-xs text-navy-400 mt-1">{lineItems.filter(li => li.estimate_id === est.id).length} line items</p>}
            </div>
          ))}
          {byStatus[col.key].length === 0 && <EmptyColumn />}
        </BoardColumn>
      ))}
    </div>
  );
}

// ── 3. Invoices Board ──────────────────────────────────────
function InvoicesBoard({ data }: { data: ReturnType<typeof useData> }) {
  const { invoices } = data;
  const byStatus = useMemo(() => {
    const groups: Record<string, Invoice[]> = { draft: [], sent: [], paid: [], overdue: [] };
    invoices.forEach(i => groups[i.status]?.push(i));
    return groups;
  }, [invoices]);

  return (
    <div className="hidden md:grid grid-cols-4 gap-3">
      {INVOICE_STATUSES.map(col => (
        <BoardColumn key={col.key} title={col.label} count={byStatus[col.key].length} color={col.color} bg={col.bg} border="border-navy-700">
          {byStatus[col.key].map(inv => (
            <div key={inv.id} className="card card-hover p-3">
              <p className="text-sm font-semibold text-navy-50 truncate">{inv.number}</p>
              <p className="text-xs text-navy-300 truncate mb-2">{inv.customer_name}</p>
              <p className="text-sm font-bold text-gold-400">{formatCurrency(inv.amount)}</p>
              {inv.sent_at && <p className="text-xs text-navy-400 mt-1">Sent {formatShortDate(inv.sent_at)}</p>}
              {inv.paid_at && <p className="text-xs text-success-400 mt-1">Paid {formatShortDate(inv.paid_at)}</p>}
            </div>
          ))}
          {byStatus[col.key].length === 0 && <EmptyColumn />}
        </BoardColumn>
      ))}
    </div>
  );
}

// ── 4. Payments Board ──────────────────────────────────────
function PaymentsBoard({ data }: { data: ReturnType<typeof useData> }) {
  const { payments } = data;
  const statuses = [
    { key: 'pending', label: 'Pending', color: 'text-gold-300', bg: 'bg-gold-900/40' },
    { key: 'confirmed', label: 'Confirmed', color: 'text-success-300', bg: 'bg-success-900/40' },
    { key: 'failed', label: 'Failed', color: 'text-error-300', bg: 'bg-error-900/40' },
  ] as const;

  const byStatus = useMemo(() => {
    const groups: Record<string, Payment[]> = { pending: [], confirmed: [], failed: [] };
    payments.forEach(p => groups[p.status]?.push(p));
    return groups;
  }, [payments]);

  return (
    <div className="hidden md:grid grid-cols-3 gap-3">
      {statuses.map(col => (
        <BoardColumn key={col.key} title={col.label} count={byStatus[col.key].length} color={col.color} bg={col.bg} border="border-navy-700">
          {byStatus[col.key].map(p => (
            <div key={p.id} className="card card-hover p-3">
              <div className="flex items-center gap-2 mb-1">
                {p.method === 'etransfer' ? <Smartphone className="w-4 h-4 text-teal-400" /> : p.method === 'cash' ? <DollarSign className="w-4 h-4 text-success-400" /> : <CreditCard className="w-4 h-4 text-accent-400" />}
                <p className="text-sm font-semibold text-navy-50 truncate">{p.customer_name}</p>
              </div>
              <p className="text-sm font-bold text-gold-400">{formatCurrency(p.amount)}</p>
              <p className="text-xs text-navy-400 mt-1 capitalize">{p.method} · {p.reference || '—'}</p>
              {p.confirmed_at && <p className="text-xs text-success-400 mt-1">Confirmed {formatShortDate(p.confirmed_at)}</p>}
            </div>
          ))}
          {byStatus[col.key].length === 0 && <EmptyColumn />}
        </BoardColumn>
      ))}
    </div>
  );
}

// ── 5. Customers List ──────────────────────────────────────
function CustomersList({ data }: { data: ReturnType<typeof useData> }) {
  const { customers, jobs } = data;
  return (
    <div className="space-y-2">
      {customers.map(c => {
        const jobCount = jobs.filter(j => j.customer_name === c.name).length;
        return (
          <div key={c.id} className="card card-hover p-3 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-navy-700 shrink-0"><Users className="w-5 h-5 text-gold-400" /></div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-navy-50 truncate">{c.name}</p>
              <div className="flex items-center gap-3 text-xs text-navy-300">
                {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {c.phone}</span>}
                {c.email && <span className="flex items-center gap-1 truncate"><Mail className="w-3 h-3" /> {c.email}</span>}
              </div>
              {c.address && <p className="text-xs text-navy-400 truncate mt-0.5"><MapPin className="w-3 h-3 inline" /> {c.address}</p>}
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-navy-300">{jobCount} job{jobCount !== 1 ? 's' : ''}</p>
              <p className="text-[10px] text-navy-500">{formatShortDate(c.created_at)}</p>
            </div>
          </div>
        );
      })}
      {customers.length === 0 && <div className="card p-8 text-center"><Users className="w-8 h-8 text-navy-600 mx-auto mb-2" /><p className="text-sm text-navy-300">No customers yet.</p></div>}
    </div>
  );
}

// ── 6. Reviews Board ───────────────────────────────────────
function ReviewsBoard({ data }: { data: ReturnType<typeof useData> }) {
  const { reviews } = data;
  const byStatus = useMemo(() => {
    const groups: Record<string, ReviewRequest[]> = { pending: [], requested: [], received: [], declined: [] };
    reviews.forEach(r => groups[r.status]?.push(r));
    return groups;
  }, [reviews]);

  return (
    <div className="hidden md:grid grid-cols-4 gap-3">
      {REVIEW_STATUSES.map(col => (
        <BoardColumn key={col.key} title={col.label} count={byStatus[col.key].length} color={col.color} bg={col.bg} border="border-navy-700">
          {byStatus[col.key].map(r => (
            <div key={r.id} className="card card-hover p-3">
              <div className="flex items-center gap-2 mb-1"><Star className="w-4 h-4 text-gold-400" /><p className="text-sm font-semibold text-navy-50 truncate">{r.customer_name}</p></div>
              {r.rating !== null && <p className="text-xs text-gold-300 mb-1">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</p>}
              {r.review_text && <p className="text-xs text-navy-200 bg-navy-900 rounded-lg p-2 line-clamp-2">{r.review_text}</p>}
              <p className="text-xs text-navy-400 mt-1">{formatShortDate(r.created_at)}</p>
            </div>
          ))}
          {byStatus[col.key].length === 0 && <EmptyColumn />}
        </BoardColumn>
      ))}
    </div>
  );
}

// ── 7. Tickets Board ───────────────────────────────────────
function TicketsBoard({ data }: { data: ReturnType<typeof useData> }) {
  const { tickets } = data;
  const open = tickets.filter(t => t.status === 'open');
  const resolved = tickets.filter(t => t.status === 'resolved');

  return (
    <div className="hidden md:grid grid-cols-2 gap-3">
      <BoardColumn title="Open" count={open.length} color="text-gold-300" bg="bg-gold-900/40" border="border-gold-700">
        {open.map(t => <TicketCard key={t.id} ticket={t} />)}
        {open.length === 0 && <EmptyColumn />}
      </BoardColumn>
      <BoardColumn title="Resolved" count={resolved.length} color="text-success-300" bg="bg-success-900/40" border="border-success-700">
        {resolved.map(t => <TicketCard key={t.id} ticket={t} />)}
        {resolved.length === 0 && <EmptyColumn />}
      </BoardColumn>
    </div>
  );
}

function TicketCard({ ticket }: { ticket: CsrTicket }) {
  const prio = TICKET_PRIORITIES.find(p => p.key === ticket.priority);
  return (
    <div className="card card-hover p-3">
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-sm font-semibold text-navy-50 truncate">{ticket.subject}</p>
        {prio && <span className={`shrink-0 rounded-full ${prio.bg} px-1.5 py-0.5 text-[10px] font-bold ${prio.color}`}>{prio.label}</span>}
      </div>
      <p className="text-xs text-navy-300 truncate">{ticket.customer_name}</p>
      <p className="text-xs text-navy-400 mt-1">{formatShortDate(ticket.created_at)}</p>
    </div>
  );
}

// ── 8. Notifications Board ─────────────────────────────────
function NotificationsBoard({ data }: { data: ReturnType<typeof useData> }) {
  const { notifications } = data;
  const statuses = [
    { key: 'sent', label: 'Sent', color: 'text-success-300', bg: 'bg-success-900/40' },
    { key: 'draft', label: 'Draft', color: 'text-navy-200', bg: 'bg-navy-600' },
    { key: 'failed', label: 'Failed', color: 'text-error-300', bg: 'bg-error-900/40' },
  ] as const;

  const byStatus = useMemo(() => {
    const groups: Record<string, Notification[]> = { sent: [], draft: [], failed: [] };
    notifications.forEach(n => groups[n.status]?.push(n));
    return groups;
  }, [notifications]);

  return (
    <div className="hidden md:grid grid-cols-3 gap-3">
      {statuses.map(col => (
        <BoardColumn key={col.key} title={col.label} count={byStatus[col.key].length} color={col.color} bg={col.bg} border="border-navy-700">
          {byStatus[col.key].map(n => (
            <div key={n.id} className="card card-hover p-3">
              <div className="flex items-center gap-2 mb-1">
                {n.type === 'sms' ? <MessageSquare className="w-4 h-4 text-teal-400" /> : <Mail className="w-4 h-4 text-accent-400" />}
                <p className="text-sm font-semibold text-navy-50 truncate">{n.subject}</p>
              </div>
              <p className="text-xs text-navy-300 truncate">{n.recipient_name} · {n.recipient}</p>
              <p className="text-xs text-navy-400 mt-1 line-clamp-2">{n.body}</p>
              {n.sent_at && <p className="text-xs text-navy-400 mt-1">{formatShortDate(n.sent_at)}</p>}
            </div>
          ))}
          {byStatus[col.key].length === 0 && <EmptyColumn />}
        </BoardColumn>
      ))}
    </div>
  );
}

// ── 9. Schedules List ──────────────────────────────────────
function SchedulesList({ data, serviceLabel }: { data: ReturnType<typeof useData>; serviceLabel: (key: string) => string }) {
  const { schedules } = data;
  return (
    <div className="space-y-2">
      {schedules.map(s => (
        <div key={s.id} className="card card-hover p-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-navy-700 shrink-0"><Repeat className="w-5 h-5 text-teal-400" /></div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-navy-50 truncate">{s.customer_name}</p>
            <p className="text-xs text-navy-300 truncate">{serviceLabel(s.service_key)} · {s.frequency}</p>
            {s.address && <p className="text-xs text-navy-400 truncate"><MapPin className="w-3 h-3 inline" /> {s.address}</p>}
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-navy-300">Next: {formatShortDate(s.next_run)}</p>
            <span className={`text-[10px] font-bold ${s.active ? 'text-success-400' : 'text-navy-500'}`}>{s.active ? 'Active' : 'Paused'}</span>
          </div>
        </div>
      ))}
      {schedules.length === 0 && <div className="card p-8 text-center"><Repeat className="w-8 h-8 text-navy-600 mx-auto mb-2" /><p className="text-sm text-navy-300">No recurring schedules.</p></div>}
    </div>
  );
}

// ── 10. Checklists List ────────────────────────────────────
function ChecklistsList({ data }: { data: ReturnType<typeof useData> }) {
  const { checklists, jobs } = data;
  const grouped = useMemo(() => {
    const map = new Map<string, Checklist[]>();
    checklists.forEach(c => {
      const arr = map.get(c.job_id) || [];
      arr.push(c);
      map.set(c.job_id, arr);
    });
    return map;
  }, [checklists]);

  return (
    <div className="space-y-3">
      {Array.from(grouped.entries()).map(([jobId, items]) => {
        const job = jobs.find(j => j.id === jobId);
        const done = items.filter(i => i.completed).length;
        return (
          <div key={jobId} className="card p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-navy-50 truncate">{job?.customer_name || 'Unknown Job'}</p>
              <span className="text-xs text-navy-300">{done}/{items.length} done</span>
            </div>
            <div className="w-full h-1.5 bg-navy-800 rounded-full mb-2"><div className="h-full rounded-full bg-success-400 transition-all" style={{ width: `${(done / items.length) * 100}%` }} /></div>
            <div className="space-y-1">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${item.completed ? 'text-success-400' : 'text-navy-600'}`} />
                  <span className={item.completed ? 'text-navy-400 line-through' : 'text-navy-200'}>{item.item_text}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {checklists.length === 0 && <div className="card p-8 text-center"><CheckSquare className="w-8 h-8 text-navy-600 mx-auto mb-2" /><p className="text-sm text-navy-300">No checklists yet.</p></div>}
    </div>
  );
}

// ── 11. Time Entries List ──────────────────────────────────
function TimeList({ data }: { data: ReturnType<typeof useData> }) {
  const { timeEntries, technicians, jobs } = data;
  const techName = (id: string | null) => technicians.find(t => t.id === id)?.name || 'Unassigned';
  const jobName = (id: string | null) => jobs.find(j => j.id === id)?.customer_name || '—';

  return (
    <div className="space-y-2">
      {timeEntries.map(te => (
        <div key={te.id} className="card card-hover p-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-navy-700 shrink-0"><Clock className="w-5 h-5 text-gold-400" /></div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-navy-50 truncate">{techName(te.technician_id)}</p>
            <p className="text-xs text-navy-300 truncate">Job: {jobName(te.job_id)}</p>
            {te.notes && <p className="text-xs text-navy-400 truncate">{te.notes}</p>}
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold text-gold-400">{formatDuration(te.duration_minutes)}</p>
            <p className="text-[10px] text-navy-400">{te.clock_out ? 'Clocked out' : <span className="text-success-400">Active</span>}</p>
            <p className="text-[10px] text-navy-500">{formatShortDate(te.clock_in)}</p>
          </div>
        </div>
      ))}
      {timeEntries.length === 0 && <div className="card p-8 text-center"><Clock className="w-8 h-8 text-navy-600 mx-auto mb-2" /><p className="text-sm text-navy-300">No time entries yet.</p></div>}
    </div>
  );
}

// ── 12. Photos Gallery ─────────────────────────────────────
function PhotosGallery({ data }: { data: ReturnType<typeof useData> }) {
  const { photos, jobs } = data;
  const jobName = (id: string) => jobs.find(j => j.id === id)?.customer_name || 'Unknown';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {photos.map(ph => (
        <div key={ph.id} className="card overflow-hidden group">
          <div className="aspect-square bg-navy-800 overflow-hidden">
            <img src={ph.photo_url} alt={ph.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          </div>
          <div className="p-2">
            <p className="text-xs font-semibold text-navy-100 truncate">{jobName(ph.job_id)}</p>
            {ph.caption && <p className="text-[10px] text-navy-400 truncate">{ph.caption}</p>}
            <p className="text-[10px] text-navy-500">{formatShortDate(ph.created_at)}</p>
          </div>
        </div>
      ))}
      {photos.length === 0 && <div className="card p-8 text-center col-span-full"><Camera className="w-8 h-8 text-navy-600 mx-auto mb-2" /><p className="text-sm text-navy-300">No job photos yet.</p></div>}
    </div>
  );
}

// ── 13. Campaigns Board ────────────────────────────────────
function CampaignsBoard({ data }: { data: ReturnType<typeof useData> }) {
  const { campaigns } = data;
  const byStatus = useMemo(() => {
    const groups: Record<string, Campaign[]> = { active: [], paused: [], draft: [] };
    campaigns.forEach(c => groups[c.status]?.push(c));
    return groups;
  }, [campaigns]);

  return (
    <div className="hidden md:grid grid-cols-3 gap-3">
      {CAMPAIGN_STATUSES.map(col => (
        <BoardColumn key={col.key} title={col.label} count={byStatus[col.key].length} color={col.color} bg={col.bg} border="border-navy-700">
          {byStatus[col.key].map(c => (
            <div key={c.id} className="card card-hover p-3">
              <div className="flex items-center gap-2 mb-1"><Megaphone className="w-4 h-4 text-accent-400" /><p className="text-sm font-semibold text-navy-50 truncate">{c.name}</p></div>
              <p className="text-xs text-navy-300">{c.platform}</p>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="text-navy-300">Reach: <span className="font-bold text-navy-100">{c.reach}</span></span>
                <span className="text-navy-300">Leads: <span className="font-bold text-gold-400">{c.leads}</span></span>
              </div>
            </div>
          ))}
          {byStatus[col.key].length === 0 && <EmptyColumn />}
        </BoardColumn>
      ))}
    </div>
  );
}

// ── 14. Services Grid ──────────────────────────────────────
function ServicesGrid({ data }: { data: ReturnType<typeof useData> }) {
  const { services } = data;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {services.map(s => (
        <div key={s.id} className="card p-3 text-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-navy-700 mx-auto mb-2"><ServiceIcon name={SERVICE_ICONS[s.key] || 'Wrench'} className="w-5 h-5 text-gold-400" /></div>
          <p className="text-sm font-semibold text-navy-50">{s.label}</p>
          <span className={`text-[10px] font-bold ${s.active ? 'text-success-400' : 'text-navy-500'}`}>{s.active ? 'Active' : 'Inactive'}</span>
        </div>
      ))}
      {services.length === 0 && <div className="card p-8 text-center col-span-full"><Grid3x3 className="w-8 h-8 text-navy-600 mx-auto mb-2" /><p className="text-sm text-navy-300">No services configured.</p></div>}
    </div>
  );
}

// ── 15. Technicians Grid ───────────────────────────────────
function TechniciansGrid({ data }: { data: ReturnType<typeof useData> }) {
  const { technicians } = data;
  const colors: Record<string, { color: string; bg: string; border: string; dot: string }> = {
    gold: { color: 'text-gold-300', bg: 'bg-gold-900/40', border: 'border-gold-700', dot: 'bg-gold-400' },
    teal: { color: 'text-teal-300', bg: 'bg-teal-900/40', border: 'border-teal-700', dot: 'bg-teal-400' },
    accent: { color: 'text-accent-300', bg: 'bg-accent-900/40', border: 'border-accent-700', dot: 'bg-accent-400' },
    success: { color: 'text-success-300', bg: 'bg-success-900/40', border: 'border-success-700', dot: 'bg-success-400' },
    warning: { color: 'text-warning-300', bg: 'bg-warning-900/40', border: 'border-warning-700', dot: 'bg-warning-400' },
    error: { color: 'text-error-300', bg: 'bg-error-900/40', border: 'border-error-700', dot: 'bg-error-400' },
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {technicians.map(t => {
        const c = colors[t.color] || colors.gold;
        return (
          <div key={t.id} className={`card p-3 text-center ${t.active ? c.border : 'border-navy-700'}`}>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${c.bg} border ${c.border} mx-auto mb-2`}><HardHat className={`w-5 h-5 ${c.color}`} /></div>
            <p className="text-sm font-semibold text-navy-50">{t.name}</p>
            <p className="text-xs text-navy-300">{t.role}</p>
            {t.phone && <p className="text-xs text-navy-400 mt-1 flex items-center justify-center gap-1"><Phone className="w-3 h-3" /> {t.phone}</p>}
            <span className={`text-[10px] font-bold ${t.active ? 'text-success-400' : 'text-navy-500'}`}>{t.active ? 'Active' : 'Inactive'}</span>
          </div>
        );
      })}
      {technicians.length === 0 && <div className="card p-8 text-center col-span-full"><HardHat className="w-8 h-8 text-navy-600 mx-auto mb-2" /><p className="text-sm text-navy-300">No technicians yet.</p></div>}
    </div>
  );
}

// ── 16. Line Items List ────────────────────────────────────
function LineItemsList({ data }: { data: ReturnType<typeof useData> }) {
  const { lineItems, estimates } = data;
  const estNumber = (id: string) => estimates.find(e => e.id === id)?.number || '—';

  return (
    <div className="space-y-2">
      {lineItems.map(li => (
        <div key={li.id} className="card card-hover p-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-navy-700 shrink-0"><List className="w-4 h-4 text-navy-300" /></div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-navy-100 truncate">{li.description}</p>
            <p className="text-xs text-navy-400">Estimate {estNumber(li.estimate_id)} · Qty {li.quantity}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold text-gold-400">{formatCurrency(li.unit_price)}</p>
            <p className="text-xs text-navy-400">{formatCurrency(li.unit_price * li.quantity)} total</p>
          </div>
        </div>
      ))}
      {lineItems.length === 0 && <div className="card p-8 text-center"><List className="w-8 h-8 text-navy-600 mx-auto mb-2" /><p className="text-sm text-navy-300">No estimate line items yet.</p></div>}
    </div>
  );
}

// ── Add Job Modal (unchanged) ──────────────────────────────
interface AddJobModalProps {
  services: { key: string; label: string }[];
  onClose: () => void;
  onAdd: (job: Omit<Job, 'id' | 'created_at'>) => Promise<void>;
}

function AddJobModal({ services, onClose, onAdd }: AddJobModalProps) {
  const [form, setForm] = useState({
    service_key: services[0]?.key || 'gutter',
    customer_name: '', customer_phone: '', address: '', value: String(SERVICE_FEE), scheduled_date: '', notes: '', urgent: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name.trim()) { setError('Customer name is required'); return; }
    setSaving(true);
    setError(null);
    try {
      await onAdd({
        service_key: form.service_key, customer_id: null, customer_name: form.customer_name.trim(), customer_phone: form.customer_phone.trim(),
        address: form.address.trim(), status: 'estimate', urgent: form.urgent, value: parseFloat(form.value) || 0,
        scheduled_date: form.scheduled_date || null, time_window: null, technician_id: null, rating: null, notes: form.notes.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add job');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-navy-950/80 backdrop-blur-sm p-0 md:p-4" onClick={onClose}>
      <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto rounded-b-none md:rounded-2xl p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-navy-50">New Job</h3>
          <button onClick={onClose} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label">Service</label>
            <select className="input" value={form.service_key} onChange={e => setForm(f => ({ ...f, service_key: e.target.value }))}>
              {services.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
          <div><label className="label">Customer Name *</label><input className="input" value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} placeholder="John Smith" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Phone</label><input className="input" value={form.customer_phone} onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))} placeholder="416-555-0100" /></div>
            <div><label className="label">Value ($)</label><input className="input" type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} placeholder="170" /></div>
          </div>
          <div><label className="label">Address</label><input className="input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="123 Main St, Toronto ON" /></div>
          <div><label className="label">Scheduled Date</label><input className="input" type="date" value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} /></div>
          <div><label className="label">Notes</label><textarea className="input min-h-[60px]" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Job details..." /></div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.urgent} onChange={e => setForm(f => ({ ...f, urgent: e.target.checked }))} className="w-4 h-4 accent-gold-400" />
            <span className="text-sm text-navy-100">Mark as urgent</span>
          </label>
          {error && <p className="text-xs text-error-400">{error}</p>}
          <div className="flex items-center gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Adding...' : 'Add Job'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
