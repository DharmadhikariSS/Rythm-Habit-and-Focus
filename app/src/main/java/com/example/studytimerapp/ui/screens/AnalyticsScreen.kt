package com.example.studytimerapp.ui.screens

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.rememberScrollState
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import com.example.studytimerapp.data.CsvExportUtils
import com.example.studytimerapp.theme.*
import com.example.studytimerapp.ui.components.DonutChart
import com.example.studytimerapp.ui.components.SegmentedProgressBar
import com.example.studytimerapp.viewmodels.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AnalyticsScreen(
    viewModel: AnalyticsViewModel,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current

    var selectedLens by remember { mutableStateOf(AnalyticsLens.SUBJECTS) }
    val currentTab by viewModel.timeframe.collectAsState()

    // Lens 1 Data
    val subjectStats by viewModel.subjectStats.collectAsState()
    val donutSlices by viewModel.donutSlices.collectAsState()
    val subjectTargets by viewModel.subjectTargetProgress.collectAsState()
    val timeOfDay by viewModel.timeOfDayDistribution.collectAsState()
    val recentSessions by viewModel.recentSessions.collectAsState()

    // Lens 2 Data
    val habitLeaderboard by viewModel.habitLeaderboard.collectAsState()
    val weeklyMomentum by viewModel.weeklyMomentumBars.collectAsState()
    val habitExecutiveStats by viewModel.executiveHabitStats.collectAsState()

    // Unified Metric
    val rhythmScore by viewModel.dailyRhythmScore.collectAsState()

    val allHabits by viewModel.allHabits.collectAsState(initial = emptyList())
    val allEntries by viewModel.allEntries.collectAsState(initial = emptyList())
    val allSubjects by viewModel.allSubjects.collectAsState(initial = emptyList())
    val allSessions by viewModel.allSessions.collectAsState(initial = emptyList())

    val totalTimeSecs = subjectStats.sumOf { it.totalTimeSeconds }
    val totalHours = totalTimeSecs / 3600
    val totalMinutes = (totalTimeSecs % 3600) / 60

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Productivity Insights", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = ZenTextPrimary)
                        Text("Multi-subject focus & habit intelligence", fontSize = 11.sp, color = ZenTextSecondary)
                    }
                },
                actions = {
                    TextButton(
                        onClick = {
                            CsvExportUtils.exportAndShareData(
                                context = context,
                                habits = allHabits,
                                entries = allEntries,
                                subjects = allSubjects,
                                sessions = allSessions
                            )
                        }
                    ) {
                        Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(16.dp), tint = AccentEmerald)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Export CSV", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = AccentEmerald)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = ZenBg)
            )
        },
        containerColor = ZenBg
    ) { padding ->
        LazyColumn(
            modifier = modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(top = 8.dp, bottom = 80.dp)
        ) {
            // 1. Executive Hero Card: Daily Rhythm Score & Total Metrics
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, ZenBorder, RoundedCornerShape(20.dp)),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = ZenSurface)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        // Golden Rhythm Radial Donut
                        Box(
                            modifier = Modifier
                                .size(72.dp)
                                .clip(RoundedCornerShape(16.dp))
                                .background(ZenSurfaceSubtle)
                                .padding(6.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Canvas(modifier = Modifier.size(54.dp)) {
                                drawCircle(color = ZenBorder, style = Stroke(width = 6.dp.toPx(), cap = StrokeCap.Round))
                                drawArc(
                                    color = AccentOchre,
                                    startAngle = -90f,
                                    sweepAngle = 360f * (rhythmScore / 100f).coerceIn(0f, 1f),
                                    useCenter = false,
                                    style = Stroke(width = 6.dp.toPx(), cap = StrokeCap.Round)
                                )
                            }
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("$rhythmScore", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = ZenTextPrimary)
                                Text("Score", fontSize = 9.sp, color = ZenTextSecondary)
                            }
                        }

                        Column(modifier = Modifier.weight(1f)) {
                            Text("DAILY RHYTHM INDEX", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = AccentOchre, letterSpacing = 0.5.sp)
                            Text(
                                text = if (rhythmScore >= 80) "✦ Optimal Flow State" else if (rhythmScore >= 50) "✦ Steady Momentum" else "✦ Building Rhythm",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = ZenTextPrimary
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                Column {
                                    Text("FOCUSED TIME", fontSize = 9.sp, color = ZenTextSecondary)
                                    Text("${totalHours}h ${totalMinutes}m", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = AccentEmerald)
                                }
                                Column {
                                    Text("ACTIONS DONE", fontSize = 9.sp, color = ZenTextSecondary)
                                    Text("${habitExecutiveStats.actionsCompleted} Completed", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = AccentOcean)
                                }
                            }
                        }
                    }
                }
            }

            // 2. Dual-Lens Segmented Switcher
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(ZenSurfaceSubtle)
                        .padding(3.dp)
                ) {
                    Surface(
                        modifier = Modifier
                            .weight(1f)
                            .clickable { selectedLens = AnalyticsLens.SUBJECTS },
                        shape = RoundedCornerShape(10.dp),
                        color = if (selectedLens == AnalyticsLens.SUBJECTS) ZenSurface else Color.Transparent
                    ) {
                        Row(
                            modifier = Modifier.padding(vertical = 8.dp),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("⏱", fontSize = 12.sp)
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                "Subject Timers",
                                fontSize = 13.sp,
                                fontWeight = if (selectedLens == AnalyticsLens.SUBJECTS) FontWeight.Bold else FontWeight.Normal,
                                color = if (selectedLens == AnalyticsLens.SUBJECTS) ZenTextPrimary else ZenTextSecondary
                            )
                        }
                    }

                    Surface(
                        modifier = Modifier
                            .weight(1f)
                            .clickable { selectedLens = AnalyticsLens.HABITS },
                        shape = RoundedCornerShape(10.dp),
                        color = if (selectedLens == AnalyticsLens.HABITS) ZenSurface else Color.Transparent
                    ) {
                        Row(
                            modifier = Modifier.padding(vertical = 8.dp),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("🌿", fontSize = 12.sp)
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                "Habit Consistency",
                                fontSize = 13.sp,
                                fontWeight = if (selectedLens == AnalyticsLens.HABITS) FontWeight.Bold else FontWeight.Normal,
                                color = if (selectedLens == AnalyticsLens.HABITS) ZenTextPrimary else ZenTextSecondary
                            )
                        }
                    }
                }
            }

            // ==========================================
            // LENS 1: MULTI-SUBJECT TIMER INSIGHTS
            // ==========================================
            if (selectedLens == AnalyticsLens.SUBJECTS) {
                // Timeframe Selector
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Timeframe.entries.forEach { tf ->
                            val isSelected = currentTab == tf
                            Surface(
                                modifier = Modifier
                                    .weight(1f)
                                    .clickable { viewModel.setTimeframe(tf) },
                                shape = RoundedCornerShape(10.dp),
                                color = if (isSelected) AccentEmerald else ZenSurfaceSubtle
                            ) {
                                Text(
                                    text = tf.name.lowercase().replaceFirstChar { it.uppercase() },
                                    fontSize = 12.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                    color = if (isSelected) Color.White else ZenTextSecondary,
                                    modifier = Modifier.padding(vertical = 6.dp),
                                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                                )
                            }
                        }
                    }
                }

                // A. Multi-Subject Comparison Bar Chart
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, ZenBorder, RoundedCornerShape(18.dp)),
                        shape = RoundedCornerShape(18.dp),
                        colors = CardDefaults.cardColors(containerColor = ZenSurface)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("MULTI-SUBJECT FOCUS COMPARISON", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = ZenTextSecondary, letterSpacing = 0.5.sp)
                            Spacer(modifier = Modifier.height(16.dp))

                            if (subjectStats.isEmpty() || subjectStats.all { it.totalTimeSeconds == 0L }) {
                                Box(modifier = Modifier.fillMaxWidth().height(100.dp), contentAlignment = Alignment.Center) {
                                    Text("No sessions recorded for this timeframe", fontSize = 12.sp, color = ZenTextSecondary)
                                }
                            } else {
                                val maxSecs = subjectStats.maxOfOrNull { it.totalTimeSeconds }?.coerceAtLeast(1L) ?: 1L
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .horizontalScroll(rememberScrollState()),
                                    horizontalArrangement = Arrangement.spacedBy(16.dp, Alignment.CenterHorizontally),
                                    verticalAlignment = Alignment.Bottom
                                ) {
                                    subjectStats.forEach { stat ->
                                        val subColor = Color(stat.subject.color)
                                        val fraction = (stat.totalTimeSeconds.toFloat() / maxSecs).coerceIn(0f, 1f)
                                        val barHeight = (fraction * 100f).dp.coerceAtLeast(4.dp)

                                        val durationLabel = when {
                                            stat.totalTimeSeconds >= 3600 -> "${stat.totalTimeSeconds / 3600}h ${(stat.totalTimeSeconds % 3600) / 60}m"
                                            stat.totalTimeSeconds >= 60 -> "${stat.totalTimeSeconds / 60}m"
                                            stat.totalTimeSeconds > 0 -> "${stat.totalTimeSeconds}s"
                                            else -> "-"
                                        }

                                        Column(
                                            horizontalAlignment = Alignment.CenterHorizontally,
                                            modifier = Modifier.width(56.dp)
                                        ) {
                                            // Duration text directly above the bar
                                            Text(
                                                text = durationLabel,
                                                fontSize = 10.sp,
                                                fontWeight = FontWeight.SemiBold,
                                                color = if (stat.totalTimeSeconds > 0) ZenTextPrimary else ZenTextSecondary.copy(alpha = 0.5f),
                                                maxLines = 1
                                            )

                                            Spacer(modifier = Modifier.height(6.dp))

                                            // Bar column with background track so empty subjects have a clear visual slot
                                            Box(
                                                modifier = Modifier
                                                    .width(26.dp)
                                                    .height(110.dp)
                                                    .clip(RoundedCornerShape(8.dp))
                                                    .background(ZenSurfaceSubtle),
                                                contentAlignment = Alignment.BottomCenter
                                            ) {
                                                Box(
                                                    modifier = Modifier
                                                        .fillMaxWidth()
                                                        .height(barHeight)
                                                        .clip(RoundedCornerShape(8.dp))
                                                        .background(if (stat.totalTimeSeconds > 0) subColor else ZenBorder)
                                                )
                                            }

                                            Spacer(modifier = Modifier.height(8.dp))

                                            // Subject name directly aligned beneath the bar
                                            Text(
                                                text = stat.subject.name,
                                                fontSize = 11.sp,
                                                fontWeight = FontWeight.Medium,
                                                color = ZenTextSecondary,
                                                maxLines = 1,
                                                overflow = TextOverflow.Ellipsis,
                                                textAlign = TextAlign.Center
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // B. Time Allocation Donut Chart
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, ZenBorder, RoundedCornerShape(18.dp)),
                        shape = RoundedCornerShape(18.dp),
                        colors = CardDefaults.cardColors(containerColor = ZenSurface)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("PROPORTIONAL TIME ALLOCATION", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = ZenTextSecondary, letterSpacing = 0.5.sp)
                            Spacer(modifier = Modifier.height(16.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceAround
                            ) {
                                DonutChart(
                                    slices = donutSlices,
                                    totalText = "${totalHours}h ${totalMinutes}m",
                                    size = 130.dp,
                                    strokeWidth = 14.dp
                                )

                                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                    donutSlices.take(5).forEach { slice ->
                                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                            Box(modifier = Modifier.size(10.dp).clip(CircleShape).background(slice.color))
                                            Text("${slice.label}: ${slice.percentage}%", fontSize = 12.sp, color = ZenTextPrimary)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // C. Subject Weekly Target vs. Actual Progress Bars
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, ZenBorder, RoundedCornerShape(18.dp)),
                        shape = RoundedCornerShape(18.dp),
                        colors = CardDefaults.cardColors(containerColor = ZenSurface)
                    ) {
                        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            Text("WEEKLY TARGET VS. ACTUAL", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = ZenTextSecondary, letterSpacing = 0.5.sp)

                            subjectTargets.forEach { target ->
                                val subColor = Color(target.subject.color)
                                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text(target.subject.name, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = ZenTextPrimary)
                                        Text(
                                            String.format("%.1fh / %.0fh (%d%%)", target.loggedHours, target.targetHours, target.progressPercent),
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (target.progressPercent >= 100) AccentEmerald else subColor
                                        )
                                    }
                                    SegmentedProgressBar(
                                        progressPercent = target.progressPercent,
                                        fillColor = if (target.progressPercent >= 100) AccentEmerald else subColor,
                                        segments = 10,
                                        height = 7.dp,
                                        showPercentText = false
                                    )
                                }
                            }
                        }
                    }
                }

                // D. Time of Day Productivity Spread
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, ZenBorder, RoundedCornerShape(18.dp)),
                        shape = RoundedCornerShape(18.dp),
                        colors = CardDefaults.cardColors(containerColor = ZenSurface)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("PEAK FOCUS TIME OF DAY", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = ZenTextSecondary, letterSpacing = 0.5.sp)
                            Spacer(modifier = Modifier.height(12.dp))

                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                TimeOfDayCard("🌅 Morning", "6 AM - 12 PM", timeOfDay.morningPct, AccentOcean, Modifier.weight(1f))
                                TimeOfDayCard("☀️ Afternoon", "12 PM - 6 PM", timeOfDay.afternoonPct, AccentEmerald, Modifier.weight(1f))
                                TimeOfDayCard("🌙 Evening", "6 PM - 12 AM", timeOfDay.eveningPct, AccentLavender, Modifier.weight(1f))
                            }
                        }
                    }
                }

                // E. Recent Session Logs Header
                item {
                    Text("RECENT FOCUS SESSIONS", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = ZenTextSecondary, letterSpacing = 0.5.sp)
                }

                // Recent Sessions
                if (recentSessions.isEmpty()) {
                    item {
                        Text("No sessions recorded yet", fontSize = 12.sp, color = ZenTextSecondary)
                    }
                } else {
                    items(recentSessions, key = { it.id }) { s ->
                        Card(
                            colors = CardDefaults.cardColors(containerColor = ZenSurface),
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier.fillMaxWidth().border(1.dp, ZenBorder, RoundedCornerShape(14.dp))
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                    Box(modifier = Modifier.size(10.dp).clip(CircleShape).background(Color(s.subjectColor)))
                                    Column {
                                        Text(s.subjectName, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = ZenTextPrimary)
                                        Text(s.formattedDate, fontSize = 11.sp, color = ZenTextSecondary)
                                    }
                                }
                                Text(s.durationText, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = AccentEmerald)
                            }
                        }
                    }
                }
            }

            // ==========================================
            // LENS 2: HABIT CONSISTENCY INSIGHTS
            // ==========================================
            if (selectedLens == AnalyticsLens.HABITS) {
                // A. Executive Habit Scorecards
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        HabitStatBox("CONSISTENCY", "${habitExecutiveStats.consistencyRate}%", AccentEmerald, Modifier.weight(1f))
                        HabitStatBox("STREAK", "🔥 ${habitExecutiveStats.currentStreak}d", AccentTerracotta, Modifier.weight(1f))
                        HabitStatBox("RECORD", "🏆 ${habitExecutiveStats.bestStreak}d", AccentOchre, Modifier.weight(1f))
                    }
                }

                // B. 7-Day Momentum Bar Chart
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, ZenBorder, RoundedCornerShape(18.dp)),
                        shape = RoundedCornerShape(18.dp),
                        colors = CardDefaults.cardColors(containerColor = ZenSurface)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("7-DAY HABIT MOMENTUM", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = ZenTextSecondary, letterSpacing = 0.5.sp)
                            Spacer(modifier = Modifier.height(16.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.Bottom
                            ) {
                                weeklyMomentum.forEach { bar ->
                                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                        val barHeight = (bar.completionRatio * 90f).dp.coerceAtLeast(8.dp)
                                        Box(
                                            modifier = Modifier
                                                .width(28.dp)
                                                .height(barHeight)
                                                .clip(RoundedCornerShape(6.dp))
                                                .background(
                                                    if (bar.isRestDay) AccentLavender
                                                    else if (bar.completionRatio >= 0.8f) AccentEmerald
                                                    else if (bar.completionRatio >= 0.4f) AccentOcean
                                                    else ZenSurfaceSubtle
                                                )
                                        )
                                        Spacer(modifier = Modifier.height(6.dp))
                                        Text(
                                            text = if (bar.isRestDay) "☕" else bar.dayShort,
                                            fontSize = 10.sp,
                                            fontWeight = if (bar.isToday) FontWeight.Bold else FontWeight.Normal,
                                            color = if (bar.isToday) AccentEmerald else ZenTextSecondary
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                // C. Habit Performance Leaderboard Header
                item {
                    Text("HABIT PERFORMANCE LEADERBOARD", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = ZenTextSecondary, letterSpacing = 0.5.sp)
                }

                // Leaderboard Items
                items(habitLeaderboard, key = { it.habit.id }) { item ->
                    val hColor = Color(item.habit.color)
                    Card(
                        colors = CardDefaults.cardColors(containerColor = ZenSurface),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.fillMaxWidth().border(1.dp, ZenBorder, RoundedCornerShape(16.dp))
                    ) {
                        Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                    Text(item.habit.icon, fontSize = 20.sp)
                                    Column {
                                        Text(item.habit.name, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = ZenTextPrimary)
                                        Text(item.badge, fontSize = 11.sp, color = hColor, fontWeight = FontWeight.SemiBold)
                                    }
                                }
                                Column(horizontalAlignment = Alignment.End) {
                                    Text("${item.consistencyPercent}%", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = hColor)
                                    Text("🔥 ${item.streak}d streak", fontSize = 11.sp, color = ZenTextSecondary)
                                }
                            }

                            SegmentedProgressBar(
                                progressPercent = item.consistencyPercent,
                                fillColor = hColor,
                                segments = 10,
                                height = 6.dp,
                                showPercentText = false
                            )
                        }
                    }
                }

                // D. Behavioral Spotlight Card
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth().border(1.dp, ZenBorder, RoundedCornerShape(16.dp)),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = ZenSurfaceSubtle)
                    ) {
                        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text("💡", fontSize = 16.sp)
                                Text("BEHAVIORAL SPOTLIGHT", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = ZenTextPrimary)
                            }
                            Text(
                                "Consistency creates momentum: you hit 100% of your habits on peak days. Keep your daily streak active!",
                                fontSize = 12.sp,
                                color = ZenTextSecondary
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun HabitStatBox(title: String, value: String, color: Color, modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        color = ZenSurface,
        border = androidx.compose.foundation.BorderStroke(1.dp, ZenBorder)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(title, fontSize = 9.sp, fontWeight = FontWeight.SemiBold, color = ZenTextSecondary)
            Spacer(modifier = Modifier.height(2.dp))
            Text(value, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = color)
        }
    }
}

@Composable
private fun TimeOfDayCard(title: String, hours: String, percentage: Int, color: Color, modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        color = ZenSurfaceSubtle
    ) {
        Column(modifier = Modifier.padding(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text(title, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = ZenTextPrimary)
            Text(hours, fontSize = 9.sp, color = ZenTextSecondary)
            Spacer(modifier = Modifier.height(4.dp))
            Text("$percentage%", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = color)
        }
    }
}
