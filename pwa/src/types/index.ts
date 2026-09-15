export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface Timer {
  id: string;
  title: string;
  totalSeconds: number;
  remainingSeconds: number;
  status: TimerStatus;
  category: string;
  color: string;
  createdAt: number;
}

export type HabitType = 'check' | 'duration';

export interface Habit {
  id: string;
  title: string;
  type: HabitType;
  targetDurationMinutes: number;
  frequency: string; // e.g. "Daily"
  color: string;
  streakCurrent: number;
  streakBest: number;
  createdAt: number;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  durationMinutes: number;
}

export interface SessionRecord {
  id: string;
  timerTitle: string;
  durationMinutes: number;
  completedAt: number;
  category: string;
  date: string; // YYYY-MM-DD
}

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

export interface TimeDistribution {
  morning: number;   // 05:00 - 12:00
  afternoon: number; // 12:00 - 17:00
  evening: number;   // 17:00 - 22:00
  night: number;     // 22:00 - 05:00
}
