import { useMemo, useState } from 'react';
import {
  DollarSign, Briefcase, Star, TrendingUp,
  CalendarClock, ClipboardList, Send, CreditCard, Megaphone,
  BarChart3, Download, Zap, Camera, ArrowRight, Mail, Globe, MapPin, ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { useData } from '@/lib/data';
import { formatCurrency, formatNumber, daysUntil, formatDate } from '@/lib/format';
import { exportJobsCsv, exportInvoicesCsv } from '@/lib/export';
import { COMPANY, SERVICE_ICONS, GALLERY_IMAGES } from '@/lib/constants';
import { CampaignStatusBadge } from '@/components/StatusBadges';
import ServiceIcon from '@/components/ServiceIcon';
import GlancePanel from '@/components/GlancePanel';
import SecurityAudit from '@/components/SecurityAudit';
import type { ViewKey } from '@/lib/types';

type OperationsTab = 'csr' | 'scheduling' | 'checklists' | 'camera';

interface DashboardProps {
  onNavigate: (view: ViewKey) => void;
  onNavigateOps: (tab: OperationsTab) => void;
  onServiceFilter: (key: string) => void;
}

export default function Dashboard({ onNavigate, onNavigateOps, onServiceFilter }: DashboardProps) {
  const { jobs, invoices, campaigns, tickets, schedules, services } = useData();
  const [showGlance, setShowGlance] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayRevenue = invoices
      .filter(i => i.status === 'paid' && i.paid_at && i.paid_at.slice(0, 10) === today)
      .reduce((sum, i) => sum + i.amount, 0);
    const activeJobs = jobs.filter(j => j.status === 'in-progress').length;
    const ratedJobs = jobs.filter(j => j.rating !== null);
    const csat = ratedJobs.length > 0 ? ratedJobs.reduce((sum, j) => sum + (j.rating || 0), 0) / ratedJobs.length : 0;
    const pipelineValue = jobs.filter(j => j.status === 'estimate').reduce((sum, j) => sum + j.value, 0);
    return { todayRevenue, activeJobs, csat, pipelineValue };
  }, [jobs, invoices]);

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const totalReach = activeCampaigns.reduce((s, c) => s + c.reach, 0);
  const totalLeads = activeCampaigns.reduce((s, c) => s + c.leads, 0);
  const adsRunning = activeCampaigns.filter(c => c.ads_running).length;
  const openTickets = tickets.filter(t => t.status === 'open').length;
  const upcomingSchedules = schedules.filter(s => s.active).slice(0, 3);

  const tools = [
    { label: 'Recurring', icon: CalendarClock, view: 'operations' as ViewKey, desc: `${schedules.filter(s => s.active).length} active` },
    { label: 'Checklists', icon: ClipboardList, view: 'operations' as ViewKey, desc: 'Per-job items' },
    { label: 'Invoices', icon: Send, view: 'billing' as ViewKey, desc: `${invoices.filter(i => i.status === 'sent' || i.status === 'overdue').length} pending` },
    { label: 'Payments', icon: CreditCard, view: 'billing' as ViewKey, desc: `${invoices.filter(i => i.status === 'paid').length} paid` },
  ];

  const kpis = [
    { label: "Today's Revenue", value: formatCurrency(stats.todayRevenue), icon: DollarSign, accent: 'text-success-400', bg: 'bg-success-900/30', view: 'billing' as ViewKey },
    { label: 'Active Jobs', value: stats.activeJobs.toString(), icon: Briefcase, accent: 'text-gold-400', bg: 'bg-gold-900/30', view: 'pipeline' as ViewKey },
    { label: 'CSAT Rating', value: stats.csat > 0 ? `${stats.csat.toFixed(1)}★` : '—', icon: Star, accent: 'text-teal-400', bg: 'bg-teal-900/30', view: 'pipeline' as ViewKey },
    { label: 'Pipeline Value', value: formatCurrency(stats.pipelineValue), icon: TrendingUp, accent: 'text-accent-400', bg: 'bg-accent-900/30', view: 'pipeline' as ViewKey },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(kpi => (
          <button key={kpi.label} onClick={() => onNavigate(kpi.view)} className="card card-hover p-4 text-left group">
            <div className="flex items-center justify-between mb-2">
              <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.accent} group-hover:scale-110 transition-transform`} />
              </div>
              <ArrowRight className="w-4 h-4 text-navy-500 group-hover:text-gold-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-2xl font-bold text-navy-50 font-display">{kpi.value}</p>
            <p className="text-xs text-navy-300 mt-0.5">{kpi.label}</p>
          </button>
        ))}
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-navy-700">
              <BarChart3 className="w-4 h-4 text-gold-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-navy-50">{jobs.filter(j => j.status !== 'complete').length} Open Pipeline</p>
              <p className="text-xs text-navy-300">{openTickets} active CSR</p>
            </div>
          </div>
          <div className="flex-1" />
          <button onClick={() => setShowGlance(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 px-3 py-1.5 text-xs font-bold text-navy-950 hover:from-gold-400 hover:to-gold-300 transition-all shadow-glow">
            <Zap className="w-3.5 h-3.5" /> Glance AI
          </button>
          <button onClick={() => onNavigateOps('camera')} className="inline-flex items-center gap-1.5 rounded-lg bg-teal-900/40 px-3 py-1.5 text-xs font-semibold text-teal-300 hover:bg-teal-900/60 transition-all">
            <Camera className="w-3.5 h-3.5" /> HCP Cam
          </button>
          <button onClick={() => setShowSecurity(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-error-900/40 px-3 py-1.5 text-xs font-semibold text-error-300 hover:bg-error-900/60 transition-all">
            <ShieldCheck className="w-3.5 h-3.5" /> Security Audit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tools.map(tool => (
          <button key={tool.label} onClick={() => onNavigate(tool.view)} className="card card-hover p-4 text-left group">
            <tool.icon className="w-5 h-5 text-gold-400 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-semibold text-navy-50">{tool.label}</p>
            <p className="text-xs text-navy-300 mt-0.5">{tool.desc}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => onNavigate('marketing')} className="btn-primary"><Megaphone className="w-4 h-4" /> Campaigns</button>
        <button onClick={() => onNavigate('marketing')} className="btn-secondary"><BarChart3 className="w-4 h-4" /> Marketing</button>
        <a href={COMPANY.squareCheckoutUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-accent-600 hover:bg-accent-500 px-3 py-2 text-sm font-bold text-navy-950 transition-all">
          <CreditCard className="w-4 h-4" /> Square Pay <ExternalLink className="w-3 h-3" />
        </a>
        <button onClick={() => { exportJobsCsv(jobs); exportInvoicesCsv(invoices); }} className="btn-ghost"><Download className="w-4 h-4" /> Export</button>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="section-title">Marketing Overview</h3>
          <button onClick={() => onNavigate('marketing')} className="text-xs text-gold-400 hover:text-gold-300 inline-flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div><p className="text-lg font-bold text-navy-50">{activeCampaigns.length}</p><p className="text-xs text-navy-300">Active Campaigns</p></div>
          <div><p className="text-lg font-bold text-navy-50">{formatNumber(totalReach)}</p><p className="text-xs text-navy-300">Total Reach</p></div>
          <div><p className="text-lg font-bold text-navy-50">{totalLeads}</p><p className="text-xs text-navy-300">Leads Generated</p></div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${adsRunning > 0 ? 'bg-success-900/40 text-success-300' : 'bg-navy-700 text-navy-200'}`}>
            <span className={`w-2 h-2 rounded-full ${adsRunning > 0 ? 'bg-success-400 animate-pulse-soft' : 'bg-navy-400'}`} />
            {adsRunning} ads running
          </span>
        </div>
      </div>

      {activeCampaigns.length > 0 && (
        <div className="card p-4">
          <h3 className="section-title mb-3">Active Campaigns</h3>
          <div className="space-y-2">
            {activeCampaigns.slice(0, 2).map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-xl bg-navy-900 p-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy-50 truncate">{c.name}</p>
                  <p className="text-xs text-navy-300">{c.platform} · {formatNumber(c.reach)} reach · {c.leads} leads</p>
                </div>
                <CampaignStatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {upcomingSchedules.length > 0 && (
        <div className="card p-4">
          <h3 className="section-title mb-3">Upcoming Recurring</h3>
          <div className="space-y-2">
            {upcomingSchedules.map(s => {
              const days = daysUntil(s.next_run);
              return (
                <div key={s.id} className="flex items-center justify-between rounded-xl bg-navy-900 p-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-navy-700 shrink-0">
                      <ServiceIcon name={SERVICE_ICONS[s.service_key] || 'Wrench'} className="w-4 h-4 text-gold-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-navy-50 truncate">{s.customer_name}</p>
                      <p className="text-xs text-navy-300 capitalize">{s.frequency} · {formatDate(s.next_run)}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold shrink-0 ${days <= 7 ? 'text-gold-400' : 'text-navy-300'}`}>
                    {days <= 0 ? 'Due' : `${days}d`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card p-4">
        <h3 className="section-title mb-3">Our Services</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {services.filter(s => s.active).map(svc => (
            <button
              key={svc.id}
              onClick={() => { onServiceFilter(svc.key); onNavigate('pipeline'); }}
              className="card card-hover flex items-center gap-2 p-3 text-left group"
            >
              <ServiceIcon name={SERVICE_ICONS[svc.key] || 'Wrench'} className="w-4 h-4 text-gold-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-navy-100 truncate">{svc.label}</span>
              <ArrowRight className="w-3 h-3 text-navy-500 group-hover:text-gold-400 ml-auto shrink-0 transition-all" />
            </button>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Camera className="w-4 h-4 text-gold-400" />
          <h3 className="section-title">Recent Projects</h3>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {GALLERY_IMAGES.map((img, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-navy-800">
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="absolute bottom-1 left-1 right-1 text-[9px] font-semibold text-navy-50 opacity-0 group-hover:opacity-100 transition-opacity text-center">
                {img.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-2 pb-2 text-xs text-navy-400">
        <button onClick={() => onNavigate('website')} className="inline-flex items-center gap-1.5 hover:text-gold-400 transition-colors">
          <Globe className="w-3.5 h-3.5" /> {COMPANY.website}
        </button>
        <a href={`mailto:${COMPANY.email}`} className="inline-flex items-center gap-1.5 hover:text-gold-400 transition-colors">
          <Mail className="w-3.5 h-3.5" /> {COMPANY.email}
        </a>
        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY.hq)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-gold-400 transition-colors">
          <MapPin className="w-3.5 h-3.5" /> {COMPANY.hq}
        </a>
      </div>
      {showGlance && <GlancePanel onClose={() => setShowGlance(false)} onNavigate={onNavigate} />}
      {showSecurity && <SecurityAudit onClose={() => setShowSecurity(false)} />}
    </div>
  );
}
