import Dexie, { Table } from 'dexie';
import {
  Subject,
  Habit,
  HabitEntry,
  StudySession,
  UserProfile,
  UserBadgeRecord,
  CollabSpace,
  CollabGoal,
  CollabGoalEntry,
  CollabMessage,
  CollabPraise,
  EncryptedDiaryEntry,
  WeeklyRhythmReport,
  SyncOp,
} from '../types';

export class RhythmDatabase extends Dexie {
  users!: Table<UserProfile, string>;
  subjects!: Table<Subject, string>;
  habits!: Table<Habit, string>;
  habitEntries!: Table<HabitEntry, string>;
  sessions!: Table<StudySession, string>;
  badges!: Table<UserBadgeRecord & { id?: string; userId: string }, string>;
  collabSpaces!: Table<CollabSpace, string>;
  collabGoals!: Table<CollabGoal, string>;
  collabEntries!: Table<CollabGoalEntry, string>;
  collabMessages!: Table<CollabMessage, string>;
  collabPraises!: Table<CollabPraise, string>;
  diaryEntries!: Table<EncryptedDiaryEntry, string>;
  weeklyReports!: Table<WeeklyRhythmReport, string>;
  syncQueue!: Table<SyncOp, number>;

  constructor() {
    super('RhythmDatabase_v2');
    this.version(1).stores({
      users: 'id, username, createdAt',
      subjects: 'id, userId, isRunning',
      habits: 'id, userId, type, category',
      habitEntries: 'id, habitId, dateIso',
      sessions: 'id, userId, subjectId, dateIso, completedAt',
      badges: 'id, userId, badgeId, unlockedAt',
      collabSpaces: 'id, inviteCode, ownerId',
      collabGoals: 'id, spaceId, type',
      collabEntries: 'id, goalId, userId, dateIso',
      collabMessages: 'id, spaceId, createdAt',
      collabPraises: 'id, spaceId, toUserId, dateIso',
      diaryEntries: 'id, userId, dateIso, updatedAt',
      weeklyReports: 'id, userId, weekStartIso',
      syncQueue: '++id, table, action, createdAt',
    });
  }
}

export const db = new RhythmDatabase();
