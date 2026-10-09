import { SERVICE_ICONS } from '@/lib/constants';
import ServiceIcon from './ServiceIcon';
import type { ViewKey } from '@/lib/types';

interface ServiceChipsProps {
  services: { key: string; label: string }[];
  activeFilter: string | null;
  onFilter: (key: string | null) => void;
  onNavigate?: (view: ViewKey) => void;
}

export default function ServiceChips({ services, activeFilter, onFilter, onNavigate }: ServiceChipsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      <button
        onClick={() => onFilter(null)}
        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
          activeFilter === null ? 'bg-gold-400 text-navy-950' : 'bg-navy-800 text-navy-200 hover:bg-navy-700'
        }`}
      >
        All Services
      </button>
      {services.map(svc => {
        const active = activeFilter === svc.key;
        return (
          <button
            key={svc.key}
            onClick={() => {
              onFilter(active ? null : svc.key);
              if (!active && onNavigate) onNavigate('pipeline');
            }}
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              active ? 'bg-gold-400 text-navy-950' : 'bg-navy-800 text-navy-200 hover:bg-navy-700'
            }`}
          >
            <ServiceIcon name={SERVICE_ICONS[svc.key] || 'Wrench'} className="w-3.5 h-3.5" />
            {svc.label}
          </button>
        );
      })}
    </div>
  );
}
