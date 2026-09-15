import React from 'react';
import { Calendar, Clock, Sparkles } from 'lucide-react';
import { useRhythmStore } from '../store/useRhythmStore';

export const DailyScheduleCard: React.FC = () => {
  const { dailySchedule, todayDate } = useRhythmStore();

  if (!dailySchedule || dailySchedule.length === 0) return null;

  return (
    <div className="p-5 rounded-3xl bg-zen-surface border border-zen-border shadow-sm mb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-accent-ocean/10 text-accent-ocean flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zen-text tracking-tight">
              Smart Daily Schedule
            </h3>
            <span className="text-[11px] text-zen-muted font-medium">
              Calibrated for {todayDate}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1 text-[11px] font-bold text-accent-ocean bg-accent-ocean/10 px-2.5 py-1 rounded-full">
          <Sparkles className="w-3 h-3" />
          <span>Chronotype AI</span>
        </div>
      </div>

      {/* Schedule Blocks */}
      <div className="space-y-2.5">
        {dailySchedule.map((block) => (
          <div
            key={block.id}
            className="p-3.5 rounded-2xl bg-zen-card border border-zen-border/60 flex items-start space-x-3 transition-colors hover:border-zen-border"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 mt-0.5"
              style={{ backgroundColor: `${block.color}15`, color: block.color }}
            >
              {block.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zen-text truncate">{block.title}</h4>
                <div className="flex items-center space-x-1 text-[11px] font-semibold text-zen-muted">
                  <Clock className="w-3 h-3" />
                  <span>
                    {block.startTime} – {block.endTime}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-zen-muted mt-0.5 leading-snug">
                {block.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
