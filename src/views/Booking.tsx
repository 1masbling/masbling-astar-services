import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CalendarPlus, CheckCircle2, Wrench, Clock, MapPin,
  Calendar as CalendarIcon, ArrowRight, Star, CreditCard, ExternalLink, X,
  ShieldCheck, Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { SERVICE_ICONS, COMPANY, SITE_IMAGES } from '@/lib/constants';
import ServiceIcon from '@/components/ServiceIcon';
import VoiceBookingAssistant from '@/components/VoiceBookingAssistant';
import type { Service } from '@/lib/types';

interface BookingSlot {
  date: string;
  dayName: string;
  dayNum: number;
  month: string;
  available: boolean;
}

function generateSlots(daysAhead: number): BookingSlot[] {
  const slots: BookingSlot[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 2; i < daysAhead + 2; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dow = d.getDay();
    const available = dow !== 0;
    slots.push({
      date: d.toISOString().slice(0, 10),
      dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dow],
      dayNum: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      available,
    });
  }
  return slots;
}

const TIME_SLOTS = ['8:00 AM – 10:00 AM', '10:00 AM – 12:00 PM', '12:00 PM – 2:00 PM', '2:00 PM – 4:00 PM'];
const EDGE_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

const LEAD_SOURCE_OPTIONS = ['Google Search', 'Google Maps', 'Friend/Neighbor', 'Flyer/Sign', 'Facebook', 'Other'] as const;

interface UtmData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

function parseUtmParams(url: string): UtmData | null {
  try {
    const params = new URLSearchParams(url.split('?')[1] || '');
    const utm: UtmData = {};
    const source = params.get('utm_source');
    const medium = params.get('utm_medium');
    const campaign = params.get('utm_campaign');
    if (source) utm.utm_source = source;
    if (medium) utm.utm_medium = medium;
    if (campaign) utm.utm_campaign = campaign;
    if (Object.keys(utm).length === 0) return null;
    return utm;
  } catch {
    return null;
  }
}

function useAttribution() {
  return useMemo(() => {
    if (typeof window === 'undefined') return { referrer: '', utm: null };
    return {
      referrer: document.referrer || '',
      utm: parseUtmParams(window.location.href),
    };
  }, []);
}

