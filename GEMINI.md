# Rhythm (Habit & Focus) - Shared Antigravity Brain

Welcome to **Rhythm**, a mindful, zero-distraction productivity and habit-tracking Progressive Web App (PWA) and mobile ecosystem.

This document is the **Single Source of Truth** for both developers and their **Antigravity AI agents**. When working on this repository, all agents must strictly adhere to the following architecture, design guidelines, and code conventions.

---

## 🧘 Aesthetic & Design Philosophy: Nordic Zen

Rhythm is designed to promote calm, focus, and intentionality. Never use loud, aggressive, or chaotic UI patterns.

### Color Tokens
- **Background**:
  - Light: `#FBFBFA` (Soft warm paper)
  - Dark: `#131814` (Deep Nordic forest night)
- **Surfaces & Cards**:
  - Light: `#FFFFFF` (Pure clean surface with subtle border)
  - Dark: `#1A221C` (Muted dark moss card)
- **Primary / Brand Forest**:
  - Primary: `#2D5A43` (Nordic pine green)
  - Accent / Vibrant: `#52B788` (Sage leaf highlight)
- **Text & Contrast**:
  - Light mode text: `#1C251F` (Primary), `#526055` (Muted), `#8A988D` (Subtle)
  - Dark mode text: `#E8EFE9` (Primary), `#A4B3A7` (Muted), `#5C6E61` (Subtle)
- **Borders & Dividers**:
  - Light: `#EAECE8`
  - Dark: `#253128`

### UI Conventions
- **Rounded Corners**: Generous `rounded-2xl` and `rounded-3xl` for cards, dialogs, and buttons.
- **Typography**: Clean, geometric sans-serif (Inter / System UI). Bold, clear numbers for timer displays.
- **Motion & Feedback**: Subtle, organic transitions (200-300ms ease-out). No jarring popups.
- **Sound**: Serene Tibetan singing bowl harmonic chime generated on-device via Web Audio API.

---

## 🛠️ Tech Stack & Directory Structure

```text
StudyTimerApp/
├── GEMINI.md               # This project rulebook for Antigravity agents
├── pwa/                    # Progressive Web App (Vite + React 19 + TypeScript + Tailwind)
│   ├── src/
│   │   ├── types/          # Shared data contracts
│   │   ├── services/       # Storage (LocalStorage/IndexedDB), Sound, AI Engine
│   │   ├── context/        # AppData and Theme state
│   │   ├── components/     # Reusable UI widgets
│   │   └── screens/        # HomeScreen, HabitScreen, AnalyticsScreen
│   └── public/             # PWA assets & icons
└── app/                    # Native Android Kotlin App (v1.5.0 baseline)
```

---

## 📐 Data Contracts & Models

All data must adhere to these core TypeScript types in `pwa/src/types/index.ts`:

1. **`Timer`**: `id`, `title`, `totalSeconds`, `remainingSeconds`, `status` (`'idle' | 'running' | 'paused' | 'completed'`), `category`, `color`, `createdAt`.
2. **`Habit`**: `id`, `title`, `type` (`'check' | 'duration'`), `targetMinutes`, `frequency`, `color`, `streakCurrent`, `streakBest`, `createdAt`.
3. **`HabitLog`**: `id`, `habitId`, `date` (`YYYY-MM-DD`), `completed`, `durationMinutes`.
4. **`SessionRecord`**: `id`, `timerTitle`, `durationMinutes`, `completedAt`, `category`, `date`.
5. **`BehavioralInsight`**: `category`, `confidence`, `headline`, `analysis`, `actionableTip`.

---

## 🧪 Development & Quality Standards

1. **Zero External API Costs**: All behavioral intelligence calculations and sound synthesis run 100% locally on-device.
2. **Zero Build Warnings**: Run `npm run build` inside `StudyTimerApp/pwa` before committing changes. Ensure strict TypeScript types with no `any` abuse.
3. **PWA Offline Support**: Ensure the service worker caches all static assets so the app works seamlessly without an internet connection.
4. **Mobile Responsive**: Test and ensure pixel-perfect rendering on mobile screens (375px - 430px) with iOS Safari safe-area insets respected.
