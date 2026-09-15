import React from 'react';
import { useApp } from '../context/AppContext';

interface CompleteMonthCalendarViewProps {
  currentDate: Date;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CompleteMonthCalendarView: React.FC<CompleteMonthCalendarViewProps> = ({
  currentDate,
  selectedDate,
  onSelectDate,
}) => {
  const { habits, habitLogs, todayDate } = useApp();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month offset
  const firstDay = new Date(year, month, 1);
  const startingDayIndex = firstDay.getDay(); // 0 is Sunday

  // Total days in month
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Helper to format YYYY-MM-DD
  const formatDayString = (day: number) => {
    const m = (month + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  // Compute heatmap color class for a specific day
  const getDayHeatmapStyle = (dayStr: string) => {
    const totalHabits = habits.length;
    if (totalHabits === 0) return 'bg-zen-card text-zen-muted';

    const logsForDay = habitLogs.filter(l => l.date === dayStr && l.completed);
    const ratio = logsForDay.length / totalHabits;

    if (ratio === 0) return 'bg-zen-card/80 text-zen-muted hover:bg-zen-card';
    if (ratio <= 0.25) return 'bg-zen-accent/25 text-zen-text hover:bg-zen-accent/35';
    if (ratio <= 0.5) return 'bg-zen-accent/50 text-white font-medium hover:bg-zen-accent/60';
    if (ratio <= 0.75) return 'bg-zen-accent/80 text-white font-semibold hover:bg-zen-accent/90';
    return 'bg-zen-forest text-white font-bold shadow-sm';
  };

  return (
    <div className="pt-2 animate-fade-in">
      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
        {WEEKDAYS.map(w => (
          <span key={w} className="text-[11px] font-semibold text-zen-muted uppercase tracking-wider">
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
          const dayStr = formatDayString(dayNumber);
          const isToday = dayStr === todayDate;
          const isSelected = dayStr === selectedDate;
          const heatmapClass = getDayHeatmapStyle(dayStr);

          return (
            <button
              key={dayStr}
              onClick={() => onSelectDate(dayStr)}
              className={`h-9 rounded-xl flex items-center justify-center text-xs relative transition-all duration-150 transform active:scale-95 ${heatmapClass} ${
                isSelected
                  ? 'ring-2 ring-zen-forest ring-offset-2 ring-offset-zen-surface scale-105 z-10'
                  : ''
              } ${isToday && !isSelected ? 'border border-zen-forest font-bold' : ''}`}
            >
              <span>{dayNumber}</span>
              {isToday && (
                <span className="absolute bottom-1 w-1 h-1 bg-zen-forest rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Heatmap Legend */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-zen-border text-[11px] text-zen-muted">
        <span>Less consistent</span>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-zen-card border border-zen-border" />
          <span className="w-3 h-3 rounded bg-zen-accent/25" />
          <span className="w-3 h-3 rounded bg-zen-accent/50" />
          <span className="w-3 h-3 rounded bg-zen-accent/80" />
          <span className="w-3 h-3 rounded bg-zen-forest" />
        </div>
        <span>High rhythm</span>
      </div>
    </div>
  );
};