export default function Booking() {
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    service_key: '',
    name: '', phone: '', email: '', address: '',
    date: '', timeWindow: '', notes: '',
    website: '', leadSource: '',
  });
  const attribution = useAttribution();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [slots] = useState(generateSlots(14));
  const [saving, setSaving] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    supabase.from('services').select('*').order('label')
      .then(({ data }) => {
        setServices((data || []).filter((s: Service) => s.active));
        setServicesLoading(false);
      })
      .catch(() => setServicesLoading(false));
  }, []);

  const activeServices = services;
  const selectedService = activeServices.find(s => s.key === form.service_key);

  const handleVoiceSelectService = useCallback((key: string) => {
    setForm(f => ({ ...f, service_key: key }));
  }, []);
  const handleVoiceFillField = useCallback((field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
  }, []);
  const handleVoiceProceedToStep = useCallback((targetStep: number) => {
    setStep(targetStep);
  }, []);

  const canProceedStep1 = form.service_key;
  const canProceedStep2 = form.name.trim() && form.phone.trim() && form.address.trim() && form.leadSource;
  const canProceedStep3 = form.date && form.timeWindow;
  const canSubmit = canProceedStep3 && confirmed;

  const handleSubmit = async () => {
    setSaving(true);
    setSubmitError('');
    try {
      const apiUrl = `${EDGE_BASE}/submit-booking`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      };
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          service_key: form.service_key,
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
          date: form.date,
          timeWindow: form.timeWindow,
          notes: form.notes.trim(),
          serviceLabel: selectedService?.label || form.service_key,
          honeypot: form.website,
          leadSource: form.leadSource,
          referrer: attribution.referrer,
          utm: attribution.utm,
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Booking failed (${response.status})`);
      }
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setSubmitted(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      if (msg.includes('abort') || msg.includes('timeout')) {
        setSubmitError('The booking took too long to respond. Please check your internet connection and try again, or call us at ' + COMPANY.phone + '.');
      } else if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('network')) {
        setSubmitError('Unable to connect to our booking server. Please check your internet connection and try again, or call us at ' + COMPANY.phone + '.');
      } else {
        setSubmitError(msg);
      }
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
              <h2 className="text-lg font-bold text-navy-50 font-display mb-2">Booking Failed</h2>
              <p className="text-sm text-navy-300 mb-4">{submitError}</p>
              <button onClick={() => { setSubmitError(''); setConfirmed(false); setStep(3); }} className="btn-primary w-full">Try Again</button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-success-900/40 border border-success-700/40 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-success-400" />
              </div>
              <h2 className="text-lg font-bold text-navy-50 font-display mb-2">Booking Received!</h2>
          <p className="text-sm text-navy-300 mb-4">
            Thank you, {form.name.split(' ')[0]}. We've received your request for{' '}
            <span className="text-gold-400 font-semibold">{selectedService?.label}</span>{' '}
            on {form.date} ({form.timeWindow}).
          </p>
          <p className="text-xs text-navy-400 mb-4">
            {form.email.trim()
              ? `A confirmation email has been sent to ${form.email}. `
              : ''}
            Our team will contact you within 24 hours to confirm your appointment.
          </p>

          <div className="rounded-xl bg-accent-900/20 border border-accent-800/40 p-3 mb-4 text-left">
            <div className="flex items-center gap-2 mb-1.5">
              <CreditCard className="w-4 h-4 text-accent-400" />
              <p className="text-xs font-semibold text-accent-300">Pay Online with Square</p>
            </div>
            <p className="text-xs text-navy-300 mb-2">Prefer to pay now? Use our secure Square checkout.</p>
            <a href={COMPANY.squareCheckoutUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-accent-600 hover:bg-accent-500 text-navy-950 font-bold text-xs px-3 py-2 transition-all w-full justify-center">
              <ExternalLink className="w-3.5 h-3.5" /> Open Square Checkout
            </a>
          </div>

          <button onClick={() => { setSubmitted(false); setStep(1); setForm({ service_key: '', name: '', phone: '', email: '', address: '', date: '', timeWindow: '', notes: '', website: '', leadSource: '' }); }} className="btn-primary w-full">Book Another Appointment</button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gold-400/15 border border-gold-600/30 mb-3">
          <CalendarPlus className="w-6 h-6 text-gold-400" />
        </div>
        <h2 className="text-xl font-bold text-navy-50 font-display mb-1">Book Your Service</h2>
        <p className="text-sm text-navy-300">Schedule an appointment with {COMPANY.name}</p>
      </div>

      <div className="card p-4 mb-4 bg-teal-900/20 border border-teal-700/30">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
          <p className="text-xs text-teal-200">
            Your submission is protected against spam and abuse. We respond to all bookings within 24 hours.
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl mb-4 border border-navy-800 bg-gradient-to-br from-navy-900 via-navy-900 to-navy-800 px-5 py-6 flex items-center gap-4">
        <img src={COMPANY.logoUrl} alt="Masbling Astar Services" className="w-16 h-16 rounded-xl object-contain bg-navy-50 p-1 shrink-0" />
        <div>
          <p className="text-xs font-bold text-gold-400 uppercase tracking-widest mb-0.5">Trusted Quality</p>
          <p className="text-sm font-display font-bold text-navy-50 leading-tight">Serving Brampton & the GTA with pride</p>
        </div>
      </div>

      {!servicesLoading && activeServices.length > 0 && (
        <VoiceBookingAssistant
          services={activeServices}
          onSelectService={handleVoiceSelectService}
          onFillField={handleVoiceFillField}
          onProceedToStep={handleVoiceProceedToStep}
        />
      )}

      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-gold-400 text-navy-950' : 'bg-navy-700 text-navy-400'}`}>{s}</div>
            {s < 3 && <div className={`w-8 h-0.5 transition-all ${step > s ? 'bg-gold-400' : 'bg-navy-700'}`} />}
          </div>
        ))}
      </div>

      {servicesLoading ? (
        <div className="card p-8 text-center">
          <Loader2 className="w-6 h-6 text-gold-400 mx-auto mb-2 animate-spin" />
          <p className="text-sm text-navy-300">Loading services...</p>
        </div>
      ) : (
        <>
      {/* Step 1: Service */}
      {step === 1 && (
        <div className="space-y-3 animate-fade-in">
          <h3 className="text-sm font-semibold text-navy-100 mb-2">Select a Service</h3>
          {activeServices.length === 0 ? (
            <p className="text-sm text-navy-400 text-center py-8">No services are currently available. Please call us at {COMPANY.phone}.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {activeServices.map(s => (
                <button
                  key={s.id}
                  onClick={() => setForm(f => ({ ...f, service_key: s.key }))}
                  className={`card p-3.5 text-left transition-all ${form.service_key === s.key ? 'border-gold-500 bg-gold-900/20 ring-1 ring-gold-500/40' : 'hover:border-navy-600'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-navy-700">
                      <ServiceIcon name={SERVICE_ICONS[s.key] || 'Wrench'} className="w-4 h-4 text-gold-400" />
                    </div>
                    {form.service_key === s.key && <CheckCircle2 className="w-4 h-4 text-gold-400 ml-auto" />}
                  </div>
                  <p className="text-sm font-semibold text-navy-50">{s.label}</p>
                </button>
              ))}
            </div>
          )}
          <button onClick={() => canProceedStep1 && setStep(2)} disabled={!canProceedStep1} className="btn-primary w-full">Continue <ArrowRight className="w-4 h-4" /></button>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="space-y-3 animate-fade-in">
          <h3 className="text-sm font-semibold text-navy-100 mb-2">Your Contact Details</h3>
          <div><label className="label">Full Name *</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Smith" maxLength={200} autoComplete="name" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Phone *</label><input className="input" type="tel" inputMode="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="416-555-0100" maxLength={50} autoComplete="tel" /></div>
            <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@email.com" maxLength={320} autoComplete="email" /></div>
          </div>
          <div><label className="label">Service Address *</label><input className="input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="123 Main St, Toronto ON" maxLength={300} autoComplete="street-address" /></div>
          <div>
            <label className="label">How did you hear about us? *</label>
            <select className="input" value={form.leadSource} onChange={e => setForm(f => ({ ...f, leadSource: e.target.value }))}>
              <option value="">Select an option...</option>
              {LEAD_SOURCE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div><label className="label">Notes (optional)</label><textarea className="input min-h-[60px]" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Describe the issue or any access details..." maxLength={2000} /></div>
          {/* Honeypot: hidden from real users */}
          <div className="absolute -left-[9999px] -top-[9999px] opacity-0 pointer-events-none" aria-hidden="true">
            <label>Website (leave empty)</label>
            <input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
            <button onClick={() => canProceedStep2 && setStep(3)} disabled={!canProceedStep2} className="btn-primary flex-1">Continue <ArrowRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* Step 3: Schedule */}
      {step === 3 && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-sm font-semibold text-navy-100 mb-2">Pick a Date & Time</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scroll-pl-4">
            {slots.map(slot => (
              <button
                key={slot.date}
                disabled={!slot.available}
                onClick={() => setForm(f => ({ ...f, date: slot.date }))}
                className={`card p-2.5 min-w-[68px] text-center shrink-0 snap-start transition-all ${!slot.available ? 'opacity-30 cursor-not-allowed' : form.date === slot.date ? 'border-gold-500 bg-gold-900/20 ring-1 ring-gold-500/40' : 'hover:border-navy-600'}`}
              >
                <p className="text-[10px] text-navy-400">{slot.dayName}</p>
                <p className={`text-lg font-bold font-display ${form.date === slot.date ? 'text-gold-400' : 'text-navy-50'}`}>{slot.dayNum}</p>
                <p className="text-[10px] text-navy-400">{slot.month}</p>
              </button>
            ))}
          </div>
          {form.date && (
            <div className="space-y-2 animate-fade-in">
              <p className="text-xs text-navy-300">Available time windows:</p>
              <div className="grid grid-cols-2 gap-2">
                {TIME_SLOTS.map(tw => (
                  <button
                    key={tw}
                    onClick={() => setForm(f => ({ ...f, timeWindow: tw }))}
                    className={`card p-2.5 text-center text-xs font-semibold transition-all ${form.timeWindow === tw ? 'border-gold-500 bg-gold-900/20 text-gold-300 ring-1 ring-gold-500/40' : 'text-navy-200 hover:border-navy-600'}`}
                  >
                    {tw}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Summary */}
          {form.date && form.timeWindow && (
            <div className="card p-3 bg-navy-900 animate-fade-in">
              <p className="text-xs font-semibold text-navy-200 mb-2">Booking Summary</p>
              <div className="space-y-1 text-xs text-navy-300">
                <p className="flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5 text-gold-400" /> {selectedService?.label}</p>
                <p className="flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5 text-gold-400" /> {form.date}</p>
                <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gold-400" /> {form.timeWindow}</p>
                <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gold-400" /> {form.address}</p>
                <p className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-gold-400" /> {form.name}</p>
              </div>
            </div>
          )}
          {/* Confirmation checkbox */}
          {form.date && form.timeWindow && (
            <div className="animate-fade-in">
              <button
                type="button"
                onClick={() => setConfirmed(!confirmed)}
                className={`w-full flex items-center gap-3 rounded-lg border px-3 py-3 transition-all ${confirmed ? 'border-success-600/50 bg-success-900/20' : 'border-navy-700 bg-navy-900 hover:border-navy-600'}`}
              >
                <div className={`flex items-center justify-center w-5 h-5 rounded-md shrink-0 transition-all ${confirmed ? 'bg-success-500' : 'bg-navy-700'}`}>
                  {confirmed && <CheckCircle2 className="w-3.5 h-3.5 text-navy-950" />}
                </div>
                <span className={`text-sm font-medium text-left ${confirmed ? 'text-success-200' : 'text-navy-200'}`}>
                  I confirm the details above are correct and I'd like to submit this booking request.
                </span>
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
            <button onClick={handleSubmit} disabled={!canSubmit || saving} className="btn-primary flex-1">{saving ? 'Submitting...' : 'Confirm Booking'}</button>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
