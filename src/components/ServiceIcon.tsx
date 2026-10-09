interface IconProps {
  className?: string;
}

function GutterIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <path d="M4 10h24l-3 16a2 2 0 0 1-2 1.6H9a2 2 0 0 1-2-1.6L4 10z" fill="#1e40af" />
      <path d="M4 10h24l-3 16a2 2 0 0 1-2 1.6H9a2 2 0 0 1-2-1.6L4 10z" fill="url(#gutter-shade)" opacity="0.3" />
      <rect x="3" y="7" width="26" height="5" rx="2.5" fill="#3b82f6" />
      <path d="M7 7.5c0-1 .5-2 1-2.5M12 7.5c0-1 .5-2 1-2.5M17 7.5c0-1 .5-2 1-2.5M22 7.5c0-1 .5-2 1-2.5" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 16c1.5-2 3-2 4.5 0s3 2 4.5 0" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M10 20c1.5-2 3-2 4.5 0s3 2 4.5 0" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <defs>
        <linearGradient id="gutter-shade" x1="16" y1="10" x2="16" y2="27.6">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function WindowCaulkingIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <rect x="5" y="4" width="22" height="24" rx="2" fill="#0f172a" />
      <rect x="7" y="6" width="18" height="20" rx="1" fill="#38bdf8" opacity="0.85" />
      <line x1="16" y1="6" x2="16" y2="26" stroke="#0f172a" strokeWidth="1.5" />
      <line x1="7" y1="16" x2="25" y2="16" stroke="#0f172a" strokeWidth="1.5" />
      <path d="M5 4l2-2M27 4l-2-2M5 28l2 2M27 28l-2 2" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="6" cy="5" r="1.5" fill="#fbbf24" />
      <circle cx="26" cy="5" r="1.5" fill="#fbbf24" />
      <circle cx="6" cy="27" r="1.5" fill="#fbbf24" />
      <circle cx="26" cy="27" r="1.5" fill="#fbbf24" />
    </svg>
  );
}

function WindowCleaningIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <rect x="6" y="5" width="14" height="22" rx="1.5" fill="#38bdf8" opacity="0.2" />
      <rect x="6" y="5" width="14" height="22" rx="1.5" stroke="#38bdf8" strokeWidth="1.5" />
      <line x1="13" y1="5" x2="13" y2="27" stroke="#38bdf8" strokeWidth="1" />
      <line x1="6" y1="16" x2="20" y2="16" stroke="#38bdf8" strokeWidth="1" />
      <path d="M22 8l3-3 4 4-3 3" fill="#fbbf24" />
      <rect x="21.5" y="10" width="5" height="5" rx="0.5" transform="rotate(45 24 12.5)" fill="#f59e0b" />
      <line x1="19" y1="11" x2="21" y2="13" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 10c2-1.5 4-1.5 6 0M9 20c2-1.5 4-1.5 6 0" stroke="#bae6fd" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function VentIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <rect x="5" y="4" width="22" height="24" rx="3" fill="#334155" />
      <rect x="5" y="4" width="22" height="24" rx="3" stroke="#475569" strokeWidth="1.5" />
      <path d="M8 10h16M8 14h16M8 18h16M8 22h16" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 7c4 1 8 1 12 0" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 26c2-2 4-2 6 0" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function DownpipeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <path d="M10 3h12v4l-2 2v14l2 2v2H10v-2l2-2V9l-2-2V3z" fill="#64748b" />
      <path d="M10 3h12v4l-2 2v14l2 2v2H10v-2l2-2V9l-2-2V3z" stroke="#475569" strokeWidth="1" />
      <path d="M16 9v14" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
      <path d="M12 27h8" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="6" r="2" fill="#3b82f6" />
      <path d="M14 6c0-1 1-2 2-2s2 1 2 2" stroke="#93c5fd" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function LeakSealingIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <path d="M16 3C16 3 8 12 8 19a8 8 0 0 0 16 0c0-7-8-16-8-16z" fill="#3b82f6" />
      <path d="M16 3C16 3 8 12 8 19a8 8 0 0 0 16 0c0-7-8-16-8-16z" fill="url(#leak-grad)" opacity="0.3" />
      <path d="M12 17c2-1 4-1 6 0s4 1 6 0" stroke="#bae6fd" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <circle cx="16" cy="20" r="4" fill="#fbbf24" />
      <path d="M14 20h4M16 18v4" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="leak-grad" x1="16" y1="3" x2="16" y2="27">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function HandymanIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <path d="M6 26L20 12l4 4L10 30z" fill="#f59e0b" />
      <path d="M6 26L20 12l4 4L10 30z" stroke="#d97706" strokeWidth="1" />
      <rect x="20" y="6" width="6" height="10" rx="1" transform="rotate(45 23 11)" fill="#64748b" />
      <rect x="20" y="6" width="6" height="10" rx="1" transform="rotate(45 23 11)" stroke="#475569" strokeWidth="1" />
      <path d="M24 4l4 4-2 2-4-4z" fill="#334155" />
      <path d="M6 26l-2 2v2h2l2-2z" fill="#fbbf24" />
    </svg>
  );
}

function SoffitIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <rect x="4" y="6" width="24" height="4" rx="1" fill="#475569" />
      <rect x="4" y="6" width="24" height="4" rx="1" stroke="#334155" strokeWidth="1" />
      <rect x="4" y="11" width="24" height="3" rx="0.5" fill="#64748b" opacity="0.8" />
      <rect x="4" y="15" width="24" height="3" rx="0.5" fill="#64748b" opacity="0.6" />
      <rect x="4" y="19" width="24" height="3" rx="0.5" fill="#64748b" opacity="0.4" />
      <path d="M8 6V4M14 6V4M20 6V4M26 6V4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M6 24l4-2 4 2 4-2 4 2 4-2" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function FasciaIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <path d="M4 10L16 4L28 10L16 16L4 10Z" fill="#1e40af" opacity="0.3" />
      <rect x="4" y="10" width="24" height="5" rx="1" fill="#3b82f6" />
      <rect x="4" y="10" width="24" height="5" rx="1" stroke="#1e40af" strokeWidth="1" />
      <rect x="4" y="16" width="24" height="4" rx="1" fill="#64748b" />
      <rect x="4" y="16" width="24" height="4" rx="1" stroke="#475569" strokeWidth="1" />
      <path d="M8 16v4M14 16v4M20 16v4M26 16v4" stroke="#94a3b8" strokeWidth="1" opacity="0.5" />
      <path d="M4 10L16 4L28 10" stroke="#93c5fd" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

const iconMap: Record<string, (props: IconProps) => JSX.Element> = {
  CloudRain: GutterIcon,
  Frame: WindowCaulkingIcon,
  Sparkles: WindowCleaningIcon,
  Wind: VentIcon,
  Pipette: DownpipeIcon,
  Droplets: LeakSealingIcon,
  Wrench: HandymanIcon,
  Layers: SoffitIcon,
  GalleryVerticalEnd: FasciaIcon,
};

export default function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] || HandymanIcon;
  return <Icon className={className} />;
}

export { GutterIcon, WindowCaulkingIcon, WindowCleaningIcon, VentIcon, DownpipeIcon, LeakSealingIcon, HandymanIcon, SoffitIcon, FasciaIcon };
