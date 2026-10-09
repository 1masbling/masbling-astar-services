import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, CheckCircle2, X, ArrowLeft, Lock, RefreshCw, ShieldAlert } from 'lucide-react';
import { COMPANY } from '@/lib/constants';

const EDGE_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

interface Captcha {
  token: string;
  question: string;
}

export default function DataDeletion() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    account_identifier: '',
    reason: '',
    website: '',
  });
  const [captcha, setCaptcha] = useState<Captcha | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [duplicate, setDuplicate] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    try {
      const res = await fetch(`${EDGE_BASE}/deletion-captcha`, {
        method: 'GET',
        headers: { 'X-Client-Info': 'bolt' },
      });
      const data = await res.json();
      if (data.captchaToken && data.question) {
        setCaptcha({ token: data.captchaToken, question: data.question });
        setCaptchaAnswer('');
      }
    } catch {
      // will retry on next render
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCaptcha();
  }, [fetchCaptcha]);

  const canSubmit = form.name.trim() && form.email.trim() && captchaAnswer.trim() && captcha;

  const handleSubmit = async () => {
    if (!captcha) return;
    setSaving(true);
    setSubmitError('');
    try {
      const res = await fetch(`${EDGE_BASE}/submit-deletion-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Client-Info': 'bolt' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          account_identifier: form.account_identifier.trim() || null,
          reason: form.reason.trim() || null,
          honeypot: form.website,
          captchaToken: captcha.token,
          captchaAnswer: captchaAnswer.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }
      setDuplicate(!!data.duplicate);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
      fetchCaptcha();
    } finally {
      setSaving(false);
    }
  };

  if (submitted || submitError) {
    return (
      <div className="max-w-md mx-auto animate-fade-in">
        <div className="card p-8 text-center">
          {submitError ? (
            <>
              <div className="w-16 h-16 rounded-full bg-error-900/40 border border-error-700/40 flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-error-400" />
              </div>
              <h2 className="text-lg font-bold text-navy-50 font-display mb-2">Submission Failed</h2>
              <p className="text-sm text-navy-300 mb-4">{submitError}</p>
              <button onClick={() => { setSubmitError(''); }} className="btn-primary w-full">Try Again</button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-success-900/40 border border-success-700/40 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-success-400" />
              </div>
              <h2 className="text-lg font-bold text-navy-50 font-display mb-2">Request Received</h2>
              <p className="text-sm text-navy-300 mb-4">
                {duplicate ? (
                  <>You already have a pending deletion request on file. No new request was created — we will process your existing request within 30 days.</>
                ) : (
                  <>Thank you, {form.name.split(' ')[0]}. Your data deletion request has been submitted. We will process it within 30 days and send a confirmation to <span className="text-gold-400 font-semibold">{form.email}</span>.</>
                )}
              </p>
              <p className="text-xs text-navy-400 mb-4">
                If you need to follow up, please contact us at{' '}
                <a href={`mailto:${COMPANY.email}`} className="text-teal-400 hover:text-teal-300">{COMPANY.email}</a>{' '}
                or call <a href={COMPANY.phoneHref} className="text-teal-400 hover:text-teal-300">{COMPANY.phone}</a>.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setDuplicate(false);
                  setForm({ name: '', email: '', phone: '', account_identifier: '', reason: '', website: '' });
                  fetchCaptcha();
                }}
                className="btn-primary w-full"
              >
                Submit Another Request
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-error-900/30 border border-error-700/40 mb-3">
          <ShieldCheck className="w-6 h-6 text-error-400" />
        </div>
        <h2 className="text-xl font-bold text-navy-50 font-display mb-1">Request Data Deletion</h2>
        <p className="text-sm text-navy-300">
          Submit a request to have your account and associated data deleted from {COMPANY.shortName}.
        </p>
      </div>

      <div className="card p-4 mb-4 bg-navy-900">
        <div className="flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-navy-400 mt-0.5 shrink-0" />
          <div className="text-xs text-navy-300 space-y-1.5">
            <p>
              Under Canadian privacy law (PIPEDA), you have the right to request deletion of your
              personal information. We will process your request within 30 days.
            </p>
            <p>
              Some records may be retained for up to 7 years where required by tax regulations or
              warranty obligations. You will be informed if any data must be retained.
            </p>
          </div>
        </div>
      </div>

      <div className="card p-4 mb-4 bg-teal-900/20 border border-teal-700/30">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
          <p className="text-xs text-teal-200">
            This form is protected against automated spam and abuse. Submissions are rate-limited and validated.
          </p>
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <div>
          <label className="label">Full Name *</label>
          <input
            className="input"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="John Smith"
            maxLength={200}
            autoComplete="name"
          />
        </div>
        <div>
          <label className="label">Email Address *</label>
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="john@email.com"
            maxLength={320}
            autoComplete="email"
          />
          <p className="text-[10px] text-navy-400 mt-1">We'll send a confirmation to this address once your request is processed.</p>
        </div>
        <div>
          <label className="label">Phone Number</label>
          <input
            className="input"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="416-555-0100"
            maxLength={50}
            autoComplete="tel"
          />
        </div>
        <div>
          <label className="label">Account Identifier</label>
          <input
            className="input"
            value={form.account_identifier}
            onChange={e => setForm(f => ({ ...f, account_identifier: e.target.value }))}
            placeholder="Customer ID, email on file, or service address"
            maxLength={200}
          />
          <p className="text-[10px] text-navy-400 mt-1">Any information that helps us locate your account.</p>
        </div>
        <div>
          <label className="label">Reason (optional)</label>
          <textarea
            className="input min-h-[80px]"
            value={form.reason}
            onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
            placeholder="Tell us why you'd like your data deleted..."
            maxLength={2000}
          />
        </div>

        {/* Honeypot: hidden from real users, bots will fill it */}
        <div className="absolute -left-[9999px] -top-[9999px] opacity-0 pointer-events-none" aria-hidden="true">
          <label>Website (leave empty)</label>
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
          />
        </div>

        {/* Math CAPTCHA */}
        <div>
          <label className="label">Security Question *</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 rounded-lg bg-navy-900 border border-navy-700 px-3 py-2.5">
              {captchaLoading ? (
                <RefreshCw className="w-4 h-4 text-navy-400 animate-spin" />
              ) : (
                <span className="text-sm font-semibold text-navy-100 font-mono">
                  {captcha?.question || 'Loading...'} = ?
                </span>
              )}
            </div>
            <input
              className="input w-20 text-center"
              value={captchaAnswer}
              onChange={e => setCaptchaAnswer(e.target.value)}
              placeholder="?"
              inputMode="numeric"
              maxLength={3}
            />
            <button
              type="button"
              onClick={fetchCaptcha}
              className="btn-ghost p-2.5"
              title="New question"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || saving}
          className="btn-primary w-full"
        >
          {saving ? 'Submitting...' : 'Submit Deletion Request'}
        </button>
        <p className="text-[10px] text-navy-400 text-center">
          By submitting, you confirm this is a genuine request to delete your data.
        </p>
      </div>
    </div>
  );
}
