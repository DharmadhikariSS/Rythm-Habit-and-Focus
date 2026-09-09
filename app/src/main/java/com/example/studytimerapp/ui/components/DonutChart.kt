package com.example.studytimerapp.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.studytimerapp.theme.ZenBorder
import com.example.studytimerapp.theme.ZenTextPrimary
import com.example.studytimerapp.theme.ZenTextSecondary

data class DonutSlice(
    val label: String,
    val value: Float,
    val color: Color,
    val percentage: Int
)

@Composable
fun DonutChart(
    slices: List<DonutSlice>,
    totalText: String,
    modifier: Modifier = Modifier,
    size: Dp = 140.dp,
    strokeWidth: Dp = 16.dp
) {
    val total = slices.sumOf { it.value.toDouble() }.toFloat()

    val emptyTrackColor = ZenBorder
    Box(
        modifier = modifier.size(size),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.size(size)) {
            // If empty, draw subtle gray circle
            if (total <= 0f) {
                drawCircle(
                    color = emptyTrackColor,
                    style = Stroke(width = strokeWidth.toPx(), cap = StrokeCap.Round)
                )
            } else {
                var currentAngle = -90f
                slices.forEach { slice ->
                    val sweepAngle = (slice.value / total) * 360f
                    if (sweepAngle > 0f) {
                        drawArc(
                            color = slice.color,
                            startAngle = currentAngle,
                            sweepAngle = (sweepAngle - 2f).coerceAtLeast(1f),
                            useCenter = false,
                            style = Stroke(width = strokeWidth.toPx(), cap = StrokeCap.Round)
                        )
                    }
                    currentAngle += sweepAngle
                }
            }
        }

        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = totalText,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = ZenTextPrimary
            )
            Text(
                text = "Total Focus",
                fontSize = 10.sp,
                color = ZenTextSecondary
            )
        }
    }
}
