import { useState, useMemo } from 'react';
import {
  Plus, X, Zap, TrendingUp, Users, Target, Megaphone,
  Sparkles, Lightbulb, ArrowRight, AlertTriangle, Clock,
  DollarSign, CheckCircle2, Radio, Cpu, Layers,
} from 'lucide-react';
import { useData } from '@/lib/data';
import { formatNumber, formatCurrency, formatRelative, daysUntil } from '@/lib/format';
import { JOB_STATUSES } from '@/lib/constants';
import { CampaignStatusBadge } from '@/components/StatusBadges';
import { exportJobsCsv } from '@/lib/export';
import type { Campaign, CampaignStatus } from '@/lib/types';

type Tab = 'campaigns' | 'ai' | 'studio';

export default function Marketing() {
  const [tab, setTab] = useState<Tab>('campaigns');
  const tabs: { key: Tab; label: string; icon: typeof Megaphone }[] = [
    { key: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { key: 'ai', label: 'AI Assist', icon: Zap },
    { key: 'studio', label: 'Studio', icon: Layers },
  ];
  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-lg font-bold text-navy-50 font-display">Marketing</h2>
      <div className="flex items-center gap-1.5">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${tab === t.key ? 'bg-gold-400 text-navy-950' : 'bg-navy-800 text-navy-300 hover:bg-navy-700'}`}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>
      {tab === 'campaigns' && <CampaignsPanel />}
      {tab === 'ai' && <AiAssistPanel />}
      {tab === 'studio' && <StudioPanel />}
    </div>
  );
}

function CampaignsPanel() {
  const { campaigns, addCampaign, updateCampaign } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const totalReach = activeCampaigns.reduce((s, c) => s + c.reach, 0);
  const totalLeads = activeCampaigns.reduce((s, c) => s + c.leads, 0);
  const conversionRate = totalReach > 0 ? ((totalLeads / totalReach) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="card p-3"><div className="flex items-center gap-1.5 mb-1"><Users className="w-4 h-4 text-teal-400" /><span className="text-xs text-navy-300">Reach</span></div><p className="text-base font-bold text-navy-50 font-display">{formatNumber(totalReach)}</p></div>
        <div className="card p-3"><div className="flex items-center gap-1.5 mb-1"><Target className="w-4 h-4 text-gold-400" /><span className="text-xs text-navy-300">Leads</span></div><p className="text-base font-bold text-navy-50 font-display">{totalLeads}</p></div>
        <div className="card p-3"><div className="flex items-center gap-1.5 mb-1"><TrendingUp className="w-4 h-4 text-success-400" /><span className="text-xs text-navy-300">Conv. Rate</span></div><p className="text-base font-bold text-navy-50 font-display">{conversionRate}%</p></div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-navy-300">{campaigns.length} campaigns</p>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-xs py-2"><Plus className="w-3.5 h-3.5" /> New Campaign</button>
      </div>
      <div className="space-y-2">
        {campaigns.map(c => (
          <div key={c.id} className="card card-hover p-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0"><p className="text-sm font-semibold text-navy-50 truncate">{c.name}</p><p className="text-xs text-navy-300 mt-0.5">{c.platform} · {formatRelative(c.created_at)}</p></div>
              <div className="flex items-center gap-1.5 shrink-0">
                {c.ads_running && <span className="inline-flex items-center gap-1 rounded-full bg-success-900/40 px-2 py-0.5 text-[10px] font-bold text-success-300"><Radio className="w-2.5 h-2.5" /> ADS</span>}
                <CampaignStatusBadge status={c.status} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="rounded-lg bg-navy-900 p-2"><p className="text-xs text-navy-300">Reach</p><p className="text-sm font-bold text-navy-50">{formatNumber(c.reach)}</p></div>
              <div className="rounded-lg bg-navy-900 p-2"><p className="text-xs text-navy-300">Leads</p><p className="text-sm font-bold text-navy-50">{c.leads}</p></div>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-navy-700">
              {c.status === 'active' ? (
                <button onClick={() => updateCampaign(c.id, { status: 'paused' as CampaignStatus, ads_running: false })} className="text-xs font-semibold text-warning-400 hover:text-warning-300">Pause</button>
              ) : (
                <button onClick={() => updateCampaign(c.id, { status: 'active' as CampaignStatus, ads_running: true })} className="text-xs font-semibold text-success-400 hover:text-success-300">Activate</button>
              )}
              <span className="text-xs text-navy-400">·</span>
              <button onClick={() => updateCampaign(c.id, { ads_running: !c.ads_running })} className={`text-xs font-semibold ${c.ads_running ? 'text-success-400' : 'text-navy-300'}`}>{c.ads_running ? 'Stop Ads' : 'Run Ads'}</button>
            </div>
          </div>
        ))}
      </div>
      {showAdd && <AddCampaignModal onClose={() => setShowAdd(false)} onAdd={async (c) => { await addCampaign(c); setShowAdd(false); }} />}
    </div>
  );
}

function AddCampaignModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (c: Omit<Campaign, 'id' | 'created_at'>) => Promise<void>;
}) {
  const [form, setForm] = useState({ name: '', platform: 'Facebook', ads_running: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Campaign name is required'); return; }
    setSaving(true);
    setError(null);
    try { await onAdd({ name: form.name.trim(), status: 'active', platform: form.platform, reach: 0, leads: 0, ads_running: form.ads_running }); }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to add campaign'); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-navy-950/80 backdrop-blur-sm p-0 md:p-4" onClick={onClose}>
      <div className="card w-full max-w-md rounded-b-none md:rounded-2xl p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-navy-50">New Campaign</h3>
          <button onClick={onClose} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><label className="label">Campaign Name *</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Summer Gutter Promo" /></div>
          <div><label className="label">Platform</label><select className="input" value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}><option>Facebook</option><option>Instagram</option><option>Google</option><option>LinkedIn</option><option>YouTube</option></select></div>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.ads_running} onChange={e => setForm(f => ({ ...f, ads_running: e.target.checked }))} className="w-4 h-4 accent-gold-400" /><span className="text-sm text-navy-100">Run ads immediately</span></label>
          {error && <p className="text-xs text-error-400">{error}</p>}
          <div className="flex items-center gap-2 pt-1"><button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button><button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Creating...' : 'Create Campaign'}</button></div>
        </form>
      </div>
    </div>
  );
}

function AiAssistPanel() {
  const { jobs, invoices, tickets, campaigns, schedules } = useData();

  const insights = useMemo(() => {
    const tips: { type: 'warning' | 'info' | 'success'; icon: typeof AlertTriangle; title: string; detail: string; action?: string }[] = [];

    const staleEstimates = jobs.filter(j => j.status === 'estimate' && j.urgent);
    if (staleEstimates.length > 0) tips.push({ type: 'warning', icon: AlertTriangle, title: `${staleEstimates.length} urgent estimate${staleEstimates.length > 1 ? 's' : ''} need attention`, detail: staleEstimates.map(j => `${j.customer_name} — ${j.service_key}`).join(', '), action: 'Follow up now' });

    const overdueInvoices = invoices.filter(i => i.status === 'overdue');
    if (overdueInvoices.length > 0) { const total = overdueInvoices.reduce((s, i) => s + i.amount, 0); tips.push({ type: 'warning', icon: DollarSign, title: `${overdueInvoices.length} overdue invoice${overdueInvoices.length > 1 ? 's' : ''} totaling ${formatCurrency(total)}`, detail: overdueInvoices.map(i => `${i.number} — ${i.customer_name}`).join(', '), action: 'Send reminder' }); }

    const dueSchedules = schedules.filter(s => s.active && daysUntil(s.next_run) <= 7);
    if (dueSchedules.length > 0) tips.push({ type: 'info', icon: Clock, title: `${dueSchedules.length} recurring job${dueSchedules.length > 1 ? 's' : ''} due within a week`, detail: dueSchedules.map(s => `${s.customer_name} — ${s.service_key} (${daysUntil(s.next_run)}d)`).join(', '), action: 'Schedule crew' });

    const openTickets = tickets.filter(t => t.status === 'open' && t.priority === 'high');
    if (openTickets.length > 0) tips.push({ type: 'warning', icon: AlertTriangle, title: `${openTickets.length} high-priority CSR ticket${openTickets.length > 1 ? 's' : ''} open`, detail: openTickets.map(t => t.subject).join(', '), action: 'Assign agent' });

    const activeCampaigns = campaigns.filter(c => c.status === 'active');
    if (activeCampaigns.length > 0) { const best = activeCampaigns.reduce((best, c) => c.leads > best.leads ? c : best); tips.push({ type: 'success', icon: TrendingUp, title: `"${best.name}" is your top performer`, detail: `${formatNumber(best.reach)} reach, ${best.leads} leads on ${best.platform}`, action: 'Increase budget' }); }

    const completedJobs = jobs.filter(j => j.status === 'complete' && j.rating === 5);
    if (completedJobs.length > 0) tips.push({ type: 'success', icon: CheckCircle2, title: `${completedJobs.length} 5-star completed job${completedJobs.length > 1 ? 's' : ''} — request reviews`, detail: completedJobs.map(j => j.customer_name).join(', '), action: 'Send review request' });

    const draftCampaigns = campaigns.filter(c => c.status === 'draft');
    if (draftCampaigns.length > 0) tips.push({ type: 'info', icon: Megaphone, title: `${draftCampaigns.length} draft campaign${draftCampaigns.length > 1 ? 's' : ''} not yet launched`, detail: draftCampaigns.map(c => c.name).join(', '), action: 'Launch now' });

    return tips;
  }, [jobs, invoices, tickets, campaigns, schedules]);

  return (
    <div className="space-y-3">
      <div className="card p-4 bg-gradient-to-br from-navy-800 to-navy-900 border-gold-700/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold-400/20"><Sparkles className="w-5 h-5 text-gold-400" /></div>
          <div><h3 className="text-sm font-bold text-navy-50">AI Assist</h3><p className="text-xs text-navy-300">Smart insights from your business data</p></div>
        </div>
        <p className="text-xs text-navy-200">{insights.length} actionable insight{insights.length !== 1 ? 's' : ''} based on live pipeline, billing, and marketing data.</p>
      </div>
      <div className="space-y-2">
        {insights.map((tip, i) => {
          const colorClass = tip.type === 'warning' ? 'text-warning-400 bg-warning-900/20' : tip.type === 'success' ? 'text-success-400 bg-success-900/20' : 'text-teal-400 bg-teal-900/20';
          return (
            <div key={i} className="card card-hover p-3">
              <div className="flex items-start gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${colorClass}`}><tip.icon className="w-4 h-4" /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-navy-50">{tip.title}</p>
                  <p className="text-xs text-navy-300 mt-0.5">{tip.detail}</p>
                  {tip.action && <button className="text-xs font-semibold text-gold-400 hover:text-gold-300 inline-flex items-center gap-1 mt-2">{tip.action} <ArrowRight className="w-3 h-3" /></button>}
                </div>
              </div>
            </div>
          );
        })}
        {insights.length === 0 && <div className="card p-8 text-center"><Lightbulb className="w-8 h-8 text-navy-600 mx-auto mb-2" /><p className="text-sm text-navy-300">No insights right now. Everything looks good.</p></div>}
      </div>
      <button onClick={() => exportJobsCsv(jobs)} className="btn-ghost text-xs w-full">Export data for analysis</button>
    </div>
  );
}

