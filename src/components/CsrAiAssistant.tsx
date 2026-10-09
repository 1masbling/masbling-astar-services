import { useState, useMemo } from 'react';
import {
  Sparkles, Send, Bot, AlertTriangle, CheckCircle2,
  TrendingUp, MessageSquare, Lightbulb, Phone, ChevronDown, ChevronUp,
} from 'lucide-react';
import { formatRelative } from '@/lib/format';
import { SERVICE_ICONS } from '@/lib/constants';
import { TicketPriorityBadge } from '@/components/StatusBadges';
import ServiceIcon from '@/components/ServiceIcon';
import type { CsrTicket, Job } from '@/lib/types';

interface CsrAiAssistantProps {
  tickets: CsrTicket[];
  jobs: Job[];
  onResolve: (ticketId: string) => void;
  onReopen: (ticketId: string) => void;
}

type PriorityLevel = 'high' | 'medium' | 'low';
type Sentiment = 'positive' | 'neutral' | 'negative';

interface TicketAnalysis {
  priority: PriorityLevel;
  sentiment: Sentiment;
  confidence: number;
  suggestedResponse: string;
  actionItems: string[];
  category: string;
  summary: string;
}

function analyzeTicket(ticket: CsrTicket, job: Job | undefined): TicketAnalysis {
  const text = `${ticket.subject} ${ticket.customer_name}`.toLowerCase();
  const negativeWords = ['angry', 'unhappy', 'terrible', 'worst', 'broken', 'damaged', 'refund', 'complaint', 'never', 'horrible', 'disappointed', 'frustrated', 'leak', 'flood', 'emergency'];
  const urgentWords = ['urgent', 'asap', 'emergency', 'immediately', 'now', 'critical', ' flooding', 'overflow'];
  const positiveWords = ['great', 'happy', 'satisfied', 'excellent', 'good', 'thank', 'perfect', 'amazing'];

  const negCount = negativeWords.filter(w => text.includes(w)).length;
  const urgentCount = urgentWords.filter(w => text.includes(w)).length;
  const posCount = positiveWords.filter(w => text.includes(w)).length;

  let priority: PriorityLevel = 'low';
  if (urgentCount > 0 || ticket.priority === 'high') priority = 'high';
  else if (negCount > 0 || ticket.priority === 'medium') priority = 'medium';

  let sentiment: Sentiment = 'neutral';
  if (negCount > posCount) sentiment = 'negative';
  else if (posCount > 0 && negCount === 0) sentiment = 'positive';

  const confidence = Math.min(95, 60 + (negCount + urgentCount + posCount) * 10);

  let category = 'General Inquiry';
  if (text.includes('leak') || text.includes('flood') || text.includes('water')) category = 'Water Damage / Leak';
  else if (text.includes('gutter') || text.includes('eaves')) category = 'Gutter Issue';
  else if (text.includes('window') || text.includes('caulk')) category = 'Window / Caulking';
  else if (text.includes('schedule') || text.includes('appointment') || text.includes('reschedule')) category = 'Scheduling';
  else if (text.includes('invoice') || text.includes('payment') || text.includes('bill') || text.includes('refund')) category = 'Billing / Payment';
  else if (text.includes('quality') || text.includes('workmanship') || text.includes('poor')) category = 'Quality Complaint';
  else if (text.includes('cancel')) category = 'Cancellation';

  const serviceLabel = job ? job.service_key.replace(/-/g, ' ') : 'your service';
  const summary = `${ticket.customer_name} reported a ${category.toLowerCase()} issue${job ? ` related to ${serviceLabel}` : ''}.`;

  let suggestedResponse = '';
  const actionItems: string[] = [];

  if (priority === 'high') {
    suggestedResponse = `Hi ${ticket.customer_name.split(' ')[0]}, thank you for reaching out. I understand this is urgent — we take ${category.toLowerCase()} very seriously. I've flagged your ticket as high priority and a technician will contact you within 2 hours to schedule an emergency visit. We'll make this right. — Masbling Astar Services`;
    actionItems.push('Assign technician for emergency visit within 2 hours');
    actionItems.push('Call customer directly to acknowledge the issue');
  } else if (sentiment === 'negative') {
    suggestedResponse = `Hi ${ticket.customer_name.split(' ')[0]}, I'm sorry to hear about your experience with ${category.toLowerCase()}. We value your business and want to resolve this promptly. I've reviewed your concern and will have a supervisor reach out within 24 hours to arrange a solution. Thank you for your patience. — Masbling Astar Services`;
    actionItems.push('Escalate to supervisor for quality review');
    actionItems.push('Schedule follow-up call within 24 hours');
  } else if (category === 'Billing / Payment') {
    suggestedResponse = `Hi ${ticket.customer_name.split(' ')[0]}, thank you for your inquiry about billing. I've pulled up your account and can help with this. For payment questions, please call us at 437-440-4072 or reply here with your invoice number, and we'll resolve it quickly. — Masbling Astar Services`;
    actionItems.push('Review customer invoice history');
    actionItems.push('Confirm payment status in billing system');
  } else if (category === 'Scheduling') {
    suggestedResponse = `Hi ${ticket.customer_name.split(' ')[0]}, we'd be happy to help with scheduling! Our next available appointments are coming up soon. Please let us know your preferred date and time, or call us at 437-440-4072 and we'll get you booked right away. — Masbling Astar Services`;
    actionItems.push('Check crew availability for requested time');
    actionItems.push('Confirm appointment slot with customer');
  } else {
    suggestedResponse = `Hi ${ticket.customer_name.split(' ')[0]}, thank you for contacting Masbling A Star Services. We've received your message about ${category.toLowerCase()} and will get back to you within 24 hours with next steps. If you need immediate assistance, please call 437-440-4072. — Masbling Astar Services`;
    actionItems.push('Review ticket details and assign to appropriate crew');
  }

  return { priority, sentiment, confidence, suggestedResponse, actionItems, category, summary };
}

