package com.example.studytimerapp.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.studytimerapp.theme.*
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

@Composable
fun CompleteMonthCalendarView(
    days: List<HeatmapDayData>,
    selectedDateIso: String,
    onDateSelected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    if (days.isEmpty()) return

    // Determine the first weekday of the month to compute leading empty offsets
    val firstDateIso = days.first().dateIso
    val emptyOffset = rememberWeekdayOffset(firstDateIso)

    val weekdays = listOf("S", "M", "T", "W", "T", "F", "S")

    Column(modifier = modifier.fillMaxWidth()) {
        // Weekdays Header (Sun to Sat)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceAround
        ) {
            weekdays.forEach { dayName ->
                Text(
                    text = dayName,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = ZenTextSecondary,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Total grid cells = empty leading slots + all days of the month
        val totalCells = emptyOffset + days.size
        val rowCount = (totalCells + 6) / 7

        for (row in 0 until rowCount) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 3.dp),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                for (col in 0 until 7) {
                    val cellIndex = row * 7 + col
                    val dayIndex = cellIndex - emptyOffset

                    if (dayIndex in days.indices) {
                        val day = days[dayIndex]
                        val isSelected = day.dateIso == selectedDateIso
                        val cellColor = when {
                            day.completionRatio <= 0f -> HeatmapLevel0
                            day.completionRatio <= 0.25f -> HeatmapLevel1
                            day.completionRatio <= 0.50f -> HeatmapLevel2
                            day.completionRatio <= 0.75f -> HeatmapLevel3
                            else -> HeatmapLevel4
                        }
                        val animatedColor by animateColorAsState(targetValue = cellColor, label = "gridCellColor")

                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .aspectRatio(1f)
                                .clip(RoundedCornerShape(8.dp))
                                .background(animatedColor)
                                .clickable { onDateSelected(day.dateIso) }
                                .border(
                                    width = if (isSelected) 2.dp else if (day.isToday) 1.dp else 0.dp,
                                    color = if (isSelected) AccentEmerald else if (day.isToday) ZenBorderSelected.copy(alpha = 0.6f) else Color.Transparent,
                                    shape = RoundedCornerShape(8.dp)
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Center
                            ) {
                                Text(
                                    text = "${day.dayNumber}",
                                    fontSize = 12.sp,
                                    fontWeight = if (isSelected || day.isToday) FontWeight.Bold else FontWeight.Medium,
                                    color = if (day.completionRatio >= 0.5f) Color.White else ZenTextPrimary
                                )
                                if (day.isToday) {
                                    Box(
                                        modifier = Modifier
                                            .padding(top = 1.dp)
                                            .size(3.dp)
                                            .clip(CircleShape)
                                            .background(if (day.completionRatio >= 0.5f) Color.White else AccentEmerald)
                                    )
                                }
                            }
                        }
                    } else {
                        // Empty slot outside the month boundaries
                        Spacer(modifier = Modifier.weight(1f))
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Heatmap Legend
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.End,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(3.dp)
            ) {
                Text("Less", fontSize = 10.sp, color = ZenTextTertiary)
                HeatmapLegendSquare(HeatmapLevel0)
                HeatmapLegendSquare(HeatmapLevel1)
                HeatmapLegendSquare(HeatmapLevel2)
                HeatmapLegendSquare(HeatmapLevel3)
                HeatmapLegendSquare(HeatmapLevel4)
                Text("More", fontSize = 10.sp, color = ZenTextTertiary)
            }
        }
    }
}

@Composable
private fun HeatmapLegendSquare(color: Color) {
    Box(
        modifier = Modifier
            .size(9.dp)
            .clip(RoundedCornerShape(2.dp))
            .background(color)
    )
}

private fun rememberWeekdayOffset(firstDateIso: String): Int {
    return try {
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
        val date = sdf.parse(firstDateIso) ?: return 0
        val cal = Calendar.getInstance().apply { time = date }
        val dayOfWeek = cal.get(Calendar.DAY_OF_WEEK) // 1=Sunday, 2=Monday, ..., 7=Saturday
        dayOfWeek - Calendar.SUNDAY
    } catch (_: Exception) {
        0
    }
}
