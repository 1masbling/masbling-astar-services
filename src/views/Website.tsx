import { useState, useEffect, useMemo } from 'react';
import {
  Phone, Mail, MapPin, Star, ArrowRight, Shield, Clock,
  Award, Users, CheckCircle2, Menu, X, ChevronRight, ChevronDown,
  ClipboardList, CalendarCheck, Wrench, Quote, Camera, CreditCard,
  BadgeCheck, Leaf, Zap, HardHat, ThumbsUp, Sprout,
} from 'lucide-react';
import { COMPANY, SOCIALS, SERVICE_ICONS, SITE_IMAGES } from '@/lib/constants';
import SocialIcon from '@/components/SocialIcon';
import ServiceIcon from '@/components/ServiceIcon';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';

interface LocalService {
  id: string;
  key: string;
  label: string;
  icon: string;
  active: boolean;
}

const SERVICE_DESCRIPTIONS: Record<string, string> = {
  gutter: 'Professional gutter and eavestrough cleaning, repair, and maintenance. We remove leaves, debris, and blockages to keep water flowing freely, fix sagging sections, seal joints, and re-secure loose fasteners. This protects your roof, foundation, and landscaping from water damage, prevents ice damming in winter, and extends the life of your gutter system. Recommended twice yearly for most homes in the GTA.',
  'window-caulking': 'Professional window caulking seals drafts, prevents water intrusion, and improves energy efficiency. We remove old cracked caulk, clean the surfaces, and apply premium-grade sealant for a weather-tight seal that reduces heating and cooling costs and prevents moisture damage around your window frames.',
  'window-cleaning': 'Crystal-clear window cleaning for homes and businesses. Our team uses professional-grade tools and streak-free techniques to clean interior and exterior glass, screens, and tracks. Enjoy spotless windows that let in more natural light and improve the appearance of your property — streak-free results guaranteed every time.',
  vent: 'Dryer and ventilation cleaning removes dangerous lint buildup from dryer vents, improving air quality, boosting appliance efficiency, and significantly reducing fire risk. We also clean bathroom and kitchen exhaust vents to ensure proper airflow throughout your home. A critical safety service recommended annually for every household.',
  downpipes: 'Downpipe installation and repair ensures proper drainage away from your foundation. We install new downpipes, repair or replace damaged sections, and add extensions where needed to direct water safely away from your home. Proper downpipe function prevents basement flooding, foundation cracks, and soil erosion around your property.',
  'leaks-sealing': 'Expert leak detection and sealing to stop water damage before it becomes costly. We locate the source of leaks using thorough inspection techniques, seal them with durable waterproof materials, and provide recommendations to prevent future issues. Whether it is a roof leak, window leak, or plumbing-related water intrusion, we respond quickly to protect your property.',
  handyman: 'General handyman services for all those repairs and improvements around your home or business. From drywall patches and paint touch-ups to door adjustments, fixture installations, and minor electrical or plumbing tasks, our skilled team handles a wide range of projects with professionalism and attention to detail. No job is too small.',
  soffit: 'Professional soffit installation, repair, and maintenance to protect your roofline and improve attic ventilation. We inspect for damage, rot, or pest entry points, replace deteriorated panels, and ensure proper airflow to prevent moisture buildup and extend the life of your roof. Quality soffit work keeps your home breathing properly and looking sharp.',
  fascia: 'Expert fascia board installation and repair to keep your roof edge strong, straight, and weather-tight. We replace rotted or damaged fascia, secure loose sections, and seal gaps to prevent water intrusion and pest access. Properly maintained fascia supports your gutter system and gives your home a clean, finished exterior look.',
};

const PROCESS_STEPS = [
  { icon: ClipboardList, title: 'Request a Quote', text: 'Book online or call us. Tell us what you need — we will provide a free, no-obligation estimate.' },
  { icon: CalendarCheck, title: 'Schedule Your Service', text: 'Pick a date and time that works for you. We work around your schedule, not the other way around.' },
  { icon: Wrench, title: 'We Get the Job Done', text: 'Our experienced team arrives on time, completes the work to the highest standard, and cleans up after.' },
  { icon: CheckCircle2, title: 'Enjoy the Results', text: 'Sit back and enjoy quality work backed by our satisfaction guarantee. We are not happy until you are.' },
];

const STATS = [
  { icon: Users, label: 'Happy Customers', value: '500+' },
  { icon: Clock, label: 'Years in Business', value: '10+' },
  { icon: Award, label: 'Services Offered', value: '9' },
  { icon: Shield, label: 'Satisfaction', value: '100%' },
];

