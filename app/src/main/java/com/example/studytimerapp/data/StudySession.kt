package com.example.studytimerapp.data

import kotlinx.serialization.Serializable

@Serializable
data class StudySession(
    val id: Int = 0,
    val subjectId: Int,
    val startTime: Long, // timestamp in ms
    val durationSeconds: Long // duration
)
