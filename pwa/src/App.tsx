import React, { useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { useRhythmStore } from './store/useRhythmStore';
import { TopNavbar, BottomNavbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { PomodoroBreathingOverlay } from './components/PomodoroBreathingOverlay';
import { BadgeUnlockToast } from './components/BadgeUnlockToast';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { HomeScreen } from './screens/HomeScreen';
import { HabitScreen } from './screens/HabitScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { CollabScreen } from './screens/CollabScreen';
import { DiaryScreen } from './screens/DiaryScreen';

const AppContent: React.FC = () => {
  const { isInitialized, initialize, currentUser, activeTab } = useRhythmStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-zen-bg text-zen-text flex items-center justify-center font-sans">
        <div className="flex flex-col items-center space-y-3">
          <img src="/logo.png" alt="Rhythm" className="w-12 h-12 rounded-2xl shadow-md animate-pulse" />
          <span className="text-xs font-semibold text-zen-muted uppercase tracking-widest">
            Calibrating Rhythm...
          </span>
        </div>
      </div>
    );
  }

  // First-time onboarding / Goal Pack selector
  if (!currentUser?.hasCompletedOnboarding) {
    return <OnboardingScreen />;
  }

  return (
    <div className="min-h-screen bg-zen-bg text-zen-text flex font-sans transition-colors duration-300">
      {/* Desktop Responsive Left Sidebar */}
      <Sidebar />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Navbar */}
        <div className="lg:hidden">
          <TopNavbar />
        </div>

        <main className="flex-1 w-full overflow-y-auto">
          {activeTab === 'timers' && <HomeScreen />}
          {activeTab === 'habits' && <HabitScreen />}
          {activeTab === 'analytics' && <AnalyticsScreen />}
          {activeTab === 'together' && <CollabScreen />}
          {activeTab === 'diary' && <DiaryScreen />}
        </main>

        {/* Mobile Bottom Navbar */}
        <BottomNavbar />
      </div>

      {/* Overlays & Modals */}
      <PomodoroBreathingOverlay />
      <BadgeUnlockToast />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
