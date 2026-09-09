package com.example.studytimerapp.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.compose.ui.graphics.Color
import com.example.studytimerapp.data.*
import com.example.studytimerapp.ui.components.DonutSlice
import kotlinx.coroutines.flow.*
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

enum class Timeframe { DAILY, WEEKLY, MONTHLY }

enum class AnalyticsLens { SUBJECTS, HABITS }

data class SubjectStats(
    val subject: Subject,
    val totalTimeSeconds: Long
)

data class SubjectTargetProgress(
    val subject: Subject,
    val targetHours: Float,
    val loggedHours: Float,
    val progressPercent: Int
)

data class TimeOfDayStats(
    val morningSecs: Long = 0L,
    val afternoonSecs: Long = 0L,
    val eveningSecs: Long = 0L
) {
    val totalSecs: Long get() = morningSecs + afternoonSecs + eveningSecs
    val morningPct: Int get() = if (totalSecs > 0) ((morningSecs.toFloat() / totalSecs) * 100).toInt() else 0
    val afternoonPct: Int get() = if (totalSecs > 0) ((afternoonSecs.toFloat() / totalSecs) * 100).toInt() else 0
    val eveningPct: Int get() = if (totalSecs > 0) ((eveningSecs.toFloat() / totalSecs) * 100).toInt() else 0
}

data class RecentSessionDisplay(
    val id: Int,
    val subjectName: String,
    val subjectColor: Int,
    val durationText: String,
    val formattedDate: String
)

data class HabitLeaderboardItem(
    val habit: Habit,
    val consistencyPercent: Int,
    val streak: Int,
    val badge: String
)

data class DayMomentumBar(
    val dayShort: String,
    val dateIso: String,
    val completionRatio: Float,
    val isToday: Boolean,
    val isRestDay: Boolean
)

data class ExecutiveHabitStats(
    val consistencyRate: Int = 0,
    val actionsCompleted: Int = 0,
    val currentStreak: Int = 0,
    val bestStreak: Int = 0
)

class AnalyticsViewModel(private val repository: StudyRepository) : ViewModel() {

    val allSubjects = repository.allSubjects
    val allSessions = repository.allSessions
    val allHabits = repository.allHabits
    val allEntries = repository.allHabitEntries

    private val _timeframe = MutableStateFlow(Timeframe.WEEKLY)
    val timeframe = _timeframe.asStateFlow()

    fun setTimeframe(tf: Timeframe) {
        _timeframe.value = tf
    }

    // --- LENS 1: Multi-Subject Timer Insights ---

