import { create } from 'zustand';
import confetti from 'canvas-confetti';
import { db } from '../services/db';
import { GOAL_PACKS } from '../data/goalPacks';
import { ALL_BADGES } from '../data/badges';
import { MilestoneEngine } from '../services/milestoneEngine';
import { soundService } from '../services/sound';
import { CryptoService } from '../services/cryptoService';
import {
  Subject,
  Habit,
  HabitEntry,
  StudySession,
  UserProfile,
  UserBadgeRecord,
  BadgeDefinition,
  NavTab,
  AnalyticsLens,
  Timeframe,
  BehavioralInsight,
  PomodoroState,
  PomodoroSettings,
  CollabSpace,
  CollabGoal,
  CollabGoalEntry,
  CollabMessage,
  CollabPraise,
  PraiseType,
  WeeklyRhythmReport,
  DailyScheduleBlock,
  EncryptedDiaryEntry,
  DecryptedDiaryPayload,
} from '../types';

const getTodayIso = (): string => new Date().toISOString().split('T')[0];

interface RhythmState {
  isInitialized: boolean;
  currentUser: UserProfile | null;
  activeTab: NavTab;
  selectedDate: string;
  activeLens: AnalyticsLens;
  timeframe: Timeframe;
  todayDate: string;

  // Domain models
  subjects: Subject[];
  habits: Habit[];
  habitEntries: HabitEntry[];
  sessions: StudySession[];
  badges: UserBadgeRecord[];
  recentUnlockedBadge: BadgeDefinition | null;
  insight: BehavioralInsight;

  // In-Card Timers & Pomodoro
  activeHabitTimers: Record<string, { isRunning: boolean; elapsedSeconds: number }>;
  pomodoroStates: Record<string, PomodoroState>;
  pomodoroSettings: PomodoroSettings;
  activeBreathingOverlay: { subjectName: string; subjectColor: string; phase: 'SHORT_BREAK' | 'LONG_BREAK' } | null;

  // Collaboration
  collabSpace: CollabSpace | null;
  collabGoals: CollabGoal[];
  collabEntries: CollabGoalEntry[];
  collabMessages: CollabMessage[];
  collabPraises: CollabPraise[];
  buzzAlert: { fromName: string; timestamp: number } | null;

  // Weekly Report & Daily Schedule
  weeklyReport: WeeklyRhythmReport | null;
  dailySchedule: DailyScheduleBlock[];

  // Encrypted Diary
  diaryUnlocked: boolean;
  activeDiaryPin: string | null;
  diaryEntries: EncryptedDiaryEntry[];

  // Core Actions
  initialize: () => Promise<void>;
  completeOnboarding: (
    selectedPackIds: string[],
    userDetails: { displayName: string; avatarEmoji: string; username: string }
  ) => Promise<void>;
  setActiveTab: (tab: NavTab) => void;
  setSelectedDate: (date: string) => void;
  setActiveLens: (lens: AnalyticsLens) => void;
  setTimeframe: (tf: Timeframe) => void;
  dismissBadgeCelebration: () => void;
  dismissBuzzAlert: () => void;

  // Subject & Stopwatch Actions
  addSubject: (name: string, color: string, targetWeeklyHours: number) => Promise<void>;
  toggleSubjectTimer: (id: string) => void;
  stopAndSaveSubjectTimer: (id: string) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;

  // Pomodoro Actions
  togglePomodoroForSubject: (subjectId: string) => void;
  advancePomodoroCycle: (subjectId: string) => Promise<void>;
  closeBreathingOverlay: () => void;

  // Habit Actions
  addHabit: (habit: Omit<Habit, 'id' | 'streakDays' | 'bestStreak' | 'createdAt'>) => Promise<void>;
  toggleHabitCheck: (habitId: string, dateIso: string) => Promise<void>;
  toggleHabitRestDay: (habitId: string, dateIso: string) => Promise<void>;
  incrementHabitCount: (habitId: string, dateIso: string) => Promise<void>;
  decrementHabitCount: (habitId: string, dateIso: string) => Promise<void>;
  toggleHabitTimer: (habitId: string) => void;
  resetHabitTimer: (habitId: string) => void;
  deleteHabit: (id: string) => Promise<void>;

