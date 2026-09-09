package com.example.studytimerapp.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.studytimerapp.data.DateUtils
import com.example.studytimerapp.theme.*
import java.util.Calendar

data class HeatmapDayData(
    val dateIso: String,
    val dayNumber: Int,
    val dayOfWeek: String,
    val completionRatio: Float, // 0.0 to 1.0
    val isToday: Boolean
)

@Composable
fun ActivityHeatmapStrip(
    days: List<HeatmapDayData>,
    selectedDateIso: String,
    onDateSelected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val listState = rememberLazyListState()

    // Scroll to selected date on initial composition
    LaunchedEffect(selectedDateIso) {
        val index = days.indexOfFirst { it.dateIso == selectedDateIso }
        if (index >= 0) {
            val targetScroll = (index - 3).coerceAtLeast(0)
            listState.animateScrollToItem(targetScroll)
        }
    }

    Column(modifier = modifier) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 4.dp, vertical = 2.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "DAILY ACTIVITY HEATMAP",
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold,
                color = ZenTextSecondary,
                letterSpacing = 0.5.sp
            )
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(3.dp)
            ) {
                Text("Less", fontSize = 10.sp, color = ZenTextTertiary)
                HeatmapLegendCell(HeatmapLevel0)
                HeatmapLegendCell(HeatmapLevel1)
                HeatmapLegendCell(HeatmapLevel2)
                HeatmapLegendCell(HeatmapLevel3)
                HeatmapLegendCell(HeatmapLevel4)
                Text("More", fontSize = 10.sp, color = ZenTextTertiary)
            }
        }

        Spacer(modifier = Modifier.height(6.dp))

        LazyRow(
            state = listState,
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            contentPadding = PaddingValues(horizontal = 2.dp)
        ) {
            items(days, key = { it.dateIso }) { day ->
                val isSelected = day.dateIso == selectedDateIso
                val cellColor = when {
                    day.completionRatio <= 0f -> HeatmapLevel0
                    day.completionRatio <= 0.25f -> HeatmapLevel1
                    day.completionRatio <= 0.50f -> HeatmapLevel2
                    day.completionRatio <= 0.75f -> HeatmapLevel3
                    else -> HeatmapLevel4
                }

                val animatedColor by animateColorAsState(targetValue = cellColor, label = "cellColor")

                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .clickable { onDateSelected(day.dateIso) }
                        .border(
                            width = if (isSelected) 2.dp else if (day.isToday) 1.dp else 0.dp,
                            color = if (isSelected) AccentEmerald else if (day.isToday) ZenBorderSelected.copy(alpha = 0.5f) else Color.Transparent,
                            shape = RoundedCornerShape(8.dp)
                        )
                        .background(if (isSelected) ZenSurfaceSubtle else Color.Transparent)
                        .padding(horizontal = 4.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = day.dayOfWeek.take(1),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Medium,
                        color = if (day.isToday) AccentEmerald else ZenTextTertiary
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Box(
                        modifier = Modifier
                            .size(24.dp)
                            .clip(RoundedCornerShape(6.dp))
                            .background(animatedColor),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "${day.dayNumber}",
                            fontSize = 11.sp,
                            fontWeight = if (day.isToday || isSelected) FontWeight.Bold else FontWeight.Normal,
                            color = if (day.completionRatio >= 0.5f) Color.White else ZenTextPrimary
                        )
                    }

                    if (day.isToday) {
                        Box(
                            modifier = Modifier
                                .padding(top = 2.dp)
                                .size(3.dp)
                                .clip(RoundedCornerShape(1.5.dp))
                                .background(AccentEmerald)
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun HeatmapLegendCell(color: Color) {
    Box(
        modifier = Modifier
            .size(8.dp)
            .clip(RoundedCornerShape(2.dp))
            .background(color)
    )
}
