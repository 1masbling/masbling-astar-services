import { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, ShieldAlert, ShieldX, Loader2, X, Wrench,
  AlertTriangle, Info, CheckCircle2, Database, Lock, Zap, RefreshCw,
} from 'lucide-react';

interface Finding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  table: string | null;
  category: string;
  title: string;
  description: string;
  recommendation: string;
  fixable: boolean;
}

interface FixResult {
  applied: string[];
  errors: string[];
}

const severityConfig: Record<string, {
  label: string;
  icon: typeof ShieldX;
  color: string;
  bg: string;
  border: string;
  dot: string;
}> = {
  critical: { label: 'Critical', icon: ShieldX, color: 'text-error-300', bg: 'bg-error-900/40', border: 'border-error-700/50', dot: 'bg-error-400' },
  high:     { label: 'High',     icon: ShieldAlert, color: 'text-accent-300', bg: 'bg-accent-900/40', border: 'border-accent-700/50', dot: 'bg-accent-400' },
  medium:   { label: 'Medium',   icon: AlertTriangle, color: 'text-warning-300', bg: 'bg-warning-900/40', border: 'border-warning-700/50', dot: 'bg-warning-400' },
  low:      { label: 'Low',      icon: Info, color: 'text-teal-300', bg: 'bg-teal-900/40', border: 'border-teal-700/50', dot: 'bg-teal-400' },
};

const categoryIcons: Record<string, typeof Lock> = {
  'Row Level Security': Lock,
  'RLS Policies': ShieldCheck,
  'Policy Permissions': ShieldAlert,
  'Performance': Database,
};

