import { useState, useMemo, useEffect } from 'react';
import {
  Zap, X, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  DollarSign, Briefcase, Star, Clock, Target, Lightbulb, Sparkles,
  ArrowRight, Calendar,
} from 'lucide-react';
import { useData } from '@/lib/data';
import { formatCurrency, formatNumber, daysUntil, formatRelative } from '@/lib/format';
import { SERVICE_ICONS } from '@/lib/constants';
import ServiceIcon from '@/components/ServiceIcon';
import type { ViewKey } from '@/lib/types';

interface GlancePanelProps {
  onClose: () => void;
  onNavigate: (view: ViewKey) => void;
}

interface Insight {
  type: 'alert' | 'opportunity' | 'positive' | 'action';
  icon: typeof AlertTriangle;
  title: string;
  detail: string;
  action?: { label: string; view: ViewKey };
  severity: 'high' | 'medium' | 'low';
}

export default function GlancePanel({ onClose, onNavigate }: GlancePanelProps) {
  const { jobs, invoices, campaigns, tickets, schedules, services } = useData();
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setAnalyzing(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  const insights = useMemo<Insight[]>(() => {
    const list: Insight[] = [];
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    // Revenue
    const paidInvoices = invoices.filter(i => i.status === 'paid');
    const overdueInvoices = invoices.filter(i => i.status === 'overdue');
    const sentInvoices = invoices.filter(i => i.status === 'sent');
    const todayRevenue = paidInvoices
      .filter(i => i.paid_at && i.paid_at.slice(0, 10) === today)
      .reduce((sum, i) => sum + i.amount, 0);
    const overdueAmount = overdueInvoices.reduce((sum, i) => sum + i.amount, 0);
    const outstandingAmount = sentInvoices.reduce((sum, i) => sum + i.amount, 0);

    if (overdueAmount > 0) {
      list.push({
        type: 'alert', icon: AlertTriangle, severity: 'high',
        title: `${formatCurrency(overdueAmount)} in overdue invoices`,
        detail: `${overdueInvoices.length} invoice${overdueInvoices.length > 1 ? 's' : ''} past due. Follow up with customers to recover revenue.`,
        action: { label: 'View Billing', view: 'billing' },
      });
    }

    if (outstandingAmount > 0) {
      list.push({
        type: 'action', icon: DollarSign, severity: 'medium',
        title: `${formatCurrency(outstandingAmount)} awaiting payment`,
        detail: `${sentInvoices.length} invoice${sentInvoices.length > 1 ? 's' : ''} sent but not yet paid. Expected incoming cash flow.`,
        action: { label: 'Track Payments', view: 'billing' },
      });
    }

    if (todayRevenue > 0) {
      list.push({
        type: 'positive', icon: TrendingUp, severity: 'low',
        title: `${formatCurrency(todayRevenue)} collected today`,
        detail: 'Revenue is flowing. Keep up the momentum on completed jobs.',
      });
    }

    // Pipeline
    const estimates = jobs.filter(j => j.status === 'estimate');
    const inProgress = jobs.filter(j => j.status === 'in-progress');
    const scheduled = jobs.filter(j => j.status === 'scheduled');
    const pipelineValue = estimates.reduce((s, j) => s + j.value, 0);

    if (estimates.length > 0) {
      list.push({
        type: 'opportunity', icon: Target, severity: 'medium',
        title: `${estimates.length} estimates worth ${formatCurrency(pipelineValue)}`,
        detail: 'Convert pending estimates to scheduled jobs to boost revenue.',
        action: { label: 'View Pipeline', view: 'pipeline' },
      });
    }

    if (inProgress.length > 0) {
      list.push({
        type: 'action', icon: Briefcase, severity: 'medium',
        title: `${inProgress.length} job${inProgress.length > 1 ? 's' : ''} in progress`,
        detail: 'Complete active jobs to unlock invoicing and revenue collection.',
        action: { label: 'Track Jobs', view: 'pipeline' },
      });
    }

    // Overdue scheduled jobs
    const overdueScheduled = scheduled.filter(j => j.scheduled_date && new Date(j.scheduled_date) < now);
    if (overdueScheduled.length > 0) {
      list.push({
        type: 'alert', icon: Clock, severity: 'high',
        title: `${overdueScheduled.length} scheduled job${overdueScheduled.length > 1 ? 's' : ''} past due`,
        detail: 'Reschedule or start these jobs to avoid customer dissatisfaction.',
        action: { label: 'View Pipeline', view: 'pipeline' },
      });
    }

    // CSAT
    const ratedJobs = jobs.filter(j => j.rating !== null);
    const csat = ratedJobs.length > 0 ? ratedJobs.reduce((s, j) => s + (j.rating || 0), 0) / ratedJobs.length : 0;
    if (ratedJobs.length > 0) {
      if (csat >= 4.5) {
        list.push({
          type: 'positive', icon: Star, severity: 'low',
          title: `Excellent CSAT: ${csat.toFixed(1)}/5`,
          detail: `Based on ${ratedJobs.length} review${ratedJobs.length > 1 ? 's' : ''}. Customers are very satisfied — use this in marketing.`,
        });
      } else if (csat < 3.5) {
        list.push({
          type: 'alert', icon: TrendingDown, severity: 'high',
          title: `Low CSAT: ${csat.toFixed(1)}/5`,
          detail: 'Customer satisfaction needs attention. Review completed jobs for recurring issues.',
        });
      }
    }

    // CSR Tickets
    const openTickets = tickets.filter(t => t.status === 'open');
    const highPriority = openTickets.filter(t => t.priority === 'high');
    if (highPriority.length > 0) {
      list.push({
        type: 'alert', icon: AlertTriangle, severity: 'high',
        title: `${highPriority.length} high-priority ticket${highPriority.length > 1 ? 's' : ''} open`,
        detail: 'Resolve urgent customer issues immediately to protect reputation.',
        action: { label: 'View CSR', view: 'operations' },
      });
    }

    // Schedules due soon
    const dueSoon = schedules.filter(s => s.active && daysUntil(s.next_run) <= 7);
    if (dueSoon.length > 0) {
      list.push({
        type: 'action', icon: Calendar, severity: 'medium',
        title: `${dueSoon.length} recurring job${dueSoon.length > 1 ? 's' : ''} due within 7 days`,
        detail: 'Confirm upcoming recurring appointments with customers.',
        action: { label: 'View Schedule', view: 'operations' },
      });
    }

    // Marketing
    const activeCampaigns = campaigns.filter(c => c.status === 'active');
    const totalReach = activeCampaigns.reduce((s, c) => s + c.reach, 0);
    const totalLeads = activeCampaigns.reduce((s, c) => s + c.leads, 0);
    if (activeCampaigns.length > 0) {
      const conversionRate = totalReach > 0 ? ((totalLeads / totalReach) * 100).toFixed(1) : '0';
      list.push({
        type: 'opportunity', icon: Sparkles, severity: 'low',
        title: `${activeCampaigns.length} active campaign${activeCampaigns.length > 1 ? 's' : ''} — ${formatNumber(totalReach)} reach`,
        detail: `${totalLeads} leads generated (${conversionRate}% conversion). ${
          totalLeads > 5 ? 'Strong lead flow — ensure pipeline can handle volume.' : 'Consider boosting ad spend to increase leads.'
        }`,
        action: { label: 'View Marketing', view: 'marketing' },
      });
    }

    return list.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.severity] - order[b.severity];
    });
  }, [jobs, invoices, campaigns, tickets, schedules]);

  const stats = useMemo(() => {
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
    const openPipeline = jobs.filter(j => j.status !== 'complete').reduce((s, j) => s + j.value, 0);
    const ratedJobs = jobs.filter(j => j.rating !== null);
    const csat = ratedJobs.length > 0 ? ratedJobs.reduce((s, j) => s + (j.rating || 0), 0) / ratedJobs.length : 0;
    const openTickets = tickets.filter(t => t.status === 'open').length;
    const activeJobs = jobs.filter(j => j.status === 'in-progress').length;
    return { totalRevenue, openPipeline, csat, openTickets, activeJobs };
  }, [jobs, invoices, tickets]);

  const topServices = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach(j => { counts[j.service_key] = (counts[j.service_key] || 0) + 1; });
    return Object.entries(counts)
      .map(([key, count]) => ({ key, count, label: services.find(s => s.key === key)?.label || key }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [jobs, services]);

  const recentJobs = useMemo(() => jobs.slice(0, 4), [jobs]);

  const severityStyles: Record<string, { border: string; bg: string; iconColor: string }> = {
    high: { border: 'border-error-700/50', bg: 'bg-error-900/30', iconColor: 'text-error-400' },
    medium: { border: 'border-gold-700/50', bg: 'bg-gold-900/30', iconColor: 'text-gold-400' },
    low: { border: 'border-success-700/50', bg: 'bg-success-900/30', iconColor: 'text-success-400' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-navy-950/80 backdrop-blur-sm p-0 md:p-4" onClick={onClose}>
      <div className="card w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-b-none md:rounded-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-navy-800/95 backdrop-blur-sm border-b border-navy-700 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-glow">
              <Zap className="w-5 h-5 text-navy-950" />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy-50 font-display">Glance AI</h2>
              <p className="text-xs text-navy-300">Business intelligence overview</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost p-2"><X className="w-4 h-4" /></button>
        </div>

        {analyzing ? (
          <div className="px-5 py-16 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold-900/30 mb-4">
              <Sparkles className="w-7 h-7 text-gold-400 animate-pulse-soft" />
            </div>
            <p className="text-sm font-semibold text-navy-50 mb-1">Analyzing your business data...</p>
            <p className="text-xs text-navy-300">Reviewing jobs, revenue, tickets, and campaigns</p>
            <div className="flex items-center justify-center gap-1.5 mt-4">
              {[0, 1, 2].map(i => (
                <span key={i} className="w-2 h-2 rounded-full bg-gold-400 animate-pulse-soft" style={{ animationDelay: `${i * 200}ms` }} />
              ))}
            </div>
          </div>
        ) : (
          <div className="px-5 py-4 space-y-5">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {[
                { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'text-success-400', bg: 'bg-success-900/30' },
                { label: 'Open Pipeline', value: formatCurrency(stats.openPipeline), icon: TrendingUp, color: 'text-gold-400', bg: 'bg-gold-900/30' },
                { label: 'CSAT Score', value: stats.csat > 0 ? `${stats.csat.toFixed(1)}/5` : '—', icon: Star, color: 'text-teal-400', bg: 'bg-teal-900/30' },
                { label: 'Open Tickets', value: stats.openTickets.toString(), icon: AlertTriangle, color: 'text-error-400', bg: 'bg-error-900/30' },
              ].map(s => (
                <div key={s.label} className="rounded-xl bg-navy-900 p-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${s.bg} mb-2`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <p className="text-lg font-bold text-navy-50 font-display">{s.value}</p>
                  <p className="text-[10px] text-navy-300">{s.label}</p>
                </div>
              ))}
            </div>

            {/* AI Insights */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-gold-400" />
                <h3 className="section-title">AI Insights & Recommendations</h3>
              </div>
              <div className="space-y-2.5">
                {insights.map((insight, i) => {
                  const style = severityStyles[insight.severity];
                  return (
                    <div key={i} className={`rounded-xl border ${style.border} ${style.bg} p-3.5`}>
                      <div className="flex items-start gap-3">
                        <div className={`shrink-0 mt-0.5 ${style.iconColor}`}>
                          <insight.icon className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-navy-50">{insight.title}</p>
                          <p className="text-xs text-navy-300 mt-0.5 leading-relaxed">{insight.detail}</p>
                          {insight.action && (
                            <button
                              onClick={() => { onClose(); onNavigate(insight.action!.view); }}
                              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-gold-400 hover:text-gold-300 transition-colors"
                            >
                              {insight.action.label} <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {insights.length === 0 && (
                  <div className="rounded-xl bg-navy-900 p-6 text-center">
                    <CheckCircle2 className="w-8 h-8 text-success-400 mx-auto mb-2" />
                    <p className="text-sm text-navy-200">All clear — no urgent issues detected.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Services */}
            {topServices.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-gold-400" />
                  <h3 className="section-title">Top Services by Volume</h3>
                </div>
                <div className="space-y-2">
                  {topServices.map((svc, i) => {
                    const maxCount = topServices[0].count;
                    const pct = (svc.count / maxCount) * 100;
                    return (
                      <div key={svc.key} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-navy-400 w-4">{i + 1}</span>
                        <div className="flex items-center gap-2 w-28 shrink-0">
                          <ServiceIcon name={SERVICE_ICONS[svc.key] || 'Wrench'} className="w-4 h-4 text-gold-400 shrink-0" />
                          <span className="text-xs font-medium text-navy-100 truncate">{svc.label}</span>
                        </div>
                        <div className="flex-1 h-2 bg-navy-900 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-gold-400 to-gold-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-navy-300 w-8 text-right">{svc.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            {recentJobs.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-gold-400" />
                  <h3 className="section-title">Recent Job Activity</h3>
                </div>
                <div className="space-y-1.5">
                  {recentJobs.map(job => {
                    const label = services.find(s => s.key === job.service_key)?.label || job.service_key;
                    return (
                      <div key={job.id} className="flex items-center gap-2.5 rounded-lg bg-navy-900 p-2.5">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-navy-700 shrink-0">
                          <ServiceIcon name={SERVICE_ICONS[job.service_key] || 'Wrench'} className="w-3.5 h-3.5 text-gold-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-navy-100 truncate">{job.customer_name}</p>
                          <p className="text-[10px] text-navy-300">{label} · {formatRelative(job.created_at)}</p>
                        </div>
                        <span className="text-xs font-bold text-gold-400 shrink-0">{formatCurrency(job.value)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center gap-2 pt-2 pb-1">
              <button onClick={() => { onClose(); onNavigate('pipeline'); }} className="btn-primary flex-1 text-xs">
                <Briefcase className="w-3.5 h-3.5" /> Open Pipeline
              </button>
              <button onClick={() => { onClose(); onNavigate('operations'); }} className="btn-secondary flex-1 text-xs">
                <AlertTriangle className="w-3.5 h-3.5" /> View CSR
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
