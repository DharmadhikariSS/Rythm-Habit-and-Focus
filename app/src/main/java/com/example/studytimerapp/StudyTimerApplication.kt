package com.example.studytimerapp

import android.app.Application
import com.example.studytimerapp.data.StudyRepository

class StudyTimerApplication : Application() {
    val repository by lazy { StudyRepository(this) }
}
