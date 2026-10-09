import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Mic, MicOff, Volume2, VolumeX, Sparkles, Phone,
  CheckCircle2, ArrowRight, Loader2, X,
} from 'lucide-react';
import { COMPANY, SERVICE_ICONS } from '@/lib/constants';
import ServiceIcon from '@/components/ServiceIcon';
import type { Service } from '@/lib/types';

interface VoiceBookingAssistantProps {
  services: Service[];
  onSelectService: (key: string) => void;
  onFillField: (field: string, value: string) => void;
  onProceedToStep: (step: number) => void;
}

type AssistantState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
interface ChatMessage {
  role: 'assistant' | 'user';
  text: string;
}

interface BookingState {
  serviceKey: string | null;
  date: string | null;
  timeWindow: string | null;
  name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
}

const EMPTY_STATE: BookingState = {
  serviceKey: null,
  date: null,
  timeWindow: null,
  name: null,
  phone: null,
  email: null,
  address: null,
};

const SERVICE_KEYWORDS: Record<string, string[]> = {
  gutter: ['gutter', 'gutters', 'eavestrough', 'eaves', 'eavesdrop', 'eaves drop', 'leaf guard', 'leafguard', 'gutter guard'],
  'window-caulking': ['caulk', 'caulking', 'seal window', 'window seal'],
  'window-cleaning': ['window cleaning', 'wash window', 'window wash', 'clean window'],
  vent: ['vent', 'vent cleaning', 'dryer vent', 'roof vent'],
  downpipes: ['downpipe', 'down pipe', 'downspout', 'down spout'],
  'leaks-sealing': ['leak', 'leaking', 'seal leak', 'water leak', 'drip'],
  handyman: ['handyman', 'handy man', 'general repair', 'fix'],
  soffit: ['soffit', 'soffits'],
  fascia: ['fascia', 'fascias', 'fascia board', 'fascia boards'],
};

function matchService(transcript: string): string | null {
  const lower = transcript.toLowerCase();
  for (const [key, keywords] of Object.entries(SERVICE_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return key;
  }
  return null;
}

function matchDate(transcript: string): string | null {
  const lower = transcript.toLowerCase();
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < dayNames.length; i++) {
    if (lower.includes(dayNames[i])) {
      const todayDow = now.getDay();
      let diff = i - todayDow;
      if (diff <= 0) diff += 7;
      if (lower.includes('next')) diff += 7;
      const d = new Date(now);
      d.setDate(d.getDate() + diff);
      if (d.getDay() === 0) d.setDate(d.getDate() + 1);
      return d.toISOString().slice(0, 10);
    }
  }

  if (lower.includes('today')) {
    const d = new Date(now);
    if (d.getDay() === 0) return null;
    return d.toISOString().slice(0, 10);
  }
  if (lower.includes('tomorrow')) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }

  const dayMatch = lower.match(/(?:the\s+)?(\d{1,2})(?:st|nd|rd|th)?/);
  if (dayMatch) {
    const dayNum = parseInt(dayMatch[1], 10);
    if (dayNum >= 1 && dayNum <= 31) {
      const d = new Date(now.getFullYear(), now.getMonth(), dayNum);
      if (d < now) d.setMonth(d.getMonth() + 1);
      if (d.getDay() === 0) d.setDate(d.getDate() + 1);
      return d.toISOString().slice(0, 10);
    }
  }
  return null;
}

function matchTimeWindow(transcript: string): string | null {
  const lower = transcript.toLowerCase();
  const timeSlots = [
    '8:00 AM – 10:00 AM',
    '10:00 AM – 12:00 PM',
    '12:00 PM – 2:00 PM',
    '2:00 PM – 4:00 PM',
  ];
  if (lower.includes('morning') || lower.includes('8') || lower.includes('9')) return timeSlots[0];
  if (lower.includes('10') || lower.includes('11') || lower.includes('midday') || lower.includes('noon')) return timeSlots[1];
  if (lower.includes('12') || lower.includes('1') || lower.includes('afternoon')) return timeSlots[2];
  if (lower.includes('2') || lower.includes('3') || lower.includes('late') || lower.includes('afternoon')) return timeSlots[3];
  return null;
}

