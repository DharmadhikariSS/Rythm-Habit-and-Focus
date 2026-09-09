package com.example.studytimerapp.data

import kotlinx.serialization.Serializable

@Serializable
data class Subject(
    val id: Int = 0,
    val name: String,
    val color: Int,
    val targetHoursPerWeek: Float = 0f
)
