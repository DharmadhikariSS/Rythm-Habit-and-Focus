package com.example.studytimerapp.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.studytimerapp.data.*
import com.example.studytimerapp.ui.components.HeatmapDayData
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.Calendar

data class MonthlyDashboardStats(
    val monthName: String = "",
    val totalCompleted: Int = 0,
    val monthlyProgressPercent: Int = 0,
    val todayCompleted: Int = 0,
    val todayTotal: Int = 0,
    val streakDays: Int = 0,
    val heatmapDays: List<HeatmapDayData> = emptyList()
)

class HabitViewModel(private val repository: StudyRepository) : ViewModel() {

    private val _selectedCalendar = MutableStateFlow(Calendar.getInstance())
    val selectedCalendar: StateFlow<Calendar> = _selectedCalendar.asStateFlow()

    private val _selectedDateIso = MutableStateFlow(DateUtils.todayIso())
    val selectedDateIso: StateFlow<String> = _selectedDateIso.asStateFlow()

    val allHabits = repository.allHabits
    val allEntries = repository.allHabitEntries

    // Combine habits, entries, and selected calendar to compute real-time monthly dashboard stats
    val monthlyStats: StateFlow<MonthlyDashboardStats> = combine(
        allHabits,
        allEntries,
        selectedCalendar,
        selectedDateIso
    ) { habits, entries, cal, selDate ->
        computeMonthlyStats(habits, entries, cal, selDate)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), MonthlyDashboardStats())

    // Real-time completion percentage for each habit in the selected month
    val habitMonthlyRates: StateFlow<Map<Int, Int>> = combine(
        allHabits,
        allEntries,
        selectedCalendar
    ) { habits, entries, cal ->
        val year = cal.get(Calendar.YEAR)
        val month = cal.get(Calendar.MONTH)
        val daysInMonth = DateUtils.getDaysInMonth(year, month)
        val monthDaysIso = daysInMonth.map { DateUtils.formatIso(it) }.toSet()

        val rates = mutableMapOf<Int, Int>()
        habits.forEach { habit ->
            val completedDaysInMonth = entries.count { 
                it.habitId == habit.id && it.dateIso in monthDaysIso && (it.isCompleted || it.isRestDay) 
            }
            val rate = if (monthDaysIso.isNotEmpty()) {
                ((completedDaysInMonth.toFloat() / monthDaysIso.size) * 100).toInt()
            } else 0
            rates[habit.id] = rate
        }
        rates
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyMap())

    private fun computeMonthlyStats(
        habits: List<Habit>,
        entries: List<HabitEntry>,
        cal: Calendar,
        selDate: String
    ): MonthlyDashboardStats {
        val year = cal.get(Calendar.YEAR)
        val month = cal.get(Calendar.MONTH)
        val monthName = DateUtils.formatMonthYear(cal)
        val todayIso = DateUtils.todayIso()

        val daysInMonth = DateUtils.getDaysInMonth(year, month)
        val monthDaysIso = daysInMonth.map { DateUtils.formatIso(it) }.toSet()

        // 1. Total Completed in this month
        val totalCompleted = entries.count { 
            it.dateIso in monthDaysIso && it.isCompleted 
        }

        // 2. Overall Monthly Progress %
        val totalOpportunities = habits.size * daysInMonth.size
        val monthlyProgressPercent = if (totalOpportunities > 0) {
            ((totalCompleted.toFloat() / totalOpportunities) * 100).toInt().coerceIn(0, 100)
        } else 0

        // 3. Today's stats
        val todayEntries = entries.filter { it.dateIso == todayIso }
        val todayCompleted = todayEntries.count { it.isCompleted || it.isRestDay }
        val todayTotal = habits.size

        // 4. Heatmap Day-by-Day data
        val heatmapDays = daysInMonth.map { dayCal ->
            val iso = DateUtils.formatIso(dayCal)
            val dayEntries = entries.filter { it.dateIso == iso }
            val completedCount = dayEntries.count { it.isCompleted || it.isRestDay }
            val ratio = if (habits.isNotEmpty()) {
                (completedCount.toFloat() / habits.size).coerceIn(0f, 1f)
            } else 0f

            HeatmapDayData(
                dateIso = iso,
                dayNumber = dayCal.get(Calendar.DAY_OF_MONTH),
                dayOfWeek = DateUtils.getDayOfWeekShort(dayCal),
                completionRatio = ratio,
                isToday = iso == todayIso
            )
        }

        // 5. Current Streak calculation
        val streak = calculateCurrentStreak(entries, habits)

        return MonthlyDashboardStats(
            monthName = monthName,
            totalCompleted = totalCompleted,
            monthlyProgressPercent = monthlyProgressPercent,
            todayCompleted = todayCompleted,
            todayTotal = todayTotal,
            streakDays = streak,
            heatmapDays = heatmapDays
        )
    }

    private fun calculateCurrentStreak(entries: List<HabitEntry>, habits: List<Habit>): Int {
        if (habits.isEmpty()) return 0
        var streak = 0
        val checkCal = Calendar.getInstance()
        
        // If today has completions, count today; otherwise check yesterday
        val todayIso = DateUtils.formatIso(checkCal)
        val todayCompleted = entries.any { it.dateIso == todayIso && (it.isCompleted || it.isRestDay) }
        if (!todayCompleted) {
            checkCal.add(Calendar.DAY_OF_YEAR, -1)
        }

        for (i in 0..365) {
            val iso = DateUtils.formatIso(checkCal)
            val anyDone = entries.any { it.dateIso == iso && (it.isCompleted || it.isRestDay) }
            if (anyDone) {
                streak++
                checkCal.add(Calendar.DAY_OF_YEAR, -1)
            } else {
                break
            }
        }
        return streak
    }

    fun selectDate(dateIso: String) {
        _selectedDateIso.value = dateIso
    }

    fun previousMonth() {
        val newCal = Calendar.getInstance().apply {
            timeInMillis = _selectedCalendar.value.timeInMillis
            add(Calendar.MONTH, -1)
        }
        _selectedCalendar.value = newCal
    }

    fun nextMonth() {
        val newCal = Calendar.getInstance().apply {
            timeInMillis = _selectedCalendar.value.timeInMillis
            add(Calendar.MONTH, 1)
        }
        _selectedCalendar.value = newCal
    }

    fun toggleHabit(habitId: Int) {
        viewModelScope.launch {
            repository.toggleHabitCompletion(habitId, _selectedDateIso.value)
        }
    }

    fun toggleRestDay(habitId: Int) {
        viewModelScope.launch {
            repository.toggleRestDay(habitId, _selectedDateIso.value)
        }
    }

    fun incrementCounter(habitId: Int) {
        viewModelScope.launch {
            repository.updateCounter(habitId, _selectedDateIso.value, 1)
        }
    }

    fun decrementCounter(habitId: Int) {
        viewModelScope.launch {
            repository.updateCounter(habitId, _selectedDateIso.value, -1)
        }
    }

    fun addHabit(habit: Habit) {
        viewModelScope.launch {
            repository.insertHabit(habit)
        }
    }

    fun deleteHabit(habit: Habit) {
        viewModelScope.launch {
            repository.deleteHabit(habit)
        }
    }
}

class HabitViewModelFactory(private val repository: StudyRepository) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(HabitViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return HabitViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
