import React from 'react';
import { Sparkles, Lightbulb, ShieldCheck } from 'lucide-react';
import { BehavioralInsight } from '../types';

interface AiSpotlightCardProps {
  insight: BehavioralInsight;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  PEAK_PERFORMANCE: { label: 'Peak Flow', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  MOMENTUM: { label: 'Compounding Streak', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  CONSISTENCY: { label: 'Steady Rhythm', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  HABIT_ALIGNMENT: { label: 'Chronotype Synergy', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  EARLY_EXPLORATION: { label: 'On-Device AI Engine', color: 'bg-zen-forest/10 text-zen-forest' },
};

export const AiSpotlightCard: React.FC<AiSpotlightCardProps> = ({ insight }) => {
  const meta = CATEGORY_LABELS[insight.category] || CATEGORY_LABELS.EARLY_EXPLORATION;

  return (
    <div className="p-5 rounded-3xl bg-zen-surface border border-zen-border shadow-sm relative overflow-hidden transition-all duration-300">
      {/* Background Accent Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-zen-forest/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Badges */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-zen-forest/10 text-zen-forest flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${meta.color}`}>
            {meta.label}
          </span>
        </div>

        <div className="flex items-center space-x-1 text-[11px] text-zen-muted font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-zen-accent" />
          <span>{insight.confidence}% confidence</span>
        </div>
      </div>

      {/* Headline */}
      <h3 className="text-base font-bold text-zen-text tracking-tight mb-2">
        {insight.headline}
      </h3>

      {/* Analysis Body */}
      <p className="text-xs text-zen-muted leading-relaxed mb-4">
        {insight.analysis}
      </p>

      {/* Actionable Tip Box */}
      <div className="p-3.5 rounded-2xl bg-zen-card border border-zen-border/60 flex items-start space-x-3">
        <div className="p-1 rounded-lg bg-amber-500/10 text-amber-500 mt-0.5 flex-shrink-0">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="block text-[11px] font-bold text-zen-text uppercase tracking-wider mb-0.5">
            Suggested Action
          </span>
          <p className="text-xs text-zen-muted leading-snug">
            {insight.actionableTip}
          </p>
        </div>
      </div>
    </div>
  );
};
