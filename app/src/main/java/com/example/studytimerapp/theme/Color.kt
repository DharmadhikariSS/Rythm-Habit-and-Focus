package com.example.studytimerapp.theme

import androidx.compose.runtime.Composable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

data class ZenColorPalette(
    val bg: Color,
    val surface: Color,
    val surfaceSubtle: Color,
    val border: Color,
    val borderSelected: Color,
    val textPrimary: Color,
    val textSecondary: Color,
    val textTertiary: Color,
    val heatmapLevel0: Color,
    val isDark: Boolean
)

val LightZenPalette = ZenColorPalette(
    bg = Color(0xFFF7FAF7),
    surface = Color(0xFFFFFFFF),
    surfaceSubtle = Color(0xFFEFF3EF),
    border = Color(0xFFE2EAE2),
    borderSelected = Color(0xFF4A7C59),
    textPrimary = Color(0xFF1B261F),
    textSecondary = Color(0xFF5B6E61),
    textTertiary = Color(0xFF8C9E91),
    heatmapLevel0 = Color(0xFFEAEFEA),
    isDark = false
)

val DarkZenPalette = ZenColorPalette(
    bg = Color(0xFF131814),
    surface = Color(0xFF1A221C),
    surfaceSubtle = Color(0xFF232D25),
    border = Color(0xFF2D3B30),
    borderSelected = Color(0xFF57915B),
    textPrimary = Color(0xFFE8EFE9),
    textSecondary = Color(0xFFA5B6A8),
    textTertiary = Color(0xFF6B7E6F),
    heatmapLevel0 = Color(0xFF232D25),
    isDark = true
)

val LocalZenColors = staticCompositionLocalOf { LightZenPalette }

// Dynamic composable getters - ensure all existing code works with 0 refactoring!
val ZenBg: Color @Composable get() = LocalZenColors.current.bg
val ZenSurface: Color @Composable get() = LocalZenColors.current.surface
val ZenSurfaceSubtle: Color @Composable get() = LocalZenColors.current.surfaceSubtle
val ZenBorder: Color @Composable get() = LocalZenColors.current.border
val ZenBorderSelected: Color @Composable get() = LocalZenColors.current.borderSelected
val ZenTextPrimary: Color @Composable get() = LocalZenColors.current.textPrimary
val ZenTextSecondary: Color @Composable get() = LocalZenColors.current.textSecondary
val ZenTextTertiary: Color @Composable get() = LocalZenColors.current.textTertiary
val HeatmapLevel0: Color @Composable get() = LocalZenColors.current.heatmapLevel0

// Raw constant fallbacks if ever needed
val RawZenBg = Color(0xFFF7FAF7)
val RawZenSurface = Color(0xFFFFFFFF)
val RawZenDarkBg = Color(0xFF131814)
val RawZenDarkSurface = Color(0xFF1A221C)

// Soothing Habit Category Accent Colors (Appealing & Calming)
val AccentEmerald = Color(0xFF437A55)     // Core Action / Consistency / Gym
val AccentOcean = Color(0xFF386B80)       // Deep Focus / Study / Water
val AccentTerracotta = Color(0xFFB55D46)  // Energy / Nutrition / No Sugar
val AccentLavender = Color(0xFF6B5F8C)    // Mindfulness / Meditation / Sleep
val AccentOchre = Color(0xFFA67B34)       // Reading / Writing / Growth
val AccentRose = Color(0xFF9E4E68)        // Wellness / Self-care / Fitness
val AccentSky = Color(0xFF3A7D99)         // Hydration / Outdoor / Walking
val AccentSage = Color(0xFF5D8464)        // Botanical calm / Balance

// Daily Heatmap Activity Intensity Levels
val HeatmapLevel1 = Color(0xFFC3DBC5)     // 1-25% - Light touch
val HeatmapLevel2 = Color(0xFF8FB791)     // 26-50% - Medium progress
val HeatmapLevel3 = Color(0xFF57915B)     // 51-75% - Strong momentum
val HeatmapLevel4 = Color(0xFF2E6B34)     // 76-100% - Peak completion

// Dark Theme Nordic Palette
val ZenDarkBg = Color(0xFF131814)
val ZenDarkSurface = Color(0xFF1A221C)
val ZenDarkSurfaceSubtle = Color(0xFF232D25)
val ZenDarkBorder = Color(0xFF2D3B30)
val ZenDarkTextPrimary = Color(0xFFE8EFE9)
val ZenDarkTextSecondary = Color(0xFFA5B6A8)
