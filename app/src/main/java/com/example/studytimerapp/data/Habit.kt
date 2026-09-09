package com.example.studytimerapp.data

import kotlinx.serialization.Serializable

@Serializable
enum class HabitType {
    CHECK,      // Simple 1-tap completion (e.g. No Sugar, Cold Shower)
    TIMED,      // Associated with target duration (e.g. 60m Gym, 30m Reading)
    COUNTER     // Target numeric count (e.g. 8 Glasses of Water, 20 Pages)
}

@Serializable
data class Habit(
    val id: Int = 0,
    val name: String,
    val icon: String = "🌿",
    val color: Int,
    val type: HabitType = HabitType.CHECK,
    val targetDurationMinutes: Int = 0,
    val targetCount: Int = 1,
    val targetUnit: String = "",
    val frequencyDays: List<Int> = listOf(1, 2, 3, 4, 5, 6, 7), // 1=Mon .. 7=Sun
    val isArchived: Boolean = false,
    val subjectId: Int? = null,
    val createdAt: Long = System.currentTimeMillis()
)
