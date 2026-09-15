import React, { useState } from 'react';
import { Plus, Sparkles, Flame, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TimerCard } from '../components/TimerCard';
import { AddTimerModal } from '../components/AddTimerModal';

export const HomeScreen: React.FC = () => {
  const { timers, addTimer } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const runningTimers = timers.filter(t => t.status === 'running');
  const runningCount = runningTimers.length;

  return (
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-4">
      {/* Top Rhythm Banner with Pluralization */}
      <div className="p-4 rounded-3xl bg-zen-surface border border-zen-border flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-zen-forest/10 text-zen-forest flex items-center justify-center">
            {runningCount > 0 ? (
              <Flame className="w-5 h-5 text-zen-forest animate-pulse" />
            ) : (
              <Clock className="w-5 h-5 text-zen-forest" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-bold text-zen-text tracking-tight">
              {runningCount === 0
                ? 'Ready for Focus'
                : runningCount === 1
                ? '1 active focus session'
                : `${runningCount} active focus sessions`}
            </h2>
            <span className="text-xs text-zen-muted">
              {runningCount > 0
                ? 'Stay mindful and protect your flow state'
                : 'Select or create a timer to begin'}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-9 h-9 rounded-2xl bg-zen-forest text-white flex items-center justify-center shadow-sm hover:opacity-90 active:scale-95 transition-all"
          title="Add new timer"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Timers List */}
      <div className="space-y-3.5">
        {timers.map(timer => (
          <TimerCard key={timer.id} timer={timer} />
        ))}

        {timers.length === 0 && (
          <div className="p-8 rounded-3xl bg-zen-surface border border-dashed border-zen-border text-center flex flex-col items-center justify-center">
            <Clock className="w-8 h-8 text-zen-muted/40 mb-2" />
            <h3 className="text-sm font-bold text-zen-text mb-1">No Timers Yet</h3>
            <p className="text-xs text-zen-muted mb-4 max-w-xs">
              Create your first focus timer or tap below to add a classic 25-minute Pomodoro.
            </p>
            <button
              onClick={() => addTimer('Pomodoro Focus', 25, 'Study', '#2D5A43')}
              className="px-4 py-2 rounded-2xl bg-zen-forest text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Add 25m Pomodoro</span>
            </button>
          </div>
        )}
      </div>

      <AddTimerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
