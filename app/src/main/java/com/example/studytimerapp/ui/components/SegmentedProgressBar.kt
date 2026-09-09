package com.example.studytimerapp.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.studytimerapp.theme.ZenBorder
import com.example.studytimerapp.theme.ZenSurfaceSubtle
import com.example.studytimerapp.theme.ZenTextSecondary

/**
 * 10-Segment milestone progress bar inspired by the habit tracker spreadsheet,
 * offering tactile, visual feedback for habit completion.
 */
@Composable
fun SegmentedProgressBar(
    progressPercent: Int,
    fillColor: Color,
    modifier: Modifier = Modifier,
    segments: Int = 10,
    height: Dp = 10.dp,
    showPercentText: Boolean = true
) {
    val clamped = progressPercent.coerceIn(0, 100)
    val activeSegments = (clamped / 100f * segments).toInt().coerceIn(0, segments)

    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        if (showPercentText) {
            Text(
                text = "$clamped%",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = if (clamped > 0) fillColor else ZenTextSecondary,
                modifier = Modifier.width(36.dp)
            )
        }

        Row(
            modifier = Modifier
                .weight(1f)
                .height(height),
            horizontalArrangement = Arrangement.spacedBy(2.5.dp)
        ) {
            for (i in 0 until segments) {
                val isActive = i < activeSegments
                val segmentColor by animateColorAsState(
                    targetValue = if (isActive) fillColor else ZenSurfaceSubtle,
                    animationSpec = tween(durationMillis = 250),
                    label = "segmentColor"
                )

                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                        .clip(RoundedCornerShape(2.dp))
                        .background(segmentColor)
                )
            }
        }
    }
}
