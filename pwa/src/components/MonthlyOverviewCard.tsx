import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRhythmStore } from '../store/useRhythmStore';
import { CompleteMonthCalendarView } from './CompleteMonthCalendarView';
import { ActivityHeatmapStrip } from './ActivityHeatmapStrip';
import { SegmentedProgressBar } from './SegmentedProgressBar';
import { HeatmapDayData } from '../types';

export const MonthlyOverviewCard: React.FC = () => {
  const { selectedDate, setSelectedDate, habits, habitEntries, todayDate } = useRhythmStore();
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  const [viewMonthOffset, setViewMonthOffset] = useState(0);

  // Compute view date based on offset
  const baseDate = new Date();
  baseDate.setMonth(baseDate.getMonth() + viewMonthOffset);
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const monthName = baseDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Compute total days in view month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Completion map for the month
  const completionMap: Record<string, number> = {};
  let totalCompletedInMonth = 0;
  const heatmapDays: HeatmapDayData[] = [];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let d = 1; d <= daysInMonth; d++) {
    const mStr = (month + 1).toString().padStart(2, '0');
    const dStr = d.toString().padStart(2, '0');
    const dateIso = `${year}-${mStr}-${dStr}`;

    const entriesForDay = habitEntries.filter(e => e.dateIso === dateIso && e.isCompleted);
    const activeHabitsCount = Math.max(1, habits.length);
    const ratio = habits.length > 0 ? entriesForDay.length / activeHabitsCount : 0;

    completionMap[dateIso] = ratio;
    totalCompletedInMonth += entriesForDay.length;

    const dayObj = new Date(year, month, d);
    heatmapDays.push({
      dateIso,
      dayNumber: d,
      dayOfWeek: weekdays[dayObj.getDay()],
      completionRatio: ratio,
      isToday: dateIso === todayDate,
    });
  }

  // Monthly progress percentage
  const possibleCompleted = daysInMonth * Math.max(1, habits.length);
  const monthlyProgressPercent = Math.min(100, Math.round((totalCompletedInMonth / possibleCompleted) * 100));

  // Today stats
  const todayEntries = habitEntries.filter(e => e.dateIso === todayDate && e.isCompleted);
  const todayCompleted = todayEntries.length;
  const todayTotal = habits.length;
  const todayRatio = todayTotal > 0 ? todayCompleted / todayTotal : 0;

  // Max streak calculation
  const currentStreak = habits.reduce((max, h) => Math.max(max, h.streakDays), 0);

  return (
    <div className="p-4 rounded-3xl bg-zen-surface border border-zen-border shadow-sm transition-all duration-300">
      {/* 1. Header: Month Title & Arrow Buttons */}
      <div className="flex items-center justify-between">
        <div
          onClick={() => setIsCalendarExpanded(prev => !prev)}
          className="flex items-center space-x-2 cursor-pointer select-none rounded-xl p-1 -m-1 hover:bg-zen-surface-subtle transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-zen-surface-subtle flex items-center justify-center text-sm">
            🌿
          </div>
          <h2 className="text-lg font-bold text-zen-text-primary tracking-tight">
            {monthName}
          </h2>
          <ChevronDown
            className={`w-5 h-5 text-accent-emerald transition-transform duration-300 ${
              isCalendarExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>

        {/* Month Pagination */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setViewMonthOffset(prev => prev - 1)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-zen-text-secondary hover:text-zen-text-primary hover:bg-zen-surface-subtle transition-colors"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMonthOffset(prev => prev + 1)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-zen-text-secondary hover:text-zen-text-primary hover:bg-zen-surface-subtle transition-colors"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Stats Row: Today Radial Donut + Badges Column */}
      <div className="flex items-center space-x-3 mt-3.5">
        {/* Today's Radial Progress Ring (76dp) */}
        <div className="w-[76px] h-[76px] rounded-2xl bg-zen-surface-subtle p-1.5 flex items-center justify-center relative flex-shrink-0">
          <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 60 60">
            {/* Background Track */}
            <circle
              cx="30"
              cy="30"
              r="24"
              className="fill-none stroke-zen-border"
              strokeWidth="5"
            />
            {/* Progress Arc */}
            <circle
              cx="30"
              cy="30"
              r="24"
              className="fill-none transition-all duration-500 ease-out"
              stroke="#437A55"
              strokeWidth="5"
              strokeDasharray={2 * Math.PI * 24}
              strokeDashoffset={(2 * Math.PI * 24) * (1 - todayRatio)}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold text-zen-text-primary">
              {Math.round(todayRatio * 100)}%
            </span>
            <span className="text-[9px] text-zen-text-secondary">
              {todayCompleted}/{todayTotal}
            </span>
          </div>
        </div>

        {/* Right Badges Column */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {/* Total Completed */}
            <div className="p-2 rounded-xl bg-zen-surface-subtle flex flex-col">
              <span className="text-[9px] font-semibold text-zen-text-secondary uppercase tracking-wider truncate">
                Total Completed
              </span>
              <span className="text-lg font-bold text-accent-emerald leading-tight">
                {totalCompletedInMonth}
              </span>
            </div>

            {/* Current Streak */}
            <div className="p-2 rounded-xl bg-zen-surface-subtle flex flex-col">
              <span className="text-[9px] font-semibold text-zen-text-secondary uppercase tracking-wider truncate">
                Current Streak
              </span>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className="text-xs">🔥</span>
                <span className="text-sm font-bold text-accent-terracotta truncate">
                  {currentStreak} Days
                </span>
              </div>
            </div>
          </div>

          {/* Overall Monthly Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-[9px] font-semibold text-zen-text-secondary mb-1">
              <span className="uppercase tracking-wider">Overall Monthly Progress</span>
              <span className="text-accent-emerald font-bold">{monthlyProgressPercent}%</span>
            </div>
            <SegmentedProgressBar
              progressPercent={monthlyProgressPercent}
              fillColor="#437A55"
              segments={10}
              height={7}
              showPercentText={false}
            />
          </div>
        </div>
      </div>

      {/* 3. Divider & Calendar / Heatmap Strip Section */}
      <div className="border-t border-zen-border mt-4 pt-2">
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={() => setIsCalendarExpanded(prev => !prev)}
            className="text-[11px] font-semibold text-accent-emerald hover:underline flex items-center space-x-1"
          >
            <span>{isCalendarExpanded ? '⇥ Show Daily Strip' : '▾ Show Full Month Grid'}</span>
          </button>
        </div>

        {isCalendarExpanded ? (
          <CompleteMonthCalendarView
            currentDate={baseDate}
            selectedDateIso={selectedDate}
            completionMap={completionMap}
            todayIso={todayDate}
            onSelectDate={setSelectedDate}
          />
        ) : (
          <ActivityHeatmapStrip
            days={heatmapDays}
            selectedDateIso={selectedDate}
            onDateSelected={setSelectedDate}
          />
        )}
      </div>
    </div>
  );
};
