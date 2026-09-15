import React from 'react';
import { Download, Activity, Zap, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AiSpotlightCard } from '../components/AiSpotlightCard';
import { DonutChart } from '../components/DonutChart';
import { TimeOfDayChart } from '../components/TimeOfDayChart';

export const AnalyticsScreen: React.FC = () => {
  const { sessions, habits, habitLogs, insight, exportData, todayDate } = useApp();

  // Calculate metrics
  const todaySessions = sessions.filter(s => s.date === todayDate);
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  const totalSessionsMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  const todayLogs = habitLogs.filter(l => l.date === todayDate && l.completed);
  const habitCompletionRate = habits.length > 0 ? (todayLogs.length / habits.length) : 0;

  // Daily Rhythm Score: (Focus Minutes component up to 50 pts) + (Habits component up to 50 pts)
  const focusScore = Math.min(50, Math.round((todayMinutes / 60) * 50));
  const habitScore = Math.round(habitCompletionRate * 50);
  const dailyRhythmScore = Math.min(100, focusScore + habitScore);

  return (
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-4">
      {/* 3 Metric Badges */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Today Focus */}
        <div className="p-3.5 rounded-3xl bg-zen-surface border border-zen-border shadow-sm flex flex-col items-center text-center">
          <Activity className="w-4 h-4 text-zen-forest mb-1.5" />
          <span className="text-lg font-bold text-zen-text tracking-tight">{todayMinutes}m</span>
          <span className="text-[10px] text-zen-muted uppercase font-semibold">Today Focus</span>
        </div>

        {/* 7-Day Focus */}
        <div className="p-3.5 rounded-3xl bg-zen-surface border border-zen-border shadow-sm flex flex-col items-center text-center">
          <Zap className="w-4 h-4 text-amber-500 mb-1.5" />
          <span className="text-lg font-bold text-zen-text tracking-tight">{totalSessionsMinutes}m</span>
          <span className="text-[10px] text-zen-muted uppercase font-semibold">Past Week</span>
        </div>

        {/* Rhythm Score */}
        <div className="p-3.5 rounded-3xl bg-zen-surface border border-zen-border shadow-sm flex flex-col items-center text-center">
          <Award className="w-4 h-4 text-zen-accent mb-1.5" />
          <span className="text-lg font-bold text-zen-forest tracking-tight">{dailyRhythmScore}</span>
          <span className="text-[10px] text-zen-muted uppercase font-semibold">Rhythm Score</span>
        </div>
      </div>

      {/* Dynamic AI Behavioral Spotlight */}
      <AiSpotlightCard insight={insight} />

      {/* Focus Category Breakdown (Donut Chart) */}
      <div className="p-5 rounded-3xl bg-zen-surface border border-zen-border shadow-sm">
        <h3 className="font-bold text-sm text-zen-text tracking-tight mb-1">
          Focus Categories
        </h3>
        <p className="text-xs text-zen-muted mb-2">Distribution of time across mindful tags</p>
        <DonutChart sessions={sessions} />
      </div>

      {/* Time-of-Day Chronotype Distribution */}
      <div className="p-5 rounded-3xl bg-zen-surface border border-zen-border shadow-sm">
        <h3 className="font-bold text-sm text-zen-text tracking-tight mb-1">
          Time-of-Day Chronotype
        </h3>
        <p className="text-xs text-zen-muted mb-2">When your peak cognitive focus flourishes</p>
        <TimeOfDayChart sessions={sessions} />
      </div>

      {/* CSV Data Export */}
      <div className="pt-2">
        <button
          onClick={exportData}
          className="w-full py-3 rounded-2xl bg-zen-surface hover:bg-zen-card border border-zen-border text-zen-text font-semibold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
        >
          <Download className="w-4 h-4 text-zen-forest" />
          <span>Export All Data (CSV)</span>
        </button>
      </div>
    </div>
  );
};
