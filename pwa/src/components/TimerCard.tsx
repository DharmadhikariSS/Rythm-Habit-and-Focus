import React from 'react';
import { Play, Pause, Square, Trash2 } from 'lucide-react';
import { Subject } from '../types';
import { useApp } from '../context/AppContext';

interface TimerCardProps {
  subject: Subject;
}

export const TimerCard: React.FC<TimerCardProps> = ({ subject }) => {
  const { toggleSubjectTimer, stopAndSaveSubjectTimer, deleteSubject } = useApp();

  const totalSeconds = Math.floor(subject.totalElapsedMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const timeString = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  const isRunning = subject.isRunning;
  const subjectColor = subject.color || '#437A55';

  return (
    <div
      style={{
        backgroundColor: isRunning ? `${subjectColor}12` : 'var(--zen-surface)',
        borderColor: isRunning ? `${subjectColor}99` : 'var(--zen-border)',
      }}
      className={`p-4 rounded-3xl border transition-all duration-200 shadow-xs ${
        isRunning ? 'border-[1.5px]' : 'border'
      }`}
    >
      {/* Top Row: Color Dot + Subject Name + Delete Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div
            className="w-3.5 h-3.5 rounded-full shadow-xs"
            style={{ backgroundColor: subjectColor }}
          />
          <h3 className="text-lg font-bold text-zen-text-primary tracking-tight">
            {subject.name}
          </h3>
          {subject.targetWeeklyHours > 0 && (
            <span className="text-[10px] font-semibold text-zen-text-secondary bg-zen-surface-subtle px-2 py-0.5 rounded-md">
              Goal: {subject.targetWeeklyHours}h/wk
            </span>
          )}
        </div>

        <button
          onClick={() => deleteSubject(subject.id)}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-zen-text-tertiary hover:text-red-500 hover:bg-zen-surface-subtle transition-colors"
          title="Delete subject"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Stopwatch Digital Display (42sp thin-weight font) */}
      <div className="my-3.5 flex justify-center">
        <span
          className="text-4xl font-light tracking-wider font-mono select-none"
          style={{ color: isRunning ? subjectColor : 'var(--zen-text-primary)' }}
        >
          {timeString}
        </span>
      </div>

      {/* Button Row: Primary Start/Pause + Outlined Log & Reset */}
      <div className="flex items-center space-x-2.5 pt-1">
        {/* Primary Toggle Button */}
        <button
          onClick={() => toggleSubjectTimer(subject.id)}
          style={{
            backgroundColor: isRunning ? '#B55D46' : subjectColor, // Terracotta when running
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
