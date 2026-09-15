import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Timer, Habit, HabitLog, SessionRecord, NavTab, BehavioralInsight } from '../types';
import { storage } from '../services/storage';
import { soundService } from '../services/sound';
import { BehavioralIntelligenceEngine } from '../services/aiEngine';

interface AppContextType {
  timers: Timer[];
  habits: Habit[];
  habitLogs: HabitLog[];
  sessions: SessionRecord[];
  activeTab: NavTab;
  selectedDate: string;
  insight: BehavioralInsight;
  setActiveTab: (tab: NavTab) => void;
  setSelectedDate: (date: string) => void;
  addTimer: (title: string, minutes: number, category: string, color?: string) => void;
  startTimer: (id: string) => void;
  pauseTimer: (id: string) => void;
  resetTimer: (id: string) => void;
  completeTimer: (id: string) => void;
  deleteTimer: (id: string) => void;
  addHabit: (title: string, type: 'check' | 'duration', targetMinutes: number, frequency?: string, color?: string) => void;
  toggleHabit: (habitId: string, date: string) => void;
  deleteHabit: (id: string) => void;
  exportData: () => void;
  todayDate: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getTodayFormatted = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timers, setTimers] = useState<Timer[]>(() => storage.getTimers());
  const [habits, setHabits] = useState<Habit[]>(() => storage.getHabits());
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>(() => storage.getHabitLogs());
  const [sessions, setSessions] = useState<SessionRecord[]>(() => storage.getSessions());
  const [activeTab, setActiveTab] = useState<NavTab>('timers');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayFormatted());

  const todayDate = getTodayFormatted();

  // Save to storage on changes
  useEffect(() => {
    storage.saveTimers(timers);
  }, [timers]);

  useEffect(() => {
    storage.saveHabits(habits);
  }, [habits]);

  useEffect(() => {
    storage.saveHabitLogs(habitLogs);
  }, [habitLogs]);

  useEffect(() => {
    storage.saveSessions(sessions);
  }, [sessions]);

  // Real-time Timer Interval Tick
  const timersRef = useRef(timers);
  timersRef.current = timers;

  useEffect(() => {
    const interval = setInterval(() => {
      const running = timersRef.current.filter(t => t.status === 'running');
      if (running.length === 0) return;

      setTimers(prevTimers =>
        prevTimers.map(timer => {
          if (timer.status !== 'running') return timer;

          const nextRemaining = timer.remainingSeconds - 1;
          if (nextRemaining <= 0) {
            // Timer Completed!
            soundService.playZenBowl();
            confetti({
              particleCount: 60,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#2D5A43', '#52B788', '#74C69D', '#E8EFE9']
            });

            // Log focus session record
            const durationMins = Math.max(1, Math.round(timer.totalSeconds / 60));
            const newSession: SessionRecord = {
              id: `session-${Date.now()}`,
              timerTitle: timer.title,
              durationMinutes: durationMins,
              completedAt: Date.now(),
              category: timer.category,
              date: getTodayFormatted(),
            };
            setSessions(prev => [newSession, ...prev]);

            return {
              ...timer,
              remainingSeconds: 0,
              status: 'completed' as const,
            };
          }

          return {
            ...timer,
            remainingSeconds: nextRemaining,
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Timer Handlers
  const addTimer = (title: string, minutes: number, category: string, color = '#2D5A43') => {
    const totalSecs = Math.max(60, minutes * 60);
    const newTimer: Timer = {
      id: `timer-${Date.now()}`,
      title: title.trim() || 'Focus Session',
      totalSeconds: totalSecs,
      remainingSeconds: totalSecs,
      status: 'idle',
      category: category || 'Study',
      color,
      createdAt: Date.now(),
    };
    setTimers(prev => [newTimer, ...prev]);
  };

  const startTimer = (id: string) => {
    setTimers(prev =>
      prev.map(t => {
        if (t.id === id) {
          const rem = t.remainingSeconds <= 0 ? t.totalSeconds : t.remainingSeconds;
          return { ...t, remainingSeconds: rem, status: 'running' };
        }
        return t;
      })
    );
  };

  const pauseTimer = (id: string) => {
    setTimers(prev =>
      prev.map(t => (t.id === id ? { ...t, status: 'paused' } : t))
    );
  };

  const resetTimer = (id: string) => {
    setTimers(prev =>
      prev.map(t => (t.id === id ? { ...t, remainingSeconds: t.totalSeconds, status: 'idle' } : t))
    );
  };

  const completeTimer = (id: string) => {
    const target = timers.find(t => t.id === id);
    if (!target) return;

    soundService.playZenBowl();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#2D5A43', '#52B788', '#74C69D']
    });

    const elapsedSeconds = target.totalSeconds - target.remainingSeconds;
    const durationMins = Math.max(1, Math.round((elapsedSeconds > 0 ? elapsedSeconds : target.totalSeconds) / 60));

    const newSession: SessionRecord = {
      id: `session-${Date.now()}`,
      timerTitle: target.title,
      durationMinutes: durationMins,
      completedAt: Date.now(),
      category: target.category,
      date: getTodayFormatted(),
    };
    setSessions(prev => [newSession, ...prev]);

    setTimers(prev =>
      prev.map(t => (t.id === id ? { ...t, remainingSeconds: 0, status: 'completed' } : t))
    );
  };

  const deleteTimer = (id: string) => {
    setTimers(prev => prev.filter(t => t.id !== id));
  };

  // Habit Handlers
  const addHabit = (
    title: string,
    type: 'check' | 'duration',
    targetMinutes: number,
    frequency = 'Daily',
    color = '#2D5A43'
  ) => {
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      title: title.trim(),
      type,
      targetDurationMinutes: targetMinutes,
      frequency,
      color,
      streakCurrent: 0,
      streakBest: 0,
      createdAt: Date.now(),
    };
    setHabits(prev => [...prev, newHabit]);
  };

  const toggleHabit = (habitId: string, date: string) => {
    soundService.playGentleTap();

    let newCompletedState = false;
    setHabitLogs(prev => {
      const existing = prev.find(l => l.habitId === habitId && l.date === date);
      if (existing) {
        newCompletedState = !existing.completed;
        return prev.map(l =>
          l.id === existing.id ? { ...l, completed: newCompletedState } : l
        );
      } else {
        newCompletedState = true;
        const newLog: HabitLog = {
          id: `log-${Date.now()}`,
          habitId,
          date,
          completed: true,
          durationMinutes: 0,
        };
        return [...prev, newLog];
      }
    });

    // Update streak if toggling today's log
    if (date === todayDate) {
      setHabits(prev =>
        prev.map(h => {
          if (h.id !== habitId) return h;
          const updatedCurrent = newCompletedState ? h.streakCurrent + 1 : Math.max(0, h.streakCurrent - 1);
          const updatedBest = Math.max(h.streakBest, updatedCurrent);
          return {
            ...h,
            streakCurrent: updatedCurrent,
            streakBest: updatedBest,
          };
        })
      );
    }
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    setHabitLogs(prev => prev.filter(l => l.habitId !== id));
  };

  const exportData = () => {
    storage.exportCSV(sessions, habitLogs);
  };

  // Compute AI behavioral insight
  const insight = BehavioralIntelligenceEngine.analyze(habits, habitLogs, sessions, todayDate);

  return (
    <AppContext.Provider
      value={{
        timers,
        habits,
        habitLogs,
        sessions,
        activeTab,
        selectedDate,
        insight,
        setActiveTab,
        setSelectedDate,
        addTimer,
        startTimer,
        pauseTimer,
        resetTimer,
        completeTimer,
        deleteTimer,
        addHabit,
        toggleHabit,
        deleteHabit,
        exportData,
        todayDate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
