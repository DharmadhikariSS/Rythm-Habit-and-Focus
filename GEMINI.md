# Rhythm (Habit & Focus) - Shared Antigravity Brain

Welcome to **Rhythm**, a mindful, zero-distraction productivity and habit-tracking Progressive Web App (PWA) and collaborative ecosystem.

This document is the **Single Source of Truth** for both developers and their **Antigravity AI agents**. When working on this repository, all agents must strictly adhere to the following architecture, design guidelines, and code conventions.

---

## 🧘 Aesthetic & Design Philosophy: Nordic Zen

Rhythm is designed to promote calm, focus, and intentionality. Never use loud, aggressive, or chaotic UI patterns.

### Exact Nordic Zen Palette (Color.kt parity)
- **Background**:
  - Light: `#F7FAF7`
  - Dark: `#131814` (Deep Nordic forest night)
- **Surfaces & Cards**:
  - Light: `#FFFFFF`
  - Dark: `#1A221C`
- **Primary / Brand Accents (8 Soothing Hex Tones)**:
  - `Emerald`: `#437A55`
  - `Ocean`: `#386B80`
  - `Terracotta`: `#B55D46`
  - `Lavender`: `#6B5F8C`
  - `Ochre`: `#A67B34`
  - `Rose`: `#9E4E68`
  - `Sky`: `#3A7D99`
  - `Sage`: `#5D8464`
- **Heatmap Tiers**:
  - Level 0: `#EAECE8` (Light) / `#253128` (Dark)
  - Level 1: `#85B595`
  - Level 2: `#5A996D`
  - Level 3: `#437A55`
  - Level 4: `#2D5A3D`

---

## 🛠️ Tech Stack & Directory Structure (Rhythm v2.0)

```text
StudyTimerApp/
├── GEMINI.md                     # Single Source of Truth for Antigravity agents
├── pwa/                          # Progressive Web App
│   ├── src/
│   │   ├── types/                # Domain models (Collab, Diary, Pomodoro, Badges)
│   │   ├── store/                # Zustand central reactive store (useRhythmStore)
│   │   ├── services/             # Dexie DB, Web Crypto, Milestone Engine, Sound
│   │   ├── data/                 # 12 Goal Packs & 28 Badge Definitions
│   │   ├── context/              # ThemeContext (Light / Dark)
│   │   ├── components/           # Reusable widgets (Sidebar, Navbar, TimerCard, Heatmaps)
│   │   └── screens/              # HomeScreen, HabitScreen, AnalyticsScreen, CollabScreen, DiaryScreen, OnboardingScreen
│   └── public/                   # PWA manifest & assets
```

---

## 📐 Core Architecture Principles

1. **Local-First with Dexie.js (IndexedDB)**:
   All entities (`subjects`, `habits`, `habitEntries`, `sessions`, `badges`, `collabSpaces`, `diaryEntries`) write immediately to client IndexedDB for instant UI responsiveness and 100% offline capability.

2. **Personal Encrypted Diary (Zero-Knowledge Privacy)**:
   - Diary payloads are encrypted **client-side** using the browser's native **Web Crypto API (`window.crypto.subtle`)**.
   - Key derivation: PBKDF2 with SHA-256 and 100,000 iterations using user's private PIN and random salt.
   - Cipher: AES-GCM (256-bit key, unique 96-bit IV per entry).
   - Only ciphertext is persisted to storage. Even backend/database admins cannot read diary reflections.

3. **Multi-User Collaboration Mode**:
   - Private personal goals remain strictly separated by `userId`.
   - Shared spaces allow collaborative goals with progress logging, notes, buzz nudges, and daily praises.
   - Dual leaderboards: Collaborative (team points) + Personal Records (private bests).

4. **Dynamic AI Engine (`gemini-2.0-flash`)**:
   - Insights are not static templates. Context is dynamically assembled from active goal packs, circadian chronotype peaks, habit streak trajectories, and weakest habits.
   - Local heuristics serve as instant fallback when offline.

5. **Gamification & Milestone Engine**:
   - Comprehensive taxonomy covering Streaks, Productivity Multipliers (200%-400%), Milestones (100 to 4,000+), Category Records, Accountability Battles, and Limited Seasonal Badges.

---

## 🧪 Development & Quality Standards

1. **Zero Build Warnings**: Run `npm run build` inside `StudyTimerApp/pwa` before committing. Ensure strict TypeScript types with no `any` abuse.
2. **Desktop & Mobile Responsive**: Support 375px mobile viewports (bottom navbar) through 1440px desktop screens (280px left sidebar + 2-column card layouts).
3. **Sound**: Harmonious singing bowl harmonic generated via Web Audio API.
