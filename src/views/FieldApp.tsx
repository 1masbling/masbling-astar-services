import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Smartphone, ChevronLeft, Clock, MapPin, Phone, Navigation as NavIcon,
  CheckCircle2, Circle, Camera, Timer, Play, Square, LogOut,
  Wrench, User, ChevronRight, X, CalendarDays, CreditCard, ExternalLink,
  Loader2,
} from 'lucide-react';
import { useData } from '@/lib/data';
import { formatCurrency, formatDuration } from '@/lib/format';
import { SERVICE_ICONS, TECHNICIAN_COLORS, COMPANY } from '@/lib/constants';
import ServiceIcon from '@/components/ServiceIcon';
import { JobStatusBadge } from '@/components/StatusBadges';
import type { Technician, Job } from '@/lib/types';

function toISO(d: Date) { return d.toISOString().slice(0, 10); }

export default function FieldApp({ authedTechId }: { authedTechId?: string }) {
  const { technicians, jobs } = useData();
  const [techId, setTechId] = useState<string | null>(authedTechId ?? null);
  const [openJobId, setOpenJobId] = useState<string | null>(null);

  const tech = technicians.find(t => t.id === techId) || null;

  if (!tech) {
    if (authedTechId) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-gold-400 mx-auto mb-3 animate-spin" />
          <p className="text-sm text-navy-300">Loading your profile...</p>
        </div>
      );
    }
    return <TechLogin technicians={technicians} onSelect={(id) => setTechId(id)} />;
  }

  const openJob = jobs.find(j => j.id === openJobId) || null;

  if (openJob) {
    return (
      <JobDetailView
        job={openJob}
        tech={tech}
        onBack={() => setOpenJobId(null)}
      />
    );
  }

  return (
    <TechHome tech={tech} onLogout={() => setTechId(null)} onOpenJob={(id) => setOpenJobId(id)} />
  );
}

