import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CompleteMonthCalendarView } from './CompleteMonthCalendarView';

export const MonthlyOverviewCard: React.FC = () => {
  const { selectedDate, setSelectedDate, habits, habitLogs, todayDate } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  const activeDate = new Date(selectedDate);
  const monthName = activeDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Calculate month completion percentage
  const currentYear = activeDate.getFullYear();
  const currentMonth = activeDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  let completedTotal = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const m = (currentMonth + 1).toString().padStart(2, '0');
    const dayStr = `${currentYear}-${m}-${d.toString().padStart(2, '0')}`;
    completedTotal += habitLogs.filter(l => l.date === dayStr && l.completed).length;
  }
  const possibleTotal = daysInMonth * Math.max(1, habits.length);
  const monthCompletionPercent = Math.min(100, Math.round((completedTotal / possibleTotal) * 100));

  // Compute 7 days surrounding selected date for compact strip
  const getWeekDays = () => {
    const list = [];
    const center = new Date(selectedDate);
    for (let i = -3; i <= 3; i++) {
      const d = new Date(center);
      d.setDate(center.getDate() + i);
      const str = d.toISOString().split('T')[0];
      list.push({
        dateStr: str,
        dayNumber: d.getDate(),
        weekday: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        isToday: str === todayDate,
        isSelected: str === selectedDate,
      });
    }
    return list;
  };

  const weekDays = getWeekDays();

  return (
    <div className="p-5 rounded-3xl bg-zen-surface border border-zen-border shadow-sm transition-all duration-300">
      {/* Header with Title & Dropdown Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-zen-forest/10 text-zen-forest flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-zen-text tracking-tight">{monthName}</h3>
            <span className="text-xs text-zen-muted font-medium">
              {monthCompletionPercent}% Month Consistency
            </span>
          </div>
        </div>

        {/* Dropdown Action Switcher */}
        <button
          onClick={() => setIsExpanded(prev => !prev)}
          className="px-3 py-1.5 rounded-xl bg-zen-card hover:bg-zen-border text-xs font-semibold text-zen-forest flex items-center space-x-1.5 border border-zen-border transition-all"
        >
          <span>{isExpanded ? 'Week Strip' : 'Full Month'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Accordion Body */}
      {isExpanded ? (
        <div className="mt-3">
          <CompleteMonthCalendarView
            currentDate={activeDate}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>
      ) : (
        /* Compact 7-Day Strip */
        <div className="mt-4 pt-3 border-t border-zen-border">
          <div className="flex items-center justify-between gap-1.5">
            {weekDays.map(item => {
              const logsForDay = habitLogs.filter(l => l.date === item.dateStr && l.completed);
              const isChecked = logsForDay.length > 0;

              return (
                <button
                  key={item.dateStr}
                  onClick={() => setSelectedDate(item.dateStr)}
                  className={`flex-1 py-2 rounded-2xl flex flex-col items-center transition-all ${
                    item.isSelected
                      ? 'bg-zen-forest text-white shadow-sm'
                      : 'bg-zen-card hover:bg-zen-border text-zen-muted'
                  }`}
                >
                  <span className="text-[10px] font-semibold uppercase">{item.weekday}</span>
                  <span className={`text-xs font-bold mt-0.5 ${item.isSelected ? 'text-white' : 'text-zen-text'}`}>
                    {item.dayNumber}
                  </span>
                  <span className={`w-1.5 h-1.5 rounded-full mt-1 ${
                    isChecked ? (item.isSelected ? 'bg-white' : 'bg-zen-accent') : 'bg-transparent'
                  }`} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
