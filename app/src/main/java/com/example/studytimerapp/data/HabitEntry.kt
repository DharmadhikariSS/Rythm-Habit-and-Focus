package com.example.studytimerapp.data

import kotlinx.serialization.Serializable

@Serializable
data class HabitEntry(
    val id: Int = 0,
    val habitId: Int,
    val dateIso: String,                    // "yyyy-MM-dd"
    val isCompleted: Boolean = false,
    val isRestDay: Boolean = false,         // Forgiveness / recovery day (preserves streak)
    val loggedDurationSeconds: Long = 0L,   // Accumulated duration from timer sessions
    val currentCount: Int = 0,              // Current value for COUNTER habits
    val notes: String = "",
    val updatedAt: Long = System.currentTimeMillis()
)
