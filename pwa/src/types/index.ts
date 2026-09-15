export type HabitType = 'CHECK' | 'TIMED' | 'COUNTER';

export interface Subject {
  id: string;
  name: string;
  color: string; // hex
  targetWeeklyHours: number;
  totalElapsedMs: number;
  isRunning: boolean;
}

export interface Habit {
  id: string;
  name: string;
  icon: string; // emoji e.g. "🌿"
  type: HabitType;
  color: string;
  targetDurationMinutes: number;
  targetCount: number;
  targetUnit: string;
  streakDays: number;
  bestStreak: number;
  createdAt: number;
}

export interface HabitEntry {
  id: string;
  habitId: string;
  dateIso: string; // YYYY-MM-DD
  isCompleted: boolean;
  loggedDurationSeconds: number;
  currentCount: number;
  isRestDay: boolean;
}

export interface StudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  durationSeconds: number;
  completedAt: number;
  subjectColor: string;
  dateIso: string; // YYYY-MM-DD
}

export interface HeatmapDayData {
  dateIso: string;
  dayNumber: number;
  dayOfWeek: string;
  completionRatio: number; // 0.0 to 1.0
  isToday: boolean;
}

export type AnalyticsLens = 'SUBJECTS' | 'HABITS';
export type Timeframe = 'TODAY' | 'WEEK' | 'MONTH' | 'ALL';

export type InsightCategory = 
  | 'PEAK_PERFORMANCE' 
  | 'MOMENTUM' 
  | 'CONSISTENCY' 
  | 'HABIT_ALIGNMENT' 
  | 'EARLY_EXPLORATION';

export interface BehavioralInsight {
  category: InsightCategory;
  confidence: number;
  headline: string;
  analysis: string;
  actionableTip: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type NavTab = 'timers' | 'habits' | 'analytics';
