<p align="center">
  <img src="art/logo.png" alt="Rhythm Logo" width="140" height="140" style="border-radius: 28px;" />
</p>

<h1 align="center">Rhythm: Habit & Focus</h1>

<p align="center">
  <b>A modern, beautiful, and distraction-free Android companion for deep focus, habit tracking, and productivity analytics.</b>
</p>

<p align="center">
  <a href="https://github.com/DharmadhikariSS/Rythm-Habit-and-Focus/releases"><img src="https://img.shields.io/github/v/release/DharmadhikariSS/Rythm-Habit-and-Focus?color=blue&label=Latest%20Release" alt="Latest Release" /></a>
  <a href="https://developer.android.com/about/versions/14"><img src="https://img.shields.io/badge/Platform-Android%207.0%2B%20(API%2024%2B)-3DDC84?logo=android&logoColor=white" alt="Platform" /></a>
  <a href="https://kotlinlang.org"><img src="https://img.shields.io/badge/Kotlin-2.0%2B-7F52FF?logo=kotlin&logoColor=white" alt="Kotlin" /></a>
  <a href="https://developer.android.com/jetpack/compose"><img src="https://img.shields.io/badge/UI-Jetpack%20Compose%20%7C%20Material%203-4285F4?logo=jetpackcompose&logoColor=white" alt="Jetpack Compose" /></a>
</p>

---

## 📱 About Rhythm

**Rhythm: Habit & Focus** helps you stay in flow, achieve deep work sessions, and cultivate consistent habits. Available as both a native Android app (Kotlin & Jetpack Compose) and an ultra-lightweight, zero-cost **Progressive Web App (PWA)** built with **React 19, TypeScript, Vite, and Tailwind CSS**.

Whether on your Android phone, iOS device (iPhone/iPad), or laptop, Rhythm keeps you accountable, mindful, and focused across all devices.

---

## 🌐 Progressive Web App (PWA)

The web edition is located in `/pwa`:
- **Zero-cost & 100% Offline-capable**: Persists locally via LocalStorage & IndexedDB.
- **Cross-Platform**: Installable to iOS home screens (via Safari) and Android (via Chrome) as a standalone native-feeling app.
- **Synthesized Audio**: Serene Tibetan singing bowl harmonic chime generated via Web Audio API.
- **Fast & Lightweight**: Sub-second builds with Vite, bundle < 150KB gzipped.

```bash
# Run PWA locally
cd pwa
npm install
npm run dev
```

---

## ✨ Key Features

### ⏱ Flexible Focus & Multi-Timer Engine
- **Customizable Intervals**: Pre-configured and customizable durations for Pomodoro, deep focus, and sprint intervals.
- **Subject & Tag Tagging**: Organize sessions by subjects, courses, or projects.
- **Active Controls**: Seamless play, pause, resume, and reset functionality.

### 🔔 Reliable Background Foreground Service
- **Always Running**: Accurate timekeeping backed by a dedicated Android Foreground Service that won't get killed when switching apps or locking your screen.
- **Interactive Notifications**: View real-time countdown progress and manage your timer directly from the lock screen or notification shade.
- **Audio & Haptic Alerts**: Completion notifications with sound and vibration feedback.

### 📅 Habit Tracker & Streak Consistency
- **Daily Check-ins**: Log and maintain daily habits with ease.
- **Activity Heatmap Strip**: GitHub-style visual consistency heatmaps to celebrate daily streaks and spot gaps.
- **Monthly Overview**: Progress indicators and completion percentages for every tracked habit.

### 📊 Deep Analytics & Visualizations
- **Donut Chart Breakdowns**: Visual distribution of time invested across subjects and categories.
- **Trends & Progress**: Daily, weekly, and monthly focus duration metrics.
- **Segmented Progress Bars**: Instantly inspect completion rates against target study hours.

### 💾 Data Portability & Backup
- **CSV Export**: Export your complete study session logs and habit records to CSV format with a single tap for offline backup or spreadsheet analysis.

---

## 🛠 Tech Stack & Architecture

- **Language**: [Kotlin](https://kotlinlang.org/)
- **UI Framework**: [Jetpack Compose](https://developer.android.com/jetpack/compose) with Material Design 3
- **Architecture**: MVVM (Model-View-ViewModel) with reactive unidirectional data flow
- **State Management**: Kotlin Coroutines & `StateFlow`
- **Navigation**: Navigation Compose
- **Services**: Android Foreground Service (`TimerForegroundService`)
- **Build System**: Gradle with Kotlin DSL (`build.gradle.kts`) and Version Catalog (`libs.versions.toml`)
- **Minimum SDK**: API 24 (Android 7.0 Nougat)
- **Target SDK**: API 36 (Android 15+)

---

## 📥 Downloads

Ready-to-install APKs are published under [GitHub Releases](https://github.com/DharmadhikariSS/Rythm-Habit-and-Focus/releases):

| Version | Status | Download Link |
|:---|:---|:---|
| **v1.5.0** | 🌟 **Latest (Recommended)** | [Download Rhythm v1.5.0 APK](https://github.com/DharmadhikariSS/Rythm-Habit-and-Focus/releases/download/v1.5.0/Rhythm-v1.5.0.apk) |
| **v1.4.0** | Stable | [Download Rhythm v1.4.0 APK](https://github.com/DharmadhikariSS/Rythm-Habit-and-Focus/releases/download/v1.4.0/Rhythm-v1.4.0.apk) |
| **v1.3.0** | Stable | [Download Rhythm v1.3.0 APK](https://github.com/DharmadhikariSS/Rythm-Habit-and-Focus/releases/download/v1.3.0/Rhythm-v1.3.0.apk) |
| **v1.2.0** | Stable | [Download Rhythm v1.2.0 APK](https://github.com/DharmadhikariSS/Rythm-Habit-and-Focus/releases/download/v1.2.0/Rhythm-v1.2.0.apk) |
| **v1.1.0** | Previous | [Download Rhythm v1.1.0 APK](https://github.com/DharmadhikariSS/Rythm-Habit-and-Focus/releases/download/v1.1.0/Rhythm-v1.1.0.apk) |
| **v1.0.0** | Initial Release | [Download Rhythm v1.0.0 APK](https://github.com/DharmadhikariSS/Rythm-Habit-and-Focus/releases/download/v1.0.0/Rhythm-v1.0.0.apk) |

---

## 🚀 Getting Started (Developers)

### Prerequisites
- **Android Studio**: Android Studio Koala, Ladybug, or newer
- **JDK**: Java Development Kit 17 or higher
- **Android SDK**: API level 36

### Build & Run
1. Clone this repository:
   ```bash
   git clone https://github.com/DharmadhikariSS/Rythm-Habit-and-Focus.git
   ```
2. Open the project in Android Studio:
   - Select **Open an Existing Project** and choose the cloned repository folder.
   - Let Gradle sync the dependencies.
3. Build the project via CLI:
   ```bash
   # Debug APK
   ./gradlew assembleDebug

   # Release APK
   ./gradlew assembleRelease
   ```
4. Run on a connected device or emulator directly from Android Studio.

---

## 📄 License

This project is developed by [DharmadhikariSS](https://github.com/DharmadhikariSS). All rights reserved.
