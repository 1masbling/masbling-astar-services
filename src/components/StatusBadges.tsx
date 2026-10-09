import { JOB_STATUSES, INVOICE_STATUSES, TICKET_PRIORITIES, CAMPAIGN_STATUSES } from '@/lib/constants';
import type { JobStatus, InvoiceStatus, TicketPriority, CampaignStatus } from '@/lib/types';

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const s = JOB_STATUSES.find(x => x.key === status);
  if (!s) return null;
  return <span className={`badge ${s.bg} ${s.color} border ${s.border}`}>{s.label}</span>;
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const s = INVOICE_STATUSES.find(x => x.key === status);
  if (!s) return null;
  return <span className={`badge ${s.bg} ${s.color}`}>{s.label}</span>;
}

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  const s = TICKET_PRIORITIES.find(x => x.key === priority);
  if (!s) return null;
  return <span className={`badge ${s.bg} ${s.color}`}>{s.label}</span>;
}

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const s = CAMPAIGN_STATUSES.find(x => x.key === status);
  if (!s) return null;
  return <span className={`badge ${s.bg} ${s.color}`}>{s.label}</span>;
}