const TRUST_BADGES = [
  { icon: BadgeCheck, label: 'Licensed & Insured' },
  { icon: Shield, label: 'Satisfaction Guaranteed' },
  { icon: Clock, label: '10+ Years Experience' },
  { icon: ThumbsUp, label: 'Free Estimates' },
];

const BEFORE_AFTER = [
  { before: '/before-gutter.webp', after: '/after-gutter.webp', label: 'Gutter Cleaning', beforeLabel: 'Clogged', afterLabel: 'Clean' },
  { before: '/before-window.webp', after: '/after-window.webp', label: 'Window Caulking', beforeLabel: 'Cracked', afterLabel: 'Sealed' },
];

const REAL_REVIEWS = [
  {
    name: 'Jo-Ann Davis',
    city: 'Toronto',
    text: 'Today is the second time in the last year that we\'ve hired Mark - last year he installed a new down spout for us and today I thought a corner of our gutter on the second floor needed to be re-anchored, but Mark did a through inspection and showed me photos of what he saw and confirmed that all was good. As a result, he just charged a minimum service charge rather than the original quote. Mark is responsive, professional, efficient and personable and I highly recommend him.',
  },
  {
    name: 'Murat Alagoz',
    city: 'Mississauga',
    text: 'Mark was fantastic! He fixed our eavestrough leak quickly, even with its unusual size. He\'s polite, articulate, and prompt. I\'d absolutely hire him again! And highly recommend.',
  },
  {
    name: 'Effie Kastris',
    city: 'Toronto',
    text: 'He came to the job quickly and finished it efficiently. Price was reasonable.',
  },
  {
    name: 'Margherita Di Tacchio',
    city: 'Woodbridge',
    text: 'I\'m very happy with the service provided to clean my windows and repair parts of eaves troughs. I will definitely use this service again next year.',
  },
];

const CREDENTIALS = [
  { icon: Shield, title: 'Fully Licensed & Insured', text: 'Our team carries comprehensive liability insurance and all required licenses to operate safely across Brampton and the Greater Toronto Area.' },
  { icon: Star, title: '5-Star Customer Rating', text: 'Real reviews from real customers. We maintain a perfect five-star rating on Google thanks to our consistent quality and attention to detail.' },
  { icon: HardHat, title: 'Professional-Grade Equipment', text: 'We use commercial-grade tools, premium sealants, and proven techniques on every job — whether it is a small repair or a full installation.' },
  { icon: Clock, title: 'On-Time, Every Time', text: 'We respect your schedule. Our team arrives when we say we will, completes the work efficiently, and cleans up before we leave.' },
  { icon: BadgeCheck, title: 'Upfront Honest Pricing', text: 'No surprises, no hidden fees. You get a free, no-obligation estimate before any work begins, and the price we quote is the price you pay.' },
  { icon: Sprout, title: 'Locally Owned & Operated', text: 'Based right here in Brampton, we understand the unique challenges GTA homeowners face — from ice damming to heavy leaf fall and everything between.' },
];

