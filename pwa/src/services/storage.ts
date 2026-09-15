import { Timer, Habit, HabitLog, SessionRecord, ThemeMode } from '../types';

const STORAGE_KEYS = {
  TIMERS: 'rhythm_timers_v1',
  HABITS: 'rhythm_habits_v1',
  HABIT_LOGS: 'rhythm_habit_logs_v1',
  SESSIONS: 'rhythm_sessions_v1',
  THEME: 'rhythm_theme_v1',
};

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const getDaysAgo = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return formatDate(d);
};

// Default starter timers matching Kotlin v1.5.0
const DEFAULT_TIMERS: Timer[] = [
  {
    id: 'timer-pomodoro',
    title: 'Pomodoro Focus',
    totalSeconds: 25 * 60,
    remainingSeconds: 25 * 60,
    status: 'idle',
    category: 'Study',
    color: '#2D5A43',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'timer-deepwork',
    title: 'Deep Work Session',
    totalSeconds: 45 * 60,
    remainingSeconds: 45 * 60,
    status: 'idle',
    category: 'Code',
    color: '#52B788',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'timer-break',
    title: 'Mindful Rest',
    totalSeconds: 5 * 60,
    remainingSeconds: 5 * 60,
    status: 'idle',
    category: 'Break',
    color: '#74C69D',
    createdAt: Date.now() - 86400000 * 1,
  },
];

// Default starter habits matching Kotlin v1.5.0
const DEFAULT_HABITS: Habit[] = [
  {
    id: 'habit-deepwork',
    title: 'Deep Work 45m',
    type: 'duration',
    targetDurationMinutes: 45,
    frequency: 'Daily',
    color: '#2D5A43',
    streakCurrent: 4,
    streakBest: 9,
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: 'habit-reading',
    title: 'Morning Reading',
    type: 'duration',
    targetDurationMinutes: 20,
    frequency: 'Daily',
    color: '#52B788',
    streakCurrent: 6,
    streakBest: 12,
    createdAt: Date.now() - 86400000 * 15,
  },
  {
    id: 'habit-hydrate',
    title: 'Hydration & Stretch',
    type: 'check',
    targetDurationMinutes: 0,
    frequency: 'Daily',
    color: '#74C69D',
    streakCurrent: 8,
    streakBest: 14,
    createdAt: Date.now() - 86400000 * 20,
  },
  {
    id: 'habit-meditate',
    title: 'Mindful Meditation',
    type: 'duration',
    targetDurationMinutes: 10,
    frequency: 'Daily',
    color: '#40916C',
    streakCurrent: 3,
    streakBest: 5,
    createdAt: Date.now() - 86400000 * 7,
  },
];

// Seed recent habit logs for realistic calendar heatmaps
const DEFAULT_HABIT_LOGS: HabitLog[] = [
  { id: 'log-1', habitId: 'habit-deepwork', date: getDaysAgo(0), completed: true, durationMinutes: 45 },
  { id: 'log-2', habitId: 'habit-reading', date: getDaysAgo(0), completed: true, durationMinutes: 20 },
  { id: 'log-3', habitId: 'habit-hydrate', date: getDaysAgo(0), completed: true, durationMinutes: 0 },
  { id: 'log-4', habitId: 'habit-deepwork', date: getDaysAgo(1), completed: true, durationMinutes: 45 },
  { id: 'log-5', habitId: 'habit-reading', date: getDaysAgo(1), completed: true, durationMinutes: 20 },
  { id: 'log-6', habitId: 'habit-hydrate', date: getDaysAgo(1), completed: true, durationMinutes: 0 },
  { id: 'log-7', habitId: 'habit-meditate', date: getDaysAgo(1), completed: true, durationMinutes: 10 },
  { id: 'log-8', habitId: 'habit-deepwork', date: getDaysAgo(2), completed: true, durationMinutes: 45 },
  { id: 'log-9', habitId: 'habit-hydrate', date: getDaysAgo(2), completed: true, durationMinutes: 0 },
  { id: 'log-10', habitId: 'habit-deepwork', date: getDaysAgo(3), completed: true, durationMinutes: 45 },
  { id: 'log-11', habitId: 'habit-reading', date: getDaysAgo(3), completed: true, durationMinutes: 20 },
  { id: 'log-12', habitId: 'habit-hydrate', date: getDaysAgo(3), completed: true, durationMinutes: 0 },
];