function extractName(transcript: string): string | null {
  const patterns = [
    /(?:my name is|i'm|i am|this is|it's|its)\s+([a-z][a-z]+(?:\s+[a-z][a-z]+)?)/i,
    /(?:call me|name's)\s+([a-z][a-z]+(?:\s+[a-z][a-z]+)?)/i,
  ];
  for (const p of patterns) {
    const m = transcript.match(p);
    if (m && m[1]) {
      const name = m[1].trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      if (name.length >= 2 && name.length <= 60) return name;
    }
  }
  // Fallback: if the transcript is short (1-4 words), has no digits, and doesn't
  // look like a date/time/service/address/phone, treat it as a bare name.
  const lower = transcript.toLowerCase().trim();
  const words = lower.split(/\s+/);
  const looksLikeOtherField =
    matchService(transcript) ||
    matchDate(transcript) ||
    matchTimeWindow(transcript) ||
    extractPhone(transcript) ||
    extractAddress(transcript);
  if (!looksLikeOtherField && words.length >= 1 && words.length <= 4 && !/\d/.test(transcript)) {
    const name = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    if (name.length >= 2 && name.length <= 60) return name;
  }
  return null;
}

function extractPhone(transcript: string): string | null {
  const digits = transcript.replace(/[^0-9]/g, '');
  if (digits.length >= 10) {
    const cleaned = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
  }
  return null;
}

function extractEmail(transcript: string): string | null {
  // Convert spoken email format to written format:
  // "john at gmail dot com" → "john@gmail.com"
  let normalized = transcript.toLowerCase().trim();

  // Remove common filler words people say around email addresses
  normalized = normalized.replace(/\bmy email is\b/gi, '');
  normalized = normalized.replace(/\bit's\b/gi, '');
  normalized = normalized.replace(/\bits\b/gi, '');

  // Try direct regex match first (if speech recognition already produced @ and .)
  const direct = normalized.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (direct) return direct[1].trim();

  // Convert spoken format: replace " at " with @ and " dot " with .
  // Only do this if it looks like a spoken email (has "at" in the middle)
  const atMatch = normalized.match(/^\s*([a-zA-Z0-9._%+-]+)\s+at\s+(.+)/);
  if (atMatch) {
    const localPart = atMatch[1];
    let domain = atMatch[2];
    domain = domain.replace(/\s+dot\s+/g, '.');
    domain = domain.replace(/\s+/g, '');
    // Reconstruct the email
    const email = `${localPart}@${domain}`;
    // Validate it looks reasonable
    if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return email;
    }
  }

  return null;
}

function extractAddress(transcript: string): string | null {
  const lower = transcript.toLowerCase();
  const patterns = [
    /(?:address is|live at|located at|it's at|its at|house is)\s+(.{5,80})/i,
    /(\d+\s+[a-z]+(?:\s+[a-z]+){0,4}(?:\s+(?:street|st|avenue|ave|road|rd|drive|dr|boulevard|blvd|court|ct|way|lane|ln|place|pl|crescent|cres))?)/i,
  ];
  for (const p of patterns) {
    const m = transcript.match(p);
    if (m && m[1]) {
      const addr = m[1].trim().replace(/\s+/g, ' ');
      if (addr.length >= 5 && addr.length <= 200) return addr;
    }
  }
  return null;
}

function formatDateReadable(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function buildResponse(
  state: BookingState,
  services: Service[],
): { text: string; action: { type: string; value?: string } | null; newState: BookingState } {
  const serviceLabel = state.serviceKey
    ? services.find(s => s.key === state.serviceKey)?.label || state.serviceKey
    : null;

  if (!state.serviceKey) {
    return {
      text: `Hi! I'm your booking assistant for ${COMPANY.shortName}. I can help you schedule a service using voice. Which service do you need? We offer gutter cleaning, eavestrough, window caulking, window cleaning, vent cleaning, downpipes, soffit and fascia, leak sealing, and handyman services.`,
      action: null,
      newState: state,
    };
  }

  if (state.serviceKey && !state.date) {
    return {
      text: `Great choice! ${serviceLabel} is one of our specialties. What day works best for you? You can say something like "next Tuesday" or "the 15th".`,
      action: { type: 'select-service', value: state.serviceKey },
      newState: state,
    };
  }

  if (state.serviceKey && state.date && !state.timeWindow) {
    return {
      text: `Perfect, ${serviceLabel} on ${formatDateReadable(state.date)}. Do you prefer morning, midday, or afternoon?`,
      action: { type: 'select-service-and-date', value: state.serviceKey },
      newState: state,
    };
  }

  if (state.serviceKey && state.date && state.timeWindow && !state.name) {
    return {
      text: `Excellent! ${serviceLabel} on ${formatDateReadable(state.date)}, ${state.timeWindow}. Can I get your name please?`,
      action: { type: 'select-service-date-time' },
      newState: state,
    };
  }

  if (state.name && !state.phone) {
    return {
      text: `Nice to meet you, ${state.name.split(' ')[0]}! What's the best phone number to reach you at?`,
      action: { type: 'fill-name', value: state.name },
      newState: state,
    };
  }

  if (state.name && state.phone && state.email === null) {
    return {
      text: `Thanks ${state.name.split(' ')[0]}! What's your email address? This is optional, but it helps us send you a confirmation. You can also say "skip" to continue without it.`,
      action: { type: 'fill-name-phone' },
      newState: state,
    };
  }

  if (state.name && state.phone && !state.address) {
    return {
      text: `Got it! What's the service address?`,
      action: { type: 'fill-name-email' },
      newState: state,
    };
  }

  if (state.address) {
    return {
      text: `Got it! I have all your details. Let me take you to the final confirmation step where you can review everything and submit your booking.`,
      action: { type: 'complete' },
      newState: state,
    };
  }

  return {
    text: `I heard you, but I'm not sure what you need next. Could you repeat that? You can tell me a service, a date, your name, phone number, or address.`,
    action: null,
    newState: state,
  };
}

function parseTranscript(transcript: string) {
  return {
    serviceKey: matchService(transcript),
    date: matchDate(transcript),
    timeWindow: matchTimeWindow(transcript),
    name: extractName(transcript),
    phone: extractPhone(transcript),
    email: extractEmail(transcript),
    address: extractAddress(transcript),
  };
}

function mergeState(prev: BookingState, parsed: ReturnType<typeof parseTranscript>, rawTranscript: string): BookingState {
  // If the user says "skip", treat email as explicitly empty (empty string,
  // not null) so the assistant moves on instead of re-asking.
  const skipDetected = /\bskip\b/i.test(rawTranscript);
  return {
    serviceKey: parsed.serviceKey ?? prev.serviceKey,
    date: parsed.date ?? prev.date,
    timeWindow: parsed.timeWindow ?? prev.timeWindow,
    name: parsed.name ?? prev.name,
    phone: parsed.phone ?? prev.phone,
    email: parsed.email !== null
      ? parsed.email
      : skipDetected ? '' : prev.email,
    address: parsed.address ?? prev.address,
  };
}

export default function VoiceBookingAssistant({
  services,
  onSelectService,
  onFillField,
  onProceedToStep,
}: VoiceBookingAssistantProps) {
  const [state, setState] = useState<AssistantState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: `Hi! I'm your voice booking assistant. Tap the microphone and tell me what service you need. I can help you book an appointment hands-free!`,
    },
  ]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [supported, setSupported] = useState(true);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const bookingStateRef = useRef<BookingState>({ ...EMPTY_STATE });

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    const rec = new SR();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    // Accumulate final results across multiple segments so the user can
    // pause mid-sentence (common when saying email addresses or phone
    // numbers) without the recognition stopping prematurely.
    const finalAccumulatorRef = { current: '' };

    rec.onstart = () => {
      setState('listening');
      setInterim('');
      finalAccumulatorRef.current = '';
    };

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript;
        else interimText += result[0].transcript;
      }
      if (finalText) {
        finalAccumulatorRef.current += finalText + ' ';
      }
      const allInterim = finalAccumulatorRef.current + interimText;
      setInterim(allInterim);
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech') {
        setState('idle');
        return;
      }
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setState('error');
        return;
      }
      setState('error');
    };

    rec.onend = () => {
      const accumulated = finalAccumulatorRef.current.trim();
      if (accumulated) {
        setTranscript(accumulated);
        setInterim('');
        handleUserInput(accumulated);
      } else {
        setState(prev => (prev === 'listening' ? 'idle' : prev));
      }
    };

    recognitionRef.current = rec;
    synthRef.current = window.speechSynthesis;

    return () => {
      rec.abort();
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!voiceEnabled || !synthRef.current) {
      setState('idle');
      return;
    }
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1;
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'))
      || voices.find(v => v.lang.startsWith('en') && v.name.includes('Samantha'))
      || voices.find(v => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;
    utterance.onstart = () => setState('speaking');
    utterance.onend = () => setState('idle');
    utterance.onerror = () => setState('idle');
    synthRef.current.speak(utterance);
  }, [voiceEnabled]);

  const handleUserInput = useCallback((text: string) => {
    setState('processing');
    setMessages(prev => [...prev, { role: 'user', text }]);

    setTimeout(() => {
      const parsed = parseTranscript(text);
      const merged = mergeState(bookingStateRef.current, parsed, text);
      bookingStateRef.current = merged;
      const { text: responseText, action, newState } = buildResponse(merged, services);
      bookingStateRef.current = newState;

      setMessages(prev => [...prev, { role: 'assistant', text: responseText }]);
      setTranscript('');

      // Always sync every collected field to the form so nothing gets lost
      // between voice turns — the form reflects the full accumulated state.
      if (merged.serviceKey) onSelectService(merged.serviceKey);
      if (merged.date) onFillField('date', merged.date);
      if (merged.timeWindow) onFillField('timeWindow', merged.timeWindow);
      if (merged.name) onFillField('name', merged.name);
      if (merged.phone) onFillField('phone', merged.phone);
      if (merged.email) onFillField('email', merged.email);
      if (merged.address) onFillField('address', merged.address);

      if (action) {
        switch (action.type) {
          case 'select-service':
            onProceedToStep(1);
            break;
          case 'select-service-and-date':
            onProceedToStep(3);
            break;
          case 'select-service-date-time':
            onProceedToStep(3);
            break;
          case 'fill-name':
            onProceedToStep(2);
            break;
          case 'fill-name-phone':
            onProceedToStep(2);
            break;
          case 'fill-name-email':
            onProceedToStep(2);
            break;
          case 'complete':
            onProceedToStep(3);
            break;
        }
      }

      speak(responseText);
    }, 600);
  }, [services, onSelectService, onFillField, onProceedToStep, speak]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    if (synthRef.current) synthRef.current.cancel();
    setState('listening');
    setInterim('');
    try {
      recognitionRef.current.start();
    } catch {
      try {
        recognitionRef.current.abort();
        setTimeout(() => recognitionRef.current?.start(), 100);
      } catch {
        setState('error');
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setState('idle');
  }, []);

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setState('idle');
  }, []);

  const toggleVoice = useCallback(() => {
    setVoiceEnabled(prev => {
      if (prev && synthRef.current) synthRef.current.cancel();
      return !prev;
    });
  }, []);

  if (!supported) return null;

  const isListening = state === 'listening';
  const isSpeaking = state === 'speaking';
  const isProcessing = state === 'processing';

  return (
    <div className={`card overflow-hidden transition-all ${expanded ? 'border-gold-600/40' : ''}`}>
      {/* Header bar */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3.5 text-left bg-gradient-to-br from-gold-900/15 to-navy-800"
      >
        <div className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-all ${isListening ? 'bg-error-500 animate-pulse-soft' : isSpeaking ? 'bg-gold-400 animate-pulse-soft' : 'bg-gradient-to-br from-gold-400 to-gold-600 shadow-glow'}`}>
          {isListening ? (
            <Mic className="w-4.5 h-4.5 text-navy-950" />
          ) : isSpeaking ? (
            <Volume2 className="w-4.5 h-4.5 text-navy-950" />
          ) : (
            <Sparkles className="w-4.5 h-4.5 text-navy-950" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-navy-50">Voice Booking Assistant</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-success-900/40 px-2 py-0.5 text-[9px] font-bold text-success-300">
              <span className={`w-1.5 h-1.5 rounded-full ${isListening || isSpeaking ? 'bg-success-400 animate-pulse-soft' : 'bg-success-500'}`} /> {isListening ? 'LISTENING' : isSpeaking ? 'SPEAKING' : 'READY'}
            </span>
          </div>
          <p className="text-xs text-navy-300 mt-0.5 truncate">
            {isListening ? (interim || 'Listening...') : isProcessing ? 'Processing...' : 'Tap mic to book by voice'}
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); toggleVoice(); }}
            className={`p-1.5 rounded-lg transition-colors ${voiceEnabled ? 'text-gold-400 hover:bg-navy-700' : 'text-navy-400 hover:bg-navy-700'}`}
            title={voiceEnabled ? 'Mute voice' : 'Unmute voice'}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          {expanded ? <X className="w-4 h-4 text-navy-300" /> : <ArrowRight className="w-4 h-4 text-navy-300" />}
        </div>
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div className="p-4 space-y-3 animate-slide-up">
          {/* Chat messages */}
          <div className="max-h-44 overflow-y-auto space-y-2.5 pr-1">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gold-900/30 border border-gold-700/30 text-navy-100 rounded-br-sm'
                    : 'bg-navy-900 border border-navy-700 text-navy-100 rounded-bl-sm'
                }`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1 mb-1">
                      <Sparkles className="w-3 h-3 text-gold-400" />
                      <span className="text-[9px] font-bold uppercase tracking-wide text-gold-400">Assistant</span>
                    </div>
                  )}
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Live transcript */}
          {isListening && interim && (
            <div className="rounded-lg bg-navy-900/60 border border-gold-700/20 px-3 py-2">
              <p className="text-xs text-navy-300 italic">{interim}</p>
            </div>
          )}

          {/* Mic control */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`relative inline-flex items-center justify-center w-14 h-14 rounded-full transition-all active:scale-95 ${
                isListening
                  ? 'bg-error-500 hover:bg-error-400 shadow-lg shadow-error-900/50'
                  : 'bg-gradient-to-br from-gold-400 to-gold-600 hover:from-gold-300 hover:to-gold-500 shadow-glow'
              }`}
              title={isListening ? 'Stop listening' : 'Start speaking'}
            >
              {isListening && (
                <>
                  <span className="absolute inset-0 rounded-full bg-error-400 animate-ping opacity-30" />
                  <span className="absolute -inset-1 rounded-full border-2 border-error-400/40 animate-pulse" />
                </>
              )}
              {isListening ? <MicOff className="w-6 h-6 text-navy-950 relative z-10" /> : <Mic className="w-6 h-6 text-navy-950 relative z-10" />}
            </button>
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="inline-flex items-center gap-1.5 rounded-lg bg-navy-700 px-3 py-2 text-xs font-semibold text-navy-100 hover:bg-navy-600 transition-all"
              >
                <VolumeX className="w-3.5 h-3.5" /> Stop
              </button>
            )}
          </div>

          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-1.5 justify-center">
            {services.slice(0, 4).map(s => (
              <button
                key={s.id}
                onClick={() => handleUserInput(`I need ${s.label}`)}
                className="inline-flex items-center gap-1 rounded-full bg-navy-900 border border-navy-700 px-2.5 py-1 text-[10px] font-medium text-navy-200 hover:border-gold-600/40 hover:text-gold-300 transition-all"
              >
                <ServiceIcon name={SERVICE_ICONS[s.key] || 'Wrench'} className="w-3 h-3 text-gold-400" />
                {s.label}
              </button>
            ))}
          </div>

          {/* Phone fallback */}
          <div className="flex items-center justify-center gap-1.5 pt-1 text-xs text-navy-400">
            <Phone className="w-3.5 h-3.5" />
            <span>Or call us at</span>
            <a href={COMPANY.phoneHref} className="font-semibold text-gold-400 hover:text-gold-300">{COMPANY.phone}</a>
          </div>
        </div>
      )}
    </div>
  );
}
