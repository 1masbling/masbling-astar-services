import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from './supabase';
import type {
  Job, Invoice, Checklist, Schedule, Campaign, CsrTicket, JobPhoto, Service,
  Customer, Technician, Estimate, EstimateLineItem, TimeEntry, ReviewRequest, Notification, Payment,
  DataDeletionRequest, DeletionRequestStatus,
  JobStatus, InvoiceStatus, TicketStatus,
} from './types';

interface DataContextValue {
  services: Service[];
  customers: Customer[];
  technicians: Technician[];
  jobs: Job[];
  invoices: Invoice[];
  checklists: Checklist[];
  schedules: Schedule[];
  campaigns: Campaign[];
  tickets: CsrTicket[];
  photos: JobPhoto[];
  estimates: Estimate[];
  lineItems: EstimateLineItem[];
  timeEntries: TimeEntry[];
  reviews: ReviewRequest[];
  notifications: Notification[];
  payments: Payment[];
  deletionRequests: DataDeletionRequest[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateJobStatus: (jobId: string, status: JobStatus) => Promise<void>;
  addJob: (job: Omit<Job, 'id' | 'created_at'>) => Promise<void>;
  updateJob: (jobId: string, updates: Partial<Job>) => Promise<void>;
  updateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => Promise<void>;
  addInvoice: (inv: Omit<Invoice, 'id' | 'created_at'>) => Promise<void>;
  toggleChecklist: (checklistId: string, completed: boolean) => Promise<void>;
  addSchedule: (schedule: Omit<Schedule, 'id' | 'created_at'>) => Promise<void>;
  updateSchedule: (scheduleId: string, updates: Partial<Schedule>) => Promise<void>;
  addCampaign: (campaign: Omit<Campaign, 'id' | 'created_at'>) => Promise<void>;
  updateCampaign: (campaignId: string, updates: Partial<Campaign>) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at'>) => Promise<void>;
  updateCustomer: (customerId: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (customerId: string) => Promise<void>;
  addTechnician: (tech: Omit<Technician, 'id' | 'created_at'>) => Promise<void>;
  updateTechnician: (techId: string, updates: Partial<Technician>) => Promise<void>;
  createStaffAccount: (staff: { name: string; email: string; password: string; role?: string; phone?: string; color?: string }) => Promise<void>;
  toggleStaffActive: (techId: string, active: boolean) => Promise<void>;
  resetStaffPassword: (email: string) => Promise<{ error: string | null }>;
  addEstimate: (est: Omit<Estimate, 'id' | 'created_at' | 'line_items'>, items: Omit<EstimateLineItem, 'id' | 'estimate_id' | 'created_at'>[]) => Promise<void>;
  updateEstimate: (estId: string, updates: Partial<Estimate>) => Promise<void>;
  deleteEstimate: (estId: string) => Promise<void>;
  addTimeEntry: (entry: Omit<TimeEntry, 'id' | 'created_at'>) => Promise<void>;
  updateTimeEntry: (entryId: string, updates: Partial<TimeEntry>) => Promise<void>;
  addReviewRequest: (review: Omit<ReviewRequest, 'id' | 'created_at'>) => Promise<void>;
  updateReviewRequest: (reviewId: string, updates: Partial<ReviewRequest>) => Promise<void>;
  addNotification: (notif: Omit<Notification, 'id' | 'created_at' | 'sent_at'>) => Promise<void>;
  addPayment: (payment: Omit<Payment, 'id' | 'created_at'>) => Promise<void>;
  updatePayment: (paymentId: string, updates: Partial<Payment>) => Promise<void>;
  updateDeletionRequest: (id: string, updates: Partial<Pick<DataDeletionRequest, 'status' | 'staff_notes' | 'resolved_at'>>) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [tickets, setTickets] = useState<CsrTicket[]>([]);
  const [photos, setPhotos] = useState<JobPhoto[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [lineItems, setLineItems] = useState<EstimateLineItem[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [reviews, setReviews] = useState<ReviewRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<DataDeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    const [svc, cust, tech, job, inv, chk, sch, cam, tkt, pho, est, li, te, rv, nf, pm, dr] = await Promise.all([
      supabase.from('services').select('*').order('label'),
      supabase.from('customers').select('*').order('created_at', { ascending: false }),
      supabase.from('technicians').select('*').order('name'),
      supabase.from('jobs').select('*').order('created_at', { ascending: false }),
      supabase.from('invoices').select('*').order('created_at', { ascending: false }),
      supabase.from('checklists').select('*').order('created_at', { ascending: true }),
      supabase.from('schedules').select('*').order('next_run', { ascending: true }),
      supabase.from('campaigns').select('*').order('created_at', { ascending: false }),
      supabase.from('csr_tickets').select('*').order('created_at', { ascending: false }),
      supabase.from('job_photos').select('*').order('created_at', { ascending: false }),
      supabase.from('estimates').select('*').order('created_at', { ascending: false }),
      supabase.from('estimate_line_items').select('*').order('sort_order', { ascending: true }),
      supabase.from('time_entries').select('*').order('clock_in', { ascending: false }),
      supabase.from('review_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('notifications').select('*').order('sent_at', { ascending: false }),
      supabase.from('payments').select('*').order('created_at', { ascending: false }),
      supabase.from('data_deletion_requests').select('*').order('submitted_at', { ascending: false }),
    ]);
    const results = [svc, cust, tech, job, inv, chk, sch, cam, tkt, pho, est, li, te, rv, nf, pm, dr];
    for (const r of results) {
      if (r.error) {
        if (r.error.code === 'PGRST301' || (r.error.message && r.error.message.includes('JWT issued at future'))) {
          await supabase.auth.refreshSession();
          throw new Error('RETRY');
        }
        throw r.error;
      }
    }
    setServices(svc.data || []);
    setCustomers(cust.data || []);
    setTechnicians(tech.data || []);
    setJobs(job.data || []);
    setInvoices(inv.data || []);
    setChecklists(chk.data || []);
    setSchedules(sch.data || []);
    setCampaigns(cam.data || []);
    setTickets(tkt.data || []);
    setPhotos(pho.data || []);
    setEstimates(est.data || []);
    setLineItems(li.data || []);
    setTimeEntries(te.data || []);
    setReviews(rv.data || []);
    setNotifications(nf.data || []);
    setPayments(pm.data || []);
    setDeletionRequests(dr.data || []);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchAll();
    } catch (err) {
      if (err instanceof Error && err.message === 'RETRY') {
        try {
          await fetchAll();
          return;
        } catch (retryErr) {
          setError(retryErr instanceof Error ? retryErr.message : 'Failed to load data');
          return;
        }
      }
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetchAll]);

  useEffect(() => { refresh(); }, [refresh]);

  const updateJobStatus = useCallback(async (jobId: string, status: JobStatus) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status } : j));
    const { error } = await supabase.from('jobs').update({ status }).eq('id', jobId);
    if (error) { await refresh(); throw error; }
  }, [refresh]);

  const addJob = useCallback(async (job: Omit<Job, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('jobs').insert(job).select().single();
    if (error) throw error;
    if (data) setJobs(prev => [data, ...prev]);
  }, []);

  const updateJob = useCallback(async (jobId: string, updates: Partial<Job>) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, ...updates } : j));
    const { error } = await supabase.from('jobs').update(updates).eq('id', jobId);
    if (error) { await refresh(); throw error; }
  }, [refresh]);

  const updateInvoiceStatus = useCallback(async (invoiceId: string, status: InvoiceStatus) => {
    const updates: Record<string, unknown> = { status };
    if (status === 'sent') updates.sent_at = new Date().toISOString();
    if (status === 'paid') updates.paid_at = new Date().toISOString();
    setInvoices(prev => prev.map(i => i.id === invoiceId ? { ...i, ...updates } as Invoice : i));
    const { error } = await supabase.from('invoices').update(updates).eq('id', invoiceId);
    if (error) { await refresh(); throw error; }
  }, [refresh]);

  const addInvoice = useCallback(async (inv: Omit<Invoice, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('invoices').insert(inv).select().single();
    if (error) throw error;
    if (data) setInvoices(prev => [data, ...prev]);
  }, []);

  const toggleChecklist = useCallback(async (checklistId: string, completed: boolean) => {
    setChecklists(prev => prev.map(c => c.id === checklistId ? { ...c, completed } : c));
    const { error } = await supabase.from('checklists').update({ completed }).eq('id', checklistId);
    if (error) { await refresh(); throw error; }
  }, [refresh]);

  const addSchedule = useCallback(async (schedule: Omit<Schedule, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('schedules').insert(schedule).select().single();
    if (error) throw error;
    if (data) setSchedules(prev => [...prev, data]);
  }, []);

  const updateSchedule = useCallback(async (scheduleId: string, updates: Partial<Schedule>) => {
    setSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, ...updates } : s));
    const { error } = await supabase.from('schedules').update(updates).eq('id', scheduleId);
    if (error) { await refresh(); throw error; }
  }, [refresh]);

  const addCampaign = useCallback(async (campaign: Omit<Campaign, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('campaigns').insert(campaign).select().single();
    if (error) throw error;
    if (data) setCampaigns(prev => [data, ...prev]);
  }, []);

  const updateCampaign = useCallback(async (campaignId: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, ...updates } : c));
    const { error } = await supabase.from('campaigns').update(updates).eq('id', campaignId);
    if (error) { await refresh(); throw error; }
  }, [refresh]);

  const updateTicketStatus = useCallback(async (ticketId: string, status: TicketStatus) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
    const { error } = await supabase.from('csr_tickets').update({ status }).eq('id', ticketId);
    if (error) { await refresh(); throw error; }
  }, [refresh]);

  const addCustomer = useCallback(async (customer: Omit<Customer, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('customers').insert(customer).select().single();
    if (error) throw error;
    if (data) setCustomers(prev => [data, ...prev]);
  }, []);

  const updateCustomer = useCallback(async (customerId: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, ...updates } : c));
    const { error } = await supabase.from('customers').update(updates).eq('id', customerId);
    if (error) { await refresh(); throw error; }
  }, [refresh]);

  const deleteCustomer = useCallback(async (customerId: string) => {
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    const { error } = await supabase.from('customers').delete().eq('id', customerId);
    if (error) { await refresh(); throw error; }
  }, [refresh]);

  const addTechnician = useCallback(async (tech: Omit<Technician, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('technicians').insert(tech).select().single();
    if (error) throw error;
    if (data) setTechnicians(prev => [...prev, data]);
  }, []);

  const updateTechnician = useCallback(async (techId: string, updates: Partial<Technician>) => {
    setTechnicians(prev => prev.map(t => t.id === techId ? { ...t, ...updates } : t));
    const { error } = await supabase.from('technicians').update(updates).eq('id', techId);
    if (error) { await refresh(); throw error; }
  }, [refresh]);

  const createStaffAccount = useCallback(async (staff: { name: string; email: string; password: string; role?: string; phone?: string; color?: string }) => {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-staff`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(staff),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || `Failed to create staff account (${response.status})`);
    }
    const { technician } = await response.json();
    if (technician) setTechnicians(prev => [...prev, technician]);
  }, []);

  const toggleStaffActive = useCallback(async (techId: string, active: boolean) => {
    setTechnicians(prev => prev.map(t => t.id === techId ? { ...t, active } : t));
    const { error } = await supabase.from('technicians').update({ active }).eq('id', techId);
    if (error) { await refresh(); throw error; }
  }, [refresh]);

  const resetStaffPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });
    return { error: error?.message ?? null };
  }, []);

  const addEstimate = useCallback(async (est: Omit<Estimate, 'id' | 'created_at' | 'line_items'>, items: Omit<EstimateLineItem, 'id' | 'estimate_id' | 'created_at'>[]) => {
    const { data, error } = await supabase.from('estimates').insert(est).select().single();
    if (error) throw error;
    if (data) {
      setEstimates(prev => [data, ...prev]);
      if (items.length > 0) {
        const itemsWithEst = items.map((it, i) => ({ ...it, estimate_id: data.id, sort_order: i }));
        const { data: itemData, error: itemErr } = await supabase.from('estimate_line_items').insert(itemsWithEst).select();
        if (itemErr) throw itemErr;
        if (itemData) setLineItems(prev => [...itemData, ...prev]);
      }
    }
  }, []);

  const updateEstimate = useCallback(async (estId: string, updates: Partial<Estimate>) => {
    const dbUpdates: Record<string, unknown> = { ...updates };
    if (updates.status === 'sent') dbUpdates.sent_at = new Date().toISOString();
    setEstimates(prev => prev.map(e => e.id === estId ? { ...e, ...updates } : e));
    const { error } = await supabase.from('estimates').update(dbUpdates).eq('id', estId);
    if (error) { await refresh(); throw error; }
  }, [refresh]);

  const deleteEstimate = useCallback(async (estId: string) => {
    setEstimates(prev => prev.filter(e => e.id !== estId));
    setLineItems(prev => prev.filter(li => li.estimate_id !== estId));
    const { error } = await supabase.from('estimates').delete().eq('id', estId);
    if (error) { await refresh(); throw error; }
  }, [refresh]);

  const addTimeEntry = useCallback(async (entry: Omit<TimeEntry, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('time_entries').insert(entry).select().single();
    if (error) throw error;
    if (data) setTimeEntries(prev => [data, ...prev]);
  }, []);

  const updateTimeEntry = useCallback(async (entryId: string, updates: Partial<TimeEntry>) => {
    setTimeEntries(prev => prev.map(t => t.id === entryId ? { ...t, ...updates } : t));
    const { error } = await supabase.from('time_entries').update(updates).eq('id', entryId);
    if (error) { await refresh(); throw error; }
  }, [refresh]);

  const addReviewRequest = useCallback(async (review: Omit<ReviewRequest, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('review_requests').insert(review).select().single();
    if (error) throw error;
    if (data) setReviews(prev => [data, ...prev]);
  }, []);

  const updateReviewRequest = useCallback(async (reviewId: string, updates: Partial<ReviewRequest>) => {
    const dbUpdates: Record<string, unknown> = { ...updates };
    if (updates.status === 'received') dbUpdates.responded_at = new Date().toISOString();
    if (updates.status === 'requested') dbUpdates.sent_at = new Date().toISOString();
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, ...updates } : r));
    const { error } = await supabase.from('review_requests').update(dbUpdates).eq('id', reviewId);
    if (error) { await refresh(); throw error; }
  }, [refresh]);

  const addNotification = useCallback(async (notif: Omit<Notification, 'id' | 'created_at' | 'sent_at'>) => {
    const { data, error } = await supabase.from('notifications').insert({ ...notif, sent_at: new Date().toISOString() }).select().single();
    if (error) throw error;
    if (data) setNotifications(prev => [data, ...prev]);
  }, []);

  const addPayment = useCallback(async (payment: Omit<Payment, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('payments').insert(payment).select().single();
    if (error) throw error;
    if (data) setPayments(prev => [data, ...prev]);
  }, []);

  const updatePayment = useCallback(async (paymentId: string, updates: Partial<Payment>) => {
    const dbUpdates: Record<string, unknown> = { ...updates };
    if (updates.status === 'confirmed') dbUpdates.confirmed_at = new Date().toISOString();
    setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, ...updates } as Payment : p));
    const { error } = await supabase.from('payments').update(dbUpdates).eq('id', paymentId);
    if (error) { await refresh(); throw error; }
  }, [refresh]);

  const updateDeletionRequest = useCallback(async (id: string, updates: Partial<Pick<DataDeletionRequest, 'status' | 'staff_notes' | 'resolved_at'>>) => {
    const dbUpdates: Record<string, unknown> = { ...updates };
    if (updates.status === 'completed' || updates.status === 'declined') {
      dbUpdates.resolved_at = new Date().toISOString();
    }
    setDeletionRequests(prev => prev.map(r => r.id === id ? { ...r, ...dbUpdates } as DataDeletionRequest : r));
    const { error } = await supabase.from('data_deletion_requests').update(dbUpdates).eq('id', id);
    if (error) { await refresh(); throw error; }
  }, [refresh]);

  return (
    <DataContext.Provider value={{
      services, customers, technicians, jobs, invoices, checklists, schedules, campaigns, tickets, photos,
      estimates, lineItems, timeEntries, reviews, notifications, payments,
      deletionRequests,
      loading, error, refresh,
      updateJobStatus, addJob, updateJob,
      updateInvoiceStatus, addInvoice,
      toggleChecklist,
      addSchedule, updateSchedule,
      addCampaign, updateCampaign,
      updateTicketStatus,
      addCustomer, updateCustomer, deleteCustomer,
      addTechnician, updateTechnician,
      createStaffAccount, toggleStaffActive, resetStaffPassword,
      addEstimate, updateEstimate, deleteEstimate,
      addTimeEntry, updateTimeEntry,
      addReviewRequest, updateReviewRequest,
      addNotification,
      addPayment, updatePayment,
      updateDeletionRequest,
    }}>
      {children}
    </DataContext.Provider>
  );
}
