package com.example.studytimerapp.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.studytimerapp.data.DateUtils
import com.example.studytimerapp.data.Habit
import com.example.studytimerapp.data.HabitType
import com.example.studytimerapp.theme.*
import com.example.studytimerapp.ui.components.AddHabitDialog
import com.example.studytimerapp.ui.components.HabitItemCard
import com.example.studytimerapp.ui.components.MonthlyOverviewCard
import com.example.studytimerapp.viewmodels.HabitViewModel
import com.example.studytimerapp.viewmodels.TimerViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HabitScreen(
    habitViewModel: HabitViewModel,
    timerViewModel: TimerViewModel,
    onNavigateToTimers: () -> Unit,
    modifier: Modifier = Modifier,
    isDark: Boolean = false,
    onToggleTheme: (() -> Unit)? = null
) {
    val habits by habitViewModel.allHabits.collectAsState(initial = emptyList())
    val entries by habitViewModel.allEntries.collectAsState(initial = emptyList())
    val monthlyStats by habitViewModel.monthlyStats.collectAsState()
    val habitRates by habitViewModel.habitMonthlyRates.collectAsState()
    val selectedDateIso by habitViewModel.selectedDateIso.collectAsState()
    val activeTimers by timerViewModel.activeTimers.collectAsState()
    val allSubjects by timerViewModel.allSubjects.collectAsState(initial = emptyList())

    var showAddDialog by remember { mutableStateOf(false) }

    val todayIso = DateUtils.todayIso()
    val isViewingToday = selectedDateIso == todayIso

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(28.dp)
                                .clip(CircleShape)
                                .background(AccentEmerald.copy(alpha = 0.15f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("🌿", fontSize = 14.sp)
                        }
                        Column {
                            Text(
                                text = "Rhythm",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = ZenTextPrimary
                            )
                            Text(
                                text = "Daily Habits & Flow",
                                fontSize = 11.sp,
                                color = ZenTextSecondary
                            )
                        }
                    }
                },
                actions = {
                    IconButton(onClick = { onToggleTheme?.invoke() }) {
                        Icon(
                            imageVector = if (isDark) Icons.Default.LightMode else Icons.Default.DarkMode,
                            contentDescription = "Toggle Theme",
                            tint = AccentEmerald
                        )
                    }
                    IconButton(onClick = { showAddDialog = true }) {
                        Icon(Icons.Default.Add, contentDescription = "Add Habit", tint = AccentEmerald)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = ZenBg)
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = AccentEmerald,
                contentColor = Color.White,
                shape = RoundedCornerShape(16.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Habit")
            }
        },
        containerColor = ZenBg
    ) { padding ->
        LazyColumn(
            modifier = modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
            contentPadding = PaddingValues(top = 8.dp, bottom = 80.dp)
        ) {
            // 1. Monthly Overview Hero Card with 31-Day Heatmap
            item {
                MonthlyOverviewCard(
                    monthName = monthlyStats.monthName,
                    totalCompleted = monthlyStats.totalCompleted,
                    monthlyProgressPercent = monthlyStats.monthlyProgressPercent,
                    todayCompleted = monthlyStats.todayCompleted,
                    todayTotal = monthlyStats.todayTotal,
                    streakDays = monthlyStats.streakDays,
                    heatmapDays = monthlyStats.heatmapDays,
                    selectedDateIso = selectedDateIso,
                    onDateSelected = { habitViewModel.selectDate(it) },
                    onPreviousMonth = { habitViewModel.previousMonth() },
                    onNextMonth = { habitViewModel.nextMonth() }
                )
            }

            // 2. Selected Day Header & "Return to Today" button
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 4.dp, vertical = 2.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = if (isViewingToday) "TODAY'S HABITS" else "HABITS FOR $selectedDateIso",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = ZenTextSecondary,
                            letterSpacing = 0.5.sp
                        )
                    }

                    if (!isViewingToday) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = AccentEmerald.copy(alpha = 0.12f),
                            modifier = Modifier.clickable { habitViewModel.selectDate(todayIso) }
                        ) {
                            Text(
                                text = "Return to Today",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = AccentEmerald,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }
                }
            }

            // 3. Habit Cards
            if (habits.isEmpty()) {
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, ZenBorder, RoundedCornerShape(18.dp)),
                        shape = RoundedCornerShape(18.dp),
                        colors = CardDefaults.cardColors(containerColor = ZenSurface)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(20.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text("🌿", fontSize = 36.sp)
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                "No habits tracked yet",
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                                color = ZenTextPrimary
                            )
                            Text(
                                "Tap '+' or pick a starter habit below to jumpstart your daily flow:",
                                fontSize = 12.sp,
                                color = ZenTextSecondary,
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                                modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
                            )

                            Spacer(modifier = Modifier.height(14.dp))

                            Column(
                                modifier = Modifier.fillMaxWidth(),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                QuickHabitSuggestionRow(
                                    icon = "💧",
                                    name = "Drink Water (8 Cups)",
                                    tag = "Counter Habit",
                                    color = AccentOcean,
                                    onClick = {
                                        habitViewModel.addHabit(
                                            Habit(
                                                name = "Drink Water",
                                                icon = "💧",
                                                color = AccentOcean.toArgb(),
                                                type = HabitType.COUNTER,
                                                targetCount = 8
                                            )
                                        )
                                    }
                                )
                                QuickHabitSuggestionRow(
                                    icon = "📖",
                                    name = "Daily Reading (15m)",
                                    tag = "Timed Habit",
                                    color = AccentOchre,
                                    onClick = {
                                        habitViewModel.addHabit(
                                            Habit(
                                                name = "Daily Reading",
                                                icon = "📖",
                                                color = AccentOchre.toArgb(),
                                                type = HabitType.TIMED,
                                                targetDurationMinutes = 15
                                            )
                                        )
                                    }
                                )
                                QuickHabitSuggestionRow(
                                    icon = "🧘",
                                    name = "Deep Work Sprint (25m)",
                                    tag = "Focus Habit",
                                    color = AccentEmerald,
                                    onClick = {
                                        habitViewModel.addHabit(
                                            Habit(
                                                name = "Deep Work Sprint",
                                                icon = "🧘",
                                                color = AccentEmerald.toArgb(),
                                                type = HabitType.TIMED,
                                                targetDurationMinutes = 25
                                            )
                                        )
                                    }
                                )
                                QuickHabitSuggestionRow(
                                    icon = "🏃",
                                    name = "Morning Stretch & Walk",
                                    tag = "Check-in Habit",
                                    color = AccentTerracotta,
                                    onClick = {
                                        habitViewModel.addHabit(
                                            Habit(
                                                name = "Stretch & Walk",
                                                icon = "🏃",
                                                color = AccentTerracotta.toArgb(),
                                                type = HabitType.CHECK
                                            )
                                        )
                                    }
                                )
                            }
                        }
                    }
                }
            } else {
                items(habits, key = { it.id }) { habit ->
                    val entry = entries.find { it.habitId == habit.id && it.dateIso == selectedDateIso }
                    val rate = habitRates[habit.id] ?: 0

                    // Find matching subject for timed habits strictly by subjectId or name (never raw habit ID)
                    val matchingSubject = allSubjects.find { sub ->
                        (habit.subjectId != null && sub.id == habit.subjectId) ||
                        sub.name.equals(habit.name, ignoreCase = true)
                    }
                    val timerState = matchingSubject?.let { activeTimers[it.id] }
                    val isTimerRunning = timerState?.isRunning == true
                    val elapsedSecs = (timerState?.totalElapsed ?: 0L) / 1000

                    HabitItemCard(
                        habit = habit,
                        entry = entry,
                        monthlyCompletionPercent = rate,
                        isTimerRunning = isTimerRunning,
                        timerElapsedSeconds = elapsedSecs,
                        onToggleCheck = { habitViewModel.toggleHabit(habit.id) },
                        onToggleRestDay = { habitViewModel.toggleRestDay(habit.id) },
                        onIncrementCounter = { habitViewModel.incrementCounter(habit.id) },
                        onDecrementCounter = { habitViewModel.decrementCounter(habit.id) },
                        onStartTimer = {
                            if (matchingSubject != null) {
                                timerViewModel.toggleTimer(matchingSubject.id)
                            } else {
                                timerViewModel.addSubject(habit.name, habit.color)
                            }
                        },
                        onPauseTimer = {
                            matchingSubject?.let { timerViewModel.toggleTimer(it.id) }
                        },
                        onStopTimer = {
                            matchingSubject?.let { timerViewModel.stopAndSaveTimer(it.id) }
                        },
                        onResetTimer = {
                            matchingSubject?.let { timerViewModel.resetTimer(it.id) }
                        },
                        onDeleteHabit = { habitViewModel.deleteHabit(habit) }
                    )
                }
            }
        }

        if (showAddDialog) {
            AddHabitDialog(
                onDismiss = { showAddDialog = false },
                onAddHabit = { habit ->
                    habitViewModel.addHabit(habit)
                    showAddDialog = false
                }
            )
        }
    }
}

@Composable
private fun QuickHabitSuggestionRow(
    icon: String,
    name: String,
    tag: String,
    color: Color,
    onClick: () -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        color = ZenSurfaceSubtle,
        border = androidx.compose.foundation.BorderStroke(1.dp, ZenBorder)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 10.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(icon, fontSize = 20.sp)
                Column {
                    Text(name, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = ZenTextPrimary)
                    Text(tag, fontSize = 10.sp, color = color, fontWeight = FontWeight.SemiBold)
                }
            }
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = AccentEmerald.copy(alpha = 0.15f)
            ) {
                Text(
                    text = "+ Add",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = AccentEmerald,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
            }
        }
    }
}

