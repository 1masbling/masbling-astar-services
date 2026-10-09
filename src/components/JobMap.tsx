import { useMemo } from 'react';
import { MapPin, Navigation as NavIcon, ExternalLink } from 'lucide-react';
import type { Job, Technician } from '@/lib/types';
import { TECHNICIAN_COLORS, SERVICE_ICONS } from '@/lib/constants';
import ServiceIcon from '@/components/ServiceIcon';

interface JobMapProps {
  jobs: Job[];
  technicians?: Technician[];
  onSelectJob?: (job: Job) => void;
  selectedJobId?: string | null;
  height?: string;
  showLegend?: boolean;
}

export default function JobMap({
  jobs,
  technicians,
  onSelectJob,
  selectedJobId,
  height = '400px',
  showLegend = true,
}: JobMapProps) {
  const geocodableJobs = useMemo(
    () => jobs.filter(j => j.address && j.scheduled_date),
    [jobs],
  );

  const techFor = (id: string | null) => technicians?.find(t => t.id === id);

  if (geocodableJobs.length === 0) {
    return (
      <div className="card p-8 text-center">
        <MapPin className="w-8 h-8 text-navy-600 mx-auto mb-2" />
        <p className="text-sm text-navy-300">No jobs with addresses to display on map.</p>
      </div>
    );
  }

  const uniqueAddresses = Array.from(
    new Set(geocodableJobs.map(j => j.address).filter(Boolean)),
  );
  const centerAddress = uniqueAddresses[0];

  const pinList = geocodableJobs.map((job) => {
    const tech = techFor(job.technician_id);
    const cfg = tech ? TECHNICIAN_COLORS[tech.color] || TECHNICIAN_COLORS.gold : null;
    return {
      id: job.id,
      address: job.address,
      label: job.customer_name,
      techName: tech?.name,
      techColor: cfg?.color || 'text-navy-300',
      color: job.technician_id ? cfg?.dot.replace('bg-', '') : 'navy-500',
      isSelected: job.id === selectedJobId,
    };
  });

  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(centerAddress)}&z=12&output=embed`;

  return (
    <div className="space-y-3">
      <div className="card overflow-hidden p-0">
        <div className="relative" style={{ height }}>
          <iframe
            src={mapSrc}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Job locations map"
            style={{ filter: 'saturate(0.85) brightness(0.9)' }}
          />
          <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-lg bg-navy-950/85 backdrop-blur-sm px-2.5 py-1.5 border border-navy-700">
            <MapPin className="w-3.5 h-3.5 text-gold-400" />
            <span className="text-xs font-semibold text-navy-100">
              {geocodableJobs.length} job{geocodableJobs.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="card p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <MapPin className="w-4 h-4 text-gold-400" />
          <span className="text-xs font-semibold text-navy-100">Job Locations</span>
        </div>
        <div className="space-y-1.5">
          {geocodableJobs.map(job => {
            const tech = techFor(job.technician_id);
            const cfg = tech ? TECHNICIAN_COLORS[tech.color] || TECHNICIAN_COLORS.gold : null;
            const isSelected = job.id === selectedJobId;
            return (
              <div
                key={job.id}
                className={`flex items-center gap-2.5 rounded-lg p-2 border transition-all ${
                  isSelected
                    ? 'bg-gold-900/20 border-gold-600/40'
                    : 'bg-navy-900 border-navy-700 hover:border-navy-600'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg?.dot || 'bg-navy-500'}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-navy-50 truncate">{job.customer_name}</p>
                  <p className="text-[10px] text-navy-400 truncate">{job.address}</p>
                </div>
                <span className="text-[10px] text-navy-400 shrink-0">{job.scheduled_date}</span>
                {onSelectJob && (
                  <button
                    onClick={() => onSelectJob(job)}
                    className="text-[10px] font-semibold text-gold-400 hover:text-gold-300 shrink-0"
                  >
                    View
                  </button>
                )}
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(job.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-navy-400 hover:text-gold-400 shrink-0"
                  aria-label="Open in Google Maps"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {showLegend && technicians && technicians.filter(t => t.active).length > 0 && (
        <div className="card p-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-semibold text-navy-400">Technicians:</span>
            {technicians.filter(t => t.active).map(t => {
              const cfg = TECHNICIAN_COLORS[t.color] || TECHNICIAN_COLORS.gold;
              return (
                <span key={t.id} className="inline-flex items-center gap-1 text-[10px]">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <span className={cfg.color}>{t.name.split(' ')[0]}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
