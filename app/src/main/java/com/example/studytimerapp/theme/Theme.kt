package com.example.studytimerapp.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = AccentEmerald,
    onPrimary = Color.White,
    primaryContainer = ZenDarkSurfaceSubtle,
    onPrimaryContainer = ZenDarkTextPrimary,
    secondary = AccentOcean,
    onSecondary = Color.White,
    tertiary = AccentTerracotta,
    background = ZenDarkBg,
    onBackground = ZenDarkTextPrimary,
    surface = ZenDarkSurface,
    onSurface = ZenDarkTextPrimary,
    surfaceVariant = ZenDarkSurfaceSubtle,
    onSurfaceVariant = ZenDarkTextSecondary,
    outline = ZenDarkBorder
)

private val LightColorScheme = lightColorScheme(
    primary = AccentEmerald,
    onPrimary = Color.White,
    primaryContainer = ZenSurfaceSubtle,
    onPrimaryContainer = ZenTextPrimary,
    secondary = AccentOcean,
    onSecondary = Color.White,
    tertiary = AccentTerracotta,
    background = ZenBg,
    onBackground = ZenTextPrimary,
    surface = ZenSurface,
    onSurface = ZenTextPrimary,
    surfaceVariant = ZenSurfaceSubtle,
    onSurfaceVariant = ZenTextSecondary,
    outline = ZenBorder
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

    MaterialTheme(colorScheme = colorScheme, typography = Typography, content = content)
}
