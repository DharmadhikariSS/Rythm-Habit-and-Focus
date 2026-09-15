import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
import { TopNavbar, BottomNavbar } from './components/Navbar';
import { HomeScreen } from './screens/HomeScreen';
import { HabitScreen } from './screens/HabitScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';

const AppContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-zen-bg text-zen-text flex flex-col font-sans transition-colors duration-300">
      <TopNavbar />
      <main className="flex-1 w-full">
        {activeTab === 'timers' && <HomeScreen />}
        {activeTab === 'habits' && <HabitScreen />}
        {activeTab === 'analytics' && <AnalyticsScreen />}
      </main>
      <BottomNavbar />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;