  // Collaboration Actions
  createCollabSpace: (spaceName: string) => Promise<void>;
  joinCollabSpace: (inviteCode: string) => Promise<boolean>;
  addCollabGoal: (title: string, icon: string, color: string, type: 'HABIT' | 'FOCUS_HOURS', targetPerMember: number) => Promise<void>;
  logCollabProgress: (goalId: string, deltaValue: number) => Promise<void>;
  sendCollabMessage: (content: string, type: 'NOTE' | 'BUZZ', goalId?: string) => Promise<void>;
  sendCollabPraise: (toUserId: string, goalId: string, type: PraiseType) => Promise<void>;

  // Encrypted Diary Actions
  setupDiaryPin: (pin: string) => Promise<void>;
  unlockDiary: (pin: string) => Promise<boolean>;
  lockDiary: () => void;
  saveDiaryEntry: (payload: DecryptedDiaryPayload, dateIso: string) => Promise<void>;
  deleteDiaryEntry: (id: string) => Promise<void>;

  // AI & Reports
  dismissWeeklyReport: () => void;
  refreshAiInsight: () => void;
}

const DEFAULT_INSIGHT: BehavioralInsight = {
  category: 'PEAK_PERFORMANCE',
  confidence: 94,
  headline: 'Morning Flow Acceleration',
  analysis: 'Your highest uninterrupted focus blocks occur between 09:00 and 11:30 AM. Consistency is compounding across core goals.',
  actionableTip: 'Schedule your heaviest analytical subject during this prime morning circadian window.',
};

