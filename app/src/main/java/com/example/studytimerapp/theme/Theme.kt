package com.example.studytimerapp.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary = AccentEmerald,
    onPrimary = Color.White,
    primaryContainer = Color(0xFF232D25),
    onPrimaryContainer = Color(0xFFE8EFE9),
    secondary = AccentOcean,
    onSecondary = Color.White,
    tertiary = AccentTerracotta,
    background = Color(0xFF131814),
    onBackground = Color(0xFFE8EFE9),
    surface = Color(0xFF1A221C),
    onSurface = Color(0xFFE8EFE9),
    surfaceVariant = Color(0xFF232D25),
    onSurfaceVariant = Color(0xFFA5B6A8),
    outline = Color(0xFF2D3B30)
)

private val LightColorScheme = lightColorScheme(
    primary = AccentEmerald,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFEFF3EF),
    onPrimaryContainer = Color(0xFF1B261F),
    secondary = AccentOcean,
    onSecondary = Color.White,
    tertiary = AccentTerracotta,
    background = Color(0xFFF7FAF7),
    onBackground = Color(0xFF1B261F),
    surface = Color(0xFFFFFFFF),
    onSurface = Color(0xFF1B261F),
    surfaceVariant = Color(0xFFEFF3EF),
    onSurfaceVariant = Color(0xFF5B6E61),
    outline = Color(0xFFE2EAE2)
)

@Composable
fun StudyTimerAppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false, // Default to false to showcase the soothing Nordic Zen theme
    content: @Composable () -> Unit,
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    val zenPalette = if (darkTheme) DarkZenPalette else LightZenPalette

    CompositionLocalProvider(LocalZenColors provides zenPalette) {
        MaterialTheme(colorScheme = colorScheme, typography = Typography, content = content)
    }
}
