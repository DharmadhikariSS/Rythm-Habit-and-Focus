import { ALL_BADGES } from '../data/badges';
import { Subject, Habit, HabitEntry, StudySession, UserBadgeRecord } from '../types';

export class MilestoneEngine {
  public static evaluateBadges(params: {
    existingBadges: UserBadgeRecord[];
    subjects: Subject[];
    habits: Habit[];
    habitEntries: HabitEntry[];
    sessions: StudySession[];
  }): UserBadgeRecord[] {
    const { existingBadges, habits, habitEntries, sessions } = params;
    const existingBadgeIds = new Set(existingBadges.map((b) => b.badgeId));
    const newlyUnlocked: UserBadgeRecord[] = [];

    const unlock = (badgeId: string) => {
      if (!existingBadgeIds.has(badgeId)) {
        existingBadgeIds.add(badgeId);
        newlyUnlocked.push({
          badgeId,
          unlockedAt: Date.now(),
          seen: false,
        });
      }
    };

    // 1. First sessions & categories
    if (sessions.length > 0) {
      unlock('first_study');
    }

    const completedEntries = habitEntries.filter((e) => e.isCompleted);
    if (completedEntries.length > 0) {
      unlock('first_mindfulness');
    }

    // 2. Accumulation milestones
    const totalHabitsCompleted = completedEntries.length;
    if (totalHabitsCompleted >= 100) unlock('habits_100');
    if (totalHabitsCompleted >= 365) unlock('habits_365');
    if (totalHabitsCompleted >= 500) unlock('habits_500');
    if (totalHabitsCompleted >= 1000) unlock('habits_1000');
    if (totalHabitsCompleted >= 2000) unlock('habits_2000');
    if (totalHabitsCompleted >= 4000) unlock('habits_4000');

    // 3. Streaks
    const longestStreak = habits.reduce((max, h) => Math.max(max, h.streakDays || 0, h.bestStreak || 0), 0);
    if (longestStreak >= 7) {
      unlock('seven_habit_week');
      unlock('longest_habit_streak');
    }

    // 4. Productivity multipliers
    const todayIso = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter((s) => s.dateIso === todayIso);
    const todayFocusMinutes = todaySessions.reduce((sum, s) => sum + Math.round(s.durationSeconds / 60), 0);

    if (todayFocusMinutes >= 120) unlock('multiplier_200');
    if (todayFocusMinutes >= 240) unlock('multiplier_300');
    if (todayFocusMinutes >= 360) unlock('multiplier_400');
    if (todayFocusMinutes >= 60) unlock('new_focus_record');

    const todayCompletedHabits = completedEntries.filter((e) => e.dateIso === todayIso).length;
    if (todayCompletedHabits >= 5) unlock('new_habit_record');

    // 5. Seasonal checks (based on current date)
    const now = new Date();
    const month = now.getMonth(); // 0-indexed
    const day = now.getDate();

    // World Mental Health Day (Oct 10 -> Month 9)
    if (month === 9 && day === 10) {
      if (todayFocusMinutes >= 30) unlock('mind_over_matter');
    }

    // Earth Day (Apr 22 -> Month 3)
    if (month === 3 && day === 22) {
      if (todayCompletedHabits >= 1) unlock('spring_clean_routine');
    }

    // November Gratitude (Month 10)
    if (month === 10 && longestStreak >= 7) {
      unlock('gratitude_streak');
    }

    // January New Year (Month 0)
    if (month === 0 && day <= 7 && longestStreak >= 7) {
      unlock('new_year_new_me');
    }

    return newlyUnlocked;
  }

  public static getBadgeDetails(badgeId: string) {
    return ALL_BADGES.find((b) => b.id === badgeId);
  }
}
