import React, { useState } from 'react';
import { Check, Flame, Play, Pause, RotateCcw, Plus, Minus, MoreVertical, Coffee, Trash2 } from 'lucide-react';
import { Habit, HabitEntry } from '../types';
import { useRhythmStore } from '../store/useRhythmStore';

interface HabitCardProps {
  habit: Habit;
  selectedDateIso: string;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, selectedDateIso }) => {
  const {
    habitEntries,
    toggleHabitCheck,
    toggleHabitRestDay,
    incrementHabitCount,
    decrementHabitCount,
    toggleHabitTimer,
    resetHabitTimer,
    activeHabitTimers,
    deleteHabit,
  } = useRhythmStore();

  const [showMenu, setShowMenu] = useState(false);

  const entry: HabitEntry | undefined = habitEntries.find(
    e => e.habitId === habit.id && e.dateIso === selectedDateIso
  );

  const isCompleted = entry?.isCompleted || false;
  const isRestDay = entry?.isRestDay || false;
  const currentCount = entry?.currentCount || 0;
  const loggedDurationSecs = entry?.loggedDurationSeconds || 0;

  // In-card timer state if TIMED
  const timerState = activeHabitTimers[habit.id];
  const isTimerRunning = timerState?.isRunning || false;
  const timerElapsedSeconds = timerState?.elapsedSeconds || 0;
  const totalLoggedMins = Math.floor((loggedDurationSecs + timerElapsedSeconds) / 60);

  const habitColor = habit.color || '#437A55';

  return (
    <div
      style={{
        backgroundColor: isCompleted ? `${habitColor}0D` : 'var(--zen-surface)',
        borderColor: isCompleted ? `${habitColor}99` : 'var(--zen-border)',
      }}
      className={`p-4 rounded-3xl border transition-all duration-200 shadow-xs ${
        isCompleted ? 'border-[1.5px]' : 'border'
      }`}
    >
      <div className="flex items-center space-x-3">
        {/* Circular Glyph Icon (46dp) */}
        <div
          className="w-[46px] h-[46px] rounded-full flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: `${habitColor}26` }}
        >
          {habit.icon || '🌿'}
        </div>

        {/* Title & Dynamic Subtitle Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4
              className={`text-base font-bold tracking-tight truncate ${
                isCompleted ? 'line-through text-zen-text-secondary' : 'text-zen-text-primary'
              }`}
            >
              {habit.name}
            </h4>

            {isRestDay && (
              <span className="text-[10px] font-semibold text-zen-text-secondary bg-zen-surface-subtle px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                <Coffee className="w-3 h-3 text-accent-terracotta" /> Rest Day
              </span>
            )}

            {habit.streakDays > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-accent-terracotta bg-accent-terracotta/10 px-1.5 py-0.5 rounded-md">
                <Flame className="w-3 h-3 fill-current" /> {habit.streakDays}d
              </span>
            )}
          </div>

          {/* Dynamic Subtitle by Habit Type */}
          <div className="text-xs text-zen-text-secondary mt-0.5">
            {habit.type === 'TIMED' && (
              <span>
                Goal: {habit.targetDurationMinutes}m • {totalLoggedMins}m logged{' '}
                {isTimerRunning && <span className="text-accent-emerald font-semibold">• ⏱ Running</span>}
              </span>
            )}
            {habit.type === 'COUNTER' && (
              <span>
                Goal: {habit.targetCount} {habit.targetUnit} • {currentCount} logged
              </span>
            )}
            {habit.type === 'CHECK' && <span>Daily Check-in</span>}
          </div>
        </div>

        {/* Action Controls Column */}
        <div className="flex items-center space-x-1.5 flex-shrink-0">
          {/* Menu Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(prev => !prev)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-zen-text-tertiary hover:text-zen-text-primary hover:bg-zen-surface-subtle transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-9 z-20 w-36 rounded-2xl bg-zen-surface border border-zen-border p-1.5 shadow-lg space-y-1 text-xs animate-fade-in">
                <button
                  onClick={() => {
                    toggleHabitRestDay(habit.id, selectedDateIso);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-zen-surface-subtle text-zen-text-primary flex items-center space-x-1.5"
                >
                  <Coffee className="w-3.5 h-3.5 text-accent-terracotta" />
                  <span>{isRestDay ? 'Clear Rest Day' : 'Mark Rest Day'}</span>
                </button>
                <button
                  onClick={() => {
                    deleteHabit(habit.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-red-500/10 text-red-500 flex items-center space-x-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Habit</span>
                </button>
              </div>
            )}
          </div>

          {/* Primary Check Button */}
          <button
            onClick={() => toggleHabitCheck(habit.id, selectedDateIso)}
            style={{
              backgroundColor: isCompleted ? habitColor : 'transparent',
              borderColor: isCompleted ? habitColor : 'var(--zen-border)',
            }}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all transform active:scale-90 ${
              isCompleted ? 'text-white shadow-xs' : 'hover:border-accent-emerald text-transparent'
            }`}
          >
            <Check className={`w-5 h-5 transition-transform ${isCompleted ? 'scale-100' : 'scale-0'}`} />
          </button>
        </div>
      </div>

      {/* Embedded Controls for TIMED & COUNTER Habits */}
      {habit.type === 'TIMED' && (
        <div className="mt-3 pt-2.5 border-t border-zen-border/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleHabitTimer(habit.id)}
              style={{ backgroundColor: isTimerRunning ? '#B55D46' : habitColor }}
              className="px-3 py-1.5 rounded-xl text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs"
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isTimerRunning ? 'Pause Timer' : 'Start Timer'}</span>
            </button>
            {timerElapsedSeconds > 0 && (
              <button
                onClick={() => resetHabitTimer(habit.id)}
                className="p-1.5 rounded-xl text-zen-text-secondary hover:bg-zen-surface-subtle"
                title="Reset timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <span className="text-xs font-mono font-semibold text-zen-text-primary">
            {Math.floor(timerElapsedSeconds / 60)}m {timerElapsedSeconds % 60}s
          </span>
        </div>
      )}

      {habit.type === 'COUNTER' && (
        <div className="mt-3 pt-2.5 border-t border-zen-border/60 flex items-center justify-between">
          <span className="text-xs font-semibold text-zen-text-secondary">
            Log {habit.targetUnit || 'units'}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => decrementHabitCount(habit.id, selectedDateIso)}
              className="w-7 h-7 rounded-lg bg-zen-surface-subtle hover:bg-zen-border flex items-center justify-center text-zen-text-primary transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-bold font-mono text-zen-text-primary">
              {currentCount}
            </span>
            <button
              onClick={() => incrementHabitCount(habit.id, selectedDateIso)}
              style={{ backgroundColor: habitColor }}
              className="w-7 h-7 rounded-lg text-white flex items-center justify-center shadow-xs transition-opacity hover:opacity-90"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
