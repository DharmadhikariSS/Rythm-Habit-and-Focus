import React, { useState } from 'react';
import { Plus, Calendar, RotateCcw } from 'lucide-react';
import { useRhythmStore } from '../store/useRhythmStore';
import { MonthlyOverviewCard } from '../components/MonthlyOverviewCard';
import { HabitCard } from '../components/HabitCard';
import { AddHabitModal } from '../components/AddHabitModal';

const STARTER_HABITS = [
  { name: 'Deep Work 45m', icon: '📚', type: 'TIMED' as const, targetDurationMinutes: 45, targetCount: 0, targetUnit: '', color: '#437A55' },
  { name: 'Morning Reading', icon: '📖', type: 'TIMED' as const, targetDurationMinutes: 20, targetCount: 0, targetUnit: '', color: '#386B80' },
  { name: 'Hydration 8 Cups', icon: '💧', type: 'COUNTER' as const, targetDurationMinutes: 0, targetCount: 8, targetUnit: 'cups', color: '#3A7D99' },
  { name: 'Meditation 15m', icon: '🧘', type: 'TIMED' as const, targetDurationMinutes: 15, targetCount: 0, targetUnit: '', color: '#6B5F8C' },
];

export const HabitScreen: React.FC = () => {
  const { habits, selectedDate, setSelectedDate, todayDate, addHabit } = useRhythmStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isSelectedToday = selectedDate === todayDate;
  const formattedSelectedDate = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="pb-24 pt-4 px-4 max-w-5xl mx-auto space-y-6">
      {/* 1. Monthly Overview Hero Card */}
      <MonthlyOverviewCard />

      {/* 2. Selected Date Header & Return to Today Button */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-1.5">
          <Calendar className="w-4 h-4 text-accent-emerald" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zen-text-secondary">
            {isSelectedToday ? "TODAY'S HABITS" : `HABITS FOR ${formattedSelectedDate}`}
          </h3>
        </div>

        {!isSelectedToday && (
          <button
            onClick={() => setSelectedDate(todayDate)}
            className="text-xs font-bold text-accent-emerald flex items-center space-x-1 hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Jump to Today</span>
          </button>
        )}
      </div>

      {/* 3. Habits List in Responsive 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            selectedDateIso={selectedDate}
          />
        ))}

        {habits.length === 0 && (
          <div className="col-span-full p-8 rounded-3xl bg-zen-surface border border-dashed border-zen-border text-center flex flex-col items-center justify-center">
            <span className="text-3xl mb-2">🌿</span>
            <h4 className="text-sm font-bold text-zen-text-primary mb-1">No habits tracked yet</h4>
            <p className="text-xs text-zen-text-secondary mb-4 max-w-xs">
              Add your first daily routine or pick from our curated starter habits:
            </p>

            <div className="flex flex-wrap justify-center gap-2 max-w-xs">
              {STARTER_HABITS.map((h) => (
                <button
                  key={h.name}
                  onClick={() => addHabit(h)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zen-surface-subtle hover:bg-accent-emerald hover:text-white border border-zen-border transition-all flex items-center space-x-1"
                >
                  <span>{h.icon}</span>
                  <span>{h.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) on mobile */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="lg:hidden fixed right-5 bottom-20 z-20 w-12 h-12 rounded-2xl bg-accent-emerald text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
        title="Add new habit"
      >
        <Plus className="w-6 h-6" />
      </button>

      <AddHabitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
