import type { JobStatus, InvoiceStatus, TicketPriority, CampaignStatus, EstimateStatus, ReviewStatus, NotificationType } from './types';

export const COMPANY = {
  name: 'MASBLING A STAR SERVICES',
  shortName: 'Masbling Astar',
  tagline: 'Gutter & Exterior Maintenance',
  phone: '437-440-4072',
  phoneHref: 'tel:+14374404072',
  website: 'masblingastarservices.com',
  websiteHref: 'https://masblingastarservices.com',
  email: 'info@masblingastarservices.com',
  hq: '45 Bramalea Rd, Suite 208, Brampton ON L6T 2W4',
  logoUrl: 'https://primary.jwwb.nl/public/i/m/n/temp-hwgoxuvggarjusrpjxtf/image-high-uhzdzu.png?enable-io=true&enable=upscale&height=70',
  etransferEmail: 'info@masblingastarservices.com',
  etransferRecipient: 'Masbling Astar Services',
  squareCheckoutUrl: 'https://square.link/u/fhSUKcOa',
  googleReviewUrl: 'https://www.google.com/search?q=masbling+a+star+services+brampton',
};

export const SOCIALS = [
  { key: 'x', label: 'X', href: 'https://x.com/masblingastar', icon: 'X' },
  { key: 'instagram', label: 'Instagram', href: 'https://instagram.com/masblingastar', icon: 'Instagram' },
  { key: 'tiktok', label: 'TikTok', href: 'https://tiktok.com/@1masbling', icon: 'Music2' },
  { key: 'whatsapp', label: 'WhatsApp', href: 'https://api.whatsapp.com/send?phone=4374404072', icon: 'MessageCircle' },
];

export const SERVICE_FEE = 170;

export const SERVICE_ICONS: Record<string, string> = {
  gutter: 'CloudRain',
  'window-caulking': 'Frame',
  'window-cleaning': 'Sparkles',
  vent: 'Wind',
  downpipes: 'Pipette',
  'leaks-sealing': 'Droplets',
  handyman: 'Wrench',
  soffit: 'Layers',
  fascia: 'GalleryVerticalEnd',
};

export const JOB_STATUSES: { key: JobStatus; label: string; color: string; bg: string; border: string }[] = [
  { key: 'estimate', label: 'Estimate', color: 'text-navy-200', bg: 'bg-navy-600', border: 'border-navy-500' },
  { key: 'scheduled', label: 'Scheduled', color: 'text-teal-300', bg: 'bg-teal-900/50', border: 'border-teal-700' },
  { key: 'in-progress', label: 'In Progress', color: 'text-gold-300', bg: 'bg-gold-900/40', border: 'border-gold-700' },
  { key: 'complete', label: 'Complete', color: 'text-success-300', bg: 'bg-success-900/40', border: 'border-success-700' },
];

export const JOB_STATUS_FLOW: JobStatus[] = ['estimate', 'scheduled', 'in-progress', 'complete'];

export const INVOICE_STATUSES: { key: InvoiceStatus; label: string; color: string; bg: string }[] = [
  { key: 'draft', label: 'Draft', color: 'text-navy-200', bg: 'bg-navy-600' },
  { key: 'sent', label: 'Sent', color: 'text-teal-300', bg: 'bg-teal-900/50' },
  { key: 'paid', label: 'Paid', color: 'text-success-300', bg: 'bg-success-900/40' },
  { key: 'overdue', label: 'Overdue', color: 'text-error-300', bg: 'bg-error-900/40' },
];

export const TICKET_PRIORITIES: { key: TicketPriority; label: string; color: string; bg: string }[] = [
  { key: 'high', label: 'High', color: 'text-error-300', bg: 'bg-error-900/40' },
  { key: 'medium', label: 'Medium', color: 'text-warning-300', bg: 'bg-warning-900/40' },
  { key: 'low', label: 'Low', color: 'text-teal-300', bg: 'bg-teal-900/50' },
];

export const CAMPAIGN_STATUSES: { key: CampaignStatus; label: string; color: string; bg: string }[] = [
  { key: 'active', label: 'Active', color: 'text-success-300', bg: 'bg-success-900/40' },
  { key: 'paused', label: 'Paused', color: 'text-warning-300', bg: 'bg-warning-900/40' },
  { key: 'draft', label: 'Draft', color: 'text-navy-200', bg: 'bg-navy-600' },
];

export const SITE_IMAGES = {
  hero: 'https://primary.jwwb.nl/public/i/m/n/temp-hwgoxuvggarjusrpjxtf/1000019041-standard.jpg',
  about1: 'https://primary.jwwb.nl/public/i/m/n/temp-hwgoxuvggarjusrpjxtf/img-20251115-wa0078-high.jpg?enable-io=true&enable=upscale&width=800',
  about2: 'https://primary.jwwb.nl/public/i/m/n/temp-hwgoxuvggarjusrpjxtf/20251124_144624-high.jpg?enable-io=true&enable=upscale&width=800',
  cta: 'https://primary.jwwb.nl/public/i/m/n/temp-hwgoxuvggarjusrpjxtf/1000053727-high.jpg?enable-io=true&enable=upscale&width=1200',
};