    val subjectStats: StateFlow<List<SubjectStats>> = combine(
        allSubjects,
        allSessions,
        _timeframe
    ) { subjects, sessions, tf ->
        val cal = Calendar.getInstance()
        cal.set(Calendar.HOUR_OF_DAY, 0); cal.set(Calendar.MINUTE, 0); cal.set(Calendar.SECOND, 0); cal.set(Calendar.MILLISECOND, 0)

        val startTime = when (tf) {
            Timeframe.DAILY -> cal.timeInMillis
            Timeframe.WEEKLY -> {
                cal.set(Calendar.DAY_OF_WEEK, cal.firstDayOfWeek)
                cal.timeInMillis
            }
            Timeframe.MONTHLY -> {
                cal.set(Calendar.DAY_OF_MONTH, 1)
                cal.timeInMillis
            }
        }

        val filteredSessions = sessions.filter { it.startTime >= startTime }

        subjects.map { sub ->
            val totalSecs = filteredSessions.filter { it.subjectId == sub.id }.sumOf { it.durationSeconds }
            SubjectStats(sub, totalSecs)
        }.sortedByDescending { it.totalTimeSeconds }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val donutSlices: StateFlow<List<DonutSlice>> = subjectStats.map { stats ->
        val totalSecs = stats.sumOf { it.totalTimeSeconds }.toFloat()
        if (totalSecs <= 0f) return@map emptyList()

        stats.filter { it.totalTimeSeconds > 0 }.map { stat ->
            val pct = ((stat.totalTimeSeconds.toFloat() / totalSecs) * 100).toInt()
            DonutSlice(
                label = stat.subject.name,
                value = stat.totalTimeSeconds.toFloat(),
                color = Color(stat.subject.color),
                percentage = pct
            )
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val subjectTargetProgress: StateFlow<List<SubjectTargetProgress>> = combine(
        allSubjects,
        allSessions
    ) { subjects, sessions ->
        val cal = Calendar.getInstance()
        cal.set(Calendar.HOUR_OF_DAY, 0); cal.set(Calendar.MINUTE, 0); cal.set(Calendar.SECOND, 0); cal.set(Calendar.MILLISECOND, 0)
        cal.set(Calendar.DAY_OF_WEEK, cal.firstDayOfWeek)
        val startOfWeek = cal.timeInMillis

        val thisWeekSessions = sessions.filter { it.startTime >= startOfWeek }

        subjects.map { sub ->
            val loggedSecs = thisWeekSessions.filter { it.subjectId == sub.id }.sumOf { it.durationSeconds }
            val loggedHours = loggedSecs / 3600f
            val targetHours = if (sub.targetHoursPerWeek > 0f) sub.targetHoursPerWeek else 5f
            val pct = ((loggedHours / targetHours) * 100).toInt()

            SubjectTargetProgress(
                subject = sub,
                targetHours = targetHours,
                loggedHours = loggedHours,
                progressPercent = pct
            )
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val timeOfDayDistribution: StateFlow<TimeOfDayStats> = allSessions.map { sessions ->
        var morning = 0L
        var afternoon = 0L
        var evening = 0L

        val cal = Calendar.getInstance()
        sessions.forEach { s ->
            cal.timeInMillis = s.startTime
            when (cal.get(Calendar.HOUR_OF_DAY)) {
                in 6..11 -> morning += s.durationSeconds
                in 12..17 -> afternoon += s.durationSeconds
                else -> evening += s.durationSeconds
            }
        }
        TimeOfDayStats(morning, afternoon, evening)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), TimeOfDayStats())

    val recentSessions: StateFlow<List<RecentSessionDisplay>> = combine(
        allSubjects,
        allSessions
    ) { subjects, sessions ->
        val dateFormat = SimpleDateFormat("MMM d, h:mm a", Locale.US)
        sessions.sortedByDescending { it.startTime }.take(10).map { s ->
            val sub = subjects.find { it.id == s.subjectId }
            val hours = s.durationSeconds / 3600
            val mins = (s.durationSeconds % 3600) / 60
            val durText = if (hours > 0) "${hours}h ${mins}m" else "${mins}m"
            RecentSessionDisplay(
                id = s.id,
                subjectName = sub?.name ?: "Focus Session",
                subjectColor = sub?.color ?: Color.Gray.hashCode(),
                durationText = durText,
                formattedDate = dateFormat.format(Date(s.startTime))
            )
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // --- LENS 2: Habit Consistency Insights ---

    val habitLeaderboard: StateFlow<List<HabitLeaderboardItem>> = combine(
        allHabits,
        allEntries
    ) { habits, entries ->
        val cal = Calendar.getInstance()
        val daysInMonth = DateUtils.getDaysInMonth(cal.get(Calendar.YEAR), cal.get(Calendar.MONTH))
        val monthDaysIso = daysInMonth.map { DateUtils.formatIso(it) }.toSet()

        habits.map { habit ->
            val completedCount = entries.count { 
                it.habitId == habit.id && it.dateIso in monthDaysIso && (it.isCompleted || it.isRestDay) 
            }
            val pct = if (monthDaysIso.isNotEmpty()) ((completedCount.toFloat() / monthDaysIso.size) * 100).toInt() else 0
            
            // Streak
            var streak = 0
            val checkCal = Calendar.getInstance()
            for (i in 0..180) {
                val iso = DateUtils.formatIso(checkCal)
                val done = entries.any { it.habitId == habit.id && it.dateIso == iso && (it.isCompleted || it.isRestDay) }
                if (done) {
                    streak++
                    checkCal.add(Calendar.DAY_OF_YEAR, -1)
                } else break
            }

            val badge = when {
                pct >= 85 -> "Top Performer 🏆"
                pct >= 60 -> "Consistent ⭐"
                else -> "Needs Love 🌱"
            }

            HabitLeaderboardItem(habit, pct, streak, badge)
        }.sortedByDescending { it.consistencyPercent }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val weeklyMomentumBars: StateFlow<List<DayMomentumBar>> = combine(
        allHabits,
        allEntries
    ) { habits, entries ->
        val todayIso = DateUtils.todayIso()
        val list = mutableListOf<DayMomentumBar>()

        val cal = Calendar.getInstance()
        cal.set(Calendar.DAY_OF_WEEK, Calendar.MONDAY)

        for (i in 0..6) {
            val iso = DateUtils.formatIso(cal)
            val dayEntries = entries.filter { it.dateIso == iso }
            val doneCount = dayEntries.count { it.isCompleted || it.isRestDay }
            val isRest = dayEntries.any { it.isRestDay }
            val ratio = if (habits.isNotEmpty()) (doneCount.toFloat() / habits.size).coerceIn(0f, 1f) else 0f

            list.add(
                DayMomentumBar(
                    dayShort = DateUtils.getDayOfWeekShort(cal).take(3),
                    dateIso = iso,
                    completionRatio = ratio,
                    isToday = iso == todayIso,
                    isRestDay = isRest
                )
            )
            cal.add(Calendar.DAY_OF_YEAR, 1)
        }
        list
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val executiveHabitStats: StateFlow<ExecutiveHabitStats> = combine(
        allHabits,
        allEntries
    ) { habits, entries ->
        val cal = Calendar.getInstance()
        val daysInMonth = DateUtils.getDaysInMonth(cal.get(Calendar.YEAR), cal.get(Calendar.MONTH))
        val monthDaysIso = daysInMonth.map { DateUtils.formatIso(it) }.toSet()

        val totalActions = entries.count { it.dateIso in monthDaysIso && it.isCompleted }
        val maxActions = habits.size * daysInMonth.size
        val rate = if (maxActions > 0) ((totalActions.toFloat() / maxActions) * 100).toInt() else 0

        var currentStreak = 0
        val checkCal = Calendar.getInstance()
        for (i in 0..365) {
            val iso = DateUtils.formatIso(checkCal)
            val anyDone = entries.any { it.dateIso == iso && (it.isCompleted || it.isRestDay) }
            if (anyDone) {
                currentStreak++
                checkCal.add(Calendar.DAY_OF_YEAR, -1)
            } else break
        }

        // Calculate true historical best streak across all entries
        val datesWithActivity = entries
            .filter { it.isCompleted || it.isRestDay }
            .map { it.dateIso }
            .distinct()
            .sorted()

        var maxStreak = 0
        var tempStreak = 0
        var prevCal: Calendar? = null
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)

        for (dateIso in datesWithActivity) {
            val date = try { sdf.parse(dateIso) } catch (_: Exception) { null } ?: continue
            val thisCal = Calendar.getInstance().apply { time = date }
            if (prevCal == null) {
                tempStreak = 1
            } else {
                val diffDays = (thisCal.timeInMillis - prevCal.timeInMillis) / (1000 * 60 * 60 * 24)
                if (diffDays == 1L) {
                    tempStreak++
                } else if (diffDays > 1L) {
                    tempStreak = 1
                }
            }
            prevCal = thisCal
            if (tempStreak > maxStreak) {
                maxStreak = tempStreak
            }
        }
        val calculatedBestStreak = maxOf(currentStreak, maxStreak)

        ExecutiveHabitStats(
            consistencyRate = rate,
            actionsCompleted = totalActions,
            currentStreak = currentStreak,
            bestStreak = calculatedBestStreak
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), ExecutiveHabitStats())

    // --- Unified Daily Rhythm Score (0-100) ---
    val dailyRhythmScore: StateFlow<Int> = combine(
        allHabits,
        allEntries,
        allSessions
    ) { habits, entries, sessions ->
        val todayIso = DateUtils.todayIso()
        val cal = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0); set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
        }
        val startOfToday = cal.timeInMillis

        // Habit component (0 to 50 pts)
        val todayEntries = entries.filter { it.dateIso == todayIso }
        val habitsDone = todayEntries.count { it.isCompleted || it.isRestDay }
        val habitPts = if (habits.isNotEmpty()) {
            ((habitsDone.toFloat() / habits.size) * 50f).coerceIn(0f, 50f)
        } else 0f

        // Focus Time component (0 to 50 pts, goal = 2 hours = 7200 secs)
        val todaySecs = sessions.filter { it.startTime >= startOfToday }.sumOf { it.durationSeconds }
        val focusPts = ((todaySecs.toFloat() / 7200f) * 50f).coerceIn(0f, 50f)

        (habitPts + focusPts).toInt()
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)
}

class AnalyticsViewModelFactory(private val repository: StudyRepository) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(AnalyticsViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return AnalyticsViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