function StudioPanel() {
  const { jobs, invoices, campaigns } = useData();
  const stats = [
    { label: 'API Endpoints', value: '8', icon: Cpu },
    { label: 'Mobile App', value: 'Live', icon: Radio },
    { label: 'AWS Deploy', value: 'Ready', icon: Layers },
    { label: 'Studio', value: 'Active', icon: Sparkles },
  ];
  return (
    <div className="space-y-3">
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-teal-900/40"><Layers className="w-5 h-5 text-teal-400" /></div>
          <div><p className="text-sm font-semibold text-navy-50">Studio — Business App Overview</p><p className="text-xs text-navy-300">API · Mobile · AWS Business App · Studio</p></div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {stats.map(s => (
            <div key={s.label} className="rounded-xl bg-navy-900 p-3"><div className="flex items-center gap-2 mb-1"><s.icon className="w-4 h-4 text-gold-400" /><span className="text-xs text-navy-300">{s.label}</span></div><p className="text-sm font-bold text-navy-50">{s.value}</p></div>
          ))}
        </div>
      </div>
      <div className="card p-4">
        <h3 className="section-title mb-3">Data Summary</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-navy-900 p-2.5"><span className="text-xs text-navy-300">Pipeline Jobs</span><span className="text-sm font-bold text-navy-50">{jobs.length}</span></div>
          <div className="flex items-center justify-between rounded-lg bg-navy-900 p-2.5"><span className="text-xs text-navy-300">Total Invoices</span><span className="text-sm font-bold text-navy-50">{invoices.length}</span></div>
          <div className="flex items-center justify-between rounded-lg bg-navy-900 p-2.5"><span className="text-xs text-navy-300">Marketing Campaigns</span><span className="text-sm font-bold text-navy-50">{campaigns.length}</span></div>
          <div className="flex items-center justify-between rounded-lg bg-navy-900 p-2.5"><span className="text-xs text-navy-300">Pipeline Value</span><span className="text-sm font-bold text-gold-400">{formatCurrency(jobs.filter(j => j.status === 'estimate').reduce((s, j) => s + j.value, 0))}</span></div>
        </div>
      </div>
      <div className="card p-4">
        <h3 className="section-title mb-3">Pipeline Distribution</h3>
        <div className="space-y-2">
          {JOB_STATUSES.map(s => {
            const count = jobs.filter(j => j.status === s.key).length;
            const pct = jobs.length > 0 ? (count / jobs.length) * 100 : 0;
            return (
              <div key={s.key}>
                <div className="flex items-center justify-between text-xs mb-1"><span className={s.color}>{s.label}</span><span className="text-navy-300">{count}</span></div>
                <div className="h-2 bg-navy-900 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-500 ${s.bg}`} style={{ width: `${pct}%` }} /></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
