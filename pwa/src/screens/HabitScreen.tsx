import React, { useState } from 'react';
import { Plus, Sparkles, Calendar, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MonthlyOverviewCard } from '../components/MonthlyOverviewCard';
import { HabitCard } from '../components/HabitCard';
import { AddHabitModal } from '../components/AddHabitModal';

const STARTER_HABITS = [
  { title: 'Deep Work 45m', type: 'duration' as const, targetMinutes: 45, color: '#2D5A43' },
  { title: 'Morning Reading 20m', type: 'duration' as const, targetMinutes: 20, color: '#52B788' },
  { title: 'Hydration & Stretch', type: 'check' as const, targetMinutes: 0, color: '#74C69D' },
  { title: 'Meditation 10m', type: 'duration' as const, targetMinutes: 10, color: '#40916C' },
];

export const HabitScreen: React.FC = () => {
  const { habits, selectedDate, setSelectedDate, todayDate, addHabit } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isSelectedToday = selectedDate === todayDate;
  const formattedSelectedDate = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-4">
      {/* Monthly Overview Card with 7-Column Dropdown Heatmap */}
      <MonthlyOverviewCard />

      {/* Date Header & Day Navigator Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-zen-forest" />
          <h3 className="font-bold text-sm text-zen-text">
            {isSelectedToday ? "Today's Routines" : `Routines for ${formattedSelectedDate}`}
          </h3>
        </div>

        {!isSelectedToday && (
          <button
            onClick={() => setSelectedDate(todayDate)}
            className="text-xs font-semibold text-zen-forest flex items-center space-x-1 hover:underline"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Jump to Today</span>
          </button>
        )}
      </div>

      {/* Habits List */}
      <div className="space-y-2.5">
        {habits.map(habit => (
          <HabitCard key={habit.id} habit={habit} selectedDate={selectedDate} />
        ))}

        {habits.length === 0 && (
          <div className="p-8 rounded-3xl bg-zen-surface border border-dashed border-zen-border text-center flex flex-col items-center justify-center">
            <Sparkles className="w-8 h-8 text-zen-muted/40 mb-2" />
            <h4 className="text-sm font-bold text-zen-text mb-1">No Habits Tracked</h4>
            <p className="text-xs text-zen-muted mb-4 max-w-xs">
              Add your first personal routine or pick from our curated Nordic starter habits below:
            </p>

            <div className="flex flex-wrap justify-center gap-2 max-w-xs">
              {STARTER_HABITS.map(h => (
                <button
                  key={h.title}
                  onClick={() => addHabit(h.title, h.type, h.targetMinutes, 'Daily', h.color)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-zen-card hover:bg-zen-forest hover:text-white border border-zen-border transition-all"
                >
                  + {h.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Habit FAB / Action Button */}
      <div className="pt-2">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full py-3 rounded-2xl bg-zen-surface hover:bg-zen-card border border-zen-border text-zen-forest font-semibold text-sm flex items-center justify-center space-x-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Routine</span>
        </button>
      </div>

      <AddHabitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
