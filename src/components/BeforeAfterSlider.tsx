import { useRef, useState, useCallback, useEffect } from 'react';
import { MoveHorizontal } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  logoUrl: string;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After',
  logoUrl,
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: PointerEvent) => updatePosition(e.clientX);
    const onUp = () => setIsDragging(false);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [isDragging, updatePosition]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl border border-primary-700/40 select-none cursor-ew-resize aspect-[4/3] bg-navy-900"
      onPointerDown={(e) => { setIsDragging(true); updatePosition(e.clientX); }}
    >
      {/* After image (full, behind) */}
      <img
        src={afterImage}
        alt={afterLabel}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        draggable={false}
      />

      {/* Before image (clipped to left portion) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ width: `${position}%` }}
      >
        <img
          src={beforeImage}
          alt={beforeLabel}
          className="absolute inset-0 h-full object-cover"
          style={{ width: containerRef.current?.clientWidth || '100%', maxWidth: 'none' }}
          draggable={false}
        />
      </div>

      {/* Logo watermark */}
      <img
        src={logoUrl}
        alt=""
        className="absolute bottom-3 right-3 w-9 h-9 rounded-lg object-contain bg-navy-50/90 p-1 pointer-events-none z-10 shadow-lg"
        draggable={false}
      />

      {/* Labels */}
      <span className="absolute top-3 left-3 rounded-full bg-navy-950/80 px-3 py-1 text-xs font-bold text-gold-400 pointer-events-none z-10 backdrop-blur-sm">
        {beforeLabel}
      </span>
      <span className="absolute top-3 right-14 rounded-full bg-navy-950/80 px-3 py-1 text-xs font-bold text-primary-300 pointer-events-none z-10 backdrop-blur-sm">
        {afterLabel}
      </span>

      {/* Slider line and handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white z-20 pointer-events-none"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
          <MoveHorizontal className="w-5 h-5 text-primary-700" />
        </div>
      </div>
    </div>
  );
}