// Seed recent focus sessions
const DEFAULT_SESSIONS: SessionRecord[] = [
  { id: 's-1', timerTitle: 'Deep Work Session', durationMinutes: 45, completedAt: Date.now() - 3600000 * 2, category: 'Code', date: getDaysAgo(0) },
  { id: 's-2', timerTitle: 'Pomodoro Focus', durationMinutes: 25, completedAt: Date.now() - 3600000 * 4, category: 'Study', date: getDaysAgo(0) },
  { id: 's-3', timerTitle: 'Deep Work Session', durationMinutes: 45, completedAt: Date.now() - 86400000 * 1 - 3600000 * 3, category: 'Code', date: getDaysAgo(1) },
  { id: 's-4', timerTitle: 'Pomodoro Focus', durationMinutes: 25, completedAt: Date.now() - 86400000 * 1 - 3600000 * 6, category: 'Study', date: getDaysAgo(1) },
  { id: 's-5', timerTitle: 'Reading Notes', durationMinutes: 20, completedAt: Date.now() - 86400000 * 2 - 3600000 * 2, category: 'Reading', date: getDaysAgo(2) },
  { id: 's-6', timerTitle: 'Deep Work Session', durationMinutes: 45, completedAt: Date.now() - 86400000 * 3 - 3600000 * 5, category: 'Code', date: getDaysAgo(3) },
];

export const storage = {
  getTimers: (): Timer[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TIMERS);
      return data ? JSON.parse(data) : DEFAULT_TIMERS;
    } catch {
      return DEFAULT_TIMERS;
    }
  },
  saveTimers: (timers: Timer[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.TIMERS, JSON.stringify(timers));
    } catch (e) {
      console.error('Failed to save timers', e);
    }
  },

  getHabits: (): Habit[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HABITS);
      return data ? JSON.parse(data) : DEFAULT_HABITS;
    } catch {
      return DEFAULT_HABITS;
    }
  },
  saveHabits: (habits: Habit[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    } catch (e) {
      console.error('Failed to save habits', e);
    }
  },

  getHabitLogs: (): HabitLog[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HABIT_LOGS);
      return data ? JSON.parse(data) : DEFAULT_HABIT_LOGS;
    } catch {
      return DEFAULT_HABIT_LOGS;
    }
  },
  saveHabitLogs: (logs: HabitLog[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.HABIT_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save habit logs', e);
    }
  },

  getSessions: (): SessionRecord[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return data ? JSON.parse(data) : DEFAULT_SESSIONS;
    } catch {
      return DEFAULT_SESSIONS;
    }
  },
  saveSessions: (sessions: SessionRecord[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save sessions', e);
    }
  },

  getTheme: (): ThemeMode => {
    try {
      const theme = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode;
      return theme || 'dark'; // Default to Nordic Dark
    } catch {
      return 'dark';
    }
  },
  saveTheme: (theme: ThemeMode): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  },

  exportCSV: (sessions: SessionRecord[], habitLogs: HabitLog[]): void => {
    const headers = ['Type', 'Title/ID', 'Duration(Minutes)', 'Date', 'CompletedAt/Status'];
    const sessionRows = sessions.map(s => [
      'Focus Session',
      `"${s.timerTitle}"`,
      s.durationMinutes.toString(),
      s.date,
      new Date(s.completedAt).toLocaleTimeString(),
    ]);

    const habitRows = habitLogs.map(l => [
      'Habit Log',
      `"${l.habitId}"`,
      l.durationMinutes.toString(),
      l.date,
      l.completed ? 'Completed' : 'Pending',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...sessionRows.map(r => r.join(',')), ...habitRows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rhythm_data_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