const sentimentStyles: Record<Sentiment, { label: string; color: string; bg: string }> = {
  positive: { label: 'Positive', color: 'text-success-300', bg: 'bg-success-900/40' },
  neutral: { label: 'Neutral', color: 'text-navy-200', bg: 'bg-navy-700' },
  negative: { label: 'Negative', color: 'text-error-300', bg: 'bg-error-900/40' },
};

const priorityStyles: Record<PriorityLevel, { label: string; color: string; bg: string }> = {
  high: { label: 'High Priority', color: 'text-error-300', bg: 'bg-error-900/40' },
  medium: { label: 'Medium Priority', color: 'text-warning-300', bg: 'bg-warning-900/40' },
  low: { label: 'Low Priority', color: 'text-teal-300', bg: 'bg-teal-900/40' },
};

export default function CsrAiAssistant({ tickets, jobs, onResolve, onReopen }: CsrAiAssistantProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [analysisCache, setAnalysisCache] = useState<Record<string, TicketAnalysis>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const openTickets = useMemo(() => tickets.filter(t => t.status === 'open'), [tickets]);
  const resolvedTickets = useMemo(() => tickets.filter(t => t.status === 'resolved'), [tickets]);

  const jobFor = (jobId: string | null) => jobs.find(j => j.id === jobId);

  const handleAnalyze = (ticket: CsrTicket) => {
    if (analysisCache[ticket.id]) {
      setSelectedId(selectedId === ticket.id ? null : ticket.id);
      return;
    }
    setAnalyzing(ticket.id);
    setTimeout(() => {
      const job = jobFor(ticket.job_id);
      const result = analyzeTicket(ticket, job);
      setAnalysisCache(prev => ({ ...prev, [ticket.id]: result }));
      setAnalyzing(null);
      setSelectedId(ticket.id);
    }, 1200);
  };

  const handleCopy = (ticketId: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(ticketId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* AI Banner */}
      <div className="card p-4 border-gold-700/40 bg-gradient-to-br from-gold-900/20 to-navy-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-glow shrink-0">
            <Bot className="w-5 h-5 text-navy-950" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-navy-50">CSR AI Assistant</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-success-900/40 px-2 py-0.5 text-[10px] font-bold text-success-300">
                <span className="w-1.5 h-1.5 rounded-full bg-success-400 animate-pulse-soft" /> ACTIVE
              </span>
            </div>
            <p className="text-xs text-navy-300 mt-0.5">AI-powered ticket analysis with suggested responses, sentiment detection, and smart prioritization</p>
          </div>
        </div>
      </div>

      {/* Open Tickets with AI */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="section-title">Open Tickets ({openTickets.length})</h3>
          <span className="text-[10px] text-navy-400">Tap a ticket for AI analysis</span>
        </div>

        {openTickets.length === 0 ? (
          <div className="card p-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-success-400 mx-auto mb-2" />
            <p className="text-sm text-navy-200">No open tickets — you're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {openTickets.map(ticket => {
              const job = jobFor(ticket.job_id);
              const analysis = analysisCache[ticket.id];
              const isSelected = selectedId === ticket.id;
              const isAnalyzing = analyzing === ticket.id;
              const isExpanded = expandedId === ticket.id;

              return (
                <div key={ticket.id} className={`card overflow-hidden transition-all ${isSelected ? 'border-gold-600/50' : ''}`}>
                  {/* Ticket header */}
                  <div className="p-3">
                    <button onClick={() => handleAnalyze(ticket)} className="w-full text-left">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-navy-50">{ticket.customer_name}</p>
                          <p className="text-xs text-navy-300 mt-0.5 truncate">{ticket.subject}</p>
                        </div>
                        <TicketPriorityBadge priority={ticket.priority} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-navy-400">{formatRelative(ticket.created_at)}</span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${isSelected ? 'text-gold-400' : 'text-navy-300'}`}>
                          {isAnalyzing ? (
                            <><Sparkles className="w-3 h-3 animate-pulse-soft" /> Analyzing...</>
                          ) : analysis ? (
                            <><Sparkles className="w-3 h-3" /> AI Analyzed</>
                          ) : (
                            <><Sparkles className="w-3 h-3" /> Analyze with AI</>
                          )}
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* AI Analysis */}
                  {isSelected && analysis && (
                    <div className="border-t border-navy-700 p-3 space-y-3 animate-slide-up bg-navy-900/50">
                      {/* Summary */}
                      <div className="rounded-lg bg-navy-800 p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Lightbulb className="w-3.5 h-3.5 text-gold-400" />
                          <span className="text-[10px] font-bold uppercase tracking-wide text-gold-400">AI Summary</span>
                        </div>
                        <p className="text-xs text-navy-100 leading-relaxed">{analysis.summary}</p>
                      </div>

                      {/* Analysis chips */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityStyles[analysis.priority].bg} ${priorityStyles[analysis.priority].color}`}>
                          <AlertTriangle className="w-2.5 h-2.5" /> {priorityStyles[analysis.priority].label}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${sentimentStyles[analysis.sentiment].bg} ${sentimentStyles[analysis.sentiment].color}`}>
                          <MessageSquare className="w-2.5 h-2.5" /> {sentimentStyles[analysis.sentiment].label}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-navy-700 px-2 py-0.5 text-[10px] font-semibold text-navy-200">
                          <TrendingUp className="w-2.5 h-2.5" /> {analysis.confidence}% confidence
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-teal-900/40 px-2 py-0.5 text-[10px] font-semibold text-teal-300">
                          {analysis.category}
                        </span>
                      </div>

                      {/* Action items */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-navy-300 mb-1.5">Recommended Actions</p>
                        <div className="space-y-1">
                          {analysis.actionItems.map((item, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-navy-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-success-400 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Suggested response */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <Bot className="w-3.5 h-3.5 text-gold-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wide text-gold-400">Suggested Response</span>
                          </div>
                          <button
                            onClick={() => handleCopy(ticket.id, analysis.suggestedResponse)}
                            className={`text-[10px] font-semibold inline-flex items-center gap-1 transition-colors ${copiedId === ticket.id ? 'text-success-400' : 'text-navy-300 hover:text-gold-400'}`}
                          >
                            {copiedId === ticket.id ? <><CheckCircle2 className="w-3 h-3" /> Copied</> : <><Send className="w-3 h-3" /> Copy</>}
                          </button>
                        </div>
                        <div className={`rounded-lg bg-navy-800 border border-navy-700 p-3 text-xs text-navy-100 leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
                          {analysis.suggestedResponse}
                        </div>
                        {analysis.suggestedResponse.length > 120 && (
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                            className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-navy-300 hover:text-gold-400 transition-colors"
                          >
                            {isExpanded ? <>Show less <ChevronUp className="w-3 h-3" /></> : <>Show full response <ChevronDown className="w-3 h-3" /></>}
                          </button>
                        )}
                      </div>

                      {/* Job context */}
                      {job && (
                        <div className="flex items-center gap-2 rounded-lg bg-navy-800 p-2.5">
                          <ServiceIcon name={SERVICE_ICONS[job.service_key] || 'Wrench'} className="w-4 h-4 text-gold-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-navy-400">Related Job</p>
                            <p className="text-xs font-medium text-navy-100 truncate">{job.customer_name} — {job.service_key}</p>
                          </div>
                          {job.customer_phone && (
                            <a href={`tel:${job.customer_phone}`} className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-gold-400 hover:text-gold-300 shrink-0">
                              <Phone className="w-3 h-3" /> Call
                            </a>
                          )}
                        </div>
                      )}

                      {/* Resolve button */}
                      <button
                        onClick={() => onResolve(ticket.id)}
                        className="btn-primary w-full text-xs py-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Resolved
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resolved tickets */}
      {resolvedTickets.length > 0 && (
        <div>
          <h3 className="section-title mb-2">Resolved ({resolvedTickets.length})</h3>
          <div className="space-y-1.5">
            {resolvedTickets.slice(0, 5).map(ticket => (
              <div key={ticket.id} className="card p-2.5 opacity-60">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-navy-200 truncate">{ticket.customer_name}</p>
                    <p className="text-[10px] text-navy-400 truncate">{ticket.subject}</p>
                  </div>
                  <button onClick={() => onReopen(ticket.id)} className="text-[10px] font-semibold text-navy-300 hover:text-gold-400 shrink-0">Reopen</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