export default function Website() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [expandedService, setExpandedService] = useState<string | null>(null);

  const reviewUrl = COMPANY.googleReviewUrl;
  const phone = COMPANY.phone;
  const phoneHref = COMPANY.phoneHref;
  const email = COMPANY.email;
  const hq = COMPANY.hq;
  const logoUrl = COMPANY.logoUrl;
  const companyName = COMPANY.name;
  const shortName = COMPANY.shortName;
  const tagline = COMPANY.tagline;
  const heroHeading = "Brampton's Trusted Gutter & Exterior Maintenance Experts";
  const heroSubheading = '';
  const aboutHeading = 'Your Trusted Local Experts in Gutter & Exterior Maintenance';
  const aboutP1 = 'Masbling Astar Services is a Brampton-based, family-run exterior maintenance company serving homeowners and businesses across the Greater Toronto Area for over a decade. Founded and operated by Mark, a skilled tradesperson with a passion for quality craftsmanship, we have built our reputation one satisfied customer at a time — no gimmicks, no shortcuts, just honest work done right.';
  const aboutP2 = 'We specialize in gutter cleaning and repair, eavestrough installation, window caulking and cleaning, dryer vent cleaning, downpipe installation, soffit and fascia repair, leak detection and sealing, and general handyman services. Whether you need a routine seasonal gutter clean or an urgent leak repair, our experienced team arrives on time, uses professional-grade equipment, and treats your property with the same care we would give our own.';
  const aboutP3 = 'What sets us apart is simple: we show up when we say we will, we provide free upfront estimates with no hidden fees, and we stand behind every job with a satisfaction guarantee. We are fully licensed and insured, locally owned, and proud to be Brampton\'s go-to team for exterior maintenance. Ready to get started? Book online in under two minutes or call us today for a free, no-obligation quote.';
  const ctaHeading = 'Ready to Get Started?';
  const ctaSubheading = '';
  const servicesIntro = '';
  const processIntro = '';
  const testimonialsIntro = '';
  const galleryIntro = '';
  const faqIntro = '';
  const contactIntro = 'Have a question or ready to book? Reach out — we are here to help.';
  const hoursLabel = 'Mon – Sat';
  const hoursValue = '8:00 AM – 6:00 PM';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const activeServices = useMemo<LocalService[]>(
    () => Object.keys(SERVICE_ICONS).map((key, i) => ({
      id: `service-${i}`, key, label: key.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '),
      icon: SERVICE_ICONS[key], active: true,
    })),
    [],
  );

  const activeTestimonials = REAL_REVIEWS;
  const activeFaqs: { id: string; question: string; answer: string }[] = [];
  const activeGallery: { id: string; image_url: string; alt_text: string; label: string }[] = [];
  const activeAreas: { id: string; name: string }[] = [];

  const navItems = [
    { label: 'Services', id: 'services' },
    { label: 'How It Works', id: 'process' },
    { label: 'About', id: 'about' },
    { label: 'Why Us', id: 'why-us' },
    ...(activeGallery.length > 0 ? [{ label: 'Gallery', id: 'gallery' }] : []),
    { label: 'Reviews', id: 'testimonials' },
    ...(activeFaqs.length > 0 ? [{ label: 'FAQ', id: 'faq' }] : []),
    { label: 'Contact', id: 'contact' },
    { label: 'Terms', id: 'terms' },
  ];

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-primary-900/95 backdrop-blur-md shadow-lg border-b border-primary-800' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => scrollTo('top')} className="flex items-center gap-2.5">
              <img src={logoUrl} alt="Astar Services" className="w-9 h-9 rounded-lg object-contain bg-navy-50 p-0.5" />
              <div className="text-left">
                <span className="font-display font-bold text-sm text-navy-50 block leading-tight">{shortName}</span>
                <span className="text-[10px] text-gold-400 font-medium hidden sm:block">{tagline}</span>
              </div>
            </button>

            <div className="hidden md:flex items-center gap-6">
              {navItems.map(item => (
                <button key={item.id} onClick={() => scrollTo(item.id)} className="text-sm text-navy-200 hover:text-gold-400 transition-colors">{item.label}</button>
              ))}
              <a href={reviewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 px-3 py-1.5 text-xs font-semibold text-gold-300 transition-all">
                <Star className="w-3.5 h-3.5 fill-gold-300" /> Review Us
              </a>
              <a href="#estimates" className="btn-primary text-xs px-4 py-2">
                Book Now <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white p-2">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-primary-900 border-t border-primary-800 animate-fade-in max-h-[calc(100vh-4rem)] overflow-y-auto overscroll-contain">
            <div className="px-4 py-3 space-y-0.5">
              <div className="flex items-center gap-2.5 pb-3 mb-2 border-b border-navy-800">
                <img src={logoUrl} alt="Astar Services" className="w-10 h-10 rounded-lg object-contain bg-navy-50 p-0.5" />
                <div className="text-left">
                  <span className="font-display font-bold text-sm text-navy-50 block leading-tight">{shortName}</span>
                  <span className="text-[10px] text-gold-400 font-medium">{tagline}</span>
                </div>
              </div>
              {navItems.map(item => (
                <button key={item.id} onClick={() => scrollTo(item.id)} className="flex items-center justify-between w-full text-left py-3 px-2 rounded-lg text-sm text-navy-200 hover:text-gold-400 hover:bg-navy-800/50 active:bg-navy-800 transition-colors">
                  {item.label}
                  <ChevronRight className="w-4 h-4 text-navy-600" />
                </button>
              ))}
              <a href={reviewUrl} target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-navy-800 px-3 py-3 text-sm font-semibold text-gold-300 transition-all w-full mt-2">
                <Star className="w-4 h-4 fill-gold-300" /> Review Us on Google
              </a>
              <a href="#estimates" onClick={() => setMobileMenuOpen(false)} className="btn-primary w-full text-sm mt-2 py-3">
                Book Now <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section id="top" className="relative min-h-[100svh] flex items-center overflow-hidden pt-20 pb-24 md:pb-20">
        <div className="absolute inset-0 z-0">
          <img src={SITE_IMAGES.hero} alt="Masbling Astar Services at work" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-950/80 via-primary-950/50 to-primary-900/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-gold-400/10 border border-gold-600/30 px-3 py-1.5 mb-5 sm:mb-6">
              <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
              <span className="text-xs font-medium text-gold-300">Trusted in Brampton & the GTA</span>
            </div>

            <h1 className="font-display text-[1.6rem] leading-[1.15] sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5 tracking-tight">
              {heroHeading}
            </h1>

            {heroSubheading && (
              <p className="text-sm sm:text-lg text-navy-300 leading-relaxed mb-6 sm:mb-8 max-w-xl">
                {heroSubheading}
              </p>
            )}

            <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
              <a href="#estimates" className="btn-primary text-sm px-6 py-3.5 w-full sm:w-auto justify-center">
                Book a Service <ArrowRight className="w-4 h-4" />
              </a>
              <a href={phoneHref} className="btn-secondary text-sm px-6 py-3.5 whitespace-nowrap w-full sm:w-auto justify-center">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" /> {phone}
              </a>
              <a href={reviewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-800 hover:bg-navy-700 px-6 py-3.5 text-sm font-semibold text-gold-300 transition-all w-full sm:w-auto">
                <Star className="w-4 h-4 fill-gold-300" /> Review Us
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-navy-800/60">
              {STATS.map(stat => (
                <div key={stat.label}>
                  <stat.icon className="w-5 h-5 text-gold-400 mb-1.5" />
                  <p className="font-display text-lg sm:text-xl font-bold text-navy-50">{stat.value}</p>
                  <p className="text-[10px] sm:text-[11px] text-navy-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-y border-navy-800 bg-navy-900/60 py-3.5 sm:py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {TRUST_BADGES.map(badge => (
            <div key={badge.label} className="flex items-center gap-2.5 justify-center sm:justify-start">
              <div className="inline-flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-gold-400/10 border border-gold-600/20 shrink-0">
                <badge.icon className="w-4 h-4 text-gold-400" />
              </div>
              <span className="text-xs font-semibold text-navy-100 leading-tight">{badge.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-2">What We Do</p>
            <h2 className="font-display text-xl sm:text-4xl font-bold text-white mb-3">Our Services</h2>
            {servicesIntro && (
              <p className="text-sm text-navy-300 max-w-xl mx-auto">{servicesIntro}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {activeServices.map(service => {
              const desc = SERVICE_DESCRIPTIONS[service.key] || 'Professional service tailored to your needs.';
              const isExpanded = expandedService === service.id;
              const shortDesc = desc.length > 110 ? desc.slice(0, 110) + '...' : desc;
              return (
                <div key={service.id} className="card card-hover p-5 group flex flex-col">
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gold-400/10 border border-gold-600/20 mb-3 group-hover:bg-gold-400/20 transition-colors">
                    <ServiceIcon name={service.icon || 'Wrench'} className="w-5 h-5 text-gold-400" />
                  </div>
                  <h3 className="font-display text-sm font-bold text-navy-50 mb-1.5">{service.label}</h3>
                  <p className="text-xs text-navy-300 leading-relaxed mb-3 flex-1">
                    {isExpanded ? desc : shortDesc}
                  </p>
                  <div className="flex items-center gap-3 mt-auto">
                    <a href="#estimates" className="inline-flex items-center gap-1 text-xs font-medium text-gold-400 hover:text-gold-300 transition-colors">
                      Book <ChevronRight className="w-3 h-3" />
                    </a>
                    {desc.length > 110 && (
                      <button
                        onClick={() => setExpandedService(isExpanded ? null : service.id)}
                        className="inline-flex items-center gap-0.5 text-xs font-medium text-navy-300 hover:text-gold-400 transition-colors"
                      >
                        {isExpanded ? 'Less' : 'More'}
                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="process" className="py-14 sm:py-20 px-4 sm:px-6 bg-navy-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-2">Simple Process</p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-white mb-3">How It Works</h2>
            {processIntro && (
              <p className="text-sm text-navy-300 max-w-xl mx-auto">{processIntro}</p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            {PROCESS_STEPS.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="card p-5 h-full">
                  <div className="flex items-center justify-between mb-3">
                    <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gold-400/10 border border-gold-600/20">
                      <step.icon className="w-5 h-5 text-gold-400" />
                    </div>
                    <span className="font-display text-3xl font-bold text-navy-800">0{i + 1}</span>
                  </div>
                  <h3 className="font-display text-sm font-bold text-navy-50 mb-1.5">{step.title}</h3>
                  <p className="text-xs text-navy-300 leading-relaxed">{step.text}</p>
                </div>
                {i < PROCESS_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-2 z-10">
                    <ChevronRight className="w-4 h-4 text-navy-700" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-2">About Us</p>
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-white mb-4">
                {aboutHeading}
              </h2>
              <div className="space-y-3 text-sm text-navy-300 leading-relaxed">
                {aboutP1 && <p>{aboutP1}</p>}
                {aboutP2 && <p>{aboutP2}</p>}
                {aboutP3 && <p>{aboutP3}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                {[
                  'Licensed & experienced team',
                  'Free estimates on all services',
                  'Serving Brampton & the GTA',
                  'Satisfaction guaranteed',
                ].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success-400 shrink-0" />
                    <span className="text-xs text-navy-200">{item}</span>
                  </div>
                ))}
              </div>

              <a href="#estimates" className="btn-primary text-sm mt-7 px-6 py-3">
                Get a Free Estimate <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-3">
                <img src={SITE_IMAGES.about1} alt="Gutter cleaning work" className="rounded-2xl object-cover h-48 sm:h-64 w-full" />
                <img src={SITE_IMAGES.about2} alt="Exterior maintenance work" className="rounded-2xl object-cover h-48 sm:h-64 w-full mt-6" />
              </div>
              <div className="absolute -bottom-4 -left-4 card p-4 hidden sm:block shadow-card-hover">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gold-400/10 border border-gold-600/20">
                    <Award className="w-5 h-5 text-gold-400" />
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold text-navy-50">10+ Years</p>
                    <p className="text-[11px] text-navy-400">of trusted service</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-us" className="py-14 sm:py-20 px-4 sm:px-6 bg-navy-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-2">Why Choose Us</p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-white mb-3">The Trusted Choice in the GTA</h2>
            <p className="text-sm text-navy-300 max-w-xl mx-auto">
              For over a decade, homeowners and businesses across Brampton and the Greater Toronto Area have counted on us for honest, reliable, top-quality exterior maintenance.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CREDENTIALS.map(cred => (
              <div key={cred.title} className="card card-hover p-5">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gold-400/10 border border-gold-600/20 mb-3">
                  <cred.icon className="w-5 h-5 text-gold-400" />
                </div>
                <h3 className="font-display text-sm font-bold text-navy-50 mb-1.5">{cred.title}</h3>
                <p className="text-xs text-navy-300 leading-relaxed">{cred.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery — Before & After */}
      <section id="gallery" className="py-14 sm:py-20 px-4 sm:px-6 bg-navy-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-gold-400/10 border border-gold-600/30 px-3 py-1.5 mb-3">
              <Camera className="w-3.5 h-3.5 text-gold-400" />
              <span className="text-xs font-medium text-gold-300">Before & After</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-white mb-3">See the Difference</h2>
            <p className="text-sm text-navy-300 max-w-xl mx-auto">
              Drag the slider to reveal the transformation. Every photo is our own work — watermarked to prove it.
            </p>
          </div>

          <div className="space-y-6">
            {BEFORE_AFTER.map((item, i) => (
              <div key={i}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                  <span className="font-display text-sm font-bold text-white">{item.label}</span>
                </div>
                <BeforeAfterSlider
                  beforeImage={item.before}
                  afterImage={item.after}
                  beforeLabel={item.beforeLabel}
                  afterLabel={item.afterLabel}
                  logoUrl={logoUrl}
                />
              </div>
            ))}
          </div>

          {activeGallery.length > 0 && (
            <div className="mt-12">
              <div className="text-center mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-2">More of Our Work</p>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white">Project Gallery</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {activeGallery.map((img, i) => (
                  <div
                    key={img.id}
                    className={`group relative overflow-hidden rounded-2xl border border-navy-800 cursor-pointer ${i === 0 ? 'col-span-2 lg:col-span-1' : ''}`}
                  >
                    <div className="aspect-square overflow-hidden relative">
                      <img
                        src={img.image_url}
                        alt={img.alt_text}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <img
                        src={logoUrl}
                        alt=""
                        className="absolute bottom-2 right-2 w-7 h-7 rounded-md object-contain bg-navy-50/90 p-0.5 pointer-events-none"
                        draggable={false}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                        <span className="font-display text-xs sm:text-sm font-bold text-navy-50">{img.label}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-14 sm:py-20 px-4 sm:px-6 bg-navy-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-2">Client Testimonials</p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-white mb-3">What Our Customers Say</h2>
            {testimonialsIntro ? (
              <p className="text-sm text-navy-300 max-w-xl mx-auto">{testimonialsIntro}</p>
            ) : (
              <p className="text-sm text-navy-300 max-w-xl mx-auto">
                Real reviews from real homeowners across the GTA. See why families trust us for their gutter and exterior maintenance.
              </p>
            )}
            <div className="inline-flex items-center gap-2.5 mt-4 rounded-xl bg-navy-800/80 border border-gold-600/20 px-4 py-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-gold-400 fill-gold-400" />
                ))}
              </div>
              <span className="text-sm font-semibold text-navy-50">{activeTestimonials.length} verified reviews</span>
              <a href={reviewUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-gold-400 hover:text-gold-300 transition-colors">
                View on Google
              </a>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeTestimonials.map((t, idx) => {
              const name = 'name' in t ? t.name : '';
              const city = 'location' in t ? (t as Testimonial).location : ('city' in t ? (t as typeof REAL_REVIEWS[number]).city : '');
              const text = 'text' in t ? t.text : '';
              const rating = 'rating' in t ? (t as Testimonial).rating : 5;
              return (
                <div key={'id' in t ? t.id : `review-${idx}`} className="card card-hover p-5 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <Quote className="w-7 h-7 text-gold-400/30" />
                    <span className="inline-flex items-center gap-1 rounded-full bg-success-400/10 border border-success-500/30 px-2 py-0.5">
                      <BadgeCheck className="w-3 h-3 text-success-400" />
                      <span className="text-[10px] font-semibold text-success-300">Verified Client</span>
                    </span>
                  </div>
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-gold-400 fill-gold-400" />
                    ))}
                  </div>
                  <p className="text-xs text-navy-200 leading-relaxed mb-4 flex-1">&ldquo;{text}&rdquo;</p>
                  <div className="flex items-center gap-2.5 pt-3 border-t border-navy-800/50">
                    <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-navy-700 text-gold-400 font-display font-bold text-sm shrink-0">
                      {name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-navy-50 truncate">{name}</p>
                      <p className="text-[11px] text-navy-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" /> {city}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      {activeAreas.length > 0 && (
        <section className="py-14 sm:py-20 px-4 sm:px-6 bg-navy-900/50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 sm:mb-10">
              <p className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-2">Service Areas</p>
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-white mb-3">Where We Work</h2>
              <p className="text-sm text-navy-300 max-w-xl mx-auto">
                {companyName} proudly serves homeowners and businesses across Brampton and the Greater Toronto Area.
                If your city is listed below, we can be at your door — and if you are just outside these areas, give us
                a call and we will do our best to accommodate.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {activeAreas.map(area => (
                <div key={area.id} className="card flex items-center gap-2.5 p-3">
                  <MapPin className="w-4 h-4 text-gold-400 shrink-0" />
                  <span className="text-sm font-medium text-navy-100">{area.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary-900 via-primary-900 to-primary-800 border border-primary-700">
            <div className="relative z-10 px-6 sm:px-12 py-10 sm:py-14 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <img src={logoUrl} alt="Masbling Astar Services" className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-contain bg-navy-50 p-1.5 shrink-0" />
                <div>
                  <h2 className="font-display text-xl sm:text-3xl font-bold text-white mb-2">
                    {ctaHeading}
                  </h2>
                  {ctaSubheading && (
                    <p className="text-sm text-navy-300 max-w-md">{ctaSubheading}</p>
                  )}
                </div>
              </div>
              <a href="#estimates" className="btn-primary text-sm px-6 py-3.5 shrink-0 w-full sm:w-auto justify-center">
                Book Now <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      {activeFaqs.length > 0 && (
        <section id="faq" className="py-14 sm:py-20 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <p className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-2">Questions</p>
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-white mb-3">Frequently Asked Questions</h2>
              {faqIntro && (
                <p className="text-sm text-navy-300 max-w-xl mx-auto">{faqIntro}</p>
              )}
            </div>

            <div className="space-y-3">
              {activeFaqs.map((faq, i) => (
                <div key={faq.id} className="card overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 p-4 text-left"
                  >
                    <span className="text-sm font-semibold text-navy-50">{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-gold-400 shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`grid transition-all duration-300 ${openFaq === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <p className="text-sm text-navy-300 leading-relaxed px-4 pb-4">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section id="contact" className="py-14 sm:py-20 px-4 sm:px-6 bg-navy-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-2">Get In Touch</p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-white mb-3">Contact Us</h2>
            {contactIntro && (
              <p className="text-sm text-navy-300 max-w-xl mx-auto">{contactIntro}</p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 max-w-4xl mx-auto">
            <a href={phoneHref} className="card card-hover p-5 text-center group">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gold-400/10 border border-gold-600/20 mb-3 group-hover:bg-gold-400/20 transition-colors mx-auto">
                <Phone className="w-5 h-5 text-gold-400" />
              </div>
              <p className="text-xs text-navy-400 mb-1">Phone</p>
              <p className="text-sm font-semibold text-navy-50">{phone}</p>
            </a>

            <a href={`mailto:${email}`} className="card card-hover p-5 text-center group">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gold-400/10 border border-gold-600/20 mb-3 group-hover:bg-gold-400/20 transition-colors mx-auto">
                <Mail className="w-5 h-5 text-gold-400" />
              </div>
              <p className="text-xs text-navy-400 mb-1">Email</p>
              <p className="text-sm font-semibold text-navy-50 break-all">{email}</p>
            </a>

            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hq)}`} target="_blank" rel="noopener noreferrer" className="card card-hover p-5 text-center group">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gold-400/10 border border-gold-600/20 mb-3 group-hover:bg-gold-400/20 transition-colors mx-auto">
                <MapPin className="w-5 h-5 text-gold-400" />
              </div>
              <p className="text-xs text-navy-400 mb-1">Address</p>
              <p className="text-sm font-semibold text-navy-50">{hq}</p>
            </a>

            <a href={reviewUrl} target="_blank" rel="noopener noreferrer" className="card card-hover p-5 text-center group">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gold-400/10 border border-gold-600/20 mb-3 group-hover:bg-gold-400/20 transition-colors mx-auto">
                <Star className="w-5 h-5 text-gold-400" />
              </div>
              <p className="text-xs text-navy-400 mb-1">Reviews</p>
              <p className="text-sm font-semibold text-navy-50">Review Us</p>
            </a>

            <a href={phoneHref} className="card card-hover p-5 text-center group">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gold-400/10 border border-gold-600/20 mb-3 group-hover:bg-gold-400/20 transition-colors mx-auto">
                <Clock className="w-5 h-5 text-gold-400" />
              </div>
              <p className="text-xs text-navy-400 mb-1">Service Hours</p>
              <p className="text-sm font-semibold text-navy-50">{hoursLabel}</p>
              <p className="text-xs text-navy-300">{hoursValue}</p>
            </a>
          </div>

          <div className="flex items-center justify-center gap-2.5 mt-10">
            {SOCIALS.map(s => (
              <a
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-gold-400 transition-all"
                aria-label={s.label}
              >
                <SocialIcon name={s.icon} className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Legal & Billing Terms */}
      <section id="terms" className="py-12 sm:py-16 px-4 sm:px-6 bg-navy-900/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-2">Legal & Billing</p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-white mb-3">Terms & Policies</h2>
          </div>

          <div className="space-y-4">
            <div className="card p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gold-400/10 border border-gold-600/20">
                  <CreditCard className="w-4 h-4 text-gold-400" />
                </div>
                <h3 className="font-display text-sm font-bold text-navy-50">Billing & Late Fees Policy</h3>
              </div>
              <p className="text-xs text-navy-300 leading-relaxed">
                All project invoices are processed and due immediately upon job completion. A flat $25 late
                administrative fee applies to accounts passing 7 days past due, alongside an accruing 2% interest
                charge assessed weekly.
              </p>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gold-400/10 border border-gold-600/20">
                  <Wrench className="w-4 h-4 text-gold-400" />
                </div>
                <h3 className="font-display text-sm font-bold text-navy-50">Service Call & Inspection Policy</h3>
              </div>
              <p className="text-xs text-navy-300 leading-relaxed">
                A standard $170 service call fee applies to all scheduled on-site visits, covering our
                technician's travel, time, and expert evaluation of your property. If a problem is identified
                and you approve the repair work, this $170 fee will be waived or credited toward the total cost
                of the job. If no issue is found, or if the requested work is not required, the $170 fee remains
                due to cover the site visit.
              </p>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gold-400/10 border border-gold-600/20">
                  <Clock className="w-4 h-4 text-gold-400" />
                </div>
                <h3 className="font-display text-sm font-bold text-navy-50">Operational Cancellation Policy</h3>
              </div>
              <p className="text-xs text-navy-300 leading-relaxed">
                Scheduled service windows require a mandatory 24-hour advance modification notice. Same-day
                cancellations or site entry denials incur a flat $50 logistics fee.
              </p>
            </div>

            <div className="card p-5 border-warning-700/40">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-warning-900/30 border border-warning-700/30">
                  <Shield className="w-4 h-4 text-warning-400" />
                </div>
                <h3 className="font-display text-sm font-bold text-navy-50">Structural Liability Disclaimer</h3>
              </div>
              <p className="text-xs text-navy-300 leading-relaxed">
                Masbling Astar Services carries comprehensive operational liability insurance. Our field teams
                maintain zero liability regarding pre-existing structural substrate rot, internal mold growth, or
                historic water tracking damage resulting from faulty historical frame seals or prior construction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary-800 px-4 sm:px-6 pt-6 pb-24 md:pb-8 bg-primary-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <img src={logoUrl} alt="Astar Services" className="w-8 h-8 rounded-lg object-contain bg-navy-50 p-0.5" />
                <p className="font-display text-xs font-bold text-navy-100">{companyName}</p>
              </div>
              <p className="text-[11px] text-navy-400 flex items-center gap-1.5 mb-1"><MapPin className="w-3 h-3" /> {hq}</p>
              <a href={phoneHref} className="text-[11px] text-navy-400 hover:text-gold-400 transition-colors flex items-center gap-1.5 whitespace-nowrap">
                <Phone className="w-3 h-3 shrink-0" /> {phone}
              </a>
            </div>

            <div className="rounded-xl bg-navy-900/50 border border-navy-800 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-navy-200 mb-2">Legal Billing & Late Policies</p>
              <p className="text-[10px] text-navy-400 leading-relaxed mb-2">
                Invoices are issued immediately upon work completion. A flat $25 administrative late fee applies on
                accounts passing 7 days past due, alongside an accruing 2% interest charge calculated weekly.
              </p>
              <p className="text-[10px] text-navy-400 leading-relaxed mb-2">
                Modifications to scheduled windows require 24-hour advance notice. Late cancellations or field entry
                denial incur a flat $50 logistics fee.
              </p>
              <p className="text-[10px] text-navy-400 leading-relaxed">
                A $170 service call fee applies to all on-site visits and is credited toward approved repair work.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-x-4 gap-y-2 flex-wrap justify-center border-t border-navy-800/50 pt-5">
            <a href="#estimates" className="text-xs text-navy-400 hover:text-gold-400 transition-colors">Book a Service</a>
            <a href={reviewUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-navy-400 hover:text-gold-400 transition-colors inline-flex items-center gap-1">
              <Star className="w-3 h-3 fill-gold-400 text-gold-400" /> Review Us
            </a>
            <a href="#terms" className="text-xs text-navy-400 hover:text-gold-400 transition-colors">Terms & Policies</a>
            <a href="#data-deletion" className="text-xs text-navy-400 hover:text-gold-400 transition-colors">Data Deletion</a>
            <a href="#staff" className="text-xs text-navy-500 hover:text-navy-300 transition-colors">Staff Sign In</a>
          </div>

          <p className="text-center text-[10px] text-navy-500 mt-6">
            &copy; {new Date().getFullYear()} {companyName}. All rights reserved.
          </p>

          <div className="flex justify-center mt-5">
            <a href="https://websitelaunches.com/site/masblingastarservices.com" target="_blank" rel="noopener noreferrer">
              <img
                src="https://websitelaunches.com/badge/masblingastarservices.com.svg"
                alt="Established online - Public launch record"
                width={255}
                height={55}
                className="h-auto w-auto"
              />
            </a>
          </div>
        </div>
      </footer>
      {/* Mobile sticky action bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-primary-900/95 backdrop-blur-md border-t border-primary-800 px-3 py-2.5 flex items-center gap-2 safe-area-pb">
        <a href={phoneHref} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary-700 active:bg-primary-600 px-3 py-2.5 text-xs font-semibold text-white transition-all">
          <Phone className="w-4 h-4 text-gold-400" /> Call
        </a>
        <a href="#estimates" className="flex-[1.5] inline-flex items-center justify-center gap-1.5 rounded-xl bg-gold-400 active:bg-gold-300 px-3 py-2.5 text-xs font-bold text-black transition-all">
          Book Now <ArrowRight className="w-3.5 h-3.5" />
        </a>
        <a href={reviewUrl} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary-700 active:bg-primary-600 px-3 py-2.5 text-xs font-semibold text-white transition-all">
          <Star className="w-3.5 h-3.5 fill-gold-300 text-gold-300" /> Review
        </a>
      </div>
    </div>
  );
}
