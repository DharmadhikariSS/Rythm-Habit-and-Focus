import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Subject, Habit, HabitEntry, StudySession, NavTab, AnalyticsLens, Timeframe, BehavioralInsight } from '../types';
import { storage } from '../services/storage';
import { soundService } from '../services/sound';
import { BehavioralIntelligenceEngine } from '../services/aiEngine';

interface AppContextType {
  subjects: Subject[];
  habits: Habit[];
  habitEntries: HabitEntry[];
  sessions: StudySession[];
  activeTab: NavTab;
  selectedDate: string;
  activeLens: AnalyticsLens;
  timeframe: Timeframe;
  insight: BehavioralInsight;
  activeHabitTimers: Record<string, { isRunning: boolean; elapsedSeconds: number }>;
  todayDate: string;
  setActiveTab: (tab: NavTab) => void;
  setSelectedDate: (date: string) => void;
  setActiveLens: (lens: AnalyticsLens) => void;
  setTimeframe: (tf: Timeframe) => void;
  // Subject actions
  addSubject: (name: string, color: string, targetWeeklyHours: number) => void;
  toggleSubjectTimer: (id: string) => void;
  stopAndSaveSubjectTimer: (id: string) => void;
  deleteSubject: (id: string) => void;
  // Habit actions
  addHabit: (habit: Omit<Habit, 'id' | 'streakDays' | 'bestStreak' | 'createdAt'>) => void;
  toggleHabitCheck: (habitId: string, dateIso: string) => void;
  toggleHabitRestDay: (habitId: string, dateIso: string) => void;
  incrementHabitCount: (habitId: string, dateIso: string) => void;
  decrementHabitCount: (habitId: string, dateIso: string) => void;
  toggleHabitTimer: (habitId: string) => void;
  resetHabitTimer: (habitId: string) => void;
  deleteHabit: (id: string) => void;
  // Export
  exportData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getTodayIso = (): string => new Date().toISOString().split('T')[0];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useState<Subject[]>(() => storage.getSubjects());
  const [habits, setHabits] = useState<Habit[]>(() => storage.getHabits());
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>(() => storage.getEntries());
  const [sessions, setSessions] = useState<StudySession[]>(() => storage.getSessions());
  const [activeTab, setActiveTab] = useState<NavTab>('timers');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayIso());
  const [activeLens, setActiveLens] = useState<AnalyticsLens>('SUBJECTS');
  const [timeframe, setTimeframe] = useState<Timeframe>('TODAY');
  const [activeHabitTimers, setActiveHabitTimers] = useState<Record<string, { isRunning: boolean; elapsedSeconds: number }>>({});

  const todayDate = getTodayIso();

  // Storage persistence
  useEffect(() => { storage.saveSubjects(subjects); }, [subjects]);
  useEffect(() => { storage.saveHabits(habits); }, [habits]);
  useEffect(() => { storage.saveEntries(habitEntries); }, [habitEntries]);
  useEffect(() => { storage.saveSessions(sessions); }, [sessions]);

  // Master Stopwatch Runner
  const subjectsRef = useRef(subjects);
  subjectsRef.current = subjects;
  const habitTimersRef = useRef(activeHabitTimers);
  habitTimersRef.current = activeHabitTimers;

  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Tick running subjects
      const hasRunningSubjects = subjectsRef.current.some(s => s.isRunning);
      if (hasRunningSubjects) {
        setSubjects(prev =>
          prev.map(s => (s.isRunning ? { ...s, totalElapsedMs: s.totalElapsedMs + 1000 } : s))
        );
      }

      // 2. Tick running in-card habit timers
      const runningHabitIds = Object.keys(habitTimersRef.current).filter(
        id => habitTimersRef.current[id]?.isRunning
      );
      if (runningHabitIds.length > 0) {
        setActiveHabitTimers(prev => {
          const updated = { ...prev };
          runningHabitIds.forEach(id => {
            if (updated[id]?.isRunning) {
              updated[id] = {
                ...updated[id],
                elapsedSeconds: updated[id].elapsedSeconds + 1,
              };
            }
          });
          return updated;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Subject Handlers
  const addSubject = (name: string, color: string, targetWeeklyHours: number) => {
    const newSub: Subject = {
      id: `sub-${Date.now()}`,
      name: name.trim() || 'Focus Subject',
      color,
      targetWeeklyHours,
      totalElapsedMs: 0,
      isRunning: false,
    };
    setSubjects(prev => [...prev, newSub]);
  };

  const toggleSubjectTimer = (id: string) => {
    setSubjects(prev =>
      prev.map(s => (s.id === id ? { ...s, isRunning: !s.isRunning } : s))
    );
  };

  const stopAndSaveSubjectTimer = (id: string) => {
    const target = subjects.find(s => s.id === id);
    if (!target || target.totalElapsedMs <= 0) return;

    soundService.playZenBowl();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#437A55', '#386B80', '#52B788', '#B55D46']
    });

    const durationSeconds = Math.max(1, Math.round(target.totalElapsedMs / 1000));
    const newSession: StudySession = {
      id: `sess-${Date.now()}`,
      subjectId: target.id,
      subjectName: target.name,
      durationSeconds,
      completedAt: Date.now(),
      subjectColor: target.color,
      dateIso: getTodayIso(),
    };

    setSessions(prev => [newSession, ...prev]);
    setSubjects(prev =>
      prev.map(s => (s.id === id ? { ...s, isRunning: false, totalElapsedMs: 0 } : s))
    );
  };

  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  // Habit Handlers
  const addHabit = (habitData: Omit<Habit, 'id' | 'streakDays' | 'bestStreak' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: `habit-${Date.now()}`,
      streakDays: 0,
      bestStreak: 0,
      createdAt: Date.now(),
    };
    setHabits(prev => [...prev, newHabit]);
  };

  const toggleHabitCheck = (habitId: string, dateIso: string) => {
    soundService.playGentleTap();

    let newCompletedState = false;
    setHabitEntries(prev => {
      const existing = prev.find(e => e.habitId === habitId && e.dateIso === dateIso);
      if (existing) {
        newCompletedState = !existing.isCompleted;
        return prev.map(e =>
          e.id === existing.id ? { ...e, isCompleted: newCompletedState } : e
        );
      } else {
        newCompletedState = true;
        const newEntry: HabitEntry = {
          id: `entry-${Date.now()}`,
          habitId,
          dateIso,
          isCompleted: true,
          loggedDurationSeconds: 0,
          currentCount: 0,
          isRestDay: false,
        };
        return [...prev, newEntry];
      }
    });

    if (dateIso === todayDate) {
      setHabits(prev =>
        prev.map(h => {
          if (h.id !== habitId) return h;
          const updated = newCompletedState ? h.streakDays + 1 : Math.max(0, h.streakDays - 1);
          return {
            ...h,
            streakDays: updated,
            bestStreak: Math.max(h.bestStreak, updated),
          };
        })
      );
    }
  };

  const toggleHabitRestDay = (habitId: string, dateIso: string) => {
    setHabitEntries(prev => {
      const existing = prev.find(e => e.habitId === habitId && e.dateIso === dateIso);
      if (existing) {
        return prev.map(e => (e.id === existing.id ? { ...e, isRestDay: !e.isRestDay } : e));
      } else {
        return [
          ...prev,
          {
            id: `entry-${Date.now()}`,
            habitId,
            dateIso,
            isCompleted: false,
            loggedDurationSeconds: 0,
            currentCount: 0,
            isRestDay: true,
          },
        ];
      }
    });
  };

  const incrementHabitCount = (habitId: string, dateIso: string) => {
    soundService.playGentleTap();
    setHabitEntries(prev => {
      const existing = prev.find(e => e.habitId === habitId && e.dateIso === dateIso);
      const targetHabit = habits.find(h => h.id === habitId);
      const targetCount = targetHabit?.targetCount || 1;

      if (existing) {
        const nextCount = existing.currentCount + 1;
        const isCompleted = nextCount >= targetCount;
        return prev.map(e =>
          e.id === existing.id ? { ...e, currentCount: nextCount, isCompleted } : e
        );
      } else {
        const nextCount = 1;
        const isCompleted = nextCount >= targetCount;
        return [
          ...prev,
          {
            id: `entry-${Date.now()}`,
            habitId,
            dateIso,
            isCompleted,
            loggedDurationSeconds: 0,
            currentCount: nextCount,
            isRestDay: false,
          },
        ];
      }
    });
  };

  const decrementHabitCount = (habitId: string, dateIso: string) => {
    setHabitEntries(prev => {
      const existing = prev.find(e => e.habitId === habitId && e.dateIso === dateIso);
      const targetHabit = habits.find(h => h.id === habitId);
      const targetCount = targetHabit?.targetCount || 1;

      if (existing && existing.currentCount > 0) {
        const nextCount = existing.currentCount - 1;
        const isCompleted = nextCount >= targetCount;
        return prev.map(e =>
          e.id === existing.id ? { ...e, currentCount: nextCount, isCompleted } : e
        );
      }
      return prev;
    });
  };

  const toggleHabitTimer = (habitId: string) => {
    setActiveHabitTimers(prev => {
      const cur = prev[habitId] || { isRunning: false, elapsedSeconds: 0 };
      return {
        ...prev,
        [habitId]: { ...cur, isRunning: !cur.isRunning },
      };
    });
  };

  const resetHabitTimer = (habitId: string) => {
    setActiveHabitTimers(prev => ({
      ...prev,
      [habitId]: { isRunning: false, elapsedSeconds: 0 },
    }));
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    setHabitEntries(prev => prev.filter(e => e.habitId !== id));
  };

  const exportData = () => {
    storage.exportCSV(habits, habitEntries, subjects, sessions);
  };

  const insight = BehavioralIntelligenceEngine.analyze(habits, habitEntries, sessions, todayDate);

  return (
    <AppContext.Provider
      value={{
        subjects,
        habits,
        habitEntries,
        sessions,
        activeTab,
        selectedDate,
        activeLens,
        timeframe,
        insight,
        activeHabitTimers,
        todayDate,
        setActiveTab,
        setSelectedDate,
        setActiveLens,
        setTimeframe,
        addSubject,
        toggleSubjectTimer,
        stopAndSaveSubjectTimer,
        deleteSubject,
        addHabit,
        toggleHabitCheck,
        toggleHabitRestDay,
        incrementHabitCount,
        decrementHabitCount,
        toggleHabitTimer,
        resetHabitTimer,
        deleteHabit,
        exportData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
