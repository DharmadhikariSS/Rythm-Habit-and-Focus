import { Subject, Habit, HabitEntry, StudySession, ThemeMode } from '../types';

const STORAGE_KEYS = {
  SUBJECTS: 'rhythm_subjects_v2',
  HABITS: 'rhythm_habits_v2',
  ENTRIES: 'rhythm_entries_v2',
  SESSIONS: 'rhythm_sessions_v2',
  THEME: 'rhythm_theme_v2',
};

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const getDaysAgo = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return formatDate(d);
};

// Default subjects matching Android Kotlin v1.5.0
const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'sub-study',
    name: 'Study',
    color: '#437A55', // AccentEmerald
    targetWeeklyHours: 10,
    totalElapsedMs: 0,
    isRunning: false,
  },
  {
    id: 'sub-code',
    name: 'Code',
    color: '#386B80', // AccentOcean
    targetWeeklyHours: 15,
    totalElapsedMs: 0,
    isRunning: false,
  },
  {
    id: 'sub-gym',
    name: 'Gym',
    color: '#B55D46', // AccentTerracotta
    targetWeeklyHours: 5,
    totalElapsedMs: 0,
    isRunning: false,
  },
  {
    id: 'sub-reading',
    name: 'Reading',
    color: '#A67B34', // AccentOchre
    targetWeeklyHours: 5,
    totalElapsedMs: 0,
    isRunning: false,
  },
];

// Default habits matching Android Kotlin v1.5.0
const DEFAULT_HABITS: Habit[] = [
  {
    id: 'habit-deepwork',
    name: 'Deep Work 45m',
    icon: '📚',
    type: 'TIMED',
    color: '#437A55',
    targetDurationMinutes: 45,
    targetCount: 0,
    targetUnit: '',
    streakDays: 5,
    bestStreak: 12,
    createdAt: Date.now() - 86400000 * 15,
  },
  {
    id: 'habit-reading',
    name: 'Morning Reading',
    icon: '📖',
    type: 'TIMED',
    color: '#386B80',
    targetDurationMinutes: 20,
    targetCount: 0,
    targetUnit: '',
    streakDays: 6,
    bestStreak: 14,
    createdAt: Date.now() - 86400000 * 14,
  },
  {
    id: 'habit-hydrate',
    name: 'Hydration 8 Cups',
    icon: '💧',
    type: 'COUNTER',
    color: '#3A7D99',
    targetDurationMinutes: 0,
    targetCount: 8,
    targetUnit: 'cups',
    streakDays: 8,
    bestStreak: 16,
    createdAt: Date.now() - 86400000 * 20,
  },
  {
    id: 'habit-meditate',
    name: 'Mindful Meditation',
    icon: '🧘',
    type: 'TIMED',
    color: '#6B5F8C',
    targetDurationMinutes: 15,
    targetCount: 0,
    targetUnit: '',
    streakDays: 3,
    bestStreak: 7,
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: 'habit-nosugar',
    name: 'No Sugar & Clean Eating',
    icon: '🌿',
    type: 'CHECK',
    color: '#5D8464',
    targetDurationMinutes: 0,
    targetCount: 0,
    targetUnit: '',
    streakDays: 9,
    bestStreak: 15,
    createdAt: Date.now() - 86400000 * 22,
  },
];

// Seed realistic entries for heatmap activity
const DEFAULT_ENTRIES: HabitEntry[] = [
  { id: 'e-1', habitId: 'habit-deepwork', dateIso: getDaysAgo(0), isCompleted: true, loggedDurationSeconds: 2700, currentCount: 0, isRestDay: false },
  { id: 'e-2', habitId: 'habit-reading', dateIso: getDaysAgo(0), isCompleted: true, loggedDurationSeconds: 1200, currentCount: 0, isRestDay: false },
  { id: 'e-3', habitId: 'habit-hydrate', dateIso: getDaysAgo(0), isCompleted: true, loggedDurationSeconds: 0, currentCount: 8, isRestDay: false },
  { id: 'e-4', habitId: 'habit-deepwork', dateIso: getDaysAgo(1), isCompleted: true, loggedDurationSeconds: 2700, currentCount: 0, isRestDay: false },
  { id: 'e-5', habitId: 'habit-reading', dateIso: getDaysAgo(1), isCompleted: true, loggedDurationSeconds: 1200, currentCount: 0, isRestDay: false },
  { id: 'e-6', habitId: 'habit-hydrate', dateIso: getDaysAgo(1), isCompleted: true, loggedDurationSeconds: 0, currentCount: 8, isRestDay: false },
  { id: 'e-7', habitId: 'habit-meditate', dateIso: getDaysAgo(1), isCompleted: true, loggedDurationSeconds: 900, currentCount: 0, isRestDay: false },
  { id: 'e-8', habitId: 'habit-nosugar', dateIso: getDaysAgo(1), isCompleted: true, loggedDurationSeconds: 0, currentCount: 0, isRestDay: false },
  { id: 'e-9', habitId: 'habit-deepwork', dateIso: getDaysAgo(2), isCompleted: true, loggedDurationSeconds: 2700, currentCount: 0, isRestDay: false },
  { id: 'e-10', habitId: 'habit-hydrate', dateIso: getDaysAgo(2), isCompleted: true, loggedDurationSeconds: 0, currentCount: 8, isRestDay: false },
  { id: 'e-11', habitId: 'habit-nosugar', dateIso: getDaysAgo(2), isCompleted: true, loggedDurationSeconds: 0, currentCount: 0, isRestDay: false },
  { id: 'e-12', habitId: 'habit-reading', dateIso: getDaysAgo(3), isCompleted: true, loggedDurationSeconds: 1200, currentCount: 0, isRestDay: false },
  { id: 'e-13', habitId: 'habit-deepwork', dateIso: getDaysAgo(3), isCompleted: true, loggedDurationSeconds: 2700, currentCount: 0, isRestDay: false },
];

