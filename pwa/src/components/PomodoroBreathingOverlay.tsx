import React, { useState, useEffect } from 'react';
import { X, Sparkles, Wind } from 'lucide-react';
import { useRhythmStore } from '../store/useRhythmStore';

export const PomodoroBreathingOverlay: React.FC = () => {
  const { activeBreathingOverlay, closeBreathingOverlay } = useRhythmStore();
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [secondsInPhase, setSecondsInPhase] = useState<number>(4);

  useEffect(() => {
    if (!activeBreathingOverlay) return;

    // 4s Inhale -> 4s Hold -> 4s Exhale box breathing
    const timer = setInterval(() => {
      setSecondsInPhase((prev) => {
        if (prev <= 1) {
          setBreathPhase((current) => {
            if (current === 'Inhale') return 'Hold';
            if (current === 'Hold') return 'Exhale';
            return 'Inhale';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeBreathingOverlay]);

  if (!activeBreathingOverlay) return null;

  const isLong = activeBreathingOverlay.phase === 'LONG_BREAK';

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-zen-bg/95 backdrop-blur-xl animate-fade-in">
      {/* Top Bar */}
      <div className="w-full max-w-md flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: activeBreathingOverlay.subjectColor }}
          />
          <span className="text-xs font-bold uppercase tracking-wider text-zen-muted">
            {activeBreathingOverlay.subjectName} · {isLong ? 'Long Rest' : 'Rest Break'}
          </span>
        </div>

        <button
          onClick={closeBreathingOverlay}
          className="p-2 rounded-xl bg-zen-card text-zen-muted hover:text-zen-text transition-colors"
          title="Dismiss overlay"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center Breathing Circle */}
      <div className="flex flex-col items-center justify-center relative my-auto">
        <div
          className={`w-64 h-64 rounded-full flex flex-col items-center justify-center border-4 border-zen-border/40 shadow-2xl transition-all duration-1000 ${
            breathPhase === 'Inhale'
              ? 'scale-110 border-accent-emerald bg-accent-emerald/10'
              : breathPhase === 'Hold'
              ? 'scale-110 border-accent-ochre bg-accent-ochre/10'
              : 'scale-90 border-accent-ocean bg-accent-ocean/10'
          }`}
        >
          <Wind
            className={`w-10 h-10 mb-2 transition-transform duration-1000 ${
              breathPhase === 'Inhale' ? 'text-accent-emerald -translate-y-1' : 'text-zen-muted'
            }`}
          />
          <span className="text-3xl font-light text-zen-text tracking-tight transition-all">
            {breathPhase}
          </span>
          <span className="text-sm font-semibold text-zen-muted mt-1">
            {secondsInPhase}s
          </span>
        </div>

        <p className="mt-8 text-xs font-medium text-zen-muted text-center max-w-xs leading-relaxed">
          Release muscle tension. Allow your eyes to focus on the distance and let your brain consolidate learned neural connections.
        </p>
      </div>

      {/* Bottom Action */}
      <div className="w-full max-w-md text-center pb-4">
        <button
          onClick={closeBreathingOverlay}
          className="px-6 py-2.5 rounded-2xl bg-zen-card hover:bg-zen-border text-xs font-semibold text-zen-text transition-colors"
        >
          Return to Focus Room
        </button>
      </div>
    </div>
  );
};
