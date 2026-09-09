package com.example.studytimerapp.viewmodels

import android.content.Context
import android.os.Bundle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.studytimerapp.data.PersistedTimer
import com.example.studytimerapp.data.StudyRepository
import com.example.studytimerapp.data.StudySession
import com.example.studytimerapp.data.Subject
import com.example.studytimerapp.services.TimerForegroundService
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.Calendar
import java.util.Locale
import com.example.studytimerapp.data.DateUtils

data class ActiveTimer(
    val subjectId: Int,
    val startTime: Long,
    val isRunning: Boolean = false,
    val pendingSessions: List<StudySession> = emptyList(),
    val currentSessionElapsed: Long = 0L 
) {
    val totalElapsed: Long get() = pendingSessions.sumOf { it.durationSeconds * 1000L } + currentSessionElapsed
}

class TimerViewModel(
    private val repository: StudyRepository,
    private val context: Context? = null
) : ViewModel() {
    
    val allSubjects = repository.allSubjects
    
    private val _activeTimers = MutableStateFlow<Map<Int, ActiveTimer>>(emptyMap())
    val activeTimers: StateFlow<Map<Int, ActiveTimer>> = _activeTimers.asStateFlow()

    private var timerJob: Job? = null

    init {
        // Wire lock-screen notification action callbacks
        TimerForegroundService.onActionToggle = { subjectId ->
            toggleTimer(subjectId)
        }
        TimerForegroundService.onActionStop = { subjectId ->
            stopAndSaveTimer(subjectId)
        }
        TimerForegroundService.onActionPauseAll = {
            pauseAllTimers()
        }

        restorePersistedTimers()
        startTicker()
    }

    private fun restorePersistedTimers() {
        val persisted = repository.persistedTimers.value
        if (persisted.isNotEmpty()) {
            val now = System.currentTimeMillis()
            // Single Active Timer Rule: ensure at most ONE timer is running (latest start time)
            val runningCandidate = persisted.values
                .filter { it.isRunning }
                .maxByOrNull { it.startTime }

            val restored = persisted.mapValues { (subjectId, pt) ->
                val shouldBeRunning = runningCandidate != null && pt.subjectId == runningCandidate.subjectId
                val elapsed = if (shouldBeRunning) (now - pt.startTime) else 0L
                val pending = if (pt.accumulatedDurationSeconds > 0) {
                    listOf(StudySession(id = 0, subjectId = subjectId, startTime = pt.startTime, durationSeconds = pt.accumulatedDurationSeconds))
                } else emptyList()
                ActiveTimer(
                    subjectId = subjectId,
                    startTime = if (shouldBeRunning) pt.startTime else now,
                    isRunning = shouldBeRunning,
                    pendingSessions = pending,
                    currentSessionElapsed = elapsed
                )
            }
            _activeTimers.value = restored
            syncForegroundService(restored)
        }
    }

    private fun persistCurrentTimers(timers: Map<Int, ActiveTimer>) {
        val mapped = timers.mapValues { (_, timer) ->
            PersistedTimer(
                subjectId = timer.subjectId,
                startTime = timer.startTime,
                isRunning = timer.isRunning,
                accumulatedDurationSeconds = timer.pendingSessions.sumOf { it.durationSeconds }
            )
        }
        viewModelScope.launch {
            repository.saveActiveTimers(mapped)
        }
        syncForegroundService(timers)
    }

    private fun syncForegroundService(timers: Map<Int, ActiveTimer>) {
        val ctx = context ?: return
        val runningTimers = timers.filter { it.value.isRunning }

        if (runningTimers.isEmpty()) {
            TimerForegroundService.stopService(ctx)
            return
        }

        // Calculate today's start
        val cal = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        val startOfToday = cal.timeInMillis

        // Calculate week's start
        val calWeek = Calendar.getInstance().apply {
            set(Calendar.DAY_OF_WEEK, firstDayOfWeek)
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        val startOfWeek = calWeek.timeInMillis

        // Quick Daily Rhythm Score approximation
        val habitsDone = repository.allHabitEntries.value.count { 
            it.dateIso == DateUtils.todayIso() && (it.isCompleted || it.isRestDay) 
        }
        val totalHabits = repository.allHabits.value.size
        val habitPts = if (totalHabits > 0) ((habitsDone.toFloat() / totalHabits) * 50f).coerceIn(0f, 50f) else 0f
        val totalRunningElapsedSecs = runningTimers.values.sumOf { it.totalElapsed / 1000 }
        val allTodaySecs = repository.allSessions.value.filter { it.startTime >= startOfToday }.sumOf { it.durationSeconds } + totalRunningElapsedSecs
        val focusPts = ((allTodaySecs.toFloat() / 7200f) * 50f).coerceIn(0f, 50f)
        val rhythmScore = (habitPts + focusPts).toInt()

        val bundles = ArrayList<Bundle>()

        for (timer in runningTimers.values) {
            val subject = repository.allSubjects.value.find { it.id == timer.subjectId }
            val name = subject?.name ?: "Focus Timer"
            val color = subject?.color ?: 0

            val matchingHabit = repository.allHabits.value.find { 
                it.name.equals(name, ignoreCase = true) 
            }

            val pastTodaySecs = repository.allSessions.value
                .filter { it.subjectId == timer.subjectId && it.startTime >= startOfToday }
                .sumOf { it.durationSeconds }
            val currentSessionSecs = timer.totalElapsed / 1000
            val todayTotalSecs = pastTodaySecs + currentSessionSecs
            val todayTotalMinutes = (todayTotalSecs / 60).toInt()

            val targetMinutes = if (matchingHabit != null && matchingHabit.targetDurationMinutes > 0) {
                matchingHabit.targetDurationMinutes
            } else if (subject != null && subject.targetHoursPerWeek > 0) {
                ((subject.targetHoursPerWeek * 60) / 7).toInt().coerceAtLeast(30)
            } else {
                0
            }

            var streakDays = 0
            if (matchingHabit != null) {
                val entries = repository.allHabitEntries.value.filter { it.habitId == matchingHabit.id }
                val checkCal = Calendar.getInstance()
                val todayIso = DateUtils.formatIso(checkCal)
                val todayCompleted = entries.any { it.dateIso == todayIso && (it.isCompleted || it.isRestDay) }
                if (!todayCompleted) {
                    checkCal.add(Calendar.DAY_OF_YEAR, -1)
                }
                for (i in 0..365) {
                    val iso = DateUtils.formatIso(checkCal)
                    val done = entries.any { it.dateIso == iso && (it.isCompleted || it.isRestDay) }
                    if (done) {
                        streakDays++
                        checkCal.add(Calendar.DAY_OF_YEAR, -1)
                    } else break
                }
            }

            val todayTotalFormatted = if (todayTotalSecs >= 3600) {
                "${todayTotalSecs / 3600}h ${(todayTotalSecs % 3600) / 60}m"
            } else {
                "${todayTotalSecs / 60}m"
            }

            val weekSecs = repository.allSessions.value
                .filter { it.subjectId == timer.subjectId && it.startTime >= startOfWeek }
                .sumOf { it.durationSeconds } + currentSessionSecs
            val weekHours = weekSecs / 3600f
            val targetWeeklyHours = subject?.targetHoursPerWeek ?: 0f
            val weeklyProgressFormatted = if (targetWeeklyHours > 0) {
                String.format(Locale.US, "%.1fh / %.0fh", weekHours, targetWeeklyHours)
            } else ""

            val bundle = Bundle().apply {
                putInt(TimerForegroundService.KEY_SUBJECT_ID, timer.subjectId)
                putString(TimerForegroundService.KEY_SUBJECT_NAME, name)
                putLong(TimerForegroundService.KEY_ELAPSED_MS, timer.totalElapsed)
                putInt(TimerForegroundService.KEY_SUBJECT_COLOR, color)
                putInt(TimerForegroundService.KEY_TARGET_MINUTES, targetMinutes)
                putInt(TimerForegroundService.KEY_TODAY_TOTAL_MINUTES, todayTotalMinutes)
                putInt(TimerForegroundService.KEY_STREAK_DAYS, streakDays)
                putString(TimerForegroundService.KEY_TODAY_TOTAL_FORMATTED, todayTotalFormatted)
                putString(TimerForegroundService.KEY_WEEKLY_PROGRESS_FORMATTED, weeklyProgressFormatted)
                putInt(TimerForegroundService.KEY_RHYTHM_SCORE, rhythmScore)
            }
            bundles.add(bundle)
        }

        TimerForegroundService.updateService(ctx, bundles)
    }

    private fun checkMidnightCrossover(timer: ActiveTimer, now: Long): ActiveTimer {
        if (!timer.isRunning) return timer
        
        val calStart = Calendar.getInstance().apply { timeInMillis = timer.startTime }
        val calNow = Calendar.getInstance().apply { timeInMillis = now }
        
        if (calStart.get(Calendar.YEAR) != calNow.get(Calendar.YEAR) || 
            calStart.get(Calendar.DAY_OF_YEAR) != calNow.get(Calendar.DAY_OF_YEAR)) {
            
            calStart.set(Calendar.HOUR_OF_DAY, 23)
            calStart.set(Calendar.MINUTE, 59)
            calStart.set(Calendar.SECOND, 59)
            calStart.set(Calendar.MILLISECOND, 999)
            val endOfDayMs = calStart.timeInMillis
            
            val durationMs = endOfDayMs - timer.startTime
            val session = StudySession(
                id = 0,
                subjectId = timer.subjectId,
                startTime = timer.startTime,
                durationSeconds = durationMs / 1000
            )
            
            calStart.add(Calendar.MILLISECOND, 1) // 00:00:00 of next day
            val startOfNewDayMs = calStart.timeInMillis
            
            val intermediateTimer = timer.copy(
                startTime = startOfNewDayMs,
                pendingSessions = timer.pendingSessions + session
            )
            return checkMidnightCrossover(intermediateTimer, now)
        }
        
        return timer.copy(currentSessionElapsed = now - timer.startTime)
    }

    private fun startTicker() {
        timerJob = viewModelScope.launch {
            var tickCount = 0
            while (true) {
                delay(1000)
                tickCount++
                val now = System.currentTimeMillis()
                _activeTimers.update { timers ->
                    timers.mapValues { (_, timer) ->
                        if (timer.isRunning) {
                            checkMidnightCrossover(timer, now)
                        } else {
                            timer
                        }
                    }
                }
                if (tickCount % 30 == 0 && _activeTimers.value.any { it.value.isRunning }) {
                    syncForegroundService(_activeTimers.value)
                }
            }
        }
    }

    fun addSubject(name: String, color: Int, targetHoursPerWeek: Float = 5f) {
        viewModelScope.launch {
            repository.insertSubject(Subject(id = 0, name = name, color = color, targetHoursPerWeek = targetHoursPerWeek))
        }
    }

    fun deleteSubject(subject: Subject) {
        viewModelScope.launch {
            repository.deleteSubject(subject)
            stopAndSaveTimer(subject.id)
        }
    }

    fun toggleTimer(subjectId: Int) {
        val now = System.currentTimeMillis()
        var updatedTimers: Map<Int, ActiveTimer> = emptyMap()
        _activeTimers.update { timers ->
            val timer = timers[subjectId]
            val willBeRunning = timer == null || !timer.isRunning
            val newTimers = timers.toMutableMap()
            
            // Single Active Timer Rule: If the target timer is starting/resuming, pause ALL other running timers!
            if (willBeRunning) {
                timers.forEach { (otherId, otherTimer) ->
                    if (otherId != subjectId && otherTimer.isRunning) {
                        val updatedOther = checkMidnightCrossover(otherTimer, now)
                        val durationSecs = updatedOther.currentSessionElapsed / 1000
                        val session = StudySession(
                            id = 0,
                            subjectId = otherId,
                            startTime = updatedOther.startTime,
                            durationSeconds = durationSecs
                        )
                        newTimers[otherId] = updatedOther.copy(
                            isRunning = false,
                            pendingSessions = updatedOther.pendingSessions + session,
                            currentSessionElapsed = 0L,
                            startTime = now
                        )
                    }
                }
            }

            if (timer == null) {
                newTimers[subjectId] = ActiveTimer(subjectId = subjectId, startTime = now, isRunning = true)
            } else if (timer.isRunning) {
                val updatedTimer = checkMidnightCrossover(timer, now)
                val durationSecs = updatedTimer.currentSessionElapsed / 1000
                val session = StudySession(
                    id = 0,
                    subjectId = subjectId,
                    startTime = updatedTimer.startTime,
                    durationSeconds = durationSecs
                )
                newTimers[subjectId] = updatedTimer.copy(
                    isRunning = false,
                    pendingSessions = updatedTimer.pendingSessions + session,
                    currentSessionElapsed = 0L,
                    startTime = now
                )
            } else {
                newTimers[subjectId] = timer.copy(
                    isRunning = true,
                    startTime = now
                )
            }
            updatedTimers = newTimers
            newTimers
        }
        persistCurrentTimers(updatedTimers)
    }

    fun pauseAllTimers() {
        val now = System.currentTimeMillis()
        var updatedTimers: Map<Int, ActiveTimer> = emptyMap()
        _activeTimers.update { timers ->
            val newTimers = timers.toMutableMap()
            timers.forEach { (subId, timer) ->
                if (timer.isRunning) {
                    val updatedTimer = checkMidnightCrossover(timer, now)
                    val durationSecs = updatedTimer.currentSessionElapsed / 1000
                    val session = StudySession(
                        id = 0,
                        subjectId = subId,
                        startTime = updatedTimer.startTime,
                        durationSeconds = durationSecs
                    )
                    newTimers[subId] = updatedTimer.copy(
                        isRunning = false,
                        pendingSessions = updatedTimer.pendingSessions + session,
                        currentSessionElapsed = 0L,
                        startTime = now
                    )
                }
            }
            updatedTimers = newTimers
            newTimers
        }
        persistCurrentTimers(updatedTimers)
    }

    fun resetTimer(subjectId: Int) {
        var updatedTimers: Map<Int, ActiveTimer> = emptyMap()
        _activeTimers.update { current ->
            val mutable = current.toMutableMap()
            mutable.remove(subjectId)
            updatedTimers = mutable
            mutable
        }
        persistCurrentTimers(updatedTimers)
    }

    fun stopAndSaveTimer(subjectId: Int) {
        val timer = _activeTimers.value[subjectId] ?: return
        val updatedTimer = checkMidnightCrossover(timer, System.currentTimeMillis())
        
        val durationSecs = updatedTimer.currentSessionElapsed / 1000
        val finalSession = if (updatedTimer.isRunning && durationSecs > 0) {
            StudySession(
                id = 0,
                subjectId = subjectId,
                startTime = updatedTimer.startTime,
                durationSeconds = durationSecs
            )
        } else null

        val allSessions = updatedTimer.pendingSessions + listOfNotNull(finalSession)
        
        viewModelScope.launch {
            allSessions.forEach {
                if (it.durationSeconds > 0) {
                    repository.insertSession(it)
                }
            }
        }
        
        var updatedTimers: Map<Int, ActiveTimer> = emptyMap()
        _activeTimers.update { current ->
            val mutable = current.toMutableMap()
            mutable.remove(subjectId)
            updatedTimers = mutable
            mutable
        }
        persistCurrentTimers(updatedTimers)
    }
}

class TimerViewModelFactory(
    private val repository: StudyRepository,
    private val context: Context? = null
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(TimerViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return TimerViewModel(repository, context) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
