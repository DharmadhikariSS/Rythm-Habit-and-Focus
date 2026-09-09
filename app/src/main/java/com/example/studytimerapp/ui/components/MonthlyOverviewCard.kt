package com.example.studytimerapp.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowLeft
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.studytimerapp.theme.*

@Composable
fun MonthlyOverviewCard(
    monthName: String,
    totalCompleted: Int,
    monthlyProgressPercent: Int,
    todayCompleted: Int,
    todayTotal: Int,
    streakDays: Int,
    heatmapDays: List<HeatmapDayData>,
    selectedDateIso: String,
    onDateSelected: (String) -> Unit,
    onPreviousMonth: () -> Unit,
    onNextMonth: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, ZenBorder, RoundedCornerShape(20.dp)),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = ZenSurface),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            // Month Header with Prev/Next buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(CircleShape)
                            .background(ZenSurfaceSubtle),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("🌿", fontSize = 16.sp)
                    }
                    Text(
                        text = monthName,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = ZenTextPrimary
                    )
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(onClick = onPreviousMonth, modifier = Modifier.size(32.dp)) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.KeyboardArrowLeft,
                            contentDescription = "Previous Month",
                            tint = ZenTextSecondary
                        )
                    }
                    IconButton(onClick = onNextMonth, modifier = Modifier.size(32.dp)) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                            contentDescription = "Next Month",
                            tint = ZenTextSecondary
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Stats Row: Radial Donut for Today + Monthly Summary Cards
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Today's Radial Progress Ring
                val todayRatio = if (todayTotal > 0) todayCompleted.toFloat() / todayTotal else 0f
                val animatedTodayRatio by animateFloatAsState(
                    targetValue = todayRatio,
                    animationSpec = tween(durationMillis = 400),
                    label = "todayRatio"
                )

                Box(
                    modifier = Modifier
                        .size(76.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(ZenSurfaceSubtle)
                        .padding(6.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Canvas(modifier = Modifier.size(56.dp)) {
                        // Background track
                        drawCircle(
                            color = ZenBorder,
                            style = Stroke(width = 6.dp.toPx(), cap = StrokeCap.Round)
                        )
                        // Progress arc
                        drawArc(
                            color = AccentEmerald,
                            startAngle = -90f,
                            sweepAngle = 360f * animatedTodayRatio,
                            useCenter = false,
                            style = Stroke(width = 6.dp.toPx(), cap = StrokeCap.Round)
                        )
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "${(todayRatio * 100).toInt()}%",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = ZenTextPrimary
                        )
                        Text(
                            text = "$todayCompleted/$todayTotal",
                            fontSize = 9.sp,
                            color = ZenTextSecondary
                        )
                    }
                }

                // Metric Badges Column
                Column(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Total Completed & Streak Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        // Total Completed Badge
                        Surface(
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp),
                            color = ZenSurfaceSubtle
                        ) {
                            Column(modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)) {
                                Text("TOTAL COMPLETED", fontSize = 9.sp, fontWeight = FontWeight.SemiBold, color = ZenTextSecondary)
                                Text(
                                    text = "$totalCompleted",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = AccentEmerald
                                )
                            }
                        }

                        // Streak Flame Badge
                        Surface(
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp),
                            color = ZenSurfaceSubtle
                        ) {
                            Column(modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)) {
                                Text("CURRENT STREAK", fontSize = 9.sp, fontWeight = FontWeight.SemiBold, color = ZenTextSecondary)
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                    Text("🔥", fontSize = 14.sp)
                                    Text(
                                        text = "$streakDays Days",
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = AccentTerracotta
                                    )
                                }
                            }
                        }
                    }

                    // Overall Monthly Progress Bar
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("OVERALL MONTHLY PROGRESS", fontSize = 9.sp, fontWeight = FontWeight.SemiBold, color = ZenTextSecondary)
                            Text("$monthlyProgressPercent%", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = AccentEmerald)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        SegmentedProgressBar(
                            progressPercent = monthlyProgressPercent,
                            fillColor = AccentEmerald,
                            segments = 10,
                            height = 8.dp,
                            showPercentText = false
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
            HorizontalDivider(color = ZenBorder, thickness = 0.8.dp)
            Spacer(modifier = Modifier.height(12.dp))

            // 31-Day Activity Heatmap Strip
            ActivityHeatmapStrip(
                days = heatmapDays,
                selectedDateIso = selectedDateIso,
                onDateSelected = onDateSelected
            )
        }
    }
}