// ── Tech Login ──────────────────────────────────────────────
function TechLogin({ technicians, onSelect }: {
  technicians: Technician[];
  onSelect: (id: string) => void;
}) {
  const activeTechs = technicians.filter(t => t.active);
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold-400/15 border border-gold-600/30 mb-3">
            <Smartphone className="w-8 h-8 text-gold-400" />
          </div>
          <h2 className="text-xl font-bold text-navy-50 font-display mb-1">Field App</h2>
          <p className="text-sm text-navy-300">{COMPANY.name}</p>
          <p className="text-xs text-navy-400 mt-2">Select your profile to clock in</p>
        </div>
        <div className="space-y-2">
          {activeTechs.map(t => {
            const cfg = TECHNICIAN_COLORS[t.color] || TECHNICIAN_COLORS.gold;
            return (
              <button
                key={t.id}
                onClick={() => onSelect(t.id)}
                className="card card-hover p-3.5 w-full flex items-center gap-3 text-left transition-all"
              >
                <div className={`flex items-center justify-center w-12 h-12 rounded-2xl ${cfg.bg} ${cfg.border} border shrink-0`}>
                  <User className={`w-6 h-6 ${cfg.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-navy-50 truncate">{t.name}</p>
                  <p className="text-xs text-navy-300">{t.role}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-navy-500 shrink-0" />
              </button>
            );
          })}
          {activeTechs.length === 0 && (
            <div className="card p-8 text-center">
              <User className="w-8 h-8 text-navy-600 mx-auto mb-2" />
              <p className="text-sm text-navy-300">No active technicians found.</p>
            </div>
          )}
        </div>
        <p className="text-center text-[10px] text-navy-500 mt-6">Field App v1.0 · {COMPANY.name}</p>
      </div>
    </div>
  );
}

// ── Tech Home ───────────────────────────────────────────────
function TechHome({ tech, onLogout, onOpenJob }: {
  tech: Technician;
  onLogout: () => void;
  onOpenJob: (jobId: string) => void;
}) {
  const { jobs, timeEntries } = useData();
  const today = toISO(new Date());

  const myJobs = useMemo(() => jobs.filter(j => j.technician_id === tech.id), [jobs, tech.id]);
  const todayJobs = myJobs.filter(j => j.scheduled_date === today);
  const upcomingJobs = myJobs.filter(j => j.scheduled_date && j.scheduled_date > today && j.status !== 'complete' && j.status !== 'estimate');
  const completedJobs = myJobs.filter(j => j.status === 'complete');

  const activeTimer = timeEntries.find(te => te.technician_id === tech.id && !te.clock_out);
  const elapsed = activeTimer ? Math.round((Date.now() - new Date(activeTimer.clock_in).getTime()) / 60000) : 0;

  const todayMinutes = timeEntries
    .filter(te => te.technician_id === tech.id && te.clock_out && te.clock_in.slice(0, 10) === today)
    .reduce((s, te) => s + te.duration_minutes, 0);

  const cfg = TECHNICIAN_COLORS[tech.color] || TECHNICIAN_COLORS.gold;

  return (
    <div className="max-w-md mx-auto space-y-4 animate-fade-in pb-24">
      {/* Profile header */}
      <div className={`card p-4 ${cfg.bg} ${cfg.border} border`}>
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-12 h-12 rounded-2xl bg-navy-800 shrink-0`}>
            <User className={`w-6 h-6 ${cfg.color}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold text-navy-50 truncate">{tech.name}</p>
            <p className="text-xs text-navy-300">{tech.role}</p>
          </div>
          <button onClick={onLogout} className="btn-ghost p-2 text-navy-300 hover:text-error-400" aria-label="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-navy-700/50">
          <div className="text-center"><p className="text-xs text-navy-300">Today</p><p className={`text-sm font-bold ${cfg.color}`}>{formatDuration(todayMinutes)}</p></div>
          <div className="text-center"><p className="text-xs text-navy-300">Jobs</p><p className={`text-sm font-bold ${cfg.color}`}>{todayJobs.length}</p></div>
          <div className="text-center"><p className="text-xs text-navy-300">Done</p><p className={`text-sm font-bold ${cfg.color}`}>{completedJobs.length}</p></div>
        </div>
      </div>

      {/* Active timer */}
      {activeTimer && (
        <div className="card p-3.5 border-gold-600/40 bg-gold-900/10">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold-900/30 shrink-0">
              <Timer className="w-5 h-5 text-gold-400 animate-pulse-soft" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gold-400">Timer Running</p>
              <p className="text-lg font-bold text-navy-50 font-display">{formatDuration(elapsed)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Today's Jobs */}
      <div>
        <h3 className="section-title mb-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> Today's Schedule
        </h3>
        <div className="space-y-2">
          {todayJobs.length === 0 ? (
            <div className="card p-6 text-center">
              <Clock className="w-8 h-8 text-navy-600 mx-auto mb-2" />
              <p className="text-sm text-navy-300">No jobs scheduled today.</p>
            </div>
          ) : (
            todayJobs.sort((a, b) => (a.time_window || 'zzz').localeCompare(b.time_window || 'zzz')).map(job => (
              <JobCard key={job.id} job={job} onClick={() => onOpenJob(job.id)} />
            ))
          )}
        </div>
      </div>

      {/* Upcoming */}
      {upcomingJobs.length > 0 && (
        <div>
          <h3 className="section-title mb-2 flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" /> Upcoming
          </h3>
          <div className="space-y-2">
            {upcomingJobs.slice(0, 5).map(job => (
              <JobCard key={job.id} job={job} onClick={() => onOpenJob(job.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Job Card ────────────────────────────────────────────────
function JobCard({ job, onClick }: {
  job: Job;
  onClick: () => void;
}) {
  const { services, checklists } = useData();
  const serviceLabel = services.find(s => s.key === job.service_key)?.label || job.service_key;
  const checklistItems = checklists.filter(c => c.job_id === job.id);
  const checklistDone = checklistItems.filter(c => c.completed).length;

  return (
    <button onClick={onClick} className="card card-hover p-3 w-full text-left">
      <div className="flex items-start gap-2.5">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-navy-700 shrink-0">
          <ServiceIcon name={SERVICE_ICONS[job.service_key] || 'Wrench'} className="w-5 h-5 text-gold-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-navy-50 truncate">{job.customer_name}</p>
          <p className="text-xs text-navy-300 truncate">{serviceLabel}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {job.time_window && <span className="flex items-center gap-1 text-[10px] text-navy-400"><Clock className="w-2.5 h-2.5" /> {job.time_window}</span>}
            {job.scheduled_date && <span className="text-[10px] text-navy-400">{job.scheduled_date}</span>}
            <JobStatusBadge status={job.status} />
          </div>
          {checklistItems.length > 0 && (
            <div className="flex items-center gap-1 mt-1.5">
              <div className="h-1 flex-1 bg-navy-900 rounded-full overflow-hidden">
                <div className="h-full bg-gold-400 rounded-full transition-all" style={{ width: `${(checklistDone / checklistItems.length) * 100}%` }} />
              </div>
              <span className="text-[10px] text-navy-400 shrink-0">{checklistDone}/{checklistItems.length}</span>
            </div>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-navy-500 shrink-0 mt-1" />
      </div>
    </button>
  );
}

// ── Job Detail View ─────────────────────────────────────────
function JobDetailView({ job, tech, onBack }: {
  job: Job;
  tech: Technician;
  onBack: () => void;
}) {
  const { services, checklists, timeEntries, toggleChecklist, updateJob, updateJobStatus, addTimeEntry, updateTimeEntry, addNotification } = useData();
  const [noteText, setNoteText] = useState(job.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setNoteText(job.notes || ''); }, [job.id, job.notes]);

  const cfg = TECHNICIAN_COLORS[tech.color] || TECHNICIAN_COLORS.gold;
  const serviceLabel = services.find(s => s.key === job.service_key)?.label || job.service_key;
  const jobChecklists = checklists.filter(c => c.job_id === job.id);
  const checklistDone = jobChecklists.filter(c => c.completed).length;
  const checklistProgress = jobChecklists.length > 0 ? (checklistDone / jobChecklists.length) * 100 : 0;

  const myTimer = timeEntries.find(te => te.technician_id === tech.id && te.job_id === job.id && !te.clock_out);
  const myEntries = timeEntries.filter(te => te.technician_id === tech.id && te.job_id === job.id && te.clock_out);
  const totalJobMinutes = myEntries.reduce((s, te) => s + te.duration_minutes, 0) + (myTimer ? Math.round((Date.now() - new Date(myTimer.clock_in).getTime()) / 60000) : 0);

  const handleClockIn = async () => {
    await addTimeEntry({ job_id: job.id, technician_id: tech.id, clock_in: new Date().toISOString(), clock_out: null, duration_minutes: 0, notes: '' });
    if (job.status === 'scheduled') {
      await updateJobStatus(job.id, 'in-progress');
    }
  };

  const handleClockOut = async () => {
    if (!myTimer) return;
    const now = new Date();
    const duration = Math.round((now.getTime() - new Date(myTimer.clock_in).getTime()) / 60000);
    await updateTimeEntry(myTimer.id, { clock_out: now.toISOString(), duration_minutes: duration });
  };

  const handleComplete = async () => {
    if (myTimer) await handleClockOut();
    await updateJobStatus(job.id, 'complete');
    await updateJob(job.id, { notes: noteText.trim() });
    if (job.customer_phone) {
      await addNotification({
        type: 'sms',
        recipient: job.customer_phone,
        recipient_name: job.customer_name,
        subject: 'Job Complete',
        body: `Hi ${job.customer_name?.split(' ')[0] || 'there'}, your ${serviceLabel} service has been completed. Thank you for choosing ${COMPANY.name}! We'd love a review — reply with your feedback.`,
        status: 'sent',
        related_job_id: job.id,
        related_invoice_id: null,
      });
    }
    onBack();
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try { await updateJob(job.id, { notes: noteText.trim() }); }
    finally { setSavingNotes(false); }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-md mx-auto space-y-3 animate-fade-in pb-24">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-navy-300 hover:text-navy-100 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      {/* Job header */}
      <div className="card p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-navy-700 shrink-0">
            <ServiceIcon name={SERVICE_ICONS[job.service_key] || 'Wrench'} className="w-6 h-6 text-gold-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold text-navy-50 truncate">{job.customer_name}</p>
            <p className="text-sm text-navy-300">{serviceLabel}</p>
          </div>
          <JobStatusBadge status={job.status} />
        </div>
        <div className="space-y-1.5 pt-3 border-t border-navy-700">
          {job.time_window && <p className="flex items-center gap-2 text-sm text-navy-200"><Clock className="w-4 h-4 text-navy-400" /> {job.time_window}</p>}
          {job.address && <p className="flex items-start gap-2 text-sm text-navy-200"><MapPin className="w-4 h-4 text-navy-400 shrink-0 mt-0.5" /> {job.address}</p>}
          {job.customer_phone && <a href={`tel:${job.customer_phone}`} className="flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300"><Phone className="w-4 h-4" /> {job.customer_phone}</a>}
          <p className="flex items-center gap-2 text-sm text-gold-400 font-bold"><Wrench className="w-4 h-4" /> {formatCurrency(job.value)}</p>
        </div>
        {job.address && (
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(job.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary w-full mt-3 text-xs"
          >
            <NavIcon className="w-3.5 h-3.5" /> Navigate to Job Site
          </a>
        )}
      </div>

      {/* Embedded map */}
      {job.address && (
        <div className="card overflow-hidden p-0">
          <div className="relative h-48">
            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent(job.address)}&z=15&output=embed`}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Job site map"
              style={{ filter: 'saturate(0.85) brightness(0.9)' }}
            />
          </div>
        </div>
      )}

      {/* Timer section */}
      <div className={`card p-4 ${cfg.bg} ${cfg.border} border`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-navy-100 flex items-center gap-1.5"><Timer className="w-4 h-4" /> Time on Job</h3>
          <span className={`text-sm font-bold ${cfg.color}`}>{formatDuration(totalJobMinutes)}</span>
        </div>
        {myTimer ? (
          <button onClick={handleClockOut} className="flex items-center justify-center gap-2 w-full rounded-xl bg-error-600 hover:bg-error-500 text-navy-950 font-bold py-3 transition-all">
            <Square className="w-5 h-5 fill-current" /> Clock Out
          </button>
        ) : (
          <button onClick={handleClockIn} className="flex items-center justify-center gap-2 w-full rounded-xl bg-success-600 hover:bg-success-500 text-navy-950 font-bold py-3 transition-all">
            <Play className="w-5 h-5 fill-current" /> Clock In
          </button>
        )}
        {myEntries.length > 0 && (
          <div className="mt-3 pt-3 border-t border-navy-700/50 space-y-1">
            <p className="text-xs text-navy-400 font-semibold mb-1">Previous sessions</p>
            {myEntries.map(e => (
              <div key={e.id} className="flex items-center justify-between text-xs">
                <span className="text-navy-300">{new Date(e.clock_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {new Date(e.clock_in).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                <span className={`font-bold ${cfg.color}`}>{formatDuration(e.duration_minutes)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checklist */}
      {jobChecklists.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-navy-100 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Checklist</h3>
            <span className="text-xs font-bold text-gold-400">{checklistDone}/{jobChecklists.length}</span>
          </div>
          <div className="h-1.5 bg-navy-900 rounded-full mb-3 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-gold-400 to-gold-500 rounded-full transition-all duration-300" style={{ width: `${checklistProgress}%` }} />
          </div>
          <div className="space-y-1">
            {jobChecklists.map(item => (
              <button
                key={item.id}
                onClick={() => toggleChecklist(item.id, !item.completed)}
                className="flex items-center gap-2.5 w-full rounded-lg p-2.5 text-left hover:bg-navy-900 transition-all"
              >
                {item.completed ? <CheckCircle2 className="w-5 h-5 text-success-400 shrink-0" /> : <Circle className="w-5 h-5 text-navy-500 shrink-0" />}
                <span className={`text-sm ${item.completed ? 'text-navy-400 line-through' : 'text-navy-100'}`}>{item.item_text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Photo capture */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-navy-100 flex items-center gap-1.5 mb-3"><Camera className="w-4 h-4" /> Job Site Photos</h3>
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoCapture} />
        {photoUrl ? (
          <div className="space-y-2">
            <div className="relative rounded-xl overflow-hidden">
              <img src={photoUrl} alt="Job site" className="w-full rounded-xl" />
              <button onClick={() => setPhotoUrl(null)} className="absolute top-2 right-2 btn-ghost p-1.5 bg-navy-950/80"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-success-400 text-center">Photo captured (demo — not uploaded to server)</p>
          </div>
        ) : (
          <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-navy-600 hover:border-gold-500/50 py-8 transition-all">
            <Camera className="w-8 h-8 text-navy-500" />
            <p className="text-sm text-navy-300">Tap to capture photo</p>
            <p className="text-[10px] text-navy-500">Before / during / after documentation</p>
          </button>
        )}
      </div>

      {/* Notes */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-navy-100 flex items-center gap-1.5 mb-2"><Wrench className="w-4 h-4" /> Job Notes</h3>
        <textarea
          className="input min-h-[80px]"
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
          placeholder="Add notes about the work performed, issues found, materials used..."
        />
        <button onClick={handleSaveNotes} disabled={savingNotes} className="btn-secondary w-full mt-2 text-xs">
          {savingNotes ? 'Saving...' : 'Save Notes'}
        </button>
      </div>

      {/* Collect payment via Square */}
      {job.status === 'complete' && (
        <div className="card p-4 border-accent-700/30">
          <h3 className="text-sm font-semibold text-navy-100 flex items-center gap-1.5 mb-2"><CreditCard className="w-4 h-4 text-accent-400" /> Collect Payment</h3>
          <p className="text-xs text-navy-300 mb-3">Share the Square checkout link with the customer to collect payment of <span className="font-bold text-gold-400">{formatCurrency(job.value)}</span>.</p>
          <a href={COMPANY.squareCheckoutUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full rounded-xl bg-accent-600 hover:bg-accent-500 text-navy-950 font-bold py-3 transition-all">
            <ExternalLink className="w-5 h-5" /> Open Square Checkout
          </a>
        </div>
      )}

      {/* Complete job */}
      {job.status !== 'complete' && (
        <button
          onClick={handleComplete}
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-success-600 hover:bg-success-500 text-navy-950 font-bold py-3.5 transition-all shadow-glow"
        >
          <CheckCircle2 className="w-5 h-5" /> Mark Job Complete
        </button>
      )}
    </div>
  );
}
