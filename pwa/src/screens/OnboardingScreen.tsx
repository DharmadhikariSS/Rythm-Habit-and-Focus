import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { GOAL_PACKS } from '../data/goalPacks';
import { useRhythmStore } from '../store/useRhythmStore';

const AVATAR_OPTIONS = ['🧘', '🦁', '🌿', '⚡', '🦉', '🌊', '🎯', '🚀', '🔥', '💎'];

export const OnboardingScreen: React.FC = () => {
  const { completeOnboarding } = useRhythmStore();
  const [selectedPackIds, setSelectedPackIds] = useState<string[]>(['exam_warrior', 'mental_wellness', 'deep_work']);
  const [displayName, setDisplayName] = useState<string>('Mindful Scholar');
  const [username, setUsername] = useState<string>('scholar');
  const [avatarEmoji, setAvatarEmoji] = useState<string>('🧘');

  const togglePack = (id: string) => {
    if (selectedPackIds.includes(id)) {
      setSelectedPackIds(selectedPackIds.filter((p) => p !== id));
    } else {
      if (selectedPackIds.length >= 3) {
        // Replace the oldest
        setSelectedPackIds([...selectedPackIds.slice(1), id]);
      } else {
        setSelectedPackIds([...selectedPackIds, id]);
      }
    }
  };

  const isReady = selectedPackIds.length === 3 && displayName.trim().length > 0;

  const handleStart = () => {
    if (!isReady) return;
    completeOnboarding(selectedPackIds, {
      displayName: displayName.trim(),
      username: username.trim() || 'practitioner',
      avatarEmoji,
    });
  };

  return (
    <div className="min-h-screen bg-zen-bg text-zen-text flex flex-col items-center justify-start p-4 sm:p-8 safe-top safe-bottom">
      <div className="w-full max-w-4xl mx-auto space-y-8 py-6">
        {/* Header */}
        <div className="text-center space-y-3 max-w-lg mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent-emerald/10 text-accent-emerald text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to Rhythm v2.0</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zen-text">
            Choose Your Foundation
          </h1>
          <p className="text-xs sm:text-sm text-zen-muted leading-relaxed">
            Select <span className="font-bold text-accent-emerald">any 3 goal packs</span> to calibrate your daily study stopwatches, habit streaks, and circadian schedule.
          </p>
        </div>

        {/* Profile Card Setup */}
        <div className="p-5 rounded-3xl bg-zen-surface border border-zen-border shadow-sm max-w-lg mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-zen-muted block">
            Practitioner Identity
          </span>

          {/* Avatar selector */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {AVATAR_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setAvatarEmoji(emoji)}
                className={`w-10 h-10 flex-shrink-0 text-xl rounded-2xl flex items-center justify-center transition-all ${
                  avatarEmoji === emoji
                    ? 'bg-accent-emerald text-white scale-110 shadow-md ring-2 ring-accent-emerald/30'
                    : 'bg-zen-card hover:bg-zen-border text-zen-text'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-zen-muted block mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Arjun"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zen-card border border-zen-border text-xs font-semibold text-zen-text focus:outline-none focus:ring-2 focus:ring-accent-emerald/40"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-zen-muted block mb-1">Handle / Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. arjun_focus"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zen-card border border-zen-border text-xs font-semibold text-zen-text focus:outline-none focus:ring-2 focus:ring-accent-emerald/40"
              />
            </div>
          </div>
        </div>

        {/* Goal Packs Selector Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto px-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zen-muted">
              Select 3 Researched Goal Packs
            </h3>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                selectedPackIds.length === 3
                  ? 'bg-accent-emerald/15 text-accent-emerald'
                  : 'bg-accent-ochre/15 text-accent-ochre'
              }`}
            >
              {selectedPackIds.length} of 3 Selected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {GOAL_PACKS.map((pack) => {
              const isSelected = selectedPackIds.includes(pack.id);
              return (
                <div
                  key={pack.id}
                  onClick={() => togglePack(pack.id)}
                  className={`p-5 rounded-3xl border cursor-pointer transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${
                    isSelected
                      ? 'bg-zen-surface border-accent-emerald shadow-md ring-2 ring-accent-emerald/30 -translate-y-0.5'
                      : 'bg-zen-surface/60 border-zen-border hover:border-zen-border/80 hover:bg-zen-surface'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-accent-emerald text-white flex items-center justify-center shadow-sm">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div>
                    {/* Icon & Title */}
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 rounded-2xl bg-zen-card text-2xl flex items-center justify-center shadow-inner">
                        {pack.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zen-text">{pack.title}</h4>
                        <span className="text-[10px] text-zen-muted block leading-tight">
                          {pack.tagline}
                        </span>
                      </div>
                    </div>

                    {/* Pre-configured Habits Pills */}
                    <div className="mt-3 space-y-1.5">
                      <span className="text-[10px] font-bold text-zen-muted uppercase tracking-wider block">
                        Included Habits:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {pack.habits.map((h, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg bg-zen-card text-[11px] text-zen-text font-medium flex items-center space-x-1"
                          >
                            <span>{h.icon}</span>
                            <span>{h.name}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Pre-configured Subjects */}
                    <div className="mt-3 space-y-1.5">
                      <span className="text-[10px] font-bold text-zen-muted uppercase tracking-wider block">
                        Study Timers:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {pack.subjects.map((s, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg text-[11px] font-semibold"
                            style={{ backgroundColor: `${s.color}15`, color: s.color }}
                          >
                            {s.name} ({s.targetWeeklyHours}h)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Floating Bar */}
        <div className="sticky bottom-4 z-20 max-w-md mx-auto w-full">
          <button
            onClick={handleStart}
            disabled={!isReady}
            className={`w-full py-4 px-6 rounded-3xl font-bold text-sm shadow-xl flex items-center justify-center space-x-2 transition-all duration-200 ${
              isReady
                ? 'bg-accent-emerald hover:opacity-95 text-white cursor-pointer scale-100'
                : 'bg-zen-card text-zen-muted opacity-60 cursor-not-allowed'
            }`}
          >
            <span>Let's Begin Rhythm</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="text-center mt-2 flex items-center justify-center space-x-1 text-[11px] text-zen-muted">
            <ShieldCheck className="w-3 h-3 text-accent-emerald" />
            <span>100% On-Device · IndexedDB Persistent</span>
          </div>
        </div>
      </div>
    </div>
  );
};