export const GALLERY_IMAGES = [
  { src: 'https://primary.jwwb.nl/public/i/m/n/temp-hwgoxuvggarjusrpjxtf/img-20251115-wa0078-high-87ftzz.jpg?enable-io=true&fit=bounds&width=540&height=540&quality=60', alt: 'Gutter cleaning service', label: 'Gutter Cleaning' },
  { src: 'https://primary.jwwb.nl/public/i/m/n/temp-hwgoxuvggarjusrpjxtf/1000017143-high.jpg?enable-io=true&enable=upscale&crop=1%3A1%2Coffset-x42&width=800', alt: 'Gutter installation work', label: 'Gutter Installation' },
  { src: 'https://primary.jwwb.nl/public/i/m/n/temp-hwgoxuvggarjusrpjxtf/1000047774-high.jpg?enable-io=true&enable=upscale&crop=1%3A1&width=800', alt: 'Exterior maintenance project', label: 'Exterior Maintenance' },
  { src: 'https://primary.jwwb.nl/public/i/m/n/temp-hwgoxuvggarjusrpjxtf/1000050365-high-qf05fe.jpg?enable-io=true&enable=upscale&crop=1%3A1&width=800', alt: 'Window caulking service', label: 'Window Caulking' },
  { src: 'https://primary.jwwb.nl/public/i/m/n/temp-hwgoxuvggarjusrpjxtf/1000019040-standard-5um343.jpg', alt: 'Eavestrough repair work', label: 'Eavestrough Repair' },
  { src: 'https://primary.jwwb.nl/public/i/m/n/temp-hwgoxuvggarjusrpjxtf/1000017147-standard.jpg', alt: 'Downpipe installation', label: 'Downpipe Service' },
];

export const FREQUENCIES = ['weekly', 'biweekly', 'monthly', 'quarterly', 'biannual', 'annual'];

export const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { key: 'pipeline', label: 'Pipeline', icon: 'GitBranch' },
  { key: 'dispatch', label: 'Dispatch', icon: 'CalendarDays' },
  { key: 'customers', label: 'Customers', icon: 'Users' },
  { key: 'estimates', label: 'Estimates', icon: 'FileText' },
  { key: 'operations', label: 'Operations', icon: 'SlidersHorizontal' },
  { key: 'billing', label: 'Billing', icon: 'Receipt' },
  { key: 'marketing', label: 'Marketing', icon: 'Megaphone' },
  { key: 'settings', label: 'Settings', icon: 'Settings' },
] as const;

export const BOOKING_NAV = { key: 'booking', label: 'Online Booking', icon: 'CalendarPlus' } as const;

export const TECHNICIAN_COLORS: Record<string, { color: string; bg: string; border: string; dot: string }> = {
  gold:    { color: 'text-gold-300',    bg: 'bg-gold-900/40',    border: 'border-gold-700',    dot: 'bg-gold-400' },
  teal:    { color: 'text-teal-300',    bg: 'bg-teal-900/40',    border: 'border-teal-700',    dot: 'bg-teal-400' },
  accent:  { color: 'text-accent-300',  bg: 'bg-accent-900/40',  border: 'border-accent-700',  dot: 'bg-accent-400' },
  success: { color: 'text-success-300', bg: 'bg-success-900/40', border: 'border-success-700', dot: 'bg-success-400' },
  warning: { color: 'text-warning-300', bg: 'bg-warning-900/40', border: 'border-warning-700', dot: 'bg-warning-400' },
  error:   { color: 'text-error-300',   bg: 'bg-error-900/40',   border: 'border-error-700',   dot: 'bg-error-400' },
};

export const TECHNICIAN_COLOR_OPTIONS = ['gold', 'teal', 'accent', 'success', 'warning', 'error'];

export const ESTIMATE_STATUSES: { key: EstimateStatus; label: string; color: string; bg: string }[] = [
  { key: 'draft', label: 'Draft', color: 'text-navy-200', bg: 'bg-navy-600' },
  { key: 'sent', label: 'Sent', color: 'text-teal-300', bg: 'bg-teal-900/50' },
  { key: 'approved', label: 'Approved', color: 'text-success-300', bg: 'bg-success-900/40' },
  { key: 'declined', label: 'Declined', color: 'text-error-300', bg: 'bg-error-900/40' },
  { key: 'expired', label: 'Expired', color: 'text-warning-300', bg: 'bg-warning-900/40' },
];

export const REVIEW_STATUSES: { key: ReviewStatus; label: string; color: string; bg: string }[] = [
  { key: 'pending', label: 'Pending', color: 'text-navy-200', bg: 'bg-navy-600' },
  { key: 'requested', label: 'Requested', color: 'text-teal-300', bg: 'bg-teal-900/50' },
  { key: 'received', label: 'Received', color: 'text-success-300', bg: 'bg-success-900/40' },
  { key: 'declined', label: 'Declined', color: 'text-error-300', bg: 'bg-error-900/40' },
];

export const NOTIFICATION_TYPES: { key: NotificationType; label: string; icon: string }[] = [
  { key: 'sms', label: 'SMS', icon: 'MessageSquare' },
  { key: 'email', label: 'Email', icon: 'Mail' },
];

export const TIME_WINDOWS = [
  '8:00 AM – 10:00 AM',
  '9:00 AM – 11:00 AM',
  '10:00 AM – 12:00 PM',
  '11:00 AM – 1:00 PM',
  '12:00 PM – 2:00 PM',
  '1:00 PM – 3:00 PM',
  '2:00 PM – 4:00 PM',
  '8:00 AM – 12:00 PM',
  '9:00 AM – 3:00 PM',
  '10:00 AM – 2:00 PM',
];
