import React from 'react';
import { Check, Flame, Trash2, Clock } from 'lucide-react';
import { Habit } from '../types';
import { useApp } from '../context/AppContext';

interface HabitCardProps {
  habit: Habit;
  selectedDate: string;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, selectedDate }) => {
  const { habitLogs, toggleHabit, deleteHabit } = useApp();

  const isCompleted = habitLogs.some(
    l => l.habitId === habit.id && l.date === selectedDate && l.completed
  );

  return (
    <div className={`p-4 rounded-3xl bg-zen-surface border transition-all duration-200 flex items-center justify-between shadow-sm ${
      isCompleted
        ? 'border-zen-forest/30 bg-zen-forest/5'
        : 'border-zen-border hover:border-zen-muted/30'
    }`}>
      {/* Left Info */}
      <div className="flex items-center space-x-3.5 flex-1 min-w-0 pr-2">
        {/* Accent Color Bar */}
        <div
          className="w-1.5 h-10 rounded-full flex-shrink-0"
          style={{ backgroundColor: habit.color || '#2D5A43' }}
        />

        <div className="min-w-0">
          <h4 className={`font-semibold text-sm tracking-tight truncate transition-colors ${
            isCompleted ? 'text-zen-muted line-through' : 'text-zen-text'
          }`}>
            {habit.title}
          </h4>

          <div className="flex items-center space-x-2.5 mt-0.5">
            {habit.type === 'duration' ? (
              <span className="text-xs text-zen-muted flex items-center gap-1">
                <Clock className="w-3 h-3 text-zen-accent" /> {habit.targetDurationMinutes}m target
              </span>
            ) : (
              <span className="text-xs text-zen-muted">Check-in</span>
            )}

            {/* Streak Badge */}
            {habit.streakCurrent > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                <Flame className="w-3 h-3 fill-amber-500" /> {habit.streakCurrent}d streak
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Controls: Check button & Delete */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => deleteHabit(habit.id)}
          className="p-1.5 text-zen-muted/50 hover:text-red-500 rounded-lg hover:bg-zen-card transition-colors"
          title="Delete habit"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => toggleHabit(habit.id, selectedDate)}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all transform active:scale-90 ${
            isCompleted
              ? 'bg-zen-forest text-white shadow-sm shadow-zen-forest/30 scale-105'
              : 'border-2 border-zen-border hover:border-zen-forest text-transparent'
          }`}
          title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          <Check className={`w-5 h-5 transition-transform ${isCompleted ? 'scale-100' : 'scale-0'}`} />
        </button>
      </div>
    </div>
  );
};