// Seed study sessions matching Android
const DEFAULT_SESSIONS: StudySession[] = [
  { id: 's-1', subjectId: 'sub-code', subjectName: 'Code', durationSeconds: 3600, completedAt: Date.now() - 3600000 * 2, subjectColor: '#386B80', dateIso: getDaysAgo(0) },
  { id: 's-2', subjectId: 'sub-study', subjectName: 'Study', durationSeconds: 2700, completedAt: Date.now() - 3600000 * 5, subjectColor: '#437A55', dateIso: getDaysAgo(0) },
  { id: 's-3', subjectId: 'sub-code', subjectName: 'Code', durationSeconds: 4500, completedAt: Date.now() - 86400000 * 1 - 3600000 * 3, subjectColor: '#386B80', dateIso: getDaysAgo(1) },
  { id: 's-4', subjectId: 'sub-study', subjectName: 'Study', durationSeconds: 3000, completedAt: Date.now() - 86400000 * 1 - 3600000 * 6, subjectColor: '#437A55', dateIso: getDaysAgo(1) },
  { id: 's-5', subjectId: 'sub-reading', subjectName: 'Reading', durationSeconds: 1800, completedAt: Date.now() - 86400000 * 2 - 3600000 * 4, subjectColor: '#A67B34', dateIso: getDaysAgo(2) },
  { id: 's-6', subjectId: 'sub-gym', subjectName: 'Gym', durationSeconds: 3600, completedAt: Date.now() - 86400000 * 2 - 3600000 * 8, subjectColor: '#B55D46', dateIso: getDaysAgo(2) },
  { id: 's-7', subjectId: 'sub-code', subjectName: 'Code', durationSeconds: 5400, completedAt: Date.now() - 86400000 * 3 - 3600000 * 4, subjectColor: '#386B80', dateIso: getDaysAgo(3) },
];

export const storage = {
  getSubjects: (): Subject[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      return data ? JSON.parse(data) : DEFAULT_SUBJECTS;
    } catch {
      return DEFAULT_SUBJECTS;
    }
  },
  saveSubjects: (subjects: Subject[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
    } catch (e) {
      console.error('Failed to save subjects', e);
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

  getEntries: (): HabitEntry[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ENTRIES);
      return data ? JSON.parse(data) : DEFAULT_ENTRIES;
    } catch {
      return DEFAULT_ENTRIES;
    }
  },
  saveEntries: (entries: HabitEntry[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
    } catch (e) {
      console.error('Failed to save entries', e);
    }
  },

  getSessions: (): StudySession[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return data ? JSON.parse(data) : DEFAULT_SESSIONS;
    } catch {
      return DEFAULT_SESSIONS;
    }
  },
  saveSessions: (sessions: StudySession[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save sessions', e);
    }
  },

  getTheme: (): ThemeMode => {
    try {
      const theme = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode;
      return theme || 'dark';
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

  exportCSV: (
    habits: Habit[],
    entries: HabitEntry[],
    subjects: Subject[],
    sessions: StudySession[]
  ): void => {
    const lines: string[] = [];

    lines.push('=== STUDY SESSIONS ===');
    lines.push('Session ID,Subject Name,Duration (Minutes),Date,Completed Time');
    sessions.forEach(s => {
      lines.push(
        `"${s.id}","${s.subjectName}",${Math.round(s.durationSeconds / 60)},"${s.dateIso}","${new Date(s.completedAt).toLocaleTimeString()}"`
      );
    });

    lines.push('');
    lines.push('=== HABIT LOGS ===');
    lines.push('Entry ID,Habit Name,Type,Status,Count/Duration,Date');
    entries.forEach(e => {
      const habit = habits.find(h => h.id === e.habitId);
      const habitName = habit?.name || e.habitId;
      const status = e.isRestDay ? 'Rest Day' : e.isCompleted ? 'Completed' : 'Pending';
      const measure = habit?.type === 'COUNTER' ? `${e.currentCount} ${habit.targetUnit}` : `${Math.round(e.loggedDurationSeconds / 60)}m`;
      lines.push(`"${e.id}","${habitName}","${habit?.type || 'CHECK'}","${status}","${measure}","${e.dateIso}"`);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(lines.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `rhythm_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
