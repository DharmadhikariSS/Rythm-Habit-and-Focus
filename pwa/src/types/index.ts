export type HabitType = 'CHECK' | 'TIMED' | 'COUNTER';

export interface Subject {
  id: string;
  userId?: string;
  name: string;
  color: string; // hex
  targetWeeklyHours: number;
  totalElapsedMs: number;
  isRunning: boolean;
}

export interface Habit {
  id: string;
  userId?: string;
  name: string;
  icon: string; // emoji e.g. "🌿"
  type: HabitType;
  color: string;
  category?: 'study' | 'wellness' | 'fitness' | 'productivity' | 'mindfulness' | 'finance' | 'organization';
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
  userId?: string;
  subjectId: string;
  subjectName: string;
  durationSeconds: number;
  completedAt: number;
  subjectColor: string;
  dateIso: string; // YYYY-MM-DD
  wasPomodoro?: boolean;
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
export type NavTab = 'timers' | 'habits' | 'analytics' | 'together' | 'diary';

// User & Profile
export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarEmoji: string;
  email?: string;
  hasCompletedOnboarding: boolean;
  selectedGoalPacks: string[];
  diaryPinHash?: string;
  diarySalt?: string;
  createdAt: number;
}

// Pomodoro Types
export interface PomodoroState {
  subjectId: string;
  phase: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';
  remainingSeconds: number;
  cyclesCompleted: number;
  isActive: boolean;
}

export interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
}

// Badges & Milestones
export type BadgeCategory = 
  | 'streaks' 
  | 'multipliers' 
  | 'accumulations' 
  | 'monthly' 
  | 'categories' 
  | 'accountability' 
  | 'seasonal';

export interface BadgeDefinition {
  id: string;
  category: BadgeCategory;
  title: string;
  icon: string;
  description: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

export interface UserBadgeRecord {
  badgeId: string;
  unlockedAt: number;
  seen: boolean;
}

// Goal Packs (Onboarding)
export interface GoalPackHabitTemplate {
  name: string;
  icon: string;
  type: HabitType;
  category: 'study' | 'wellness' | 'fitness' | 'productivity' | 'mindfulness' | 'finance' | 'organization';
  targetDurationMinutes?: number;
  targetCount?: number;
  targetUnit?: string;
  color: string;
}

export interface GoalPackSubjectTemplate {
  name: string;
  color: string;
  targetWeeklyHours: number;
}

export interface GoalPack {
  id: string;
  title: string;
  tagline: string;
  icon: string;
  accentColor: string;
  habits: GoalPackHabitTemplate[];
  subjects: GoalPackSubjectTemplate[];
}

// Collaboration
export interface CollabMember {
  id: string;
  name: string;
  avatar: string;
  joinedAt: number;
}

export interface CollabSpace {
  id: string;
  name: string;
  inviteCode: string;
  ownerId: string;
  members: CollabMember[];
  createdAt: number;
}

export interface CollabGoal {
  id: string;
  spaceId: string;
  title: string;
  icon: string;
  type: 'HABIT' | 'FOCUS_HOURS';
  targetPerMember: number;
  color: string;
  createdAt: number;
}

export interface CollabGoalEntry {
  id: string;
  goalId: string;
  userId: string;
  userName: string;
  dateIso: string;
  value: number;
  completedAt: number;
}

export interface CollabMessage {
  id: string;
  spaceId: string;
  goalId?: string;
  fromUserId: string;
  fromUserName: string;
  type: 'NOTE' | 'BUZZ';
  content?: string;
  createdAt: number;
}

export type PraiseType = 'ON_FIRE' | 'LIGHTNING' | 'ZEN' | 'BEAST' | 'CONSISTENT';

export interface CollabPraise {
  id: string;
  spaceId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  goalId: string;
  type: PraiseType;
  dateIso: string;
}

// Weekly Rhythm Report
export interface WeeklyRhythmReport {
  id: string;
  weekStartIso: string;
  focusHours: number;
  focusDeltaPercent: number;
  habitRate: number;
  habitDeltaPercent: number;
  topSubjectName: string;
  topSubjectHours: number;
  longestStreakHabit: string;
  longestStreakDays: number;
  aiSummary: string;
  ratingLabel: string;
  generatedAt: number;
  isDismissed: boolean;
}

// Smart Daily Schedule
export interface DailyScheduleBlock {
  id: string;
  startTime: string;
  endTime: string;
  title: string;
  category: 'focus' | 'habit' | 'rest';
  description: string;
  icon: string;
  color: string;
}

// Personal Encrypted Diary
export interface EncryptedDiaryEntry {
  id: string;
  userId: string;
  dateIso: string;
  encryptedPayload: string; // Base64 AES-GCM ciphertext
  salt: string; // Base64 salt for PBKDF2
  iv: string; // Base64 IV for AES-GCM
  updatedAt: number;
}

export interface DecryptedDiaryPayload {
  mood: string;
  title: string;
  body: string;
}

// Offline Sync Queue
export interface SyncOp {
  id?: number;
  table: string;
  action: 'insert' | 'update' | 'delete';
  recordId: string;
  data: unknown;
  createdAt: number;
}

