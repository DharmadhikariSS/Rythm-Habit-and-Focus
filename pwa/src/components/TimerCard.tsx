import React from 'react';
import { Play, Pause, RotateCcw, Check, Trash2 } from 'lucide-react';
import { Timer } from '../types';
import { useApp } from '../context/AppContext';

interface TimerCardProps {
  timer: Timer;
}

export const TimerCard: React.FC<TimerCardProps> = ({ timer }) => {
  const { startTimer, pauseTimer, resetTimer, completeTimer, deleteTimer } = useApp();

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hours > 0) {
      return `${hours}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const isRunning = timer.status === 'running';
  const isCompleted = timer.status === 'completed';

  // Calculate circular SVG progress
  const progress = timer.totalSeconds > 0
    ? (timer.totalSeconds - timer.remainingSeconds) / timer.totalSeconds
    : 0;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className={`p-5 rounded-3xl bg-zen-surface border transition-all duration-300 shadow-sm ${
      isRunning
        ? 'border-zen-forest ring-1 ring-zen-forest/20 shadow-zen'
        : 'border-zen-border hover:border-zen-muted/30'
    }`}>
      {/* Top Header: Title, Category & Delete */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: timer.color || '#2D5A43' }}
            />
            <h3 className="font-semibold text-base text-zen-text tracking-tight">{timer.title}</h3>
          </div>
          <span className="text-xs text-zen-muted mt-0.5 inline-block font-medium">
            {timer.category} • {Math.round(timer.totalSeconds / 60)}m
          </span>
        </div>

        <button
          onClick={() => deleteTimer(timer.id)}
          className="p-1.5 text-zen-muted hover:text-red-500 rounded-lg hover:bg-zen-card transition-colors"
          title="Delete timer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Countdown & Progress Dial */}
      <div className="flex flex-col items-center justify-center my-3 relative">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 130 130">
            {/* Background Track */}
            <circle
              cx="65"
              cy="65"
              r={radius}
              className="stroke-zen-card fill-none"
              strokeWidth="8"
            />
            {/* Progress Stroke */}
            <circle
              cx="65"
              cy="65"
              r={radius}
              className="fill-none transition-all duration-500 ease-out"
              stroke={timer.color || 'var(--zen-forest)'}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Center Digital Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold tracking-tighter font-mono text-zen-text">
              {formatTime(timer.remainingSeconds)}
            </span>
            <span className={`text-[11px] font-medium uppercase tracking-wider mt-0.5 ${
              isRunning ? 'text-zen-forest animate-pulse' : isCompleted ? 'text-emerald-500' : 'text-zen-muted'
            }`}>
              {timer.status}
            </span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-center space-x-3 mt-4 pt-3 border-t border-zen-border">
        {/* Reset Button */}
        <button
          onClick={() => resetTimer(timer.id)}
          className="p-2.5 rounded-2xl bg-zen-card hover:bg-zen-border text-zen-muted hover:text-zen-text transition-colors"
          title="Reset timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Primary Play/Pause Button */}
        {isRunning ? (
          <button
            onClick={() => pauseTimer(timer.id)}
            className="px-6 py-2.5 rounded-2xl bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 flex items-center space-x-2 font-medium transition-all"
          >
            <Pause className="w-4 h-4 fill-current" />
            <span className="text-sm">Pause</span>
          </button>
        ) : (
          <button
            onClick={() => startTimer(timer.id)}
            className="px-6 py-2.5 rounded-2xl bg-zen-forest text-white hover:opacity-90 flex items-center space-x-2 font-medium shadow-sm transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span className="text-sm">{timer.remainingSeconds === timer.totalSeconds ? 'Start' : 'Resume'}</span>
          </button>
        )}

        {/* Complete Session Button */}
        <button
          onClick={() => completeTimer(timer.id)}
          disabled={timer.remainingSeconds === timer.totalSeconds}
          className={`p-2.5 rounded-2xl transition-colors ${
            timer.remainingSeconds === timer.totalSeconds
              ? 'opacity-30 cursor-not-allowed bg-zen-card text-zen-muted'
              : 'bg-zen-card hover:bg-emerald-500/20 text-zen-muted hover:text-emerald-600'
          }`}
          title="Complete session"
        >
          <Check className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
