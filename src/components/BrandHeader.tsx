import { Phone, Globe, Mail, MapPin } from 'lucide-react';
import { COMPANY, SOCIALS } from '@/lib/constants';
import SocialIcon from './SocialIcon';

interface BrandHeaderProps {
  onWebsiteClick?: () => void;
}

export default function BrandHeader({ onWebsiteClick }: BrandHeaderProps) {
  const logoUrl = COMPANY.logoUrl;
  const name = COMPANY.name;
  const tagline = COMPANY.tagline;
  const phone = COMPANY.phone;
  const phoneHref = COMPANY.phoneHref;
  const email = COMPANY.email;
  const website = COMPANY.website;
  const hq = COMPANY.hq;

  const WebsiteLink = ({ className, iconClass, label }: { className: string; iconClass: string; label?: string }) => {
    if (onWebsiteClick) {
      return (
        <button onClick={onWebsiteClick} className={className}>
          <Globe className={iconClass} /> {label}
        </button>
      );
    }
    return (
      <a href="#top" className={className}>
        <Globe className={iconClass} /> {label}
      </a>
    );
  };
  return (
    <header className="bg-white border-b border-navy-100 px-4 py-4 md:px-6 md:py-5 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => { window.location.hash = ''; window.scrollTo({ top: 0 }); }}
            className="flex items-center gap-3 group cursor-pointer"
            aria-label="Go to home"
          >
            <img
              src={logoUrl}
              alt="Masbling Astar Services"
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-contain shrink-0 group-hover:opacity-90 transition-opacity"
            />
            <div className="min-w-0">
              <p className="font-display text-sm md:text-lg font-bold text-navy-800 tracking-tight leading-tight">
                {name}
              </p>
              <p className="text-xs text-gold-600 font-medium hidden sm:block">{tagline}</p>
            </div>
          </button>
          <div className="flex items-center gap-3">
            <WebsiteLink
              className="hidden md:inline-flex items-center gap-2 rounded-xl bg-navy-50 hover:bg-navy-100 px-3 py-2 text-sm font-medium text-navy-700 transition-all"
              iconClass="w-4 h-4 text-gold-500"
              label={website}
            />
            <a
              href={phoneHref}
              className="hidden md:inline-flex items-center gap-2 rounded-xl bg-gold-500 hover:bg-gold-600 px-3 py-2 text-sm font-semibold text-white transition-all whitespace-nowrap"
            >
              <Phone className="w-4 h-4 shrink-0" />
              {phone}
            </a>
            <div className="flex items-center gap-1.5">
              {SOCIALS.map(s => (
                <a
                  key={s.key}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-navy-50 hover:bg-gold-100 text-navy-500 hover:text-gold-600 transition-all"
                  aria-label={s.label}
                >
                  <SocialIcon name={s.icon} className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 md:hidden">
          <a href={phoneHref} className="inline-flex items-center gap-1.5 text-xs text-navy-700 font-medium whitespace-nowrap">
            <Phone className="w-3.5 h-3.5 text-gold-500 shrink-0" /> {phone}
          </a>
          <WebsiteLink
            className="inline-flex items-center gap-1.5 text-xs text-navy-600 hover:text-gold-600 transition-colors"
            iconClass="w-3.5 h-3.5 text-gold-500"
            label={website}
          />
          <a href={`mailto:${email}`} className="inline-flex items-center gap-1.5 text-xs text-navy-600 hover:text-gold-600 transition-colors">
            <Mail className="w-3.5 h-3.5 text-gold-500" /> {email}
          </a>
        </div>
        <div className="hidden md:flex items-center gap-4 mt-2 text-xs text-navy-500">
          <a href={`mailto:${email}`} className="inline-flex items-center gap-1.5 hover:text-gold-600 transition-colors"><Mail className="w-3.5 h-3.5" /> {email}</a>
          <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {hq}</span>
        </div>
      </div>
    </header>
  );
}
