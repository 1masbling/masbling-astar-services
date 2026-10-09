import { useState, useMemo } from 'react';
import {
  CalendarDays, ChevronLeft, ChevronRight, X,
  User, Clock, MapPin, Wrench, Users as UsersIcon,
  Timer, Play, Square, Plus, History, Map as MapIcon,
} from 'lucide-react';
import JobMap from '@/components/JobMap';
import { useData } from '@/lib/data';
import { formatCurrency, formatDate, formatRelative } from '@/lib/format';
import {
  SERVICE_ICONS, TECHNICIAN_COLORS, TIME_WINDOWS,
} from '@/lib/constants';
import { JobStatusBadge } from '@/components/StatusBadges';
import ServiceIcon from '@/components/ServiceIcon';
import type { Job, Technician } from '@/lib/types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function startOfWeek(d: Date) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - date.getDay());
  return date;
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

type DispatchTab = 'calendar' | 'time' | 'map';

export default function Dispatch() {
  const [tab, setTab] = useState<DispatchTab>('calendar');
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-1.5">
        <button onClick={() => setTab('calendar')} className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${tab === 'calendar' ? 'bg-gold-400 text-navy-950' : 'bg-navy-800 text-navy-300 hover:bg-navy-700'}`}>
          <CalendarDays className="w-3.5 h-3.5" /> Calendar
        </button>
        <button onClick={() => setTab('time')} className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${tab === 'time' ? 'bg-gold-400 text-navy-950' : 'bg-navy-800 text-navy-300 hover:bg-navy-700'}`}>
          <Timer className="w-3.5 h-3.5" /> Time Tracking
        </button>
        <button onClick={() => setTab('map')} className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${tab === 'map' ? 'bg-gold-400 text-navy-950' : 'bg-navy-800 text-navy-300 hover:bg-navy-700'}`}>
          <MapIcon className="w-3.5 h-3.5" /> Map
        </button>
      </div>
      {tab === 'calendar' && <CalendarTab />}
      {tab === 'time' && <TimeTrackingTab />}
      {tab === 'map' && <MapTab />}
    </div>
  );
}

function CalendarTab() {
  const { jobs, technicians, services, updateJob } = useData();
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [assignJob, setAssignJob] = useState<Job | null>(null);
  const [showUnassigned, setShowUnassigned] = useState(true);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const todayISO = toISO(new Date());

  const scheduledJobs = useMemo(() => jobs.filter(j => j.scheduled_date && j.status !== 'complete' && j.status !== 'estimate'), [jobs]);
  const unassignedJobs = useMemo(() => scheduledJobs.filter(j => !j.technician_id), [scheduledJobs]);

  const jobsByDay = useMemo(() => {
    const map: Record<string, Job[]> = {};
    weekDays.forEach(d => { map[toISO(d)] = []; });
    scheduledJobs.forEach(j => {
      if (j.scheduled_date && map[j.scheduled_date]) map[j.scheduled_date].push(j);
    });
    Object.values(map).forEach(arr => arr.sort((a, b) => (a.time_window || 'zzz').localeCompare(b.time_window || 'zzz')));
    return map;
  }, [scheduledJobs, weekDays]);

  const weekLabel = `${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  const techFor = (id: string | null) => technicians.find(t => t.id === id);
  const serviceLabel = (key: string) => services.find(s => s.key === key)?.label || key;
  const assignedCount = scheduledJobs.filter(j => j.technician_id).length;

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-navy-50 font-display">Dispatch</h2>
          <span className="text-xs text-navy-300">{assignedCount}/{scheduledJobs.length} assigned</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekStart(startOfWeek(new Date()))} className="btn-ghost text-xs">Today</button>
          <div className="flex items-center gap-1">
            <button onClick={() => setWeekStart(addDays(weekStart, -7))} className="btn-ghost p-1.5"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-xs font-semibold text-navy-100 min-w-[140px] text-center">{weekLabel}</span>
            <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="btn-ghost p-1.5"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div className="card p-3">
        <div className="flex items-center gap-2 mb-2"><UsersIcon className="w-4 h-4 text-gold-400" /><span className="text-xs font-semibold text-navy-100">Technicians</span></div>
        <div className="flex flex-wrap gap-2">
          {technicians.filter(t => t.active).map(t => {
            const cfg = TECHNICIAN_COLORS[t.color] || TECHNICIAN_COLORS.gold;
            const count = scheduledJobs.filter(j => j.technician_id === t.id).length;
            return <span key={t.id} className={`inline-flex items-center gap-1.5 rounded-full ${cfg.bg} ${cfg.border} border px-2.5 py-1 text-xs font-semibold ${cfg.color}`}><span className={`w-2 h-2 rounded-full ${cfg.dot}`} />{t.name} ({count})</span>;
          })}
        </div>
      </div>

      {showUnassigned && unassignedJobs.length > 0 && (
        <div className="card p-3 border-accent-700/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent-400" /><span className="text-xs font-semibold text-accent-300">Unassigned Queue ({unassignedJobs.length})</span></div>
            <button onClick={() => setShowUnassigned(false)} className="btn-ghost p-1"><X className="w-3.5 h-3.5" /></button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {unassignedJobs.map(job => (
              <button key={job.id} onClick={() => setAssignJob(job)} className="card card-hover p-2.5 min-w-[180px] text-left shrink-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-navy-700 shrink-0"><ServiceIcon name={SERVICE_ICONS[job.service_key] || 'Wrench'} className="w-3.5 h-3.5 text-gold-400" /></div>
                  <div className="min-w-0"><p className="text-xs font-semibold text-navy-50 truncate">{job.customer_name}</p><p className="text-[10px] text-navy-300 truncate">{serviceLabel(job.service_key)}</p></div>
                </div>
                <div className="flex items-center justify-between"><span className="text-[10px] text-navy-400">{job.scheduled_date}</span><span className="text-xs font-bold text-gold-400">{formatCurrency(job.value)}</span></div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {weekDays.map(day => {
          const iso = toISO(day);
          const dayJobs = jobsByDay[iso] || [];
          const isToday = iso === todayISO;
          return (
            <div key={iso} className={`card p-2 min-h-[160px] ${isToday ? 'border-gold-600/50' : ''}`}>
              <div className={`flex items-center justify-between mb-2 pb-1.5 border-b ${isToday ? 'border-gold-700/40' : 'border-navy-700'}`}>
                <div><p className={`text-xs font-bold ${isToday ? 'text-gold-400' : 'text-navy-200'}`}>{WEEKDAYS[day.getDay()]}</p><p className={`text-sm font-bold font-display ${isToday ? 'text-gold-300' : 'text-navy-50'}`}>{day.getDate()}</p></div>
                {dayJobs.length > 0 && <span className="text-[10px] font-bold text-navy-400 bg-navy-800 rounded-full px-1.5 py-0.5">{dayJobs.length}</span>}
              </div>
              <div className="space-y-1.5">
                {dayJobs.map(job => {
                  const tech = techFor(job.technician_id);
                  const cfg = tech ? TECHNICIAN_COLORS[tech.color] || TECHNICIAN_COLORS.gold : null;
                  return (
                    <button key={job.id} onClick={() => setAssignJob(job)} className={`w-full text-left rounded-lg p-2 border transition-all hover:scale-[1.02] ${cfg ? `${cfg.bg} ${cfg.border}` : 'bg-navy-900 border-navy-700'}`}>
                      <div className="flex items-center gap-1.5 mb-1"><ServiceIcon name={SERVICE_ICONS[job.service_key] || 'Wrench'} className={`w-3 h-3 ${cfg ? cfg.color : 'text-navy-400'}`} /><p className="text-xs font-semibold text-navy-50 truncate">{job.customer_name}</p></div>
                      {job.time_window && <p className="flex items-center gap-1 text-[10px] text-navy-300 mb-0.5"><Clock className="w-2.5 h-2.5" /> {job.time_window}</p>}
                      <div className="flex items-center justify-between">{tech ? <span className={`text-[10px] font-medium ${cfg?.color}`}>{tech.name.split(' ')[0]}</span> : <span className="text-[10px] font-medium text-accent-300">Unassigned</span>}<span className="text-[10px] font-bold text-gold-400">{formatCurrency(job.value)}</span></div>
                    </button>
                  );
                })}
                {dayJobs.length === 0 && <p className="text-[10px] text-navy-500 text-center py-3">No jobs</p>}
              </div>
            </div>
          );
        })}
      </div>

      {assignJob && (
        <AssignModal
          job={assignJob}
          technicians={technicians}
          serviceLabel={serviceLabel(assignJob.service_key)}
          onClose={() => setAssignJob(null)}
          onAssign={async (techId, timeWindow) => { await updateJob(assignJob.id, { technician_id: techId, time_window: timeWindow }); setAssignJob(null); }}
        />
      )}
    </>
  );
}

function AssignModal({ job, technicians, serviceLabel, onClose, onAssign }: {
  job: Job;
  technicians: Technician[];
  serviceLabel: string;
  onClose: () => void;
  onAssign: (techId: string | null, timeWindow: string | null) => Promise<void>;
}) {
  const [techId, setTechId] = useState<string | null>(job.technician_id);
  const [timeWindow, setTimeWindow] = useState<string | null>(job.time_window);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeTechs = technicians.filter(t => t.active);

  const handleSave = async () => {
    setSaving(true); setError(null);
    try { await onAssign(techId, timeWindow); }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to assign'); setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-navy-950/80 backdrop-blur-sm p-0 md:p-4" onClick={onClose}>
      <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto rounded-b-none md:rounded-2xl p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-navy-50">Assign Technician</h3>
          <button onClick={onClose} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
        </div>
        <div className="card p-3 mb-4 bg-navy-900">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-navy-700 shrink-0"><ServiceIcon name={SERVICE_ICONS[job.service_key] || 'Wrench'} className="w-4 h-4 text-gold-400" /></div>
            <div className="min-w-0"><p className="text-sm font-semibold text-navy-50 truncate">{job.customer_name}</p><p className="text-xs text-navy-300">{serviceLabel} · {formatCurrency(job.value)}</p></div>
          </div>
          <div className="space-y-1 text-xs text-navy-300">
            <p className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-navy-400" /> {job.scheduled_date}</p>
            {job.address && <p className="flex items-start gap-1.5"><MapPin className="w-3.5 h-3.5 text-navy-400 shrink-0 mt-0.5" /> {job.address}</p>}
          </div>
          <div className="mt-2 pt-2 border-t border-navy-700"><JobStatusBadge status={job.status} /></div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="label flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Technician</label>
            <div className="grid grid-cols-1 gap-1.5">
              {activeTechs.map(t => {
                const cfg = TECHNICIAN_COLORS[t.color] || TECHNICIAN_COLORS.gold;
                return (
                  <button key={t.id} onClick={() => setTechId(t.id)} className={`flex items-center gap-2.5 rounded-xl p-2.5 border transition-all text-left ${techId === t.id ? `${cfg.bg} ${cfg.border}` : 'bg-navy-900 border-navy-700 hover:border-navy-600'}`}>
                    <span className={`w-3 h-3 rounded-full ${cfg.dot} shrink-0`} />
                    <div className="min-w-0 flex-1"><p className={`text-sm font-semibold ${techId === t.id ? cfg.color : 'text-navy-100'}`}>{t.name}</p><p className="text-xs text-navy-400">{t.role}</p></div>
                    {techId === t.id && <span className={`text-xs font-bold ${cfg.color}`}>✓</span>}
                  </button>
                );
              })}
              <button onClick={() => setTechId(null)} className={`flex items-center gap-2.5 rounded-xl p-2.5 border transition-all text-left ${techId === null ? 'bg-accent-900/30 border-accent-700' : 'bg-navy-900 border-navy-700 hover:border-navy-600'}`}>
                <Wrench className="w-3.5 h-3.5 text-navy-400" /><p className={`text-sm font-semibold ${techId === null ? 'text-accent-300' : 'text-navy-300'}`}>Unassigned</p>
              </button>
            </div>
          </div>
          <div>
            <label className="label flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Time Window</label>
            <select className="input" value={timeWindow || ''} onChange={e => setTimeWindow(e.target.value || null)}>
              <option value="">No time window</option>
              {TIME_WINDOWS.map(tw => <option key={tw} value={tw}>{tw}</option>)}
            </select>
          </div>
          {error && <p className="text-xs text-error-400">{error}</p>}
          <div className="flex items-center gap-2 pt-1"><button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button><button type="button" onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save Assignment'}</button></div>
        </div>
      </div>
    </div>
  );
}

// ── Time Tracking Tab ───────────────────────────────────────
function TimeTrackingTab() {
  const { timeEntries, technicians, jobs, addTimeEntry, updateTimeEntry } = useData();
  const [showManual, setShowManual] = useState(false);

  const activeEntries = timeEntries.filter(te => !te.clock_out);
  const completedEntries = timeEntries.filter(te => te.clock_out).sort((a, b) => (b.clock_in || '').localeCompare(a.clock_in || ''));

  const techName = (id: string | null) => technicians.find(t => t.id === id)?.name || 'Unassigned';
  const jobFor = (id: string | null) => jobs.find(j => j.id === id);

  const totalMinutesToday = useMemo(() => {
    const today = toISO(new Date());
    return completedEntries.filter(te => te.clock_in && te.clock_in.slice(0, 10) === today).reduce((s, te) => s + te.duration_minutes, 0);
  }, [completedEntries]);

  const totalWeek = useMemo(() => {
    const ws = startOfWeek(new Date());
    return completedEntries.filter(te => te.clock_in && new Date(te.clock_in) >= ws).reduce((s, te) => s + te.duration_minutes, 0);
  }, [completedEntries]);

  const perTech = useMemo(() => {
    const map: Record<string, number> = {};
    completedEntries.forEach(te => {
      const name = techName(te.technician_id);
      map[name] = (map[name] || 0) + te.duration_minutes;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [completedEntries, technicians]);

  const handleClockIn = async (techId: string, jobId: string | null) => {
    await addTimeEntry({ job_id: jobId, technician_id: techId, clock_in: new Date().toISOString(), clock_out: null, duration_minutes: 0, notes: '' });
  };

  const handleClockOut = async (entryId: string) => {
    const entry = timeEntries.find(te => te.id === entryId);
    if (!entry) return;
    const now = new Date();
    const duration = Math.round((now.getTime() - new Date(entry.clock_in).getTime()) / 60000);
    await updateTimeEntry(entryId, { clock_out: now.toISOString(), duration_minutes: duration });
  };

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-bold text-navy-50 font-display">Time Tracking</h2>
        <button onClick={() => setShowManual(true)} className="btn-primary text-xs py-2"><Plus className="w-3.5 h-3.5" /> Manual Entry</button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="card p-3"><div className="flex items-center gap-1.5 mb-1"><Timer className="w-4 h-4 text-gold-400" /><span className="text-xs text-navy-300">Today</span></div><p className="text-base font-bold text-navy-50 font-display">{formatDuration(totalMinutesToday)}</p></div>
        <div className="card p-3"><div className="flex items-center gap-1.5 mb-1"><Clock className="w-4 h-4 text-teal-400" /><span className="text-xs text-navy-300">This Week</span></div><p className="text-base font-bold text-teal-300 font-display">{formatDuration(totalWeek)}</p></div>
        <div className="card p-3"><div className="flex items-center gap-1.5 mb-1"><UsersIcon className="w-4 h-4 text-accent-400" /><span className="text-xs text-navy-300">Active</span></div><p className="text-base font-bold text-accent-300 font-display">{activeEntries.length}</p></div>
      </div>

      {/* Active timers */}
      <div>
        <h3 className="section-title mb-2">Active Timers</h3>
        <div className="space-y-2">
          {activeEntries.map(entry => {
            const tech = technicians.find(t => t.id === entry.technician_id);
            const cfg = tech ? TECHNICIAN_COLORS[tech.color] || TECHNICIAN_COLORS.gold : null;
            const job = jobFor(entry.job_id);
            const elapsed = entry.clock_in ? Math.round((Date.now() - new Date(entry.clock_in).getTime()) / 60000) : 0;
            return (
              <div key={entry.id} className={`card p-3 border ${cfg ? cfg.border : 'border-navy-700'} ${cfg ? cfg.bg : ''}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-navy-700">
                        <Timer className={`w-4 h-4 ${cfg?.color || 'text-navy-400'} animate-pulse-soft`} />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${cfg?.color || 'text-navy-100'}`}>{tech?.name || 'Unknown'}</p>
                      <p className="text-xs text-navy-300 truncate">{job ? `${job.customer_name} · ${job.service_key}` : 'No job assigned'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <p className={`text-sm font-bold font-display ${cfg?.color || 'text-navy-100'}`}>{formatDuration(elapsed)}</p>
                      <p className="text-[10px] text-navy-400">Since {new Date(entry.clock_in).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                    </div>
                    <button onClick={() => handleClockOut(entry.id)} className="flex items-center justify-center w-9 h-9 rounded-xl bg-error-600 hover:bg-error-500 text-navy-950 transition-all shrink-0">
                      <Square className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {activeEntries.length === 0 && <div className="card p-6 text-center"><Timer className="w-8 h-8 text-navy-600 mx-auto mb-2" /><p className="text-sm text-navy-300">No active timers. Clock in a technician to start tracking.</p></div>}
        </div>
      </div>

      {/* Quick clock-in */}
      <div>
        <h3 className="section-title mb-2">Quick Clock-In</h3>
        <div className="grid grid-cols-2 gap-2">
          {technicians.filter(t => t.active).map(t => {
            const cfg = TECHNICIAN_COLORS[t.color] || TECHNICIAN_COLORS.gold;
            const isClockedIn = activeEntries.some(e => e.technician_id === t.id);
            const assignedJobs = jobs.filter(j => j.technician_id === t.id && j.status === 'in-progress');
            return (
              <div key={t.id} className={`card p-2.5 border ${cfg.border} ${cfg.bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                  <p className={`text-sm font-semibold ${cfg.color} truncate`}>{t.name}</p>
                  {isClockedIn && <span className="text-[9px] font-bold text-success-400 ml-auto">CLOCKED IN</span>}
                </div>
                {isClockedIn ? (
                  <p className="text-xs text-navy-400">Already tracking time</p>
                ) : assignedJobs.length > 0 ? (
                  <div className="space-y-1">
                    {assignedJobs.slice(0, 2).map(j => (
                      <button key={j.id} onClick={() => handleClockIn(t.id, j.id)} className={`flex items-center gap-1.5 w-full rounded-lg bg-navy-800 hover:bg-navy-700 p-1.5 text-xs font-semibold ${cfg.color} transition-all`}>
                        <Play className="w-3 h-3 fill-current" /> {j.customer_name}
                      </button>
                    ))}
                    <button onClick={() => handleClockIn(t.id, null)} className="flex items-center gap-1.5 w-full rounded-lg bg-navy-800 hover:bg-navy-700 p-1.5 text-xs font-semibold text-navy-300 transition-all">
                      <Play className="w-3 h-3 fill-current" /> General work
                    </button>
                  </div>
                ) : (
                  <button onClick={() => handleClockIn(t.id, null)} className={`flex items-center gap-1.5 w-full rounded-lg bg-navy-800 hover:bg-navy-700 p-1.5 text-xs font-semibold ${cfg.color} transition-all`}>
                    <Play className="w-3 h-3 fill-current" /> Clock In
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-technician totals */}
      {perTech.length > 0 && (
        <div>
          <h3 className="section-title mb-2">Hours by Technician</h3>
          <div className="space-y-1.5">
            {perTech.map(([name, mins]) => {
              const tech = technicians.find(t => t.name === name);
              const cfg = tech ? TECHNICIAN_COLORS[tech.color] || TECHNICIAN_COLORS.gold : null;
              return (
                <div key={name} className="card p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${cfg?.dot || 'bg-navy-500'}`} /><span className="text-sm font-medium text-navy-100">{name}</span></div>
                  <span className={`text-sm font-bold ${cfg?.color || 'text-navy-200'}`}>{formatDuration(mins)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* History */}
      <div>
        <h3 className="section-title mb-2 flex items-center gap-1.5"><History className="w-3.5 h-3.5" /> Recent Entries</h3>
        <div className="space-y-1.5">
          {completedEntries.slice(0, 15).map(entry => {
            const tech = technicians.find(t => t.id === entry.technician_id);
            const cfg = tech ? TECHNICIAN_COLORS[tech.color] || TECHNICIAN_COLORS.gold : null;
            const job = jobFor(entry.job_id);
            return (
              <div key={entry.id} className="card p-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full ${cfg?.dot || 'bg-navy-500'} shrink-0`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-navy-100 truncate">{tech?.name || 'Unknown'}</p>
                    <p className="text-xs text-navy-400 truncate">{job ? job.customer_name : 'No job'} · {formatDate(entry.clock_in)}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${cfg?.color || 'text-navy-200'}`}>{formatDuration(entry.duration_minutes)}</p>
                  <p className="text-[10px] text-navy-400">{formatRelative(entry.clock_in)}</p>
                </div>
              </div>
            );
          })}
          {completedEntries.length === 0 && <p className="text-xs text-navy-400 text-center py-3">No completed time entries yet.</p>}
        </div>
      </div>

      {showManual && (
        <ManualEntryModal
          technicians={technicians}
          jobs={jobs}
          onClose={() => setShowManual(false)}
          onSave={async (entry) => { await addTimeEntry(entry); setShowManual(false); }}
        />
      )}
    </>
  );
}

function ManualEntryModal({ technicians, jobs, onClose, onSave }: {
  technicians: Technician[];
  jobs: Job[];
  onClose: () => void;
  onSave: (e: { job_id: string | null; technician_id: string | null; clock_in: string; clock_out: string | null; duration_minutes: number; notes: string }) => Promise<void>;
}) {
  const [techId, setTechId] = useState('');
  const [jobId, setJobId] = useState('');
  const [clockIn, setClockIn] = useState('');
  const [clockOut, setClockOut] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!techId || !clockIn) { setError('Technician and clock-in time are required'); return; }
    const inTime = new Date(clockIn);
    const outTime = clockOut ? new Date(clockOut) : null;
    const duration = outTime ? Math.round((outTime.getTime() - inTime.getTime()) / 60000) : 0;
    if (outTime && duration <= 0) { setError('Clock-out must be after clock-in'); return; }
    setSaving(true); setError(null);
    try {
      await onSave({ job_id: jobId || null, technician_id: techId, clock_in: inTime.toISOString(), clock_out: outTime?.toISOString() || null, duration_minutes: duration, notes: notes.trim() });
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to save'); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-navy-950/80 backdrop-blur-sm p-0 md:p-4" onClick={onClose}>
      <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto rounded-b-none md:rounded-2xl p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-navy-50">Manual Time Entry</h3>
          <button onClick={onClose} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><label className="label">Technician *</label>
            <select className="input" value={techId} onChange={e => setTechId(e.target.value)}>
              <option value="">Select...</option>
              {technicians.filter(t => t.active).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div><label className="label">Job (optional)</label>
            <select className="input" value={jobId} onChange={e => setJobId(e.target.value)}>
              <option value="">No specific job</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.customer_name} — {j.service_key}</option>)}
            </select>
          </div>
          <div><label className="label">Clock In *</label><input className="input" type="datetime-local" value={clockIn} onChange={e => setClockIn(e.target.value)} /></div>
          <div><label className="label">Clock Out</label><input className="input" type="datetime-local" value={clockOut} onChange={e => setClockOut(e.target.value)} /></div>
          <div><label className="label">Notes</label><input className="input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Work performed..." /></div>
          {error && <p className="text-xs text-error-400">{error}</p>}
          <div className="flex items-center gap-2 pt-1"><button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button><button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save Entry'}</button></div>
        </form>
      </div>
    </div>
  );
}

// ── Map Tab ─────────────────────────────────────────────────
function MapTab() {
  const { jobs, technicians } = useData();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const scheduledJobs = useMemo(
    () => jobs.filter(j => j.scheduled_date && j.address && j.status !== 'complete' && j.status !== 'estimate'),
    [jobs],
  );

  const selectedJob = scheduledJobs.find(j => j.id === selectedJobId) || null;

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-navy-50 font-display">Dispatch Map</h2>
          <span className="text-xs text-navy-300">{scheduledJobs.length} scheduled jobs</span>
        </div>
      </div>

      <JobMap
        jobs={scheduledJobs}
        technicians={technicians}
        onSelectJob={(job) => setSelectedJobId(job.id)}
        selectedJobId={selectedJobId}
        height="420px"
      />

      {selectedJob && (
        <div className="card p-4 border-gold-600/40 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-navy-700 shrink-0">
              <ServiceIcon name={SERVICE_ICONS[selectedJob.service_key] || 'Wrench'} className="w-5 h-5 text-gold-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-navy-50">{selectedJob.customer_name}</p>
              <p className="text-xs text-navy-300">{selectedJob.address}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-[10px] text-navy-400">{selectedJob.scheduled_date}</span>
                {selectedJob.time_window && <span className="text-[10px] text-navy-400">{selectedJob.time_window}</span>}
                <JobStatusBadge status={selectedJob.status} />
              </div>
            </div>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(selectedJob.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs shrink-0"
            >
              <MapPin className="w-3.5 h-3.5" /> Open in Maps
            </a>
          </div>
        </div>
      )}
    </>
  );
}
