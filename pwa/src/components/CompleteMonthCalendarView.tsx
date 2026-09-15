import React from 'react';

interface CompleteMonthCalendarViewProps {
  currentDate: Date;
  selectedDateIso: string;
  completionMap: Record<string, number>; // dateIso -> ratio (0.0 to 1.0)
  todayIso: string;
  onSelectDate: (dateIso: string) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const HEATMAP_COLORS = [
  'var(--zen-heatmap-0)',
  '#C3DBC5',
  '#8FB791',
  '#57915B',
  '#2E6B34',
];

const getHeatmapColor = (ratio: number | undefined): string => {
  if (ratio === undefined || ratio <= 0) return HEATMAP_COLORS[0];
  if (ratio <= 0.25) return HEATMAP_COLORS[1];
  if (ratio <= 0.50) return HEATMAP_COLORS[2];
  if (ratio <= 0.75) return HEATMAP_COLORS[3];
  return HEATMAP_COLORS[4];
};

export const CompleteMonthCalendarView: React.FC<CompleteMonthCalendarViewProps> = ({
  currentDate,
  selectedDateIso,
  completionMap,
  todayIso,
  onSelectDate,
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const startingDayIndex = firstDay.getDay(); // 0 is Sun
  const totalDays = new Date(year, month + 1, 0).getDate();

  const formatDayString = (day: number) => {
    const m = (month + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  return (
    <div className="pt-2 animate-fade-in">
      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
        {WEEKDAYS.map(w => (
          <span key={w} className="text-[11px] font-semibold text-zen-text-secondary uppercase tracking-wider">
            {w}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {/* Leading empty cells */}
        {Array.from({ length: startingDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="h-9 rounded-xl opacity-0" />
        ))}

        {/* Days of month */}
        {Array.from({ length: totalDays }).map((_, i) => {
          const dayNumber = i + 1;
          const dayIso = formatDayString(dayNumber);
          const isToday = dayIso === todayIso;
          const isSelected = dayIso === selectedDateIso;
          const ratio = completionMap[dayIso];
          const cellColor = getHeatmapColor(ratio);
          const isDarkShade = (ratio || 0) > 0.5;

          return (
            <button
              key={dayIso}
              onClick={() => onSelectDate(dayIso)}
              style={{ backgroundColor: cellColor }}
              className={`h-9 rounded-xl flex items-center justify-center text-xs relative transition-all duration-150 transform active:scale-95 ${
                isDarkShade ? 'text-white font-bold' : 'text-zen-text-primary font-medium'
              } ${
                isSelected
                  ? 'ring-2 ring-zen-border-selected ring-offset-2 ring-offset-zen-surface scale-105 z-10'
                  : ''
              } ${isToday && !isSelected ? 'border-2 border-accent-emerald font-bold' : ''}`}
            >
              <span>{dayNumber}</span>
              {isToday && (
                <span className="absolute bottom-1 w-1 h-1 bg-accent-emerald rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Heatmap Legend */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-zen-border text-[11px] text-zen-text-secondary">
        <span>Less</span>
        <div className="flex items-center space-x-1">
          {HEATMAP_COLORS.map((c, i) => (
            <span
              key={i}
              className="w-3 h-3 rounded-[3px] border border-black/5 dark:border-white/5"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
};
