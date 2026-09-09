package com.example.studytimerapp.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.studytimerapp.data.Habit
import com.example.studytimerapp.data.HabitEntry
import com.example.studytimerapp.data.HabitType
import com.example.studytimerapp.theme.*
import java.util.concurrent.TimeUnit

@Composable
fun HabitItemCard(
    habit: Habit,
    entry: HabitEntry?,
    monthlyCompletionPercent: Int,
    isTimerRunning: Boolean = false,
    timerElapsedSeconds: Long = 0L,
    onToggleCheck: () -> Unit,
    onToggleRestDay: () -> Unit,
    onIncrementCounter: () -> Unit,
    onDecrementCounter: () -> Unit,
    onStartTimer: () -> Unit,
    onPauseTimer: () -> Unit,
    onStopTimer: () -> Unit,
    onResetTimer: () -> Unit,
    onDeleteHabit: () -> Unit,
    modifier: Modifier = Modifier
) {
    val haptic = LocalHapticFeedback.current
    var showMenu by remember { mutableStateOf(false) }

    val habitColor = Color(habit.color)
    val isCompleted = entry?.isCompleted == true
    val isRestDay = entry?.isRestDay == true

    Card(
        modifier = modifier
            .fillMaxWidth()
            .border(
                width = if (isCompleted) 1.5.dp else 1.dp,
                color = if (isCompleted) habitColor.copy(alpha = 0.6f) else ZenBorder,
                shape = RoundedCornerShape(20.dp)
            ),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isCompleted) habitColor.copy(alpha = 0.05f) else ZenSurface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            // Top Row: Icon + Name + Subtitle + Independent Checkbox & Menu
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Circular Glyph Icon
                Box(
                    modifier = Modifier
                        .size(46.dp)
                        .clip(CircleShape)
                        .background(habitColor.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = habit.icon, fontSize = 22.sp)
                }

                // Title & Subtitle Details
                Column(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(2.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = habit.name,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = ZenTextPrimary
                        )

                        if (isRestDay) {
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = ZenSurfaceSubtle
                            ) {
                                Text(
                                    text = "☕ Rest Day",
                                    fontSize = 10.sp,
                                    color = ZenTextSecondary,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }

                    // Dynamic Subtitle by Habit Type
                    when (habit.type) {
                        HabitType.TIMED -> {
                            val loggedMinutes = ((entry?.loggedDurationSeconds ?: 0L) + timerElapsedSeconds) / 60
                            val targetMins = habit.targetDurationMinutes
                            val timerStatus = if (isTimerRunning) "• ⏱ Running" else if (timerElapsedSeconds > 0) "• ⏸ Paused" else ""
                            Text(
                                text = "Goal: ${targetMins}m • ${loggedMinutes}m logged $timerStatus",
                                fontSize = 12.sp,
                                color = if (isTimerRunning) AccentEmerald else ZenTextSecondary
                            )
                        }
                        HabitType.COUNTER -> {
                            val current = entry?.currentCount ?: 0
                            Text(
                                text = "Goal: ${habit.targetCount} ${habit.targetUnit} • $current logged",
                                fontSize = 12.sp,
                                color = ZenTextSecondary
                            )
                        }
                        HabitType.CHECK -> {
                            Text(
                                text = if (isCompleted) "Completed for today" else "Daily Action",
                                fontSize = 12.sp,
                                color = if (isCompleted) AccentEmerald else ZenTextSecondary
                            )
                        }
                    }
                }

                // Top-Right: Independent Activity Check Button [ ✓ ] & Overflow Menu
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    // Tactile Independent Check Button
                    val checkBtnBg by animateColorAsState(
                        targetValue = if (isCompleted) habitColor else ZenSurfaceSubtle,
                        label = "checkBtnBg"
                    )
                    val checkIconColor by animateColorAsState(
                        targetValue = if (isCompleted) Color.White else ZenTextSecondary,
                        label = "checkIconColor"
                    )

                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(checkBtnBg)
                            .clickable {
                                haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                                onToggleCheck()
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Check,
                            contentDescription = "Toggle Complete",
                            tint = checkIconColor,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    // More Options Menu
                    Box {
                        IconButton(onClick = { showMenu = true }, modifier = Modifier.size(28.dp)) {
                            Icon(Icons.Default.MoreVert, contentDescription = "More", tint = ZenTextSecondary)
                        }
                        DropdownMenu(
                            expanded = showMenu,
                            onDismissRequest = { showMenu = false }
                        ) {
                            DropdownMenuItem(
                                text = { Text(if (isRestDay) "Remove Rest Day" else "Mark as Rest Day ☕") },
                                onClick = {
                                    haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                    onToggleRestDay()
                                    showMenu = false
                                }
                            )
                            DropdownMenuItem(
                                text = { Text("Delete Habit", color = MaterialTheme.colorScheme.error) },
                                onClick = {
                                    onDeleteHabit()
                                    showMenu = false
                                }
                            )
                        }
                    }
                }
            }

            // --- Type-Specific Interactive Control Bar ---

            // A) For TIMED Habits: Dedicated Timer Control Bar (Play, Pause, Save/Stop, Reset)
            if (habit.type == HabitType.TIMED) {
                Spacer(modifier = Modifier.height(12.dp))
                val isTimerActive = isTimerRunning || timerElapsedSeconds > 0

                if (!isTimerActive) {
                    // When idle: clean single button to start focus
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                                onStartTimer()
                            },
                        shape = RoundedCornerShape(12.dp),
                        color = habitColor.copy(alpha = 0.12f)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 10.dp),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.PlayArrow, contentDescription = "Start Timer", tint = habitColor, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Start Focus Stopwatch", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = habitColor)
                        }
                    }
                } else {
                    // When active (Running or Paused): Live Stopwatch Readout + Full Controls
                    val hours = TimeUnit.SECONDS.toHours(timerElapsedSeconds)
                    val minutes = TimeUnit.SECONDS.toMinutes(timerElapsedSeconds) % 60
                    val seconds = timerElapsedSeconds % 60
                    val formattedTime = if (hours > 0) {
                        String.format("%02d:%02d:%02d", hours, minutes, seconds)
                    } else {
                        String.format("%02d:%02d", minutes, seconds)
                    }

                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        color = ZenSurfaceSubtle
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(10.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            // Live Stopwatch Time Display
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Text("⏱", fontSize = 14.sp)
                                    Text("Active Stopwatch", fontSize = 12.sp, color = ZenTextSecondary)
                                }
                                Text(
                                    text = formattedTime,
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isTimerRunning) AccentEmerald else ZenTextPrimary
                                )
                            }

                            // Control Buttons: [ Pause / Resume ] [ Stop & Save ] [ Reset ]
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                // Pause / Resume
                                Button(
                                    onClick = {
                                        haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                                        if (isTimerRunning) onPauseTimer() else onStartTimer()
                                    },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(10.dp),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = if (isTimerRunning) AccentTerracotta else habitColor
                                    ),
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp)
                                ) {
                                    Icon(
                                        imageVector = if (isTimerRunning) Icons.Default.Pause else Icons.Default.PlayArrow,
                                        contentDescription = null,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(if (isTimerRunning) "Pause" else "Resume", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }

                                // Stop & Save
                                Button(
                                    onClick = {
                                        haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                                        onStopTimer()
                                    },
                                    modifier = Modifier.weight(1.3f),
                                    shape = RoundedCornerShape(10.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = AccentEmerald),
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp)
                                ) {
                                    Icon(Icons.Default.Save, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    val loggedM = (timerElapsedSeconds / 60).coerceAtLeast(1)
                                    Text("Save (+${loggedM}m)", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }

                                // Reset (Discard without saving)
                                OutlinedButton(
                                    onClick = {
                                        haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                        onResetTimer()
                                    },
                                    modifier = Modifier.weight(0.9f),
                                    shape = RoundedCornerShape(10.dp),
                                    colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.error),
                                    border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.error.copy(alpha = 0.4f)),
                                    contentPadding = PaddingValues(horizontal = 6.dp, vertical = 6.dp)
                                ) {
                                    Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(2.dp))
                                    Text("Reset", fontSize = 12.sp)
                                }
                            }
                        }
                    }
                }
            }

            // B) For COUNTER Habits: Dedicated Stepper [-] [Count] [+]
            if (habit.type == HabitType.COUNTER) {
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("DAILY COUNTER", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = ZenTextSecondary, letterSpacing = 0.5.sp)
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(ZenSurfaceSubtle)
                            .padding(2.dp)
                    ) {
                        IconButton(
                            onClick = {
                                haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                onDecrementCounter()
                            },
                            modifier = Modifier.size(30.dp)
                        ) {
                            Icon(Icons.Default.Remove, contentDescription = "Decrement", tint = ZenTextSecondary, modifier = Modifier.size(16.dp))
                        }
                        Text(
                            text = "${entry?.currentCount ?: 0} / ${habit.targetCount} ${habit.targetUnit}",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = ZenTextPrimary,
                            modifier = Modifier.padding(horizontal = 8.dp)
                        )
                        IconButton(
                            onClick = {
                                haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                onIncrementCounter()
                            },
                            modifier = Modifier.size(30.dp)
                        ) {
                            Icon(Icons.Default.Add, contentDescription = "Increment", tint = AccentEmerald, modifier = Modifier.size(16.dp))
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // --- DUAL PROGRESS BARS ---

            // 1. Daily Target Progress Bar
            val (dailyLabel, dailyPercent, dailyText) = when (habit.type) {
                HabitType.TIMED -> {
                    val totalLoggedSecs = (entry?.loggedDurationSeconds ?: 0L) + timerElapsedSeconds
                    val targetSecs = (habit.targetDurationMinutes * 60L).coerceAtLeast(1L)
                    val pct = if (isCompleted && totalLoggedSecs < targetSecs) 100 else ((totalLoggedSecs.toFloat() / targetSecs) * 100).toInt()
                    val loggedMins = totalLoggedSecs / 60
                    Triple("TODAY'S TARGET", pct, "$loggedMins/${habit.targetDurationMinutes}m ($pct%)")
                }
                HabitType.COUNTER -> {
                    val count = entry?.currentCount ?: 0
                    val target = habit.targetCount.coerceAtLeast(1)
                    val pct = ((count.toFloat() / target) * 100).toInt()
                    Triple("TODAY'S TARGET", pct, "$count/$target ${habit.targetUnit} ($pct%)")
                }
                HabitType.CHECK -> {
                    val pct = if (isCompleted) 100 else 0
                    Triple("TODAY'S TARGET", pct, if (isCompleted) "Completed (100%)" else "Pending (0%)")
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = dailyLabel,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = ZenTextPrimary,
                    letterSpacing = 0.5.sp
                )
                Text(
                    text = dailyText,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (dailyPercent >= 100) AccentEmerald else habitColor
                )
            }

            Spacer(modifier = Modifier.height(5.dp))

            SegmentedProgressBar(
                progressPercent = dailyPercent,
                fillColor = if (dailyPercent >= 100) AccentEmerald else habitColor,
                segments = 10,
                height = 8.dp,
                showPercentText = false
            )

            Spacer(modifier = Modifier.height(10.dp))

            // 2. Monthly Consistency Progress Bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "MONTHLY RATE",
                    fontSize = 9.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = ZenTextSecondary,
                    letterSpacing = 0.5.sp
                )
                Text(
                    text = "$monthlyCompletionPercent% consistent",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Medium,
                    color = ZenTextSecondary
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            SegmentedProgressBar(
                progressPercent = monthlyCompletionPercent,
                fillColor = habitColor.copy(alpha = 0.75f),
                segments = 10,
                height = 5.dp,
                showPercentText = false
            )
        }
    }
}
