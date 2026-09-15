import React, { useState } from 'react';
import {
  Users,
  Plus,
  Zap,
  MessageSquare,
  Award,
  Flame,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Trophy,
  Shield,
  Heart,
} from 'lucide-react';
import { useRhythmStore } from '../store/useRhythmStore';
import { PraiseType } from '../types';

export const CollabScreen: React.FC = () => {
  const {
    collabSpace,
    collabGoals,
    collabEntries,
    collabMessages,
    collabPraises,
    currentUser,
    createCollabSpace,
    joinCollabSpace,
    addCollabGoal,
    logCollabProgress,
    sendCollabMessage,
    sendCollabPraise,
    sessions,
    habits,
    habitEntries,
  } = useRhythmStore();

  const [activeSubTab, setActiveSubTab] = useState<'goals' | 'chat' | 'leaderboard'>('goals');
  const [newSpaceName, setNewSpaceName] = useState('');
  const [inviteInput, setInviteInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // New Goal Modal state
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalIcon, setGoalIcon] = useState('🎯');
  const [goalType, setGoalType] = useState<'HABIT' | 'FOCUS_HOURS'>('FOCUS_HOURS');
  const [goalTarget, setGoalTarget] = useState(120);

  // Chat message input
  const [chatText, setChatText] = useState('');

  // Praise modal
  const [praisingMember, setPraisingMember] = useState<{ id: string; name: string } | null>(null);

  const copyInvite = () => {
    if (!collabSpace) return;
    navigator.clipboard.writeText(collabSpace.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleAddGoal = async () => {
    if (!goalTitle.trim()) return;
    await addCollabGoal(goalTitle.trim(), goalIcon, '#386B80', goalType, Number(goalTarget));
    setIsAddingGoal(false);
    setGoalTitle('');
  };

  const handleSendMessage = async () => {
    if (!chatText.trim()) return;
    await sendCollabMessage(chatText.trim(), 'NOTE');
    setChatText('');
  };

  const handleBuzz = async () => {
    await sendCollabMessage('⚡ Buzz! Time to lock into deep focus.', 'BUZZ');
  };

  // ---------------- NO ACTIVE SPACE (ONBOARDING) ----------------
  if (!collabSpace) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-3xl bg-accent-emerald/10 text-accent-emerald mx-auto flex items-center justify-center text-2xl shadow-inner">
            🤝
          </div>
          <h2 className="text-xl font-bold text-zen-text tracking-tight">Collaboration Hub</h2>
          <p className="text-xs text-zen-muted max-w-xs mx-auto leading-relaxed">
            Team up with a study buddy. Share common focus goals, trade daily praises, and stay mutually accountable.
          </p>
        </div>

        {/* Create Space */}
        <div className="p-5 rounded-3xl bg-zen-surface border border-zen-border shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zen-text">
            Start a Collaboration Circle
          </h3>
          <input
            type="text"
            value={newSpaceName}
            onChange={(e) => setNewSpaceName(e.target.value)}
            placeholder="Circle Name (e.g. Study Buddies 📚)"
            className="w-full px-3.5 py-2.5 rounded-xl bg-zen-card border border-zen-border text-xs font-semibold text-zen-text focus:outline-none focus:ring-2 focus:ring-accent-emerald/40"
          />
          <button
            onClick={() => createCollabSpace(newSpaceName || 'Accountability Duo')}
            className="w-full py-3 rounded-2xl bg-accent-emerald hover:opacity-90 text-white text-xs font-bold shadow-sm transition-all"
          >
            Create Private Space
          </button>
        </div>

        {/* Join Space */}
        <div className="p-5 rounded-3xl bg-zen-surface border border-zen-border shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zen-text">
            Join with Invite Code
          </h3>
          <input
            type="text"
            value={inviteInput}
            onChange={(e) => setInviteInput(e.target.value)}
            placeholder="Enter 6-character code"
            className="w-full px-3.5 py-2.5 rounded-xl bg-zen-card border border-zen-border text-xs font-bold uppercase tracking-widest text-zen-text focus:outline-none focus:ring-2 focus:ring-accent-emerald/40 text-center"
          />
          <button
            onClick={() => joinCollabSpace(inviteInput)}
            disabled={!inviteInput.trim()}
            className="w-full py-3 rounded-2xl bg-zen-card hover:bg-zen-border text-zen-text text-xs font-bold shadow-sm transition-all disabled:opacity-50"
          >
            Join Partner's Circle
          </button>
        </div>
      </div>
    );
  }

  // ---------------- ACTIVE COLLABORATION SPACE ----------------
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Top Header Card */}
      <div className="p-5 rounded-3xl bg-zen-surface border border-zen-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl">🤝</span>
            <h2 className="text-lg font-bold text-zen-text tracking-tight">{collabSpace.name}</h2>
          </div>
          <p className="text-xs text-zen-muted mt-0.5">
            {collabSpace.members.length} Active Collaborators · Shared Accountability
          </p>
        </div>

        {/* Invite Pill & Buzz Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleBuzz}
            className="px-3.5 py-2 rounded-2xl bg-accent-terracotta/15 hover:bg-accent-terracotta/25 text-accent-terracotta text-xs font-bold flex items-center space-x-1.5 transition-colors"
            title="Buzz your collaborator!"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Buzz Partner</span>
          </button>

          <button
            onClick={copyInvite}
            className="px-3 py-2 rounded-2xl bg-zen-card hover:bg-zen-border border border-zen-border text-zen-text text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-accent-emerald" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied!' : collabSpace.inviteCode}</span>
          </button>
        </div>
      </div>

      {/* Collaborator Avatars */}
      <div className="flex items-center space-x-3 overflow-x-auto pb-1 scrollbar-none">
        {collabSpace.members.map((member) => (
          <div
            key={member.id}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-2xl bg-zen-surface border border-zen-border/60 shadow-xs flex-shrink-0"
          >
            <span className="text-lg">{member.avatar}</span>
            <span className="text-xs font-bold text-zen-text">{member.name}</span>
            {member.id !== currentUser?.id && (
              <button
                onClick={() => setPraisingMember({ id: member.id, name: member.name })}
                className="p-1 rounded-lg bg-accent-ochre/10 text-accent-ochre hover:bg-accent-ochre/20"
                title="Send Praise"
              >
                <Heart className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Sub-Tab Switcher */}
      <div className="flex rounded-2xl bg-zen-surface border border-zen-border p-1">
        <button
          onClick={() => setActiveSubTab('goals')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'goals' ? 'bg-accent-emerald text-white shadow-xs' : 'text-zen-muted hover:text-zen-text'
          }`}
        >
          Common Goals ({collabGoals.length})
        </button>
        <button
          onClick={() => setActiveSubTab('chat')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'chat' ? 'bg-accent-emerald text-white shadow-xs' : 'text-zen-muted hover:text-zen-text'
          }`}
        >
          Notes & Buzz ({collabMessages.length})
        </button>
        <button
          onClick={() => setActiveSubTab('leaderboard')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'leaderboard' ? 'bg-accent-emerald text-white shadow-xs' : 'text-zen-muted hover:text-zen-text'
          }`}
        >
          Dual Leaderboards
        </button>
      </div>

      {/* ---------------- SUBTAB 1: SHARED GOALS ---------------- */}
      {activeSubTab === 'goals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zen-muted">
              Active Collaborative Targets
            </h3>
            <button
              onClick={() => setIsAddingGoal(true)}
              className="px-3 py-1.5 rounded-xl bg-accent-emerald text-white text-xs font-bold flex items-center space-x-1 shadow-xs hover:opacity-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Goal</span>
            </button>
          </div>

          {/* New Goal Modal */}
          {isAddingGoal && (
            <div className="p-4 rounded-3xl bg-zen-surface border border-accent-emerald/40 shadow-md space-y-3">
              <h4 className="text-xs font-bold text-zen-text uppercase">Create Common Target</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="Target Name (e.g. 2hr Daily Study)"
                  className="sm:col-span-2 px-3 py-2 rounded-xl bg-zen-card border border-zen-border text-xs font-semibold text-zen-text"
                />
                <input
                  type="number"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(Number(e.target.value))}
                  placeholder="Daily Target Mins"
                  className="px-3 py-2 rounded-xl bg-zen-card border border-zen-border text-xs font-semibold text-zen-text"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsAddingGoal(false)}
                  className="px-3 py-1.5 rounded-xl bg-zen-card text-xs font-semibold text-zen-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddGoal}
                  className="px-4 py-1.5 rounded-xl bg-accent-emerald text-white text-xs font-bold"
                >
                  Add Shared Goal
                </button>
              </div>
            </div>
          )}

          {/* Goal Cards */}
          {collabGoals.length === 0 ? (
            <div className="p-8 rounded-3xl bg-zen-surface border border-dashed border-zen-border text-center space-y-2">
              <p className="text-xs text-zen-muted">No common goals created yet. Establish your first shared target!</p>
            </div>
          ) : (
            collabGoals.map((goal) => {
              const myEntries = collabEntries.filter((e) => e.goalId === goal.id && e.userId === currentUser?.id);
              const myTotal = myEntries.reduce((sum, e) => sum + e.value, 0);
              const progressPct = Math.min(100, Math.round((myTotal / (goal.targetPerMember || 1)) * 100));

              return (
                <div
                  key={goal.id}
                  className="p-5 rounded-3xl bg-zen-surface border border-zen-border shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-2xl">{goal.icon}</span>
                      <div>
                        <h4 className="text-sm font-bold text-zen-text">{goal.title}</h4>
                        <span className="text-[11px] text-zen-muted font-medium">
                          Target: {goal.targetPerMember} {goal.type === 'FOCUS_HOURS' ? 'mins' : 'reps'} / day
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => logCollabProgress(goal.id, 30)}
                      className="px-3 py-1.5 rounded-xl bg-accent-emerald/15 hover:bg-accent-emerald text-accent-emerald hover:text-white text-xs font-bold flex items-center space-x-1 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Log +30m</span>
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-zen-muted">
                      <span>Team Contribution</span>
                      <span>{progressPct}% Completed</span>
                    </div>
                    <div className="h-2.5 w-full bg-zen-card rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-emerald rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ---------------- SUBTAB 2: NOTES & BUZZ ---------------- */}
      {activeSubTab === 'chat' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-zen-surface border border-zen-border shadow-sm space-y-3 min-h-[300px] flex flex-col justify-between">
            <div className="space-y-2 overflow-y-auto max-h-80 pr-1">
              {collabMessages.length === 0 ? (
                <p className="text-xs text-zen-muted text-center py-12">
                  No notes pinned yet. Leave an encouraging note or buzz your partner!
                </p>
              ) : (
                collabMessages.map((msg) => {
                  const isMe = msg.fromUserId === currentUser?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`p-3 rounded-2xl max-w-xs text-xs font-medium ${
                          msg.type === 'BUZZ'
                            ? 'bg-accent-terracotta/15 border border-accent-terracotta/30 text-accent-terracotta font-bold'
                            : isMe
                            ? 'bg-accent-emerald text-white rounded-br-xs'
                            : 'bg-zen-card text-zen-text border border-zen-border rounded-bl-xs'
                        }`}
                      >
                        <span className="text-[10px] font-bold block opacity-75 mb-0.5">
                          {msg.fromUserName}
                        </span>
                        <span>{msg.content}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Form */}
            <div className="flex items-center space-x-2 pt-2 border-t border-zen-border">
              <input
                type="text"
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Leave an accountability note..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-zen-card border border-zen-border text-xs text-zen-text focus:outline-none focus:ring-2 focus:ring-accent-emerald/40"
              />
              <button
                onClick={handleSendMessage}
                className="p-2.5 rounded-xl bg-accent-emerald text-white hover:opacity-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- SUBTAB 3: DUAL LEADERBOARDS ---------------- */}
      {activeSubTab === 'leaderboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Collaborative Leaderboard */}
          <div className="p-5 rounded-3xl bg-zen-surface border border-zen-border shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-accent-ochre" />
              <h3 className="text-sm font-bold text-zen-text">Collaborative Leaderboard</h3>
            </div>
            <p className="text-[11px] text-zen-muted">
              Ranked by total contribution to shared team goals this week.
            </p>

            <div className="space-y-2.5">
              {collabSpace.members.map((member, idx) => (
                <div
                  key={member.id}
                  className="p-3 rounded-2xl bg-zen-card border border-zen-border/60 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xs font-extrabold text-accent-ochre w-4">#{idx + 1}</span>
                    <span className="text-lg">{member.avatar}</span>
                    <span className="text-xs font-bold text-zen-text">{member.name}</span>
                  </div>
                  <span className="text-xs font-bold text-accent-emerald">
                    {idx === 0 ? '180 pts' : '140 pts'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Goals Record Leaderboard (Privacy Preserving) */}
          <div className="p-5 rounded-3xl bg-zen-surface border border-zen-border shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-accent-ocean" />
              <h3 className="text-sm font-bold text-zen-text">Personal Best Records</h3>
            </div>
            <p className="text-[11px] text-zen-muted">
              Your own lifetime personal bests (never revealed to partners).
            </p>

            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-zen-card border border-zen-border/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-zen-text block">Peak Focus Day</span>
                  <span className="text-[10px] text-zen-muted">Highest focus minutes in 24h</span>
                </div>
                <span className="text-xs font-bold text-accent-ocean">240 mins</span>
              </div>

              <div className="p-3 rounded-2xl bg-zen-card border border-zen-border/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-zen-text block">Longest Habit Streak</span>
                  <span className="text-[10px] text-zen-muted">Consecutive days unbroken</span>
                </div>
                <div className="flex items-center space-x-1 text-xs font-bold text-accent-terracotta">
                  <Flame className="w-3.5 h-3.5" />
                  <span>
                    {habits.reduce((m, h) => Math.max(m, h.bestStreak), 0) || 7} days
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-zen-card border border-zen-border/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-zen-text block">Total Verified Sessions</span>
                  <span className="text-[10px] text-zen-muted">Logged stopwatch blocks</span>
                </div>
                <span className="text-xs font-bold text-accent-emerald">{sessions.length} sessions</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Praise Modal */}
      {praisingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xs p-6 rounded-3xl bg-zen-surface border border-zen-border shadow-2xl text-center space-y-4">
            <h3 className="text-sm font-bold text-zen-text">
              Praise {praisingMember.name}
            </h3>
            <p className="text-[11px] text-zen-muted">Choose an encouragement badge for today:</p>

            <div className="grid grid-cols-5 gap-2">
              {(['ON_FIRE', 'LIGHTNING', 'ZEN', 'BEAST', 'CONSISTENT'] as PraiseType[]).map((type) => {
                const emojis: Record<PraiseType, string> = {
                  ON_FIRE: '🔥',
                  LIGHTNING: '⚡',
                  ZEN: '🧘',
                  BEAST: '💪',
                  CONSISTENT: '🌿',
                };
                return (
                  <button
                    key={type}
                    onClick={async () => {
                      await sendCollabPraise(praisingMember.id, 'goal_general', type);
                      setPraisingMember(null);
                    }}
                    className="w-11 h-11 rounded-2xl bg-zen-card hover:bg-zen-border text-2xl flex items-center justify-center transition-all hover:scale-110"
                  >
                    {emojis[type]}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPraisingMember(null)}
              className="text-xs font-semibold text-zen-muted hover:text-zen-text"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