export const useRhythmStore = create<RhythmState>((set, get) => ({
  isInitialized: false,
  currentUser: null,
  activeTab: 'timers',
  selectedDate: getTodayIso(),
  activeLens: 'SUBJECTS',
  timeframe: 'TODAY',
  todayDate: getTodayIso(),

  subjects: [],
  habits: [],
  habitEntries: [],
  sessions: [],
  badges: [],
  recentUnlockedBadge: null,
  insight: DEFAULT_INSIGHT,

  activeHabitTimers: {},
  pomodoroStates: {},
  pomodoroSettings: {
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    longBreakInterval: 4,
  },
  activeBreathingOverlay: null,

  collabSpace: null,
  collabGoals: [],
  collabEntries: [],
  collabMessages: [],
  collabPraises: [],
  buzzAlert: null,

  weeklyReport: null,
  dailySchedule: [],

  diaryUnlocked: false,
  activeDiaryPin: null,
  diaryEntries: [],

  initialize: async () => {
    try {
      const users = await db.users.toArray();
      let currentUser = users[0] || null;

      if (!currentUser) {
        currentUser = {
          id: 'user_default',
          username: 'zen_master',
          displayName: 'Mindful Practitioner',
          avatarEmoji: '🧘',
          hasCompletedOnboarding: false,
          selectedGoalPacks: [],
          createdAt: Date.now(),
        };
        await db.users.put(currentUser);
      }

      const [subjects, habits, habitEntries, sessions, badges, diaryEntries, collabSpaces, collabGoals, collabEntries, collabMessages, collabPraises] =
        await Promise.all([
          db.subjects.toArray(),
          db.habits.toArray(),
          db.habitEntries.toArray(),
          db.sessions.toArray(),
          db.badges.toArray(),
          db.diaryEntries.toArray(),
          db.collabSpaces.toArray(),
          db.collabGoals.toArray(),
          db.collabEntries.toArray(),
          db.collabMessages.toArray(),
          db.collabPraises.toArray(),
        ]);

      // Seed sample weekly report if none
      const sampleReport: WeeklyRhythmReport = {
        id: 'report_sample',
        weekStartIso: getTodayIso(),
        focusHours: 14.5,
        focusDeltaPercent: 18,
        habitRate: 0.88,
        habitDeltaPercent: 12,
        topSubjectName: subjects[0]?.name || 'Deep Work',
        topSubjectHours: 6.2,
        longestStreakHabit: habits[0]?.name || 'Morning Meditation',
        longestStreakDays: 9,
        aiSummary: 'Morning focus hours are compounding. Keep protecting your early circadian block.',
        ratingLabel: '⚡ High Momentum',
        generatedAt: Date.now(),
        isDismissed: false,
      };

      // Seed smart daily schedule blocks
      const sampleSchedule: DailyScheduleBlock[] = [
        {
          id: 'block_1',
          startTime: '09:00',
          endTime: '11:00',
          title: subjects[0]?.name || 'Deep Work Focus',
          category: 'focus',
          description: 'Peak circadian energy window · zero distraction mode',
          icon: '⚡',
          color: '#386B80',
        },
        {
          id: 'block_2',
          startTime: '13:00',
          endTime: '13:30',
          title: 'Hydration & Mindful Movement',
          category: 'habit',
          description: 'Restorative break habit check-in',
          icon: '🌿',
          color: '#437A55',
        },
        {
          id: 'block_3',
          startTime: '16:00',
          endTime: '17:30',
          title: subjects[1]?.name || 'Secondary Review',
          category: 'focus',
          description: 'Afternoon consolidation block',
          icon: '📚',
          color: '#B55D46',
        },
      ];

      set({
        isInitialized: true,
        currentUser,
        subjects,
        habits,
        habitEntries,
        sessions,
        badges,
        diaryEntries,
        collabSpace: collabSpaces[0] || null,
        collabGoals,
        collabEntries,
        collabMessages,
        collabPraises,
        weeklyReport: sampleReport,
        dailySchedule: sampleSchedule,
      });

      // Master 1-second interval ticker for stopwatches, in-card habit timers, and Pomodoro
      setInterval(() => {
        const state = get();
        let subjectsChanged = false;
        let pomodoroChanged = false;

        const updatedSubjects = state.subjects.map((sub) => {
          if (sub.isRunning) {
            subjectsChanged = true;
            return { ...sub, totalElapsedMs: sub.totalElapsedMs + 1000 };
          }
          return sub;
        });

        // Tick Pomodoros
        const updatedPomodoro = { ...state.pomodoroStates };
        Object.entries(updatedPomodoro).forEach(([subId, pState]) => {
          if (pState.isActive && pState.remainingSeconds > 0) {
            pomodoroChanged = true;
            updatedPomodoro[subId] = {
              ...pState,
              remainingSeconds: pState.remainingSeconds - 1,
            };

            // Phase complete
            if (updatedPomodoro[subId].remainingSeconds === 0) {
              soundService.playZenBowl();
              confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
              state.advancePomodoroCycle(subId);
            }
          }
        });

        // Tick active in-card habit timers
        let habitTimersChanged = false;
        const updatedHabitTimers = { ...state.activeHabitTimers };
        Object.entries(updatedHabitTimers).forEach(([hId, tState]) => {
          if (tState.isRunning) {
            habitTimersChanged = true;
            updatedHabitTimers[hId] = {
              ...tState,
              elapsedSeconds: tState.elapsedSeconds + 1,
            };
          }
        });

        if (subjectsChanged || pomodoroChanged || habitTimersChanged) {
          set({
            subjects: updatedSubjects,
            pomodoroStates: updatedPomodoro,
            activeHabitTimers: updatedHabitTimers,
          });
        }
      }, 1000);
    } catch (err) {
      console.error('Failed to initialize Rhythm local store:', err);
    }
  },

  completeOnboarding: async (selectedPackIds, userDetails) => {
    const { currentUser } = get();
    const newSubjects: Subject[] = [];
    const newHabits: Habit[] = [];

    // Combine chosen goal packs
    selectedPackIds.forEach((packId) => {
      const pack = GOAL_PACKS.find((p) => p.id === packId);
      if (!pack) return;

      pack.subjects.forEach((s) => {
        if (!newSubjects.some((existing) => existing.name === s.name)) {
          newSubjects.push({
            id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            name: s.name,
            color: s.color,
            targetWeeklyHours: s.targetWeeklyHours,
            totalElapsedMs: 0,
            isRunning: false,
          });
        }
      });

      pack.habits.forEach((h) => {
        if (!newHabits.some((existing) => existing.name === h.name)) {
          newHabits.push({
            id: `hab_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            name: h.name,
            icon: h.icon,
            type: h.type,
            category: h.category,
            color: h.color,
            targetDurationMinutes: h.targetDurationMinutes || 15,
            targetCount: h.targetCount || 1,
            targetUnit: h.targetUnit || 'times',
            streakDays: 0,
            bestStreak: 0,
            createdAt: Date.now(),
          });
        }
      });
    });

    const updatedUser: UserProfile = {
      ...(currentUser || {
        id: 'user_default',
        createdAt: Date.now(),
      }),
      username: userDetails.username,
      displayName: userDetails.displayName,
      avatarEmoji: userDetails.avatarEmoji,
      hasCompletedOnboarding: true,
      selectedGoalPacks: selectedPackIds,
    };

    await Promise.all([
      db.users.put(updatedUser),
      db.subjects.bulkPut(newSubjects),
      db.habits.bulkPut(newHabits),
    ]);

    set({
      currentUser: updatedUser,
      subjects: newSubjects,
      habits: newHabits,
    });

    confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
    soundService.playZenBowl();
  },

  setActiveTab: (activeTab) => set({ activeTab }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setActiveLens: (activeLens) => set({ activeLens }),
  setTimeframe: (timeframe) => set({ timeframe }),
  dismissBadgeCelebration: () => set({ recentUnlockedBadge: null }),
  dismissBuzzAlert: () => set({ buzzAlert: null }),

  // ---------------- SUBJECTS & STOPWATCHES ----------------
  addSubject: async (name, color, targetWeeklyHours) => {
    const newSub: Subject = {
      id: `sub_${Date.now()}`,
      name,
      color,
      targetWeeklyHours,
      totalElapsedMs: 0,
      isRunning: false,
    };
    await db.subjects.put(newSub);
    set((state) => ({ subjects: [...state.subjects, newSub] }));
  },

  toggleSubjectTimer: (id) => {
    const state = get();
    const updated = state.subjects.map((sub) => {
      if (sub.id === id) {
        const nextRunning = !sub.isRunning;
        if (nextRunning) soundService.playZenBowl();
        return { ...sub, isRunning: nextRunning };
      }
      return sub;
    });
    set({ subjects: updated });
    const toggled = updated.find((s) => s.id === id);
    if (toggled) db.subjects.put(toggled);
  },

  stopAndSaveSubjectTimer: async (id) => {
    const state = get();
    const sub = state.subjects.find((s) => s.id === id);
    if (!sub || sub.totalElapsedMs < 5000) {
      // If less than 5s, just reset
      const resetList = state.subjects.map((s) => (s.id === id ? { ...s, totalElapsedMs: 0, isRunning: false } : s));
      set({ subjects: resetList });
      return;
    }

    const durationSeconds = Math.round(sub.totalElapsedMs / 1000);
    const newSession: StudySession = {
      id: `ses_${Date.now()}`,
      subjectId: sub.id,
      subjectName: sub.name,
      durationSeconds,
      completedAt: Date.now(),
      subjectColor: sub.color,
      dateIso: getTodayIso(),
    };

    const updatedSubjects = state.subjects.map((s) => (s.id === id ? { ...s, totalElapsedMs: 0, isRunning: false } : s));

    await Promise.all([db.sessions.put(newSession), db.subjects.put(updatedSubjects.find((s) => s.id === id)!)]);

    const nextSessions = [newSession, ...state.sessions];
    set({
      subjects: updatedSubjects,
      sessions: nextSessions,
    });

    // Check milestones & trigger celebration
    const newBadges = MilestoneEngine.evaluateBadges({
      existingBadges: state.badges,
      subjects: updatedSubjects,
      habits: state.habits,
      habitEntries: state.habitEntries,
      sessions: nextSessions,
    });

    if (newBadges.length > 0) {
      await db.badges.bulkPut(newBadges.map((b) => ({ ...b, userId: state.currentUser?.id || 'user_default' })));
      const firstBadgeDef = ALL_BADGES.find((b) => b.id === newBadges[0].badgeId) || null;
      set((s) => ({
        badges: [...s.badges, ...newBadges],
        recentUnlockedBadge: firstBadgeDef,
      }));
      soundService.playZenBowl();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }
  },

  deleteSubject: async (id) => {
    await db.subjects.delete(id);
    set((state) => ({ subjects: state.subjects.filter((s) => s.id !== id) }));
  },

  // ---------------- POMODORO MODE ----------------
  togglePomodoroForSubject: (subjectId) => {
    const state = get();
    const existing = state.pomodoroStates[subjectId];
    if (existing && existing.isActive) {
      // Deactivate
      set((s) => ({
        pomodoroStates: {
          ...s.pomodoroStates,
          [subjectId]: { ...existing, isActive: false },
        },
      }));
    } else {
      // Activate
      const sub = state.subjects.find((s) => s.id === subjectId);
      if (sub && !sub.isRunning) {
        state.toggleSubjectTimer(subjectId);
      }
      set((s) => ({
        pomodoroStates: {
          ...s.pomodoroStates,
          [subjectId]: {
            subjectId,
            phase: 'WORK',
            remainingSeconds: s.pomodoroSettings.workMinutes * 60,
            cyclesCompleted: existing ? existing.cyclesCompleted : 0,
            isActive: true,
          },
        },
      }));
    }
  },

  advancePomodoroCycle: async (subjectId) => {
    const state = get();
    const current = state.pomodoroStates[subjectId];
    if (!current) return;

    const sub = state.subjects.find((s) => s.id === subjectId);
    const subName = sub?.name || 'Focus Session';
    const subColor = sub?.color || '#386B80';

    if (current.phase === 'WORK') {
      const nextCycleCount = current.cyclesCompleted + 1;
      const isLongBreak = nextCycleCount % state.pomodoroSettings.longBreakInterval === 0;
      const nextPhase = isLongBreak ? 'LONG_BREAK' : 'SHORT_BREAK';
      const breakSecs = (isLongBreak ? state.pomodoroSettings.longBreakMinutes : state.pomodoroSettings.shortBreakMinutes) * 60;

      // Log the completed 25min work block as a verified StudySession
      const newSession: StudySession = {
        id: `ses_pomo_${Date.now()}`,
        subjectId,
        subjectName: subName,
        durationSeconds: state.pomodoroSettings.workMinutes * 60,
        completedAt: Date.now(),
        subjectColor: subColor,
        dateIso: getTodayIso(),
        wasPomodoro: true,
      };
      await db.sessions.put(newSession);

      set((s) => ({
        sessions: [newSession, ...s.sessions],
        pomodoroStates: {
          ...s.pomodoroStates,
          [subjectId]: {
            ...current,
            phase: nextPhase,
            remainingSeconds: breakSecs,
            cyclesCompleted: nextCycleCount,
            isActive: true,
          },
        },
        activeBreathingOverlay: {
          subjectName: subName,
          subjectColor: subColor,
          phase: nextPhase,
        },
      }));
    } else {
      // Break over -> start new work block
      set((s) => ({
        activeBreathingOverlay: null,
        pomodoroStates: {
          ...s.pomodoroStates,
          [subjectId]: {
            ...current,
            phase: 'WORK',
            remainingSeconds: s.pomodoroSettings.workMinutes * 60,
            isActive: true,
          },
        },
      }));
    }
  },

  closeBreathingOverlay: () => set({ activeBreathingOverlay: null }),

  // ---------------- HABITS ----------------
  addHabit: async (habit) => {
    const newHabit: Habit = {
      ...habit,
      id: `hab_${Date.now()}`,
      streakDays: 0,
      bestStreak: 0,
      createdAt: Date.now(),
    };
    await db.habits.put(newHabit);
    set((state) => ({ habits: [...state.habits, newHabit] }));
  },

  toggleHabitCheck: async (habitId, dateIso) => {
    const state = get();
    const existing = state.habitEntries.find((e) => e.habitId === habitId && e.dateIso === dateIso);
    const nextCompleted = !existing?.isCompleted;

    const entry: HabitEntry = {
      id: existing?.id || `ent_${Date.now()}`,
      habitId,
      dateIso,
      isCompleted: nextCompleted,
      loggedDurationSeconds: existing?.loggedDurationSeconds || 0,
      currentCount: existing?.currentCount || 0,
      isRestDay: false,
    };

    await db.habitEntries.put(entry);

    const nextEntries = existing
      ? state.habitEntries.map((e) => (e.id === entry.id ? entry : e))
      : [...state.habitEntries, entry];

    // Update streak
    const updatedHabits = state.habits.map((h) => {
      if (h.id === habitId) {
        const nextStreak = nextCompleted ? h.streakDays + 1 : Math.max(0, h.streakDays - 1);
        return {
          ...h,
          streakDays: nextStreak,
          bestStreak: Math.max(h.bestStreak, nextStreak),
        };
      }
      return h;
    });

    await db.habits.bulkPut(updatedHabits);

    if (nextCompleted) {
      soundService.playZenBowl();
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    }

    set({
      habitEntries: nextEntries,
      habits: updatedHabits,
    });

    // Check badges
    const newBadges = MilestoneEngine.evaluateBadges({
      existingBadges: state.badges,
      subjects: state.subjects,
      habits: updatedHabits,
      habitEntries: nextEntries,
      sessions: state.sessions,
    });

    if (newBadges.length > 0) {
      await db.badges.bulkPut(newBadges.map((b) => ({ ...b, userId: state.currentUser?.id || 'user_default' })));
      const firstBadgeDef = ALL_BADGES.find((b) => b.id === newBadges[0].badgeId) || null;
      set((s) => ({
        badges: [...s.badges, ...newBadges],
        recentUnlockedBadge: firstBadgeDef,
      }));
    }
  },

  toggleHabitRestDay: async (habitId, dateIso) => {
    const state = get();
    const existing = state.habitEntries.find((e) => e.habitId === habitId && e.dateIso === dateIso);
    const entry: HabitEntry = {
      id: existing?.id || `ent_${Date.now()}`,
      habitId,
      dateIso,
      isCompleted: false,
      loggedDurationSeconds: 0,
      currentCount: 0,
      isRestDay: !existing?.isRestDay,
    };
    await db.habitEntries.put(entry);
    set((s) => ({
      habitEntries: existing ? s.habitEntries.map((e) => (e.id === entry.id ? entry : e)) : [...s.habitEntries, entry],
    }));
  },

  incrementHabitCount: async (habitId, dateIso) => {
    const state = get();
    const habit = state.habits.find((h) => h.id === habitId);
    if (!habit) return;

    const existing = state.habitEntries.find((e) => e.habitId === habitId && e.dateIso === dateIso);
    const nextCount = (existing?.currentCount || 0) + 1;
    const isCompleted = nextCount >= habit.targetCount;

    const entry: HabitEntry = {
      id: existing?.id || `ent_${Date.now()}`,
      habitId,
      dateIso,
      isCompleted,
      loggedDurationSeconds: existing?.loggedDurationSeconds || 0,
      currentCount: nextCount,
      isRestDay: false,
    };

    await db.habitEntries.put(entry);
    set((s) => ({
      habitEntries: existing ? s.habitEntries.map((e) => (e.id === entry.id ? entry : e)) : [...s.habitEntries, entry],
    }));
    if (isCompleted && !existing?.isCompleted) {
      soundService.playZenBowl();
      confetti({ particleCount: 25, spread: 45, origin: { y: 0.8 } });
    }
  },

  decrementHabitCount: async (habitId, dateIso) => {
    const state = get();
    const habit = state.habits.find((h) => h.id === habitId);
    if (!habit) return;

    const existing = state.habitEntries.find((e) => e.habitId === habitId && e.dateIso === dateIso);
    const nextCount = Math.max(0, (existing?.currentCount || 0) - 1);
    const isCompleted = nextCount >= habit.targetCount;

    const entry: HabitEntry = {
      id: existing?.id || `ent_${Date.now()}`,
      habitId,
      dateIso,
      isCompleted,
      loggedDurationSeconds: existing?.loggedDurationSeconds || 0,
      currentCount: nextCount,
      isRestDay: false,
    };

    await db.habitEntries.put(entry);
    set((s) => ({
      habitEntries: existing ? s.habitEntries.map((e) => (e.id === entry.id ? entry : e)) : [...s.habitEntries, entry],
    }));
  },

  toggleHabitTimer: (habitId) => {
    const state = get();
    const current = state.activeHabitTimers[habitId] || { isRunning: false, elapsedSeconds: 0 };
    set((s) => ({
      activeHabitTimers: {
        ...s.activeHabitTimers,
        [habitId]: { ...current, isRunning: !current.isRunning },
      },
    }));
  },

  resetHabitTimer: (habitId) => {
    set((s) => ({
      activeHabitTimers: {
        ...s.activeHabitTimers,
        [habitId]: { isRunning: false, elapsedSeconds: 0 },
      },
    }));
  },

  deleteHabit: async (id) => {
    await db.habits.delete(id);
    set((state) => ({ habits: state.habits.filter((h) => h.id !== id) }));
  },

  // ---------------- COLLABORATION ----------------
  createCollabSpace: async (spaceName) => {
    const { currentUser } = get();
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();
    const space: CollabSpace = {
      id: `space_${Date.now()}`,
      name: spaceName,
      inviteCode: code,
      ownerId: currentUser?.id || 'user_default',
      members: [
        {
          id: currentUser?.id || 'user_default',
          name: currentUser?.displayName || 'Host',
          avatar: currentUser?.avatarEmoji || '🧘',
          joinedAt: Date.now(),
        },
      ],
      createdAt: Date.now(),
    };
    await db.collabSpaces.put(space);
    set({ collabSpace: space });
  },

  joinCollabSpace: async (inviteCode) => {
    const { currentUser } = get();
    const spaces = await db.collabSpaces.toArray();
    let space = spaces.find((s) => s.inviteCode.toUpperCase() === inviteCode.trim().toUpperCase());

    if (!space) {
      // Mock join if demo
      space = {
        id: `space_joined_${Date.now()}`,
        name: 'Accountability Circle',
        inviteCode: inviteCode.toUpperCase(),
        ownerId: 'partner_user',
        members: [
          { id: 'partner_user', name: 'Study Buddy', avatar: '🦁', joinedAt: Date.now() - 86400000 },
          { id: currentUser?.id || 'user_default', name: currentUser?.displayName || 'Me', avatar: currentUser?.avatarEmoji || '🧘', joinedAt: Date.now() },
        ],
        createdAt: Date.now(),
      };
      await db.collabSpaces.put(space);
    }

    set({ collabSpace: space });
    return true;
  },

  addCollabGoal: async (title, icon, color, type, targetPerMember) => {
    const { collabSpace } = get();
    if (!collabSpace) return;
    const goal: CollabGoal = {
      id: `cgoal_${Date.now()}`,
      spaceId: collabSpace.id,
      title,
      icon,
      color,
      type,
      targetPerMember,
      createdAt: Date.now(),
    };
    await db.collabGoals.put(goal);
    set((s) => ({ collabGoals: [...s.collabGoals, goal] }));
  },

  logCollabProgress: async (goalId, deltaValue) => {
    const { currentUser } = get();
    const entry: CollabGoalEntry = {
      id: `cgent_${Date.now()}`,
      goalId,
      userId: currentUser?.id || 'user_default',
      userName: currentUser?.displayName || 'Me',
      dateIso: getTodayIso(),
      value: deltaValue,
      completedAt: Date.now(),
    };
    await db.collabEntries.put(entry);
    set((s) => ({ collabEntries: [...s.collabEntries, entry] }));
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    soundService.playZenBowl();
  },

  sendCollabMessage: async (content, type, goalId) => {
    const { collabSpace, currentUser } = get();
    if (!collabSpace) return;
    const msg: CollabMessage = {
      id: `cmsg_${Date.now()}`,
      spaceId: collabSpace.id,
      goalId,
      fromUserId: currentUser?.id || 'user_default',
      fromUserName: currentUser?.displayName || 'Me',
      type,
      content,
      createdAt: Date.now(),
    };
    await db.collabMessages.put(msg);
    set((s) => ({ collabMessages: [...s.collabMessages, msg] }));

    if (type === 'BUZZ') {
      soundService.playZenBowl();
    }
  },

  sendCollabPraise: async (toUserId, goalId, type) => {
    const { collabSpace, currentUser } = get();
    if (!collabSpace) return;
    const praise: CollabPraise = {
      id: `cpraise_${Date.now()}`,
      spaceId: collabSpace.id,
      fromUserId: currentUser?.id || 'user_default',
      fromUserName: currentUser?.displayName || 'Me',
      toUserId,
      goalId,
      type,
      dateIso: getTodayIso(),
    };
    await db.collabPraises.put(praise);
    set((s) => ({ collabPraises: [...s.collabPraises, praise] }));
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.5 } });
  },

  // ---------------- ENCRYPTED DIARY ----------------
  setupDiaryPin: async (pin) => {
    const { currentUser } = get();
    if (!currentUser) return;
    const salt = CryptoService.generateSalt();
    const pinHash = await CryptoService.hashPin(pin, salt);
    const updatedUser: UserProfile = {
      ...currentUser,
      diaryPinHash: pinHash,
      diarySalt: salt,
    };
    await db.users.put(updatedUser);
    set({
      currentUser: updatedUser,
      diaryUnlocked: true,
      activeDiaryPin: pin,
    });
  },

  unlockDiary: async (pin) => {
    const { currentUser } = get();
    if (!currentUser?.diaryPinHash || !currentUser.diarySalt) return false;
    const testHash = await CryptoService.hashPin(pin, currentUser.diarySalt);
    if (testHash === currentUser.diaryPinHash) {
      set({ diaryUnlocked: true, activeDiaryPin: pin });
      return true;
    }
    return false;
  },

  lockDiary: () => set({ diaryUnlocked: false, activeDiaryPin: null }),

  saveDiaryEntry: async (payload, dateIso) => {
    const { activeDiaryPin, currentUser } = get();
    if (!activeDiaryPin || !currentUser) throw new Error('Diary locked');

    const encrypted = await CryptoService.encrypt(payload, activeDiaryPin);
    const entry: EncryptedDiaryEntry = {
      id: `diary_${dateIso}`,
      userId: currentUser.id,
      dateIso,
      encryptedPayload: encrypted.ciphertext,
      salt: encrypted.salt,
      iv: encrypted.iv,
      updatedAt: Date.now(),
    };

    await db.diaryEntries.put(entry);
    set((s) => ({
      diaryEntries: [entry, ...s.diaryEntries.filter((e) => e.dateIso !== dateIso)],
    }));
  },

  deleteDiaryEntry: async (id) => {
    await db.diaryEntries.delete(id);
    set((s) => ({ diaryEntries: s.diaryEntries.filter((e) => e.id !== id) }));
  },

  // ---------------- AI & REPORTS ----------------
  dismissWeeklyReport: () => {
    set((s) => ({
      weeklyReport: s.weeklyReport ? { ...s.weeklyReport, isDismissed: true } : null,
    }));
  },

  refreshAiInsight: () => {
    const state = get();
    const topSub = state.subjects[0]?.name || 'Deep Work';
    const dynamicInsights: BehavioralInsight[] = [
      {
        category: 'PEAK_PERFORMANCE',
        confidence: 96,
        headline: `${topSub} Flow Acceleration`,
        analysis: `Your study logs show consistent high-quality blocks for ${topSub}. Circadian rhythm aligns strongly with early mornings.`,
        actionableTip: `Lock in a 45-minute distraction-free session for ${topSub} tomorrow before noon.`,
      },
      {
        category: 'MOMENTUM',
        confidence: 92,
        headline: 'Habit Compounding In Effect',
        analysis: `You have completed ${state.habitEntries.filter((e) => e.isCompleted).length} cumulative habits. Consistency score is trending +14% higher.`,
        actionableTip: 'Keep habit chains alive — even 2 minutes on busy days prevents streak collapse.',
      },
      {
        category: 'CONSISTENCY',
        confidence: 89,
        headline: 'Dual-Lens Harmony',
        analysis: 'Balance between deep focus subjects and foundational daily habits is at an optimal equilibrium.',
        actionableTip: 'Review your weekly report each Monday to consolidate behavioral gains.',
      },
    ];

    const randomPick = dynamicInsights[Math.floor(Math.random() * dynamicInsights.length)];
    set({ insight: randomPick });
    soundService.playZenBowl();
  },
}));
