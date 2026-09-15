import React from 'react';
import { Play, Pause, Square, Trash2, Clock } from 'lucide-react';
import { Subject } from '../types';
import { useRhythmStore } from '../store/useRhythmStore';

interface TimerCardProps {
  subject: Subject;
}

export const TimerCard: React.FC<TimerCardProps> = ({ subject }) => {
  const {
    toggleSubjectTimer,
    stopAndSaveSubjectTimer,
    deleteSubject,
    togglePomodoroForSubject,
    pomodoroStates,
  } = useRhythmStore();

  const pomo = pomodoroStates[subject.id];
  const isPomoActive = Boolean(pomo?.isActive);

  // Time calculation
  const totalSeconds = Math.floor(subject.totalElapsedMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const stopwatchString = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  // Pomodoro remaining string if active
  const pomoRemaining = pomo ? pomo.remainingSeconds : 1500;
  const pomoMins = Math.floor(pomoRemaining / 60);
  const pomoSecs = pomoRemaining % 60;
  const pomodoroString = `${pad(pomoMins)}:${pad(pomoSecs)}`;

  const isRunning = subject.isRunning;
  const subjectColor = subject.color || '#437A55';

  return (
    <div
      style={{
        backgroundColor: isRunning ? `${subjectColor}12` : 'var(--zen-surface)',
        borderColor: isRunning ? `${subjectColor}99` : 'var(--zen-border)',
      }}
      className={`p-5 rounded-3xl border transition-all duration-200 shadow-xs ${
        isRunning ? 'border-[1.5px]' : 'border'
      }`}
    >
      {/* Top Row: Color Dot + Subject Name + Pomodoro Toggle + Delete */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div
            className="w-3.5 h-3.5 rounded-full shadow-xs"
            style={{ backgroundColor: subjectColor }}
          />
          <h3 className="text-base font-bold text-zen-text-primary tracking-tight">
            {subject.name}
          </h3>
          {subject.targetWeeklyHours > 0 && (
            <span className="text-[10px] font-semibold text-zen-text-secondary bg-zen-surface-subtle px-2 py-0.5 rounded-md">
              {subject.targetWeeklyHours}h/wk
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1.5">
          {/* Pomodoro Overlay Mode Toggle */}
          <button
            onClick={() => togglePomodoroForSubject(subject.id)}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all ${
              isPomoActive
                ? 'bg-accent-terracotta text-white shadow-xs'
                : 'bg-zen-card hover:bg-zen-border text-zen-muted hover:text-zen-text'
            }`}
            title="Toggle Pomodoro Overlay Mode"
          >
            <span>🍅</span>
            <span className="text-[11px]">{isPomoActive ? 'Pomo On' : 'Pomo'}</span>
          </button>

          <button
            onClick={() => deleteSubject(subject.id)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-zen-text-tertiary hover:text-red-500 hover:bg-zen-surface-subtle transition-colors"
            title="Delete subject"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timer Display */}
      <div className="my-4 flex flex-col items-center justify-center">
        <span
          className="text-4xl font-light tracking-wider font-mono select-none"
          style={{ color: isRunning ? subjectColor : 'var(--zen-text-primary)' }}
        >
          {isPomoActive ? pomodoroString : stopwatchString}
        </span>

        {isPomoActive && (
          <div className="flex items-center space-x-2 mt-1.5">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                pomo?.phase === 'WORK'
                  ? 'bg-accent-terracotta/15 text-accent-terracotta'
                  : 'bg-accent-emerald/15 text-accent-emerald'
              }`}
            >
              {pomo?.phase === 'WORK' ? 'Focus Work Block' : 'Restorative Break'}
            </span>
            {pomo && pomo.cyclesCompleted > 0 && (
              <span className="text-[11px] font-bold text-zen-muted flex items-center space-x-0.5">
                <span>🍅 × {pomo.cyclesCompleted}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Button Row: Primary Start/Pause + Outlined Log & Reset */}
      <div className="flex items-center space-x-2.5 pt-1">
        {/* Primary Toggle Button */}
        <button
          onClick={() => toggleSubjectTimer(subject.id)}
          style={{
            backgroundColor: isRunning ? '#B55D46' : subjectColor,
          }}
          className="flex-1 py-2.5 px-4 rounded-xl text-white font-semibold text-sm flex items-center justify-center space-x-1.5 shadow-xs hover:opacity-95 active:scale-98 transition-all"
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>{subject.totalElapsedMs > 0 ? 'Resume' : 'Start Focus'}</span>
            </>
          )}
        </button>

        {/* Secondary Log & Reset Button */}
        {subject.totalElapsedMs > 0 && (
          <button
            onClick={() => stopAndSaveSubjectTimer(subject.id)}
            className="py-2.5 px-3.5 rounded-xl border border-red-500/50 text-red-500 hover:bg-red-500/10 font-semibold text-xs flex items-center space-x-1 transition-colors"
            title="Log session and reset"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Log & Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
