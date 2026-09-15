import React from 'react';
import { Sparkles, TrendingUp, Award, Flame, X } from 'lucide-react';
import { useRhythmStore } from '../store/useRhythmStore';

export const WeeklyReportCard: React.FC = () => {
  const { weeklyReport, dismissWeeklyReport } = useRhythmStore();

  if (!weeklyReport || weeklyReport.isDismissed) return null;

  return (
    <div className="p-5 rounded-3xl bg-zen-surface border border-zen-border shadow-sm relative overflow-hidden transition-all duration-300 mb-6">
      {/* Background Accent Glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-accent-emerald/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-accent-emerald/10 text-accent-emerald flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent-emerald block">
              In-App Weekly Rhythm Report
            </span>
            <span className="text-xs font-semibold text-zen-muted">
              Week of {weeklyReport.weekStartIso}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-accent-ochre/15 text-accent-ochre">
            {weeklyReport.ratingLabel}
          </span>
          <button
            onClick={dismissWeeklyReport}
            className="p-1 rounded-lg text-zen-muted hover:text-zen-text hover:bg-zen-card"
            title="Dismiss for now"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metric Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        <div className="p-3 rounded-2xl bg-zen-card border border-zen-border/40">
          <span className="text-[10px] font-bold text-zen-muted uppercase tracking-wider block">
            Focus Hours
          </span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="text-lg font-extrabold text-zen-text">
              {weeklyReport.focusHours}h
            </span>
            <span className="text-[10px] font-bold text-accent-emerald flex items-center">
              <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
              +{weeklyReport.focusDeltaPercent}%
            </span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-zen-card border border-zen-border/40">
          <span className="text-[10px] font-bold text-zen-muted uppercase tracking-wider block">
            Habit Consistency
          </span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="text-lg font-extrabold text-zen-text">
              {Math.round(weeklyReport.habitRate * 100)}%
            </span>
            <span className="text-[10px] font-bold text-accent-emerald flex items-center">
              <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
              +{weeklyReport.habitDeltaPercent}%
            </span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-zen-card border border-zen-border/40">
          <span className="text-[10px] font-bold text-zen-muted uppercase tracking-wider block">
            Top Subject
          </span>
          <div className="flex items-baseline space-x-1 mt-0.5 truncate">
            <span className="text-sm font-bold text-zen-text truncate">
              {weeklyReport.topSubjectName}
            </span>
            <span className="text-[10px] text-zen-muted">
              ({weeklyReport.topSubjectHours}h)
            </span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-zen-card border border-zen-border/40">
          <span className="text-[10px] font-bold text-zen-muted uppercase tracking-wider block">
            Best Streak
          </span>
          <div className="flex items-center space-x-1 mt-0.5">
            <Flame className="w-3.5 h-3.5 text-accent-terracotta" />
            <span className="text-sm font-bold text-zen-text truncate">
              {weeklyReport.longestStreakDays} days
            </span>
          </div>
        </div>
      </div>

      {/* AI Behavioral Synthesis */}
      <div className="p-3 rounded-2xl bg-accent-emerald/5 border border-accent-emerald/15 flex items-start space-x-2.5">
        <Award className="w-4 h-4 text-accent-emerald mt-0.5 flex-shrink-0" />
        <p className="text-xs text-zen-text leading-relaxed font-medium">
          {weeklyReport.aiSummary}
        </p>
      </div>
    </div>
  );
};
