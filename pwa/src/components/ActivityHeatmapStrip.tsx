import React, { useRef, useEffect } from 'react';
import { HeatmapDayData } from '../types';

interface ActivityHeatmapStripProps {
  days: HeatmapDayData[];
  selectedDateIso: string;
  onDateSelected: (dateIso: string) => void;
}

const HEATMAP_COLORS = [
  'var(--zen-heatmap-0)', // Level 0 (0%)
  '#C3DBC5',              // Level 1 (1-25%)
  '#8FB791',              // Level 2 (26-50%)
  '#57915B',              // Level 3 (51-75%)
  '#2E6B34',              // Level 4 (76-100%)
];

const getHeatmapColor = (ratio: number): string => {
  if (ratio <= 0) return HEATMAP_COLORS[0];
  if (ratio <= 0.25) return HEATMAP_COLORS[1];
  if (ratio <= 0.50) return HEATMAP_COLORS[2];
  if (ratio <= 0.75) return HEATMAP_COLORS[3];
  return HEATMAP_COLORS[4];
};

export const ActivityHeatmapStrip: React.FC<ActivityHeatmapStripProps> = ({
  days,
  selectedDateIso,
  onDateSelected,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to selected date on load/change
  useEffect(() => {
    if (!scrollRef.current) return;
    const selectedEl = scrollRef.current.querySelector(`[data-date="${selectedDateIso}"]`);
    if (selectedEl) {
      selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedDateIso]);

  return (
    <div className="pt-2">
      {/* Header & Legend */}
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-zen-text-secondary">
          Daily Activity Heatmap
        </span>

        <div className="flex items-center space-x-1 text-[10px] text-zen-text-tertiary">
          <span>Less</span>
          {HEATMAP_COLORS.map((c, i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-[3px] border border-black/5 dark:border-white/5"
              style={{ backgroundColor: c }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Horizontal Scrolling Day Cards */}
      <div
        ref={scrollRef}
        className="flex space-x-2 overflow-x-auto pb-2 pt-1 px-1 scrollbar-none"
      >
        {days.map(day => {
          const isSelected = day.dateIso === selectedDateIso;
          const cellColor = getHeatmapColor(day.completionRatio);

          return (
            <button
              key={day.dateIso}
              data-date={day.dateIso}
              onClick={() => onDateSelected(day.dateIso)}
              className={`flex-shrink-0 w-[48px] h-[72px] rounded-2xl flex flex-col items-center justify-center p-1.5 transition-all duration-150 transform active:scale-95 ${
                isSelected
                  ? 'bg-zen-surface-subtle border-2 border-zen-border-selected shadow-sm scale-105'
                  : 'bg-zen-surface border border-zen-border hover:border-zen-border-selected/40'
              }`}
            >
              <span className={`text-[10px] font-semibold uppercase ${
                day.isToday ? 'text-accent-emerald font-bold' : 'text-zen-text-secondary'
              }`}>
                {day.dayOfWeek}
              </span>

              <span className={`text-sm font-bold my-0.5 ${
                isSelected ? 'text-zen-text-primary' : 'text-zen-text-primary/90'
              }`}>
                {day.dayNumber}
              </span>

              {/* Heatmap Activity Pill */}
              <div
                className="w-3.5 h-3.5 rounded-[4px] shadow-xs border border-black/5 dark:border-white/10 mt-0.5"
                style={{ backgroundColor: cellColor }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
