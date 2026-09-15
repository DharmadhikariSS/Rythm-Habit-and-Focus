import React from 'react';
import { Sunrise, Sun, Sunset, Moon } from 'lucide-react';
import { StudySession } from '../types';

interface TimeOfDayChartProps {
  sessions: StudySession[];
}

interface TimeDistribution {
  morning: number;
  afternoon: number;
  evening: number;
  night: number;
}

export const TimeOfDayChart: React.FC<TimeOfDayChartProps> = ({ sessions }) => {
  const dist: TimeDistribution = { morning: 0, afternoon: 0, evening: 0, night: 0 };

  sessions.forEach(s => {
    const hour = new Date(s.completedAt).getHours();
    const durationMinutes = Math.round(s.durationSeconds / 60);
    if (hour >= 5 && hour < 12) dist.morning += durationMinutes;
    else if (hour >= 12 && hour < 17) dist.afternoon += durationMinutes;
    else if (hour >= 17 && hour < 22) dist.evening += durationMinutes;
    else dist.night += durationMinutes;
  });

  const maxMinutes = Math.max(1, dist.morning, dist.afternoon, dist.evening, dist.night);

  const periods = [
    { label: 'Morning', hours: '05:00 - 12:00', minutes: dist.morning, icon: <Sunrise className="w-4 h-4 text-amber-500" /> },
    { label: 'Afternoon', hours: '12:00 - 17:00', minutes: dist.afternoon, icon: <Sun className="w-4 h-4 text-orange-400" /> },
    { label: 'Evening', hours: '17:00 - 22:00', minutes: dist.evening, icon: <Sunset className="w-4 h-4 text-rose-400" /> },
    { label: 'Night', hours: '22:00 - 05:00', minutes: dist.night, icon: <Moon className="w-4 h-4 text-indigo-400" /> },
  ];

  return (
    <div className="space-y-3 pt-2">
      {periods.map(p => {
        const percent = Math.round((p.minutes / maxMinutes) * 100);
        return (
          <div key={p.label} className="flex flex-col space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                {p.icon}
                <span className="font-semibold text-zen-text">{p.label}</span>
                <span className="text-[10px] text-zen-muted">({p.hours})</span>
              </div>
              <span className="font-bold text-zen-text">{p.minutes}m</span>
            </div>

            {/* Bar */}
            <div className="h-2.5 w-full bg-zen-card rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-emerald rounded-full transition-all duration-500"
                style={{ width: `${p.minutes > 0 ? Math.max(5, percent) : 0}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

