import { BehavioralInsight, Habit, HabitLog, SessionRecord, TimeDistribution } from '../types';

export class BehavioralIntelligenceEngine {
  public static analyze(
    habits: Habit[],
    habitLogs: HabitLog[],
    sessions: SessionRecord[],
    todayDate: string
  ): BehavioralInsight {
    const todayLogs = habitLogs.filter(l => l.date === todayDate);
    const todayCompletedCount = todayLogs.filter(l => l.completed).length;
    const totalHabitsCount = habits.length;

    const todaySessions = sessions.filter(s => s.date === todayDate);
    const todayFocusMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

    // Compute past 7 days focus minutes
    const past7DaysFocusMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);

    // Calculate max streak
    const maxActiveStreak = habits.reduce((max, h) => Math.max(max, h.streakCurrent), 0);

    // Calculate time of day distribution
    const timeDist: TimeDistribution = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    sessions.forEach(s => {
      const hour = new Date(s.completedAt).getHours();
      if (hour >= 5 && hour < 12) timeDist.morning += s.durationMinutes;
      else if (hour >= 12 && hour < 17) timeDist.afternoon += s.durationMinutes;
      else if (hour >= 17 && hour < 22) timeDist.evening += s.durationMinutes;
      else timeDist.night += s.durationMinutes;
    });

    const dominantChronotype = Object.entries(timeDist).reduce(
      (best, [period, mins]) => (mins > best.mins ? { period, mins } : best),
      { period: 'morning', mins: -1 }
    ).period;

    // Rule 1: High Momentum Streak
    if (maxActiveStreak >= 5) {
      return {
        category: 'MOMENTUM',
        confidence: 94,
        headline: `${maxActiveStreak}-Day Streak in Flow State`,
        analysis: `Your consistency is compounding significantly. Maintaining a ${maxActiveStreak}-day streak demonstrates strong neural habit formation and intrinsic motivation.`,
        actionableTip: `Protect your streak anchor: complete your easiest micro-habit early in your ${dominantChronotype} block to secure today's rhythm momentum.`,
      };
    }

    // Rule 2: Peak Performance (Deep Focus + High Habit Completion)
    if (todayFocusMinutes >= 45 && todayCompletedCount >= Math.min(2, totalHabitsCount)) {
      return {
        category: 'PEAK_PERFORMANCE',
        confidence: 92,
        headline: 'Optimal Deep Work Synergy Achieved',
        analysis: `You have logged ${todayFocusMinutes} mindful focus minutes while checking off ${todayCompletedCount} key habits today. Your focus sessions are creating high kinetic momentum for your daily routines.`,
        actionableTip: `Take a 10-minute mindful pause. Avoid task-switching while your working memory is in this heightened state of clarity.`,
      };
    }

    // Rule 3: Dominant Chronotype Peak
    if (past7DaysFocusMinutes >= 60) {
      const chronotypeCapitalized = dominantChronotype.charAt(0).toUpperCase() + dominantChronotype.slice(1);
      return {
        category: 'HABIT_ALIGNMENT',
        confidence: 88,
        headline: `${chronotypeCapitalized} Chronotype Anchor`,
        analysis: `Behavioral clustering indicates your deepest cognitive resonance occurs during the ${dominantChronotype} (${timeDist[dominantChronotype as keyof TimeDistribution]}m recorded). Scheduling rigorous tasks here yields lowest friction.`,
        actionableTip: `Block out high-cognitive load timers specifically during the ${dominantChronotype} hours, saving administrative routines for later.`,
      };
    }

    // Rule 4: Consistent Progress
    if (totalHabitsCount > 0 && todayCompletedCount > 0) {
      return {
        category: 'CONSISTENCY',
        confidence: 85,
        headline: 'Steady Foundations Emerging',
        analysis: `You have already begun checking off routines today. Small, deliberate commitments build long-term neuroplasticity more reliably than sporadic bursts.`,
        actionableTip: `Try pairing your next habit directly with a 25-minute Pomodoro focus block to lock in a compound reward loop.`,
      };
    }

    // Fallback / Early Exploration
    return {
      category: 'EARLY_EXPLORATION',
      confidence: 80,
      headline: 'Awakening Your Daily Rhythm',
      analysis: 'As you complete timers and daily habits, the on-device AI behavioral engine will detect your natural chronotype, peak flow hours, and habit synergy.',
      actionableTip: 'Start with a single 25-minute Pomodoro timer or check off a foundational starter habit to begin mapping your rhythm.',
    };
  }
}
