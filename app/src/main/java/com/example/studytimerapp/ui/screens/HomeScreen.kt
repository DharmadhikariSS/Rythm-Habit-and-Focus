package com.example.studytimerapp.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Stop
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
import com.example.studytimerapp.data.Subject
import com.example.studytimerapp.theme.*
import com.example.studytimerapp.viewmodels.ActiveTimer
import com.example.studytimerapp.viewmodels.TimerViewModel
import java.util.concurrent.TimeUnit

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: TimerViewModel,
    modifier: Modifier = Modifier
) {
    val subjects by viewModel.allSubjects.collectAsState(initial = emptyList())
    val activeTimers by viewModel.activeTimers.collectAsState()
    
    var showAddDialog by remember { mutableStateOf(false) }
    val runningCount = activeTimers.count { it.value.isRunning }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Focus Timers", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = ZenTextPrimary)
                        Text(
                            text = if (runningCount > 0) "1 active focus session" else "Focus stopwatch engine",
                            fontSize = 11.sp,
                            color = if (runningCount > 0) AccentEmerald else ZenTextSecondary
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { showAddDialog = true }) {
                        Icon(Icons.Default.Add, contentDescription = "Add Timer Subject", tint = AccentEmerald)
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
                Icon(Icons.Default.Add, contentDescription = "Add Subject")
            }
        },
        containerColor = ZenBg
    ) { padding ->
        if (subjects.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("⏱", fontSize = 36.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("No focus subjects yet", fontWeight = FontWeight.Bold, color = ZenTextPrimary)
                    Text("Tap + to add a subject or timed habit", fontSize = 12.sp, color = ZenTextSecondary)
                }
            }
        } else {
            LazyColumn(
                modifier = modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
                contentPadding = PaddingValues(top = 8.dp, bottom = 80.dp)
            ) {
                items(subjects, key = { it.id }) { subject ->
                    SubjectTimerCard(
                        subject = subject,
                        timerState = activeTimers[subject.id],
                        onToggle = { viewModel.toggleTimer(subject.id) },
                        onStop = { viewModel.stopAndSaveTimer(subject.id) },
                        onDelete = { viewModel.deleteSubject(subject) }
                    )
                }
            }
        }

        if (showAddDialog) {
            AddSubjectDialog(
                onDismiss = { showAddDialog = false },
                onAdd = { name, color, targetHours ->
                    viewModel.addSubject(name, color, targetHours)
                    showAddDialog = false
                }
            )
        }
    }
}

@Composable
fun SubjectTimerCard(
    subject: Subject,
    timerState: ActiveTimer?,
    onToggle: () -> Unit,
    onStop: () -> Unit,
    onDelete: () -> Unit
) {
    val totalMs = timerState?.totalElapsed ?: 0L
    val hours = TimeUnit.MILLISECONDS.toHours(totalMs)
    val minutes = TimeUnit.MILLISECONDS.toMinutes(totalMs) % 60
    val seconds = TimeUnit.MILLISECONDS.toSeconds(totalMs) % 60
    val timeString = String.format("%02d:%02d:%02d", hours, minutes, seconds)

    val isRunning = timerState?.isRunning == true
    val subjectColor = Color(subject.color)

    Card(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isRunning) subjectColor.copy(alpha = 0.08f) else ZenSurface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
        modifier = Modifier
            .fillMaxWidth()
            .border(
                width = if (isRunning) 1.5.dp else 1.dp,
                color = if (isRunning) subjectColor.copy(alpha = 0.6f) else ZenBorder,
                shape = RoundedCornerShape(20.dp)
            )
    ) {
        Column(
            modifier = Modifier
                .padding(18.dp)
                .fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(14.dp)
                            .clip(CircleShape)
                            .background(subjectColor)
                    )
                    Text(
                        text = subject.name,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = ZenTextPrimary
                    )
                }
                IconButton(onClick = onDelete, modifier = Modifier.size(32.dp)) {
                    Icon(
                        Icons.Default.Delete,
                        contentDescription = "Delete Subject",
                        tint = ZenTextTertiary
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(14.dp))
            
            Text(
                text = timeString,
                fontSize = 42.sp,
                fontWeight = FontWeight.Light,
                color = if (isRunning) subjectColor else ZenTextPrimary,
                modifier = Modifier.align(Alignment.CenterHorizontally),
                letterSpacing = 2.sp
            )

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Button(
                    onClick = onToggle,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isRunning) AccentTerracotta else subjectColor
                    )
                ) {
                    Icon(
                        imageVector = if (isRunning) Icons.Default.Pause else Icons.Default.PlayArrow,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(if (isRunning) "Pause" else if (totalMs > 0) "Resume" else "Start Focus")
                }

                if (totalMs > 0) {
                    OutlinedButton(
                        onClick = onStop,
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = MaterialTheme.colorScheme.error
                        ),
                        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.error.copy(alpha = 0.5f))
                    ) {
                        Icon(Icons.Default.Stop, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Log & Reset")
                    }
                }
            }
        }
    }
}

@Composable
fun AddSubjectDialog(onDismiss: () -> Unit, onAdd: (String, Int, Float) -> Unit) {
    var name by remember { mutableStateOf("") }
    var selectedWeeklyHours by remember { mutableFloatStateOf(5f) }
    val soothingColors = listOf(
        AccentEmerald,
        AccentOcean,
        AccentTerracotta,
        AccentLavender,
        AccentOchre,
        AccentRose,
        AccentSky,
        AccentSage
    )
    var selectedColor by remember { mutableStateOf(soothingColors[0]) }
    val weeklyGoalOptions = listOf(3f, 5f, 8f, 10f, 15f, 20f)

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add Focus Subject", fontWeight = FontWeight.Bold, color = ZenTextPrimary) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Subject Name") },
                    placeholder = { Text("e.g. Study, Gym, Reading") },
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp)
                )

                // Weekly Target Hours
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("WEEKLY TARGET HOURS", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = ZenTextSecondary)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        weeklyGoalOptions.forEach { hours ->
                            val isSelected = selectedWeeklyHours == hours
                            Surface(
                                modifier = Modifier
                                    .weight(1f)
                                    .clickable { selectedWeeklyHours = hours },
                                shape = RoundedCornerShape(8.dp),
                                color = if (isSelected) selectedColor else ZenSurfaceSubtle
                            ) {
                                Text(
                                    text = "${hours.toInt()}h",
                                    fontSize = 12.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                    color = if (isSelected) Color.White else ZenTextPrimary,
                                    modifier = Modifier.padding(vertical = 6.dp),
                                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                                )
                            }
                        }
                    }
                }
                
                Text("SELECT COLOR", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = ZenTextSecondary)

                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    soothingColors.forEach { color ->
                        val isSelected = selectedColor == color
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(CircleShape)
                                .background(color)
                                .border(
                                    width = if (isSelected) 3.dp else 0.dp,
                                    color = if (isSelected) ZenTextPrimary else Color.Transparent,
                                    shape = CircleShape
                                )
                                .clickable { selectedColor = color }
                        )
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { if (name.isNotBlank()) onAdd(name.trim(), selectedColor.toArgb(), selectedWeeklyHours) },
                enabled = name.isNotBlank(),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(containerColor = selectedColor)
            ) {
                Text("Add Subject", color = Color.White)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = ZenTextSecondary)
            }
        }
    )
}
