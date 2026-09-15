import React from 'react';
import {
  Timer,
  Calendar,
  BarChart2,
  Users,
  BookLock,
  Moon,
  Sun,
  Bell,
  Sparkles,
} from 'lucide-react';
import { useRhythmStore } from '../store/useRhythmStore';
import { useTheme } from '../context/ThemeContext';
import { soundService } from '../services/sound';
import { NavTab } from '../types';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, subjects, currentUser } = useRhythmStore();
  const { isDark, toggleTheme } = useTheme();

  const runningCount = subjects.filter((s) => s.isRunning).length;

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'timers', label: 'Focus Timers', icon: <Timer className="w-5 h-5" />, badge: runningCount },
    { id: 'habits', label: 'Habit Rhythm', icon: <Calendar className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics & Trends', icon: <BarChart2 className="w-5 h-5" /> },
    { id: 'together', label: 'Collaboration', icon: <Users className="w-5 h-5" /> },
    { id: 'diary', label: 'Personal Diary', icon: <BookLock className="w-5 h-5" /> },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-zen-surface border-r border-zen-border h-screen sticky top-0 px-5 py-6 justify-between transition-colors z-20">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center space-x-3 px-2">
          <img src="/logo.png" alt="Rhythm" className="w-8 h-8 rounded-xl shadow-sm" />
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zen-text">Rhythm</h1>
            <p className="text-[11px] uppercase tracking-widest text-zen-muted font-semibold">
              Mindful Focus v2.0
            </p>
          </div>
        </div>

        {/* User Card */}
        <div className="p-3.5 rounded-2xl bg-zen-card border border-zen-border/60 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 text-xl flex items-center justify-center">
            {currentUser?.avatarEmoji || '🧘'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-zen-text truncate">
              {currentUser?.displayName || 'Practitioner'}
            </h4>
            <p className="text-xs text-zen-muted truncate">@{currentUser?.username || 'zen_master'}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-accent-emerald text-white shadow-sm font-semibold'
                    : 'text-zen-muted hover:text-zen-text hover:bg-zen-card'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      isActive ? 'bg-white text-accent-emerald' : 'bg-accent-terracotta text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls */}
      <div className="space-y-3 pt-4 border-t border-zen-border">
        {/* On-device sound test & theme */}
        <div className="flex items-center justify-between px-2">
          <button
            onClick={() => soundService.playZenBowl()}
            className="flex items-center space-x-2 text-xs font-medium text-zen-muted hover:text-accent-emerald transition-colors"
            title="Play Singing Bowl Chime"
          >
            <Bell className="w-4 h-4" />
            <span>Harmonic Chime</span>
          </button>

          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-zen-card hover:bg-zen-border text-zen-muted hover:text-accent-emerald transition-colors"
            title={isDark ? 'Light Mode' : 'Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-accent-emerald" />}
          </button>
        </div>

        <div className="text-[11px] text-zen-muted/80 text-center flex items-center justify-center space-x-1">
          <Sparkles className="w-3 h-3 text-accent-emerald" />
          <span>Nordic Zen · Offline-First</span>
        </div>
      </div>
    </aside>
  );
};