export default function SecurityAudit({ onClose }: { onClose: () => void }) {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [fixing, setFixing] = useState(false);
  const [fixResult, setFixResult] = useState<FixResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fixedIds, setFixedIds] = useState<Set<string>>(new Set());

  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/security-audit`;

  const runAudit = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFixResult(null);
    try {
      const res = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error(`Audit failed (${res.status})`);
      const data = await res.json();
      if (!data.findings || !Array.isArray(data.findings)) throw new Error('Invalid response');
      setFindings(data.findings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run audit');
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => { runAudit(); }, [runAudit]);

  const handleFixAll = async () => {
    setFixing(true);
    setError(null);
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'fix_all' }),
      });
      if (!res.ok) throw new Error(`Fix failed (${res.status})`);
      const data = await res.json();
      if (!data.results) throw new Error('Invalid response');
      setFixResult(data.results);
      const fixed = new Set<string>();
      findings.forEach(f => {
        if (f.fixable) fixed.add(f.id);
      });
      setFixedIds(fixed);
      await runAudit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply fixes');
    } finally {
      setFixing(false);
    }
  };

  const fixableCount = findings.filter(f => f.fixable && !fixedIds.has(f.id)).length;
  const allFixed = findings.length > 0 && findings.every(f => !f.fixable || fixedIds.has(f.id));
  const counts = {
    critical: findings.filter(f => f.severity === 'critical' && !fixedIds.has(f.id)).length,
    high: findings.filter(f => f.severity === 'high' && !fixedIds.has(f.id)).length,
    medium: findings.filter(f => f.severity === 'medium' && !fixedIds.has(f.id)).length,
    low: findings.filter(f => f.severity === 'low' && !fixedIds.has(f.id)).length,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-navy-950/80 backdrop-blur-sm p-0 md:p-4" onClick={onClose}>
      <div className="card w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-b-none md:rounded-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-navy-800/95 backdrop-blur-sm border-b border-navy-700 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl shadow-glow ${allFixed ? 'bg-gradient-to-br from-success-400 to-success-600' : 'bg-gradient-to-br from-error-400 to-error-600'}`}>
              {allFixed ? <ShieldCheck className="w-5 h-5 text-navy-950" /> : <ShieldAlert className="w-5 h-5 text-navy-950" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-navy-50 font-display">Security Audit</h2>
              <p className="text-xs text-navy-300">
                {loading ? 'Scanning database...' : allFixed ? 'All fixable issues resolved' : `${findings.length} finding${findings.length !== 1 ? 's' : ''} detected`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={runAudit} disabled={loading} className="btn-ghost p-2" title="Re-run audit">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="btn-ghost p-2"><X className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Severity Summary */}
          {!loading && findings.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {(['critical', 'high', 'medium', 'low'] as const).map(sev => {
                const cfg = severityConfig[sev];
                const count = counts[sev];
                return (
                  <div key={sev} className={`rounded-xl border ${cfg.border} ${cfg.bg} p-2.5 text-center`}>
                    <cfg.icon className={`w-4 h-4 mx-auto mb-1 ${cfg.color}`} />
                    <p className={`text-lg font-bold font-display ${cfg.color}`}>{count}</p>
                    <p className="text-[10px] text-navy-300">{cfg.label}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="rounded-xl border border-error-700/50 bg-error-900/30 p-4 flex items-start gap-2.5">
              <AlertTriangle className="w-4.5 h-4.5 text-error-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-error-300">Audit Error</p>
                <p className="text-xs text-navy-300 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="py-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-navy-700 mb-3">
                <Loader2 className="w-6 h-6 text-gold-400 animate-spin" />
              </div>
              <p className="text-sm font-semibold text-navy-100">Scanning database for vulnerabilities...</p>
              <p className="text-xs text-navy-300 mt-1">Checking RLS policies, indexes, and permissions</p>
            </div>
          )}

          {/* Findings list */}
          {!loading && findings.length === 0 && !error && (
            <div className="py-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-success-900/40 mb-3">
                <CheckCircle2 className="w-6 h-6 text-success-400" />
              </div>
              <p className="text-sm font-semibold text-navy-100">No vulnerabilities found</p>
              <p className="text-xs text-navy-300 mt-1">Your database security configuration looks good.</p>
            </div>
          )}

          {/* Fix result banner */}
          {fixResult && (
            <div className={`rounded-xl border p-3.5 ${fixResult.errors.length > 0 ? 'border-warning-700/50 bg-warning-900/30' : 'border-success-700/50 bg-success-900/30'}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-success-400" />
                <p className="text-sm font-semibold text-navy-50">Fixes Applied ({fixResult.applied.length})</p>
              </div>
              <div className="space-y-1">
                {fixResult.applied.map((item, i) => (
                  <p key={i} className="text-xs text-navy-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-success-400 shrink-0" /> {item}
                  </p>
                ))}
                {fixResult.errors.map((item, i) => (
                  <p key={`e${i}`} className="text-xs text-error-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-error-400 shrink-0" /> {item}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Individual findings */}
          {!loading && findings.length > 0 && (
            <div className="space-y-2.5">
              {findings.map(finding => {
                const cfg = severityConfig[finding.severity];
                const CategoryIcon = categoryIcons[finding.category] || Info;
                const isFixed = fixedIds.has(finding.id);
                return (
                  <div
                    key={finding.id}
                    className={`rounded-xl border p-3.5 transition-all ${isFixed ? 'border-success-700/30 bg-success-900/20 opacity-60' : `${cfg.border} ${cfg.bg}`}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`shrink-0 mt-0.5 ${cfg.color}`}>
                        <CategoryIcon className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${cfg.bg} ${cfg.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} /> {cfg.label}
                          </span>
                          {finding.table && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-navy-700 px-2 py-0.5 text-[10px] font-medium text-navy-200">
                              <Database className="w-2.5 h-2.5" /> {finding.table}
                            </span>
                          )}
                          {finding.fixable && !isFixed && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gold-900/40 px-2 py-0.5 text-[10px] font-bold text-gold-300">
                              <Wrench className="w-2.5 h-2.5" /> Fixable
                            </span>
                          )}
                          {isFixed && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-success-900/40 px-2 py-0.5 text-[10px] font-bold text-success-300">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Fixed
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-navy-50">{finding.title}</p>
                        <p className="text-xs text-navy-300 mt-1 leading-relaxed">{finding.description}</p>
                        <div className="mt-2 rounded-lg bg-navy-900/60 p-2">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-navy-400 mb-0.5">Recommendation</p>
                          <p className="text-xs text-navy-200 font-mono leading-relaxed">{finding.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Fix button */}
          {!loading && fixableCount > 0 && (
            <button
              onClick={handleFixAll}
              disabled={fixing}
              className="btn-primary w-full"
            >
              {fixing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Applying fixes...</>
              ) : (
                <><Zap className="w-4 h-4" /> Ask Bolt to Fix ({fixableCount})</>
              )}
            </button>
          )}

          {!loading && fixableCount === 0 && findings.some(f => !f.fixable && !fixedIds.has(f.id)) && (
            <div className="rounded-xl border border-navy-700 bg-navy-900 p-3 text-center">
              <p className="text-xs text-navy-300">
                Remaining findings require manual review (adding policies or restructuring auth).
                <br />
                Contact your database administrator for assistance.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
