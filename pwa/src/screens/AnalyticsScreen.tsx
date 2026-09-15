import React from 'react';
import { Download, Clock, Calendar, Flame, Sunrise, Sun, Sunset, Moon, Sparkles } from 'lucide-react';
import { useRhythmStore } from '../store/useRhythmStore';
import { DonutChart, DonutSliceData } from '../components/DonutChart';
import { SegmentedProgressBar } from '../components/SegmentedProgressBar';
import { AiSpotlightCard } from '../components/AiSpotlightCard';
import { AnalyticsLens, Timeframe } from '../types';
import { ALL_BADGES } from '../data/badges';
import { storage } from '../services/storage';

export const AnalyticsScreen: React.FC = () => {
  const {
    subjects,
    habits,
    habitEntries,
    sessions,
    activeLens,
    setActiveLens,
    timeframe,
    setTimeframe,
    insight,
    refreshAiInsight,
    badges,
    todayDate,
  } = useRhythmStore();

  const exportData = () => storage.exportCSV(habits, habitEntries, subjects, sessions);

  // Filter sessions by timeframe
  const filteredSessions = sessions.filter(s => {
    if (timeframe === 'TODAY') return s.dateIso === todayDate;
    if (timeframe === 'WEEK') {
      const diff = (Date.now() - s.completedAt) / 86400000;
      return diff <= 7;
    }
    if (timeframe === 'MONTH') {
      const diff = (Date.now() - s.completedAt) / 86400000;
      return diff <= 30;
    }
    return true;
  });

  const totalTimeSecs = filteredSessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalHours = Math.floor(totalTimeSecs / 3600);
  const totalMinutes = Math.floor((totalTimeSecs % 3600) / 60);

  // Actions done today
  const todayEntries = habitEntries.filter(e => e.dateIso === todayDate && e.isCompleted);
  const actionsCompleted = todayEntries.length;

  // Daily rhythm score calculation (0 - 100)
  const focusPoints = Math.min(50, Math.round((totalTimeSecs / (4 * 3600)) * 50));
  const habitPoints = habits.length > 0 ? Math.round((actionsCompleted / habits.length) * 50) : 0;
  const rhythmScore = Math.min(100, focusPoints + habitPoints);

  // Subject Stats for Comparison Bar Chart
  const subjectStatsMap: Record<string, { subjectName: string; color: string; durationSecs: number }> = {};
  subjects.forEach(s => {
    subjectStatsMap[s.id] = { subjectName: s.name, color: s.color, durationSecs: 0 };
  });
  filteredSessions.forEach(s => {
    if (subjectStatsMap[s.subjectId]) {
      subjectStatsMap[s.subjectId].durationSecs += s.durationSeconds;
    } else {
      subjectStatsMap[s.subjectId] = { subjectName: s.subjectName, color: s.subjectColor, durationSecs: s.durationSeconds };
    }
  });

  const subjectStatsList = Object.values(subjectStatsMap);
  const maxSecs = subjectStatsList.reduce((max, s) => Math.max(max, s.durationSecs), 1);

  // Donut Slices
  const donutSlices: DonutSliceData[] = subjectStatsList
    .filter(s => s.durationSecs > 0)
    .map(s => ({
      label: s.subjectName,
      value: Math.round(s.durationSecs / 60),
      color: s.color,
      percentage: totalTimeSecs > 0 ? Math.round((s.durationSecs / totalTimeSecs) * 100) : 0,
    }));

  // Time of day distribution
  const timeDist = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  filteredSessions.forEach(s => {
    const hour = new Date(s.completedAt).getHours();
    const mins = Math.round(s.durationSeconds / 60);
    if (hour >= 5 && hour < 12) timeDist.morning += mins;
    else if (hour >= 12 && hour < 17) timeDist.afternoon += mins;
    else if (hour >= 17 && hour < 22) timeDist.evening += mins;
    else timeDist.night += mins;
  });
  const maxTimeDist = Math.max(1, timeDist.morning, timeDist.afternoon, timeDist.evening, timeDist.night);

  // Habit Leaderboard
  const habitStats = habits.map(h => {
    const entries = habitEntries.filter(e => e.habitId === h.id);
    const completedCount = entries.filter(e => e.isCompleted).length;
    const rate = entries.length > 0 ? Math.round((completedCount / entries.length) * 100) : 0;
    return { habit: h, completedCount, rate };
  }).sort((a, b) => b.rate - a.rate);

  return (
    <div className="pb-24 pt-4 px-4 max-w-5xl mx-auto space-y-6">
      {/* Top Bar with Export CSV */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl font-bold text-zen-text-primary tracking-tight">
            Productivity Insights
          </h1>
          <p className="text-xs text-zen-text-secondary mt-0.5">
            Multi-subject focus & habit intelligence
          </p>
        </div>

        <button
          onClick={exportData}
          className="px-3 py-1.5 rounded-xl border border-zen-border text-xs font-bold text-accent-emerald hover:bg-zen-surface-subtle flex items-center space-x-1.5 transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* 1. Executive Hero Card: Daily Rhythm Score & Total Metrics */}
      <div className="p-4 rounded-3xl bg-zen-surface border border-zen-border shadow-sm flex items-center space-x-3.5">
        {/* Golden Rhythm Radial Donut (72dp) */}
        <div className="w-[72px] h-[72px] rounded-2xl bg-zen-surface-subtle p-1 flex items-center justify-center relative flex-shrink-0">
          <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="23" className="fill-none stroke-zen-border" strokeWidth="5" />
            <circle
              cx="30"
              cy="30"
              r="23"
              className="fill-none transition-all duration-500 ease-out"
              stroke="#A67B34" // AccentOchre
              strokeWidth="5"
              strokeDasharray={2 * Math.PI * 23}
              strokeDashoffset={(2 * Math.PI * 23) * (1 - rhythmScore / 100)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-sm font-bold text-zen-text-primary">{rhythmScore}</span>
            <span className="text-[9px] text-zen-text-secondary">Score</span>
          </div>
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold text-accent-ochre uppercase tracking-wider block">
            Daily Rhythm Index
          </span>
          <h3 className="text-sm font-bold text-zen-text-primary truncate">
            {rhythmScore >= 80 ? '✦ Optimal Flow State' : rhythmScore >= 50 ? '✦ Steady Momentum' : '✦ Building Rhythm'}
          </h3>
          <div className="flex items-center space-x-4 mt-2">
            <div>
              <span className="text-[9px] font-semibold text-zen-text-secondary uppercase block">Focused Time</span>
              <span className="text-xs font-bold text-accent-emerald">{totalHours}h {totalMinutes}m</span>
            </div>
            <div>
              <span className="text-[9px] font-semibold text-zen-text-secondary uppercase block">Actions Done</span>
              <span className="text-xs font-bold text-accent-ocean">{actionsCompleted} Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Dual-Lens Segmented Switcher */}
      <div className="p-1 rounded-2xl bg-zen-surface-subtle grid grid-cols-2 gap-1 border border-zen-border/40">
        <button
          onClick={() => setActiveLens('SUBJECTS')}
          className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
            activeLens === 'SUBJECTS'
              ? 'bg-zen-surface text-zen-text-primary shadow-xs'
              : 'text-zen-text-secondary hover:text-zen-text-primary'
          }`}
        >
          <span>⏱</span>
          <span>Subject Timers</span>
        </button>

        <button
          onClick={() => setActiveLens('HABITS')}
          className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
            activeLens === 'HABITS'
              ? 'bg-zen-surface text-zen-text-primary shadow-xs'
              : 'text-zen-text-secondary hover:text-zen-text-primary'
          }`}
        >
          <span>🌿</span>
          <span>Habit Consistency</span>
        </button>
      </div>

      {/* ==========================================
          LENS 1: MULTI-SUBJECT TIMER INSIGHTS
         ========================================== */}
      {activeLens === 'SUBJECTS' && (
        <div className="space-y-4 animate-fade-in">
          {/* Timeframe Tabs */}
          <div className="grid grid-cols-4 gap-1.5">
            {(['TODAY', 'WEEK', 'MONTH', 'ALL'] as Timeframe[]).map(tf => {
              const isSelected = timeframe === tf;
              const label = tf === 'TODAY' ? 'Today' : tf === 'WEEK' ? 'Week' : tf === 'MONTH' ? 'Month' : 'All';
              return (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  style={{
                    backgroundColor: isSelected ? '#437A55' : 'var(--zen-surface-subtle)',
                    color: isSelected ? '#FFFFFF' : 'var(--zen-text-secondary)',
                  }}
                  className="py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs"
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Multi-Subject Focus Comparison Bar Chart */}
          <div className="p-4 rounded-3xl bg-zen-surface border border-zen-border shadow-sm">
            <span className="text-[11px] font-bold text-zen-text-secondary uppercase tracking-wider block mb-3">
              Multi-Subject Focus Comparison
            </span>

            {totalTimeSecs === 0 ? (
              <div className="py-8 text-center text-xs text-zen-text-secondary">
                No sessions recorded for this timeframe
              </div>
            ) : (
              <div className="flex items-end justify-around h-36 pt-4 px-2 space-x-3 overflow-x-auto">
                {subjectStatsList.map(s => {
                  const heightPercent = Math.max(8, Math.round((s.durationSecs / maxSecs) * 100));
                  const mins = Math.round(s.durationSecs / 60);

                  return (
                    <div key={s.subjectName} className="flex-1 flex flex-col items-center h-full justify-end min-w-[48px]">
                      <span className="text-[10px] font-bold text-zen-text-secondary font-mono mb-1">
                        {mins}m
                      </span>
                      <div
                        className="w-8 rounded-xl transition-all duration-500 shadow-xs"
                        style={{
                          height: `${heightPercent}%`,
                          backgroundColor: s.color,
                        }}
                      />
                      <span className="text-xs font-semibold text-zen-text-primary mt-2 truncate max-w-[54px]">
                        {s.subjectName}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Focus Distribution Donut */}
          <div className="p-4 rounded-3xl bg-zen-surface border border-zen-border shadow-sm">
            <span className="text-[11px] font-bold text-zen-text-secondary uppercase tracking-wider block mb-1">
              Focus Categories
            </span>
            <DonutChart
              slices={donutSlices}
              totalText={`${totalHours}h ${totalMinutes}m`}
            />
          </div>

          {/* Subject Target Progress Bars */}
          <div className="p-4 rounded-3xl bg-zen-surface border border-zen-border shadow-sm space-y-3">
            <span className="text-[11px] font-bold text-zen-text-secondary uppercase tracking-wider block">
              Weekly Target Progress
            </span>
            {subjects.map(s => {
              const loggedHours = ((subjectStatsMap[s.id]?.durationSecs || 0) / 3600);
              const target = s.targetWeeklyHours || 5;
              const percent = Math.min(100, Math.round((loggedHours / target) * 100));

              return (
                <div key={s.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-zen-text-primary">{s.name}</span>
                    <span className="text-zen-text-secondary font-mono">
                      {loggedHours.toFixed(1)}h / {target}h ({percent}%)
                    </span>
                  </div>
                  <SegmentedProgressBar
                    progressPercent={percent}
                    fillColor={s.color}
                    segments={10}
                    height={7}
                    showPercentText={false}
                  />
                </div>
              );
            })}
          </div>

          {/* Time-of-Day Chronotype Distribution */}
          <div className="p-4 rounded-3xl bg-zen-surface border border-zen-border shadow-sm space-y-3">
            <span className="text-[11px] font-bold text-zen-text-secondary uppercase tracking-wider block">
              Time-of-Day Chronotype
            </span>
            {[
              { label: 'Morning', hours: '05:00 - 12:00', mins: timeDist.morning, icon: <Sunrise className="w-4 h-4 text-amber-500" /> },
              { label: 'Afternoon', hours: '12:00 - 17:00', mins: timeDist.afternoon, icon: <Sun className="w-4 h-4 text-orange-400" /> },
              { label: 'Evening', hours: '17:00 - 22:00', mins: timeDist.evening, icon: <Sunset className="w-4 h-4 text-rose-400" /> },
              { label: 'Night', hours: '22:00 - 05:00', mins: timeDist.night, icon: <Moon className="w-4 h-4 text-indigo-400" /> },
            ].map(p => (
              <div key={p.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5">
                    {p.icon}
                    <span className="font-semibold text-zen-text-primary">{p.label}</span>
                    <span className="text-[10px] text-zen-text-secondary">({p.hours})</span>
                  </div>
                  <span className="font-bold text-zen-text-primary font-mono">{p.mins}m</span>
                </div>
                <div className="h-2 rounded-full bg-zen-surface-subtle overflow-hidden">
                  <div
                    className="h-full bg-accent-emerald rounded-full transition-all duration-500"
                    style={{ width: `${p.mins > 0 ? Math.max(5, (p.mins / maxTimeDist) * 100) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Recent Sessions List */}
          <div className="p-4 rounded-3xl bg-zen-surface border border-zen-border shadow-sm space-y-2.5">
            <span className="text-[11px] font-bold text-zen-text-secondary uppercase tracking-wider block mb-1">
              Recent Focus Sessions
            </span>
            {filteredSessions.slice(0, 4).map(s => (
              <div key={s.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-zen-surface-subtle">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.subjectColor }} />
                  <span className="font-bold text-zen-text-primary">{s.subjectName}</span>
                </div>
                <span className="font-mono font-semibold text-zen-text-secondary">
                  {Math.round(s.durationSeconds / 60)}m • {s.dateIso}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================
          LENS 2: HABIT CONSISTENCY INSIGHTS
         ========================================== */}
      {activeLens === 'HABITS' && (
        <div className="space-y-4 animate-fade-in">
          {/* Executive Stats Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-2xl bg-zen-surface border border-zen-border text-center shadow-xs">
              <span className="text-[9px] font-semibold text-zen-text-secondary uppercase block">Habits Done</span>
              <span className="text-lg font-bold text-accent-emerald">{actionsCompleted}</span>
            </div>
            <div className="p-3 rounded-2xl bg-zen-surface border border-zen-border text-center shadow-xs">
              <span className="text-[9px] font-semibold text-zen-text-secondary uppercase block">Active Routines</span>
              <span className="text-lg font-bold text-accent-ocean">{habits.length}</span>
            </div>
            <div className="p-3 rounded-2xl bg-zen-surface border border-zen-border text-center shadow-xs">
              <span className="text-[9px] font-semibold text-zen-text-secondary uppercase block">Best Streak</span>
              <span className="text-lg font-bold text-accent-terracotta">
                {habits.reduce((max, h) => Math.max(max, h.streakDays), 0)}d
              </span>
            </div>
          </div>

          {/* Habit Leaderboard */}
          <div className="p-4 rounded-3xl bg-zen-surface border border-zen-border shadow-sm space-y-3">
            <span className="text-[11px] font-bold text-zen-text-secondary uppercase tracking-wider block">
              Habit Consistency Leaderboard
            </span>

            {habitStats.map((item, index) => (
              <div key={item.habit.id} className="space-y-1.5 pb-2 border-b border-zen-border/40 last:border-none">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-zen-text-secondary">#{index + 1}</span>
                    <span className="text-base">{item.habit.icon}</span>
                    <span className="font-bold text-zen-text-primary">{item.habit.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center text-[10px] font-bold text-accent-terracotta">
                      <Flame className="w-3 h-3 fill-current" /> {item.habit.streakDays}d
                    </span>
                    <span className="font-mono font-bold text-accent-emerald">{item.rate}%</span>
                  </div>
                </div>

                <SegmentedProgressBar
                  progressPercent={item.rate}
                  fillColor={item.habit.color}
                  segments={10}
                  height={6}
                  showPercentText={false}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Dynamic On-Device AI Behavioral Intelligence Spotlight */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-zen-muted uppercase tracking-wider">
            Gemini 2.0 Flash Dynamic Intelligence
          </span>
          <button
            onClick={refreshAiInsight}
            className="text-xs font-bold text-accent-emerald flex items-center space-x-1 hover:underline"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Regenerate Insight</span>
          </button>
        </div>
        <AiSpotlightCard insight={insight} />
      </div>

      {/* 4. Milestones & Achievement Badges Hall */}
      <div className="p-5 rounded-3xl bg-zen-surface border border-zen-border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🏆</span>
            <div>
              <h3 className="text-sm font-bold text-zen-text tracking-tight">
                Achievement & Milestones Hall
              </h3>
              <span className="text-[10px] text-zen-muted font-medium">
                {badges.length} of {ALL_BADGES.length} Badges Unlocked
              </span>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-accent-ochre/15 text-accent-ochre">
            Lifetime Honors
          </span>
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {ALL_BADGES.map((b) => {
            const isUnlocked = badges.some((record) => record.badgeId === b.id);
            return (
              <div
                key={b.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center text-center justify-between ${
                  isUnlocked
                    ? 'bg-zen-card border-accent-ochre/40 shadow-xs'
                    : 'bg-zen-surface/40 border-zen-border/40 opacity-45'
                }`}
              >
                <div className="text-2xl mb-1.5">{b.icon}</div>
                <div>
                  <h4 className="text-xs font-bold text-zen-text leading-snug truncate w-full">
                    {b.title}
                  </h4>
                  <p className="text-[10px] text-zen-muted leading-tight mt-1 line-clamp-2">
                    {b.description}
                  </p>
                </div>
                <span
                  className={`mt-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    isUnlocked
                      ? 'bg-accent-emerald/15 text-accent-emerald'
                      : 'bg-zen-border text-zen-muted'
                  }`}
                >
                  {isUnlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
