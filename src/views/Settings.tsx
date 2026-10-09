import { useState, useEffect, useCallback } from 'react';
import {
  Building2, Phone, Mail, Globe, MapPin, Image, CreditCard, Star,
  Save, Check, AlertCircle, ExternalLink, Loader2, Plus, Trash2,
  MessageSquare, HelpCircle, Camera, MapPinned, FileText, Type,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { COMPANY } from '@/lib/constants';
import type { CompanySettings, Testimonial, Faq, GalleryImage, ServiceArea } from '@/lib/types';

type FormState = Omit<CompanySettings, 'id' | 'updated_at'>;

const DEFAULTS: FormState = {
  name: COMPANY.name,
  short_name: COMPANY.shortName,
  tagline: COMPANY.tagline,
  phone: COMPANY.phone,
  email: COMPANY.email,
  website: COMPANY.website,
  website_href: COMPANY.websiteHref,
  hq: COMPANY.hq,
  logo_url: COMPANY.logoUrl,
  etransfer_email: COMPANY.etransferEmail,
  etransfer_recipient: COMPANY.etransferRecipient,
  square_checkout_url: COMPANY.squareCheckoutUrl,
  google_review_url: COMPANY.googleReviewUrl,
  hero_heading: "Masbling Astar Services Brampton's Trusted Gutter & Exterior Maintenance Management",
  hero_subheading: '',
  about_heading: 'Built on Quality & Trust',
  about_paragraph_1: '',
  about_paragraph_2: '',
  about_paragraph_3: '',
  cta_heading: 'Ready to Get Started?',
  cta_subheading: '',
  services_intro: '',
  process_intro: '',
  gallery_intro: '',
  testimonials_intro: '',
  faq_intro: '',
  contact_intro: 'Have a question or ready to book? Reach out — we are here to help.',
  hours_label: 'Mon – Sat',
  hours_value: '8:00 AM – 6:00 PM',
};

const COMPANY_FIELDS: {
  key: keyof FormState;
  label: string;
  icon: typeof Building2;
  placeholder: string;
  type?: 'text' | 'url' | 'email';
  group: string;
}[] = [
  { key: 'name', label: 'Full Company Name', icon: Building2, placeholder: 'MASBLING A STAR SERVICES', group: 'Branding' },
  { key: 'short_name', label: 'Short Name', icon: Building2, placeholder: 'Masbling Astar', group: 'Branding' },
  { key: 'tagline', label: 'Tagline', icon: Building2, placeholder: 'Gutter & Exterior Maintenance', group: 'Branding' },
  { key: 'logo_url', label: 'Logo URL', icon: Image, placeholder: 'https://…/logo.png', type: 'url', group: 'Branding' },
  { key: 'phone', label: 'Phone Number', icon: Phone, placeholder: '437-440-4072', group: 'Contact' },
  { key: 'email', label: 'Contact Email', icon: Mail, placeholder: 'you@example.com', type: 'email', group: 'Contact' },
  { key: 'hq', label: 'Address', icon: MapPin, placeholder: '45 Bramalea Rd, Brampton ON', group: 'Contact' },
  { key: 'website', label: 'Website Label', icon: Globe, placeholder: 'masblingastarservices.com', group: 'Web' },
  { key: 'website_href', label: 'Website URL', icon: Globe, placeholder: 'https://masblingastarservices.com', type: 'url', group: 'Web' },
  { key: 'google_review_url', label: 'Google Review Link', icon: Star, placeholder: 'https://www.google.com/search?q=…', type: 'url', group: 'Web' },
  { key: 'etransfer_email', label: 'E-Transfer Email', icon: Mail, placeholder: 'info@masblingastarservices.com', type: 'email', group: 'Payments' },
  { key: 'etransfer_recipient', label: 'E-Transfer Recipient Name', icon: Building2, placeholder: 'Masbling Astar Services', group: 'Payments' },
  { key: 'square_checkout_url', label: 'Square Checkout Link', icon: CreditCard, placeholder: 'https://square.link/u/…', type: 'url', group: 'Payments' },
  { key: 'hours_label', label: 'Service Hours Label', icon: Phone, placeholder: 'Mon – Sat', group: 'Contact' },
  { key: 'hours_value', label: 'Service Hours Value', icon: Phone, placeholder: '8:00 AM – 6:00 PM', group: 'Contact' },
];

const COMPANY_GROUP_ORDER = ['Branding', 'Contact', 'Web', 'Payments'];

const WEBSITE_TEXT_FIELDS: {
  key: keyof FormState;
  label: string;
  type: 'text' | 'textarea';
  placeholder: string;
}[] = [
  { key: 'hero_heading', label: 'Hero Heading', type: 'text', placeholder: 'Professional Gutter Cleaning…' },
  { key: 'hero_subheading', label: 'Hero Subheading', type: 'textarea', placeholder: 'Main intro paragraph…' },
  { key: 'services_intro', label: 'Services Section Intro', type: 'textarea', placeholder: 'Description of your services…' },
  { key: 'process_intro', label: 'How It Works Section Intro', type: 'textarea', placeholder: 'Description of your process…' },
  { key: 'about_heading', label: 'About Section Heading', type: 'text', placeholder: 'Built on Quality & Trust' },
  { key: 'about_paragraph_1', label: 'About Paragraph 1', type: 'textarea', placeholder: '' },
  { key: 'about_paragraph_2', label: 'About Paragraph 2', type: 'textarea', placeholder: '' },
  { key: 'about_paragraph_3', label: 'About Paragraph 3', type: 'textarea', placeholder: '' },
  { key: 'gallery_intro', label: 'Gallery Section Intro', type: 'textarea', placeholder: '' },
  { key: 'testimonials_intro', label: 'Testimonials Section Intro', type: 'textarea', placeholder: '' },
  { key: 'cta_heading', label: 'Call-to-Action Heading', type: 'text', placeholder: 'Ready to Get Started?' },
  { key: 'cta_subheading', label: 'Call-to-Action Subheading', type: 'textarea', placeholder: '' },
  { key: 'faq_intro', label: 'FAQ Section Intro', type: 'textarea', placeholder: '' },
  { key: 'contact_intro', label: 'Contact Section Intro', type: 'textarea', placeholder: '' },
];

type Tab = 'company' | 'text' | 'testimonials' | 'faqs' | 'gallery' | 'areas';

const TABS: { key: Tab; label: string; icon: typeof Building2 }[] = [
  { key: 'company', label: 'Company Info', icon: Building2 },
  { key: 'text', label: 'Website Text', icon: Type },
  { key: 'testimonials', label: 'Testimonials', icon: MessageSquare },
  { key: 'faqs', label: 'FAQs', icon: HelpCircle },
  { key: 'gallery', label: 'Gallery', icon: Camera },
  { key: 'areas', label: 'Service Areas', icon: MapPinned },
];

export default function Settings() {
  const [tab, setTab] = useState<Tab>('company');
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [areas, setAreas] = useState<ServiceArea[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [settingsRes, testRes, faqRes, galRes, areaRes] = await Promise.all([
      supabase.from('company_settings').select('*').eq('id', 1).maybeSingle(),
      supabase.from('website_testimonials').select('*').order('display_order'),
      supabase.from('website_faqs').select('*').order('display_order'),
      supabase.from('website_gallery').select('*').order('display_order'),
      supabase.from('website_service_areas').select('*').order('display_order'),
    ]);
    if (settingsRes.error) { console.error('Settings load failed:', settingsRes.error.message); setError('Could not load your settings. Please refresh and try again.'); }
    else if (settingsRes.data) {
      const { id: _id, updated_at: _u, ...rest } = settingsRes.data as CompanySettings;
      setForm({ ...DEFAULTS, ...rest });
    }
    if (testRes.data) setTestimonials(testRes.data as Testimonial[]);
    if (faqRes.data) setFaqs(faqRes.data as Faq[]);
    if (galRes.data) setGallery(galRes.data as GalleryImage[]);
    if (areaRes.data) setAreas(areaRes.data as ServiceArea[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    const { error: upErr } = await supabase
      .from('company_settings')
      .upsert({ id: 1, ...form, updated_at: new Date().toISOString() })
      .eq('id', 1);
    if (upErr) { console.error('Settings save failed:', upErr.message); setError('Could not save your changes. Please try again.'); } else { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    setSaving(false);
  };

  const update = (key: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // ── Testimonials CRUD ──
  const addTestimonial = () => {
    const newItem: Testimonial = {
      id: crypto.randomUUID(), name: '', text: '', rating: 5,
      location: '', display_order: testimonials.length, active: true,
    };
    setTestimonials([...testimonials, newItem]);
  };
  const updateTestimonial = (id: string, field: keyof Testimonial, value: string | number | boolean) => {
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };
  const deleteTestimonial = async (id: string) => {
    setTestimonials(prev => prev.filter(t => t.id !== id));
    await supabase.from('website_testimonials').delete().eq('id', id);
  };
  const saveTestimonials = async () => {
    setSaving(true); setError(null);
    const ops = testimonials.map((t, i) =>
      supabase.from('website_testimonials').upsert({
        ...t, display_order: i,
      })
    );
    const results = await Promise.all(ops);
    const err = results.find(r => r.error);
    if (err?.error) { console.error('Settings save failed:', err.error.message); setError('Could not save your changes. Please try again.'); } else { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    setSaving(false);
  };

  // ── FAQs CRUD ──
  const addFaq = () => {
    const newItem: Faq = {
      id: crypto.randomUUID(), question: '', answer: '',
      display_order: faqs.length, active: true,
    };
    setFaqs([...faqs, newItem]);
  };
  const updateFaq = (id: string, field: keyof Faq, value: string | number | boolean) => {
    setFaqs(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  };
  const deleteFaq = async (id: string) => {
    setFaqs(prev => prev.filter(f => f.id !== id));
    await supabase.from('website_faqs').delete().eq('id', id);
  };
  const saveFaqs = async () => {
    setSaving(true); setError(null);
    const ops = faqs.map((f, i) =>
      supabase.from('website_faqs').upsert({ ...f, display_order: i })
    );
    const results = await Promise.all(ops);
    const err = results.find(r => r.error);
    if (err?.error) { console.error('Settings save failed:', err.error.message); setError('Could not save your changes. Please try again.'); } else { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    setSaving(false);
  };

  // ── Gallery CRUD ──
  const addGalleryImage = () => {
    const newItem: GalleryImage = {
      id: crypto.randomUUID(), image_url: '', alt_text: '', label: '',
      display_order: gallery.length, active: true,
    };
    setGallery([...gallery, newItem]);
  };
  const updateGalleryImage = (id: string, field: keyof GalleryImage, value: string | number | boolean) => {
    setGallery(prev => prev.map(g => g.id === id ? { ...g, [field]: value } : g));
  };
  const deleteGalleryImage = async (id: string) => {
    setGallery(prev => prev.filter(g => g.id !== id));
    await supabase.from('website_gallery').delete().eq('id', id);
  };
  const saveGallery = async () => {
    setSaving(true); setError(null);
    const ops = gallery.map((g, i) =>
      supabase.from('website_gallery').upsert({ ...g, display_order: i })
    );
    const results = await Promise.all(ops);
    const err = results.find(r => r.error);
    if (err?.error) { console.error('Settings save failed:', err.error.message); setError('Could not save your changes. Please try again.'); } else { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    setSaving(false);
  };

  // ── Service Areas CRUD ──
  const addArea = () => {
    const newItem: ServiceArea = {
      id: crypto.randomUUID(), name: '',
      display_order: areas.length, active: true,
    };
    setAreas([...areas, newItem]);
  };
  const updateArea = (id: string, field: keyof ServiceArea, value: string | number | boolean) => {
    setAreas(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };
  const deleteArea = async (id: string) => {
    setAreas(prev => prev.filter(a => a.id !== id));
    await supabase.from('website_service_areas').delete().eq('id', id);
  };
  const saveAreas = async () => {
    setSaving(true); setError(null);
    const ops = areas.map((a, i) =>
      supabase.from('website_service_areas').upsert({ ...a, display_order: i })
    );
    const results = await Promise.all(ops);
    const err = results.find(r => r.error);
    if (err?.error) { console.error('Settings save failed:', err.error.message); setError('Could not save your changes. Please try again.'); } else { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-gold-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-navy-50 font-display">Settings</h2>
          <p className="text-xs text-navy-300 mt-0.5">Edit your company info, website content, testimonials, FAQs, gallery, and service areas</p>
        </div>
        {saved && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-900/40 px-3 py-1.5 text-xs font-semibold text-success-300 animate-fade-in">
            <Check className="w-3.5 h-3.5" /> Saved
          </span>
        )}
      </div>

      {error && (
        <div className="card p-3 flex items-start gap-2.5 border-error-700/40">
          <AlertCircle className="w-4 h-4 text-error-400 shrink-0 mt-0.5" />
          <p className="text-xs text-error-300">{error}</p>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1.5 flex-wrap">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              tab === t.key
                ? 'bg-gold-400/15 text-gold-300 border border-gold-600/30'
                : 'bg-navy-800/50 text-navy-300 hover:text-navy-100 border border-transparent'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* ── Company Info Tab ── */}
      {tab === 'company' && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {COMPANY_GROUP_ORDER.map(group => (
            <div key={group} className="card p-4">
              <h3 className="section-title mb-3">{group}</h3>
              <div className="space-y-3">
                {COMPANY_FIELDS.filter(f => f.group === group).map(field => (
                  <div key={field.key}>
                    <label className="label flex items-center gap-1.5">
                      <field.icon className="w-3.5 h-3.5 text-navy-400" />
                      {field.label}
                    </label>
                    <div className="relative">
                      <input
                        className="input"
                        type={field.type || 'text'}
                        value={form[field.key]}
                        onChange={e => update(field.key, e.target.value)}
                        placeholder={field.placeholder}
                      />
                      {(field.type === 'url' || field.type === 'email') && form[field.key] && (
                        <a
                          href={form[field.key]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-gold-400 transition-colors"
                          aria-label="Open link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
            <button type="button" onClick={load} className="btn-secondary">Reset</button>
          </div>

          <div className="card p-4">
            <h3 className="section-title mb-2">Preview</h3>
            <div className="flex items-center gap-3 mb-3">
              <img src={form.logo_url} alt="Logo" className="w-12 h-12 rounded-xl object-contain bg-navy-50 p-1" />
              <div>
                <p className="text-sm font-bold text-navy-50 font-display">{form.name}</p>
                <p className="text-xs text-gold-400">{form.tagline}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-navy-300"><Phone className="w-3.5 h-3.5 text-gold-400" /> {form.phone}</div>
              <div className="flex items-center gap-1.5 text-navy-300"><Mail className="w-3.5 h-3.5 text-gold-400" /> {form.email}</div>
              <div className="flex items-center gap-1.5 text-navy-300"><Globe className="w-3.5 h-3.5 text-gold-400" /> {form.website}</div>
              <div className="flex items-center gap-1.5 text-navy-300"><MapPin className="w-3.5 h-3.5 text-gold-400" /> {form.hq}</div>
            </div>
          </div>
        </form>
      )}

      {/* ── Website Text Tab ── */}
      {tab === 'text' && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="card p-4">
            <h3 className="section-title mb-3 flex items-center gap-1.5"><FileText className="w-4 h-4 text-gold-400" /> Website Page Text</h3>
            <p className="text-xs text-navy-400 mb-4">Edit the headings and descriptions shown on each section of your public website.</p>
            <div className="space-y-4">
              {WEBSITE_TEXT_FIELDS.map(field => (
                <div key={field.key}>
                  <label className="label">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      className="input min-h-[80px] resize-y"
                      value={form[field.key]}
                      onChange={e => update(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                    />
                  ) : (
                    <input
                      className="input"
                      type="text"
                      value={form[field.key]}
                      onChange={e => update(field.key, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
            <button type="button" onClick={load} className="btn-secondary">Reset</button>
          </div>
        </form>
      )}

      {/* ── Testimonials Tab ── */}
      {tab === 'testimonials' && (
        <div className="space-y-4">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="section-title flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-gold-400" /> Customer Testimonials</h3>
              <button onClick={addTestimonial} className="btn-secondary text-xs px-3 py-1.5">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <div className="space-y-3">
              {testimonials.map((t, i) => (
                <div key={t.id} className="rounded-lg border border-navy-700 bg-navy-800/40 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-navy-500">#{i + 1}</span>
                    <button onClick={() => deleteTestimonial(t.id)} className="text-navy-500 hover:text-error-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input className="input" placeholder="Customer name" value={t.name} onChange={e => updateTestimonial(t.id, 'name', e.target.value)} />
                    <input className="input" placeholder="Location" value={t.location} onChange={e => updateTestimonial(t.id, 'location', e.target.value)} />
                    <select className="input" value={t.rating} onChange={e => updateTestimonial(t.id, 'rating', parseInt(e.target.value))}>
                      {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                    </select>
                  </div>
                  <textarea className="input min-h-[60px] resize-y" placeholder="Review text" value={t.text} onChange={e => updateTestimonial(t.id, 'text', e.target.value)} rows={2} />
                  <label className="flex items-center gap-2 text-xs text-navy-300">
                    <input type="checkbox" checked={t.active} onChange={e => updateTestimonial(t.id, 'active', e.target.checked)} className="rounded" />
                    Show on website
                  </label>
                </div>
              ))}
              {testimonials.length === 0 && <p className="text-xs text-navy-400 text-center py-4">No testimonials yet. Click Add to create one.</p>}
            </div>
          </div>
          <button onClick={saveTestimonials} disabled={saving} className="btn-primary">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Testimonials</>}
          </button>
        </div>
      )}

      {/* ── FAQs Tab ── */}
      {tab === 'faqs' && (
        <div className="space-y-4">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="section-title flex items-center gap-1.5"><HelpCircle className="w-4 h-4 text-gold-400" /> Frequently Asked Questions</h3>
              <button onClick={addFaq} className="btn-secondary text-xs px-3 py-1.5">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <div key={f.id} className="rounded-lg border border-navy-700 bg-navy-800/40 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-navy-500">#{i + 1}</span>
                    <button onClick={() => deleteFaq(f.id)} className="text-navy-500 hover:text-error-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input className="input" placeholder="Question" value={f.question} onChange={e => updateFaq(f.id, 'question', e.target.value)} />
                  <textarea className="input min-h-[70px] resize-y" placeholder="Answer" value={f.answer} onChange={e => updateFaq(f.id, 'answer', e.target.value)} rows={3} />
                  <label className="flex items-center gap-2 text-xs text-navy-300">
                    <input type="checkbox" checked={f.active} onChange={e => updateFaq(f.id, 'active', e.target.checked)} className="rounded" />
                    Show on website
                  </label>
                </div>
              ))}
              {faqs.length === 0 && <p className="text-xs text-navy-400 text-center py-4">No FAQs yet. Click Add to create one.</p>}
            </div>
          </div>
          <button onClick={saveFaqs} disabled={saving} className="btn-primary">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save FAQs</>}
          </button>
        </div>
      )}

      {/* ── Gallery Tab ── */}
      {tab === 'gallery' && (
        <div className="space-y-4">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="section-title flex items-center gap-1.5"><Camera className="w-4 h-4 text-gold-400" /> Project Gallery Images</h3>
              <button onClick={addGalleryImage} className="btn-secondary text-xs px-3 py-1.5">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <div className="space-y-3">
              {gallery.map((g, i) => (
                <div key={g.id} className="rounded-lg border border-navy-700 bg-navy-800/40 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-navy-500">#{i + 1}</span>
                    <button onClick={() => deleteGalleryImage(g.id)} className="text-navy-500 hover:text-error-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input className="input" placeholder="Image URL" value={g.image_url} onChange={e => updateGalleryImage(g.id, 'image_url', e.target.value)} />
                    <input className="input" placeholder="Label (e.g. Gutter Cleaning)" value={g.label} onChange={e => updateGalleryImage(g.id, 'label', e.target.value)} />
                  </div>
                  <input className="input" placeholder="Alt text (description for accessibility)" value={g.alt_text} onChange={e => updateGalleryImage(g.id, 'alt_text', e.target.value)} />
                  {g.image_url && <img src={g.image_url} alt={g.alt_text} className="w-full h-32 object-cover rounded-lg" />}
                  <label className="flex items-center gap-2 text-xs text-navy-300">
                    <input type="checkbox" checked={g.active} onChange={e => updateGalleryImage(g.id, 'active', e.target.checked)} className="rounded" />
                    Show on website
                  </label>
                </div>
              ))}
              {gallery.length === 0 && <p className="text-xs text-navy-400 text-center py-4">No gallery images yet. Click Add to upload one.</p>}
            </div>
          </div>
          <button onClick={saveGallery} disabled={saving} className="btn-primary">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Gallery</>}
          </button>
        </div>
      )}

      {/* ── Service Areas Tab ── */}
      {tab === 'areas' && (
        <div className="space-y-4">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="section-title flex items-center gap-1.5"><MapPinned className="w-4 h-4 text-gold-400" /> Service Areas</h3>
              <button onClick={addArea} className="btn-secondary text-xs px-3 py-1.5">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {areas.map((a, i) => (
                <div key={a.id} className="flex items-center gap-2 rounded-lg border border-navy-700 bg-navy-800/40 p-2.5">
                  <span className="text-[10px] font-bold text-navy-500 w-6">#{i + 1}</span>
                  <input className="input flex-1" placeholder="City name" value={a.name} onChange={e => updateArea(a.id, 'name', e.target.value)} />
                  <label className="flex items-center gap-1.5 text-xs text-navy-300 shrink-0">
                    <input type="checkbox" checked={a.active} onChange={e => updateArea(a.id, 'active', e.target.checked)} className="rounded" />
                    Show
                  </label>
                  <button onClick={() => deleteArea(a.id)} className="text-navy-500 hover:text-error-400 transition-colors shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {areas.length === 0 && <p className="text-xs text-navy-400 text-center py-4">No service areas yet. Click Add to create one.</p>}
            </div>
          </div>
          <button onClick={saveAreas} disabled={saving} className="btn-primary">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Service Areas</>}
          </button>
        </div>
      )}
    </div>
  );
}
