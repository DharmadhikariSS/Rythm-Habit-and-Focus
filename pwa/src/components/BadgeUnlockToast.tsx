import React from 'react';
import { Award, X } from 'lucide-react';
import { useRhythmStore } from '../store/useRhythmStore';

export const BadgeUnlockToast: React.FC = () => {
  const { recentUnlockedBadge, dismissBadgeCelebration, setActiveTab } = useRhythmStore();

  if (!recentUnlockedBadge) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm p-6 rounded-3xl bg-zen-surface border border-zen-border shadow-2xl relative text-center flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={dismissBadgeCelebration}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-zen-card text-zen-muted hover:text-zen-text"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Badge Icon Glow */}
        <div className="w-20 h-20 rounded-3xl bg-accent-ochre/15 border-2 border-accent-ochre/30 flex items-center justify-center text-4xl shadow-inner mb-4 animate-bounce">
          {recentUnlockedBadge.icon}
        </div>

        {/* Category / Rarity Tag */}
        <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-accent-ochre/15 text-accent-ochre mb-2">
          {recentUnlockedBadge.rarity} Achievement Unlocked
        </span>

        {/* Title */}
        <h3 className="text-xl font-bold text-zen-text tracking-tight mb-2">
          {recentUnlockedBadge.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-zen-muted leading-relaxed mb-6 max-w-xs">
          {recentUnlockedBadge.description}
        </p>

        {/* Buttons */}
        <div className="w-full flex items-center space-x-2">
          <button
            onClick={dismissBadgeCelebration}
            className="flex-1 py-3 rounded-2xl bg-zen-card hover:bg-zen-border text-xs font-bold text-zen-text transition-colors"
          >
            Keep Going
          </button>
          <button
            onClick={() => {
              dismissBadgeCelebration();
              setActiveTab('analytics');
            }}
            className="flex-1 py-3 rounded-2xl bg-accent-emerald hover:opacity-90 text-xs font-bold text-white transition-opacity flex items-center justify-center space-x-1.5"
          >
            <Award className="w-3.5 h-3.5" />
            <span>View Hall</span>
          </button>
        </div>
      </div>
    </div>
  );
};
