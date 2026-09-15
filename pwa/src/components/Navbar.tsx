import React from 'react';
import {
  Timer as TimerIcon,
  Calendar,
  BarChart2,
  Users,
  BookLock,
  Moon,
  Sun,
  Bell,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useRhythmStore } from '../store/useRhythmStore';
import { NavTab } from '../types';
import { soundService } from '../services/sound';

export const TopNavbar: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 w-full bg-zen-surface/80 backdrop-blur-md border-b border-zen-border transition-colors safe-top">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-2.5">
          <img src="/logo.png" alt="Rhythm" className="w-7 h-7 rounded-lg shadow-sm" />
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-zen-text">Rhythm</span>
            <span className="text-[10px] uppercase tracking-widest text-zen-muted -mt-1 font-semibold">
              Habit & Focus
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5">
          {/* Sound Bell Test */}
          <button
            onClick={() => soundService.playZenBowl()}
            title="Mindful singing bowl chime"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-zen-card hover:bg-zen-border text-zen-muted hover:text-accent-emerald transition-colors"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-zen-card hover:bg-zen-border text-zen-muted hover:text-accent-emerald transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-accent-emerald" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export const BottomNavbar: React.FC = () => {
  const { activeTab, setActiveTab, subjects } = useRhythmStore();
  const runningCount = subjects.filter((s) => s.isRunning).length;

  const tabs: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'timers', label: 'Timers', icon: <TimerIcon className="w-5 h-5" />, badge: runningCount },
    { id: 'habits', label: 'Habits', icon: <Calendar className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-5 h-5" /> },
    { id: 'together', label: 'Together', icon: <Users className="w-5 h-5" /> },
    { id: 'diary', label: 'Diary', icon: <BookLock className="w-5 h-5" /> },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-zen-surface/90 backdrop-blur-lg border-t border-zen-border safe-bottom transition-colors">
      <div className="max-w-md mx-auto px-2 h-16 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1.5 flex flex-col items-center justify-center relative rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-accent-emerald font-semibold'
                  : 'text-zen-muted hover:text-zen-text'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-accent-terracotta text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 bg-accent-emerald rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
