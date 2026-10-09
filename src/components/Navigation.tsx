import {
  LayoutDashboard, GitBranch, SlidersHorizontal, Receipt, Megaphone,
  CalendarDays, Users, FileText, CalendarPlus, Settings,
  type LucideIcon,
} from 'lucide-react';
import { NAV_ITEMS, BOOKING_NAV } from '@/lib/constants';
import type { ViewKey } from '@/lib/types';

const navIconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  GitBranch,
  SlidersHorizontal,
  Receipt,
  Megaphone,
  CalendarDays,
  Users,
  FileText,
  CalendarPlus,
  Settings,
};

interface NavigationProps {
  current: ViewKey;
  onChange: (view: ViewKey) => void;
}

export default function Navigation({ current, onChange }: NavigationProps) {
  return (
    <>
      <nav className="hidden md:flex flex-col gap-1 w-56 shrink-0 border-r border-navy-700 bg-navy-900 p-3 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const Icon = navIconMap[item.icon] || LayoutDashboard;
          const active = current === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                active ? 'bg-gold-400 text-navy-950 shadow-glow' : 'text-navy-200 hover:bg-navy-800 hover:text-navy-50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          );
        })}
        <div className="h-px bg-navy-700 my-2" />
        <button
          onClick={() => onChange(BOOKING_NAV.key)}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
            current === 'booking' ? 'bg-teal-400 text-navy-950' : 'text-teal-300 hover:bg-navy-800 hover:text-teal-200'
          }`}
        >
          <CalendarPlus className="w-4 h-4 shrink-0" />
          {BOOKING_NAV.label}
        </button>
      </nav>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-navy-700 bg-navy-900/95 backdrop-blur-md px-1 py-1.5 overflow-x-auto">
        {NAV_ITEMS.map(item => {
          const Icon = navIconMap[item.icon] || LayoutDashboard;
          const active = current === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 transition-all shrink-0 ${
                active ? 'text-gold-400' : 'text-navy-300'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[9px] font-semibold">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => onChange(BOOKING_NAV.key)}
          className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 transition-all shrink-0 ${
            current === 'booking' ? 'text-teal-400' : 'text-teal-300'
          }`}
        >
          <CalendarPlus className={`w-5 h-5 ${current === 'booking' ? 'scale-110' : ''} transition-transform`} />
          <span className="text-[9px] font-semibold">Book</span>
        </button>
      </nav>
    </>
  );
}
