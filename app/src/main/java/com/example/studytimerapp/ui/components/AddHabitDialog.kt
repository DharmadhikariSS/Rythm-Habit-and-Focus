package com.example.studytimerapp.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Remove
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
import androidx.compose.ui.window.Dialog
import com.example.studytimerapp.data.Habit
import com.example.studytimerapp.data.HabitType
import com.example.studytimerapp.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddHabitDialog(
    onDismiss: () -> Unit,
    onAddHabit: (Habit) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var selectedType by remember { mutableStateOf(HabitType.TIMED) }
    var selectedDurationMinutes by remember { mutableIntStateOf(30) }
    var counterTarget by remember { mutableIntStateOf(8) }
    var counterUnit by remember { mutableStateOf("Glasses") }
    var selectedIcon by remember { mutableStateOf("🏋️‍♂️") }
    
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

    val iconOptions = listOf("🏋️‍♂️", "📖", "🧘", "💧", "🚫", "💻", "🏃", "🌿", "🥗", "💤", "🎯", "⚡")
    val durationOptions = listOf(15, 30, 45, 60, 90, 120)
    val suggestionChips = listOf("1 Hour Gym", "Book Reading", "Drink Water", "Meditation", "No Sugar", "Deep Work")

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = ZenSurface)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "New Habit",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = ZenTextPrimary
                    )
                    IconButton(onClick = onDismiss, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = ZenTextSecondary)
                    }
                }

                // Quick Suggestion Chips
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    suggestionChips.forEach { chip ->
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = if (name == chip) AccentEmerald.copy(alpha = 0.15f) else ZenSurfaceSubtle,
                            modifier = Modifier.clickable {
                                name = chip
                                when (chip) {
                                    "1 Hour Gym" -> {
                                        selectedType = HabitType.TIMED
                                        selectedDurationMinutes = 60
                                        selectedIcon = "🏋️‍♂️"
                                        selectedColor = AccentEmerald
                                    }
                                    "Book Reading" -> {
                                        selectedType = HabitType.TIMED
                                        selectedDurationMinutes = 30
                                        selectedIcon = "📖"
                                        selectedColor = AccentOchre
                                    }
                                    "Drink Water" -> {
                                        selectedType = HabitType.COUNTER
                                        counterTarget = 8
                                        counterUnit = "Glasses"
                                        selectedIcon = "💧"
                                        selectedColor = AccentOcean
                                    }
                                    "Meditation" -> {
                                        selectedType = HabitType.TIMED
                                        selectedDurationMinutes = 15
                                        selectedIcon = "🧘"
                                        selectedColor = AccentLavender
                                    }
                                    "No Sugar" -> {
                                        selectedType = HabitType.CHECK
                                        selectedIcon = "🚫"
                                        selectedColor = AccentTerracotta
                                    }
                                    "Deep Work" -> {
                                        selectedType = HabitType.TIMED
                                        selectedDurationMinutes = 90
                                        selectedIcon = "💻"
                                        selectedColor = AccentOcean
                                    }
                                }
                            }
                        ) {
                            Text(
                                text = chip,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium,
                                color = if (name == chip) AccentEmerald else ZenTextSecondary,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                            )
                        }
                    }
                }

                // Name Input
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Habit Name") },
                    placeholder = { Text("e.g. Morning Stretch") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = selectedColor,
                        unfocusedBorderColor = ZenBorder
                    )
                )

                // Modality Selector (Check / Timed / Counter)
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("TRACKING TYPE", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = ZenTextSecondary)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        HabitType.entries.forEach { type ->
                            val isSelected = selectedType == type
                            Surface(
                                modifier = Modifier
                                    .weight(1f)
                                    .clickable { selectedType = type },
                                shape = RoundedCornerShape(10.dp),
                                color = if (isSelected) selectedColor.copy(alpha = 0.15f) else ZenSurfaceSubtle,
                                border = if (isSelected) borderStroke(1.5.dp, selectedColor) else null
                            ) {
                                Text(
                                    text = when (type) {
                                        HabitType.CHECK -> "Check"
                                        HabitType.TIMED -> "⏱ Timed"
                                        HabitType.COUNTER -> "🔢 Count"
                                    },
                                    fontSize = 12.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                    color = if (isSelected) selectedColor else ZenTextSecondary,
                                    modifier = Modifier.padding(vertical = 8.dp),
                                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                                )
                            }
                        }
                    }
                }

                // Type-Specific Target Configuration
                when (selectedType) {
                    HabitType.TIMED -> {
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text("TARGET DURATION", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = ZenTextSecondary)
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .horizontalScroll(rememberScrollState()),
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                durationOptions.forEach { mins ->
                                    val isSelected = selectedDurationMinutes == mins
                                    Surface(
                                        modifier = Modifier.clickable { selectedDurationMinutes = mins },
                                        shape = RoundedCornerShape(10.dp),
                                        color = if (isSelected) selectedColor else ZenSurfaceSubtle
                                    ) {
                                        Text(
                                            text = if (mins >= 60) "${mins / 60}h ${if (mins % 60 > 0) "${mins % 60}m" else ""}" else "${mins}m",
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Medium,
                                            color = if (isSelected) Color.White else ZenTextPrimary,
                                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }
                    HabitType.COUNTER -> {
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text("TARGET DAILY COUNT", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = ZenTextSecondary)
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(ZenSurfaceSubtle)
                                        .padding(4.dp)
                                ) {
                                    IconButton(
                                        onClick = { counterTarget = (counterTarget - 1).coerceAtLeast(1) },
                                        modifier = Modifier.size(32.dp)
                                    ) {
                                        Icon(Icons.Default.Remove, contentDescription = "Decrease")
                                    }
                                    Text(
                                        text = "$counterTarget",
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 12.dp)
                                    )
                                    IconButton(
                                        onClick = { counterTarget += 1 },
                                        modifier = Modifier.size(32.dp)
                                    ) {
                                        Icon(Icons.Default.Add, contentDescription = "Increase")
                                    }
                                }

                                OutlinedTextField(
                                    value = counterUnit,
                                    onValueChange = { counterUnit = it },
                                    label = { Text("Unit") },
                                    placeholder = { Text("Glasses, Pages") },
                                    singleLine = true,
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(10.dp)
                                )
                            }
                        }
                    }
                    HabitType.CHECK -> {
                        Text(
                            "One-tap daily checkmark habit without time tracking.",
                            fontSize = 12.sp,
                            color = ZenTextSecondary
                        )
                    }
                }

                // Glyph Icon Picker
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("CHOOSE ICON", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = ZenTextSecondary)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        iconOptions.forEach { icon ->
                            val isSelected = selectedIcon == icon
                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .clip(CircleShape)
                                    .background(if (isSelected) selectedColor.copy(alpha = 0.2f) else ZenSurfaceSubtle)
                                    .border(
                                        width = if (isSelected) 2.dp else 0.dp,
                                        color = if (isSelected) selectedColor else Color.Transparent,
                                        shape = CircleShape
                                    )
                                    .clickable { selectedIcon = icon },
                                contentAlignment = Alignment.Center
                            ) {
                                Text(icon, fontSize = 20.sp)
                            }
                        }
                    }
                }

                // Soothing Color Palette Picker
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("SOOTHING ACCENT COLOR", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = ZenTextSecondary)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        soothingColors.forEach { color ->
                            val isSelected = selectedColor == color
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
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

                Spacer(modifier = Modifier.height(4.dp))

                // Action Buttons
                Button(
                    onClick = {
                        if (name.isNotBlank()) {
                            val habit = Habit(
                                id = 0,
                                name = name.trim(),
                                icon = selectedIcon,
                                color = selectedColor.toArgb(),
                                type = selectedType,
                                targetDurationMinutes = if (selectedType == HabitType.TIMED) selectedDurationMinutes else 0,
                                targetCount = if (selectedType == HabitType.COUNTER) counterTarget else 1,
                                targetUnit = counterUnit
                            )
                            onAddHabit(habit)
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = selectedColor),
                    enabled = name.isNotBlank()
                ) {
                    Text("Save Habit", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color.White)
                }
            }
        }
    }
}

private fun borderStroke(width: androidx.compose.ui.unit.Dp, color: Color) =
    androidx.compose.foundation.BorderStroke(width, color)
