import { BehavioralInsight, Habit, HabitEntry, StudySession } from '../types';

export class BehavioralIntelligenceEngine {
  public static analyze(
    habits: Habit[],
    entries: HabitEntry[],
    sessions: StudySession[],
    todayIso: string
  ): BehavioralInsight {
    const todayEntries = entries.filter(e => e.dateIso === todayIso);
    const todayCompletedCount = todayEntries.filter(e => e.isCompleted).length;
    const totalHabitsCount = habits.length;

    const todaySessions = sessions.filter(s => s.dateIso === todayIso);
    const todayFocusMinutes = Math.round(
      todaySessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60
    );

    const past7DaysSessions = sessions.filter(s => {
      const diffDays = (Date.now() - s.completedAt) / 86400000;
      return diffDays <= 7;
    });
    const past7DaysFocusMinutes = Math.round(
      past7DaysSessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60
    );

    const maxStreak = habits.reduce((max, h) => Math.max(max, h.streakDays), 0);

    // Time of day distribution
    const timeDist = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    sessions.forEach(s => {
      const hour = new Date(s.completedAt).getHours();
      const mins = Math.round(s.durationSeconds / 60);
      if (hour >= 5 && hour < 12) timeDist.morning += mins;
      else if (hour >= 12 && hour < 17) timeDist.afternoon += mins;
      else if (hour >= 17 && hour < 22) timeDist.evening += mins;
      else timeDist.night += mins;
    });

    const dominantChronotype = Object.entries(timeDist).reduce(
      (best, [period, mins]) => (mins > best.mins ? { period, mins } : best),
      { period: 'morning', mins: -1 }
    ).period;

    // Rule 1: High Momentum Streak
    if (maxStreak >= 5) {
      return {
        category: 'MOMENTUM',
        confidence: 94,
        headline: `${maxStreak}-Day Streak in Flow State`,
        analysis: `Your consistency is compounding significantly across your habits. Maintaining a ${maxStreak}-day streak demonstrates strong neural habit formation and intrinsic motivation.`,
        actionableTip: `Protect your streak anchor: complete your easiest micro-habit early in your ${dominantChronotype} block to secure today's rhythm momentum.`,
      };
    }

    // Rule 2: Peak Performance
    if (todayFocusMinutes >= 45 && todayCompletedCount >= Math.min(2, totalHabitsCount)) {
      return {
        category: 'PEAK_PERFORMANCE',
        confidence: 92,
        headline: 'Optimal Deep Work Synergy Achieved',
        analysis: `You have logged ${todayFocusMinutes} mindful focus minutes while checking off ${todayCompletedCount} key routines today. Your focus sessions are creating high kinetic momentum for your daily rhythm.`,
        actionableTip: `Take a 10-minute mindful pause. Avoid task-switching while your working memory is in this heightened state of cognitive clarity.`,
      };
    }

    // Rule 3: Chronotype Peak
    if (past7DaysFocusMinutes >= 60) {
      const chronotypeCap = dominantChronotype.charAt(0).toUpperCase() + dominantChronotype.slice(1);
      return {
        category: 'HABIT_ALIGNMENT',
        confidence: 88,
        headline: `${chronotypeCap} Chronotype Anchor`,
        analysis: `Behavioral clustering indicates your deepest cognitive resonance occurs during the ${dominantChronotype} (${timeDist[dominantChronotype as keyof typeof timeDist]}m recorded). Scheduling rigorous study blocks here yields lowest friction.`,
        actionableTip: `Block out high-cognitive load study timers specifically during your ${dominantChronotype} window, saving administrative routines for later.`,
      };
    }

    // Rule 4: Consistent Progress
    if (totalHabitsCount > 0 && todayCompletedCount > 0) {
      return {
        category: 'CONSISTENCY',
        confidence: 85,
        headline: 'Steady Foundations Emerging',
        analysis: `You have already begun checking off routines today. Small, deliberate commitments build long-term neuroplasticity more reliably than sporadic bursts.`,
        actionableTip: `Try pairing your next habit directly with a 25-minute study stopwatch block to lock in a compound reward loop.`,
      };
    }

    // Fallback
    return {
      category: 'EARLY_EXPLORATION',
      confidence: 80,
      headline: 'Awakening Your Daily Rhythm',
      analysis: 'As you complete study timers and daily habits, the on-device AI behavioral engine will detect your natural chronotype, peak flow hours, and habit synergy.',
      actionableTip: 'Start with a single focus timer or check off a foundational starter habit to begin mapping your rhythm.',
    };
  }
}
