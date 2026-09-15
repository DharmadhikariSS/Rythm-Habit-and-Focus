import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useRhythmStore } from '../store/useRhythmStore';
import { TimerCard } from '../components/TimerCard';
import { AddTimerModal } from '../components/AddTimerModal';
import { WeeklyReportCard } from '../components/WeeklyReportCard';
import { DailyScheduleCard } from '../components/DailyScheduleCard';

export const HomeScreen: React.FC = () => {
  const { subjects, addSubject } = useRhythmStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const runningCount = subjects.filter((s) => s.isRunning).length;

  return (
    <div className="pb-24 pt-4 px-4 max-w-5xl mx-auto space-y-6">
      {/* Weekly Rhythm Report Card */}
      <WeeklyReportCard />

      {/* Smart Daily Schedule Card */}
      <DailyScheduleCard />

      {/* Top App Header Subtitle Section */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zen-text-primary tracking-tight">
            Focus & Pomodoro Timers
          </h1>
          <p
            className="text-xs font-medium mt-0.5"
            style={{ color: runningCount > 0 ? '#437A55' : 'var(--zen-text-secondary)' }}
          >
            {runningCount === 0
              ? 'Distraction-free stopwatch & Pomodoro engine'
              : runningCount === 1
              ? '1 active focus session'
              : `${runningCount} active focus sessions`}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-10 h-10 rounded-2xl bg-accent-emerald text-white flex items-center justify-center shadow-xs hover:opacity-90 active:scale-95 transition-all"
          title="Add focus subject"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Subject Stopwatch / Pomodoro Cards Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map((subject) => (
          <TimerCard key={subject.id} subject={subject} />
        ))}

        {subjects.length === 0 && (
          <div className="col-span-full p-8 rounded-3xl bg-zen-surface border border-dashed border-zen-border text-center flex flex-col items-center justify-center">
            <span className="text-3xl mb-2">⏱</span>
            <h3 className="text-sm font-bold text-zen-text-primary mb-1">No focus subjects yet</h3>
            <p className="text-xs text-zen-text-secondary mb-4 max-w-xs">
              Tap + to add a subject or timed habit to begin tracking your deep work.
            </p>
            <button
              onClick={() => addSubject('Study Focus', '#386B80', 10)}
              className="px-4 py-2 rounded-2xl bg-accent-emerald text-white text-xs font-semibold shadow-xs"
            >
              Add "Study Focus" Subject
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) on mobile */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="lg:hidden fixed right-5 bottom-20 z-20 w-12 h-12 rounded-2xl bg-accent-emerald text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
        title="Add focus subject"
      >
        <Plus className="w-6 h-6" />
      </button>

      <AddTimerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
