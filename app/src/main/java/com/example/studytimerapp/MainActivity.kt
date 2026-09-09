package com.example.studytimerapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.*
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.example.studytimerapp.data.ThemeMode
import com.example.studytimerapp.data.ThemePreferences
import com.example.studytimerapp.theme.*
import com.example.studytimerapp.ui.screens.AnalyticsScreen
import com.example.studytimerapp.ui.screens.HabitScreen
import com.example.studytimerapp.ui.screens.HomeScreen
import com.example.studytimerapp.viewmodels.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val themePrefs = ThemePreferences(this)

        setContent {
            val themeMode by themePrefs.themeMode.collectAsState()
            val isSystemDark = isSystemInDarkTheme()
            val isDark = when (themeMode) {
                ThemeMode.LIGHT -> false
                ThemeMode.DARK -> true
                ThemeMode.SYSTEM -> isSystemDark
            }

            StudyTimerAppTheme(darkTheme = isDark) {
                val app = application as StudyTimerApplication
                val timerViewModel: TimerViewModel = viewModel(
                    factory = TimerViewModelFactory(app.repository, app.applicationContext)
                )
                val analyticsViewModel: AnalyticsViewModel = viewModel(
                    factory = AnalyticsViewModelFactory(app.repository)
                )
                val habitViewModel: HabitViewModel = viewModel(
                    factory = HabitViewModelFactory(app.repository)
                )

                // Request POST_NOTIFICATIONS on Android 13+ for lock screen timer
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
                    val permissionLauncher = androidx.activity.compose.rememberLauncherForActivityResult(
                        contract = androidx.activity.result.contract.ActivityResultContracts.RequestPermission()
                    ) {}
                    androidx.compose.runtime.LaunchedEffect(Unit) {
                        permissionLauncher.launch(android.Manifest.permission.POST_NOTIFICATIONS)
                    }
                }

                val navController = rememberNavController()
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route ?: "habits"

                Scaffold(
                    bottomBar = {
                        NavigationBar(
                            containerColor = ZenSurface,
                            tonalElevation = 0.dp
                        ) {
                            NavigationBarItem(
                                selected = currentRoute == "habits",
                                onClick = {
                                    if (currentRoute != "habits") {
                                        navController.navigate("habits") {
                                            popUpTo(navController.graph.findStartDestination().id) {
                                                saveState = true
                                            }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    }
                                },
                                icon = { Icon(Icons.Default.CheckCircle, contentDescription = "Habits") },
                                label = { Text("Habits", fontSize = 12.sp, fontWeight = if (currentRoute == "habits") FontWeight.Bold else FontWeight.Normal) },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = AccentEmerald,
                                    selectedTextColor = AccentEmerald,
                                    indicatorColor = AccentEmerald.copy(alpha = 0.15f),
                                    unselectedIconColor = ZenTextSecondary,
                                    unselectedTextColor = ZenTextSecondary
                                )
                            )

                            NavigationBarItem(
                                selected = currentRoute == "timers",
                                onClick = {
                                    if (currentRoute != "timers") {
                                        navController.navigate("timers") {
                                            popUpTo(navController.graph.findStartDestination().id) {
                                                saveState = true
                                            }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    }
                                },
                                icon = { Icon(Icons.Default.Timer, contentDescription = "Focus Timers") },
                                label = { Text("Focus Timers", fontSize = 12.sp, fontWeight = if (currentRoute == "timers") FontWeight.Bold else FontWeight.Normal) },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = AccentEmerald,
                                    selectedTextColor = AccentEmerald,
                                    indicatorColor = AccentEmerald.copy(alpha = 0.15f),
                                    unselectedIconColor = ZenTextSecondary,
                                    unselectedTextColor = ZenTextSecondary
                                )
                            )

                            NavigationBarItem(
                                selected = currentRoute == "analytics",
                                onClick = {
                                    if (currentRoute != "analytics") {
                                        navController.navigate("analytics") {
                                            popUpTo(navController.graph.findStartDestination().id) {
                                                saveState = true
                                            }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    }
                                },
                                icon = { Icon(Icons.Default.BarChart, contentDescription = "Insights") },
                                label = { Text("Insights", fontSize = 12.sp, fontWeight = if (currentRoute == "analytics") FontWeight.Bold else FontWeight.Normal) },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = AccentEmerald,
                                    selectedTextColor = AccentEmerald,
                                    indicatorColor = AccentEmerald.copy(alpha = 0.15f),
                                    unselectedIconColor = ZenTextSecondary,
                                    unselectedTextColor = ZenTextSecondary
                                )
                            )
                        }
                    }
                ) { innerPadding ->
                    NavHost(
                        navController = navController,
                        startDestination = "habits",
                        modifier = Modifier.padding(innerPadding)
                    ) {
                        composable("habits") {
                            HabitScreen(
                                habitViewModel = habitViewModel,
                                timerViewModel = timerViewModel,
                                onNavigateToTimers = { navController.navigate("timers") },
                                isDark = isDark,
                                onToggleTheme = { themePrefs.toggleLightDark(isDark) }
                            )
                        }
                        composable("timers") {
                            HomeScreen(
                                viewModel = timerViewModel,
                                isDark = isDark,
                                onToggleTheme = { themePrefs.toggleLightDark(isDark) }
                            )
                        }
                        composable("analytics") {
                            AnalyticsScreen(
                                viewModel = analyticsViewModel,
                                isDark = isDark,
                                onToggleTheme = { themePrefs.toggleLightDark(isDark) }
                            )
                        }
                    }
                }
            }
        }
    }
}
