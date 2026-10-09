import { useState, useEffect } from 'react';
import { AlertCircle, Loader2, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { DataProvider, useData } from '@/lib/data';
import BrandHeader from '@/components/BrandHeader';
import Navigation from '@/components/Navigation';
import ServiceChips from '@/components/ServiceChips';
import Dashboard from '@/views/Dashboard';
import Pipeline from '@/views/Pipeline';
import Operations from '@/views/Operations';
import Billing from '@/views/Billing';
import Marketing from '@/views/Marketing';
import Customers from '@/views/Customers';
import Dispatch from '@/views/Dispatch';
import Estimates from '@/views/Estimates';
import Booking from '@/views/Booking';
import DataDeletion from '@/views/DataDeletion';
import FieldApp from '@/views/FieldApp';
import SignIn from '@/views/SignIn';
import Website from '@/views/Website';
import Settings from '@/views/Settings';
import { ArrowLeft } from 'lucide-react';
import type { ViewKey } from '@/lib/types';

function WebsitePreview({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-navy-950">
      <button
        onClick={onBack}
        className="fixed top-4 left-4 z-[60] inline-flex items-center gap-1.5 rounded-full bg-white/95 hover:bg-white px-3.5 py-2 text-xs font-semibold text-navy-800 shadow-lg transition-all"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </button>
      <Website />
    </div>
  );
}

type OperationsTab = 'csr' | 'scheduling' | 'checklists' | 'camera';

function AppContent() {
  const { user, signOut } = useAuth();
  const { services, technicians, loading, error } = useData();
  const [view, setView] = useState<ViewKey>('dashboard');
  const [serviceFilter, setServiceFilter] = useState<string | null>(null);
  const [operationsTab, setOperationsTab] = useState<OperationsTab>('csr');

  const staffTech = user ? technicians.find(t => t.auth_id === user.id) : null;
  const isStaff = !!staffTech;

  const handleNavigate = (v: ViewKey) => {
    setView(v);
    if (v !== 'pipeline') setServiceFilter(null);
    if (v === 'operations') setOperationsTab('csr');
  };

  const handleNavigateOperations = (tab: OperationsTab) => {
    setOperationsTab(tab);
    setView('operations');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-gold-400 mx-auto mb-3 animate-spin" />
          <p className="text-sm text-navy-300">Loading Masbling Astar Services...</p>
        </div>
      </div>
    );
  }

  if (view === 'website') {
    return <WebsitePreview onBack={() => handleNavigate('dashboard')} />;
  }

  if (isStaff && staffTech) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col">
        <BrandHeader />
        <main className="flex-1 overflow-y-auto px-4 py-4 pb-20 md:pb-6 md:px-6 max-w-5xl mx-auto w-full">
          <div className="flex justify-end mb-2">
            <button onClick={signOut} className="inline-flex items-center gap-1.5 text-xs text-navy-400 hover:text-error-400 transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
          <FieldApp authedTechId={staffTech.id} />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950 p-4">
        <div className="card max-w-md w-full p-6 text-center">
          <AlertCircle className="w-10 h-10 text-error-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-navy-50 mb-1">Connection Error</h2>
          <p className="text-sm text-navy-300 mb-4">{error}</p>
          <button onClick={() => refresh()} className="btn-primary text-sm px-5 py-2.5">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <BrandHeader onWebsiteClick={() => handleNavigate('website')} />
      <div className="flex flex-1 min-h-0">
        <Navigation current={view} onChange={handleNavigate} />
        <main className="flex-1 overflow-y-auto px-4 py-4 pb-20 md:pb-6 md:px-6 max-w-5xl mx-auto w-full">
          {user && (
            <div className="flex justify-end mb-2">
              <button onClick={signOut} className="inline-flex items-center gap-1.5 text-xs text-navy-400 hover:text-error-400 transition-colors">
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
          {view !== 'dashboard' && (
            <div className="mb-4">
              <ServiceChips services={services} activeFilter={serviceFilter} onFilter={setServiceFilter} onNavigate={handleNavigate} />
            </div>
          )}
          {view === 'dashboard' && <Dashboard onNavigate={handleNavigate} onNavigateOps={handleNavigateOperations} onServiceFilter={setServiceFilter} />}
          {view === 'pipeline' && <Pipeline serviceFilter={serviceFilter} onClearFilter={() => setServiceFilter(null)} onNavigate={handleNavigate} />}
          {view === 'operations' && <Operations initialTab={operationsTab} />}
          {view === 'customers' && <Customers />}
          {view === 'dispatch' && <Dispatch />}
          {view === 'estimates' && <Estimates />}
          {view === 'billing' && <Billing />}
          {view === 'marketing' && <Marketing />}
          {view === 'booking' && <Booking />}
          {view === 'data-deletion' && <DataDeletion />}
          {view === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
}

function AuthedApp() {
  const { session, loading } = useAuth();
  const [publicView, setPublicView] = useState<string | null>(null);

  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash.replace('#', '');
      setPublicView(hash || null);
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950">
        <Loader2 className="w-8 h-8 text-gold-400 mx-auto animate-spin" />
      </div>
    );
  }

  if (!session) {
    if (publicView === 'data-deletion') {
      return (
        <div className="min-h-screen bg-navy-950 flex flex-col">
          <BrandHeader />
          <main className="flex-1 overflow-y-auto px-4 py-6 pb-20 md:pb-6 max-w-5xl mx-auto w-full">
            <DataDeletion />
          </main>
        </div>
      );
    }
    if (publicView === 'booking') {
      return (
        <div className="min-h-screen bg-navy-950 flex flex-col">
          <BrandHeader />
          <main className="flex-1 overflow-y-auto px-4 py-6 pb-20 md:pb-6 max-w-5xl mx-auto w-full">
            <Booking />
          </main>
        </div>
      );
    }
    if (publicView === 'estimates') {
      return (
        <div className="min-h-screen bg-navy-950 flex flex-col">
          <BrandHeader />
          <main className="flex-1 overflow-y-auto px-4 py-6 pb-20 md:pb-6 max-w-5xl mx-auto w-full">
            <Estimates />
          </main>
        </div>
      );
    }
    if (publicView === 'staff') {
      return <SignIn />;
    }
    return <Website />;
  }

  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthedApp />
    </AuthProvider>
  );
}
