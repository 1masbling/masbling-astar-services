export type JobStatus = 'estimate' | 'scheduled' | 'in-progress' | 'complete';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';
export type PaymentMethod = 'etransfer' | 'card' | 'cash';
export type PaymentStatus = 'pending' | 'confirmed' | 'failed';
export type TicketStatus = 'open' | 'resolved';
export type TicketPriority = 'low' | 'medium' | 'high';
export type CampaignStatus = 'draft' | 'active' | 'paused';
export type EstimateStatus = 'draft' | 'sent' | 'approved' | 'declined' | 'expired';
export type ReviewStatus = 'pending' | 'requested' | 'received' | 'declined';
export type NotificationType = 'sms' | 'email';
export type NotificationStatus = 'draft' | 'sent' | 'failed';

export interface Service {
  id: string;
  key: string;
  label: string;
  icon: string;
  active: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  created_at: string;
}

export interface Technician {
  id: string;
  name: string;
  role: string;
  phone: string;
  color: string;
  active: boolean;
  auth_id: string | null;
  email: string | null;
  created_at: string;
}

export interface Job {
  id: string;
  service_key: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  address: string;
  status: JobStatus;
  urgent: boolean;
  value: number;
  scheduled_date: string | null;
  time_window: string | null;
  technician_id: string | null;
  rating: number | null;
  notes: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  number: string;
  job_id: string | null;
  customer_id: string | null;
  customer_name: string;
  amount: number;
  status: InvoiceStatus;
  sent_at: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface Checklist {
  id: string;
  job_id: string;
  template_name: string;
  item_text: string;
  completed: boolean;
  created_at: string;
}

export interface Schedule {
  id: string;
  customer_id: string | null;
  customer_name: string;
  service_key: string;
  address: string;
  frequency: string;
  next_run: string;
  active: boolean;
  created_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  platform: string;
  reach: number;
  leads: number;
  ads_running: boolean;
  created_at: string;
}

export interface CsrTicket {
  id: string;
  job_id: string | null;
  customer_id: string | null;
  customer_name: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
}

export interface JobPhoto {
  id: string;
  job_id: string;
  photo_url: string;
  caption: string;
  created_at: string;
}

export interface EstimateLineItem {
  id: string;
  estimate_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  sort_order: number;
  created_at: string;
}

export interface Estimate {
  id: string;
  number: string;
  customer_id: string | null;
  customer_name: string;
  job_id: string | null;
  status: EstimateStatus;
  subtotal: number;
  tax_rate: number;
  total: number;
  notes: string;
  sent_at: string | null;
  expires_at: string | null;
  line_items?: EstimateLineItem[];
  created_at: string;
}

export interface TimeEntry {
  id: string;
  job_id: string | null;
  technician_id: string | null;
  clock_in: string;
  clock_out: string | null;
  duration_minutes: number;
  notes: string;
  created_at: string;
}

export interface ReviewRequest {
  id: string;
  job_id: string | null;
  customer_id: string | null;
  customer_name: string;
  status: ReviewStatus;
  rating: number | null;
  review_text: string;
  sent_at: string | null;
  responded_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  recipient: string;
  recipient_name: string;
  subject: string;
  body: string;
  status: NotificationStatus;
  related_job_id: string | null;
  related_invoice_id: string | null;
  created_at: string;
  sent_at: string | null;
}

export interface Payment {
  id: string;
  invoice_id: string | null;
  customer_name: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  status: PaymentStatus;
  requested_at: string;
  confirmed_at: string | null;
  notes: string;
  created_at: string;
}

export type DeletionRequestStatus = 'pending' | 'in_progress' | 'completed' | 'declined';

export interface DataDeletionRequest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  account_identifier: string | null;
  reason: string | null;
  status: DeletionRequestStatus;
  submitted_at: string;
  resolved_at: string | null;
  staff_notes: string | null;
  created_at: string;
}

export interface CompanySettings {
  id: number;
  name: string;
  short_name: string;
  tagline: string;
  phone: string;
  email: string;
  website: string;
  website_href: string;
  hq: string;
  logo_url: string;
  etransfer_email: string;
  etransfer_recipient: string;
  square_checkout_url: string;
  google_review_url: string;
  hero_heading: string;
  hero_subheading: string;
  about_heading: string;
  about_paragraph_1: string;
  about_paragraph_2: string;
  about_paragraph_3: string;
  cta_heading: string;
  cta_subheading: string;
  services_intro: string;
  process_intro: string;
  gallery_intro: string;
  testimonials_intro: string;
  faq_intro: string;
  contact_intro: string;
  hours_label: string;
  hours_value: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  location: string;
  display_order: number;
  active: boolean;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  active: boolean;
}

export interface GalleryImage {
  id: string;
  image_url: string;
  alt_text: string;
  label: string;
  display_order: number;
  active: boolean;
}

export interface ServiceArea {
  id: string;
  name: string;
  display_order: number;
  active: boolean;
}

export type ViewKey = 'dashboard' | 'pipeline' | 'dispatch' | 'customers' | 'operations' | 'billing' | 'marketing' | 'estimates' | 'booking' | 'data-deletion' | 'website' | 'settings';
