package com.example.studytimerapp.data

import android.content.Context
import com.example.studytimerapp.theme.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.File
import java.util.Calendar

@Serializable
data class PersistedTimer(
    val subjectId: Int,
    val startTime: Long,
    val isRunning: Boolean,
    val accumulatedDurationSeconds: Long = 0L
)

@Serializable
data class AppData(
    val subjects: List<Subject> = emptyList(),
    val sessions: List<StudySession> = emptyList(),
    val habits: List<Habit> = emptyList(),
    val habitEntries: List<HabitEntry> = emptyList(),
    val activeTimers: Map<Int, PersistedTimer> = emptyMap(),
    val nextSubjectId: Int = 1,
    val nextSessionId: Int = 1,
    val nextHabitId: Int = 1,
    val nextEntryId: Int = 1
)

class StudyRepository(private val context: Context) {
    private val dataFile = File(context.filesDir, "study_data.json")
    
    private val json = Json { 
        ignoreUnknownKeys = true 
        coerceInputValues = true
        encodeDefaults = true
    }

    private val _allSubjects = MutableStateFlow<List<Subject>>(emptyList())
    val allSubjects: StateFlow<List<Subject>> = _allSubjects.asStateFlow()
    
    private val _allSessions = MutableStateFlow<List<StudySession>>(emptyList())
    val allSessions: StateFlow<List<StudySession>> = _allSessions.asStateFlow()

    private val _allHabits = MutableStateFlow<List<Habit>>(emptyList())
    val allHabits: StateFlow<List<Habit>> = _allHabits.asStateFlow()

    private val _allHabitEntries = MutableStateFlow<List<HabitEntry>>(emptyList())
    val allHabitEntries: StateFlow<List<HabitEntry>> = _allHabitEntries.asStateFlow()

    private val _persistedTimers = MutableStateFlow<Map<Int, PersistedTimer>>(emptyMap())
    val persistedTimers: StateFlow<Map<Int, PersistedTimer>> = _persistedTimers.asStateFlow()

    private var appData = AppData()

    init {
        loadData()
    }

    private fun loadData() {
        if (dataFile.exists()) {
            try {
                val jsonStr = dataFile.readText()
                appData = json.decodeFromString(jsonStr)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        // Seed initial habits if none exist so user starts with a rich, ready-to-use board
        if (appData.habits.isEmpty()) {
            val initialHabits = listOf(
                Habit(
                    id = 1,
                    name = "Book Reading",
                    icon = "📖",
                    color = AccentOchre.hashCode(),
                    type = HabitType.TIMED,
                    targetDurationMinutes = 30,
                    subjectId = 1
                ),
                Habit(
                    id = 2,
                    name = "1 Hour Gym",
                    icon = "🏋️‍♂️",
                    color = AccentEmerald.hashCode(),
                    type = HabitType.TIMED,
                    targetDurationMinutes = 60,
                    subjectId = 2
                ),
                Habit(
                    id = 3,
                    name = "Meditation",
                    icon = "🧘",
                    color = AccentLavender.hashCode(),
                    type = HabitType.TIMED,
                    targetDurationMinutes = 15,
                    subjectId = 3
                ),
                Habit(
                    id = 4,
                    name = "Drink Water",
                    icon = "💧",
                    color = AccentOcean.hashCode(),
                    type = HabitType.COUNTER,
                    targetCount = 8,
                    targetUnit = "Glasses"
                ),
                Habit(
                    id = 5,
                    name = "No Sugar",
                    icon = "🚫",
                    color = AccentTerracotta.hashCode(),
                    type = HabitType.CHECK
                )
            )

            // Seed corresponding subjects for timers if empty
            val initialSubjects = if (appData.subjects.isEmpty()) {
                listOf(
                    Subject(id = 1, name = "Book Reading", color = AccentOchre.hashCode()),
                    Subject(id = 2, name = "1 Hour Gym", color = AccentEmerald.hashCode()),
                    Subject(id = 3, name = "Meditation", color = AccentLavender.hashCode()),
                    Subject(id = 4, name = "Deep Work", color = AccentOcean.hashCode())
                )
            } else appData.subjects

            appData = appData.copy(
                habits = initialHabits,
                subjects = initialSubjects,
                nextHabitId = 6,
                nextSubjectId = if (appData.subjects.isEmpty()) 5 else appData.nextSubjectId
            )
        }

        // Auto-heal & synchronize all TIMED habits with their 1:1 Subject entities
        ensureHabitSubjectSync()

        _allSubjects.value = appData.subjects
        _allSessions.value = appData.sessions
        _allHabits.value = appData.habits
        _allHabitEntries.value = appData.habitEntries
        _persistedTimers.value = appData.activeTimers
    }

    private fun ensureHabitSubjectSync() {
        var currentSubjects = appData.subjects.toMutableList()
        var nextSubId = appData.nextSubjectId
        var changed = false

        val updatedHabits = appData.habits.map { habit ->
            if (habit.type == HabitType.TIMED) {
                // Find existing subject strictly by subjectId or by matching name (NOT raw habit ID)
                var matched = currentSubjects.find { sub ->
                    (habit.subjectId != null && sub.id == habit.subjectId) ||
                    sub.name.equals(habit.name, ignoreCase = true)
                }
                if (matched == null) {
                    matched = Subject(
                        id = nextSubId++,
                        name = habit.name,
                        color = habit.color
                    )
                    currentSubjects.add(matched)
                    changed = true
                }
                if (habit.subjectId != matched.id) {
                    changed = true
                    habit.copy(subjectId = matched.id)
                } else {
                    habit
                }
            } else {
                habit
            }
        }

        if (changed) {
            appData = appData.copy(
                habits = updatedHabits,
                subjects = currentSubjects,
                nextSubjectId = nextSubId
            )
            try {
                dataFile.writeText(json.encodeToString(appData))
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private suspend fun saveData() {
        withContext(Dispatchers.IO) {
            try {
                val jsonStr = json.encodeToString(appData)
                dataFile.writeText(jsonStr)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    // --- Subject Operations ---

    suspend fun insertSubject(subject: Subject) {
        val newSubject = subject.copy(id = appData.nextSubjectId)
        appData = appData.copy(
            subjects = appData.subjects + newSubject,
            nextSubjectId = appData.nextSubjectId + 1
        )
        _allSubjects.value = appData.subjects
        saveData()
    }

    suspend fun updateSubject(subject: Subject) {
        appData = appData.copy(
            subjects = appData.subjects.map { if (it.id == subject.id) subject else it }
        )
        _allSubjects.value = appData.subjects
        saveData()
    }

    suspend fun deleteSubject(subject: Subject) {
        appData = appData.copy(
            subjects = appData.subjects.filter { it.id != subject.id },
            sessions = appData.sessions.filter { it.subjectId != subject.id }
        )
        _allSubjects.value = appData.subjects
        _allSessions.value = appData.sessions
        saveData()
    }

    // --- Session Operations (Sync with Timed Habits) ---

    suspend fun insertSession(session: StudySession) {
        val newSession = session.copy(id = appData.nextSessionId)
        val updatedSessions = appData.sessions + newSession
        appData = appData.copy(
            sessions = updatedSessions,
            nextSessionId = appData.nextSessionId + 1
        )
        _allSessions.value = appData.sessions

        // Automatically sync session duration with any matching habit
        val subject = appData.subjects.find { it.id == session.subjectId }
        if (subject != null) {
            val matchingHabit = appData.habits.find { 
                (it.subjectId != null && it.subjectId == subject.id) ||
                it.name.equals(subject.name, ignoreCase = true)
            }
            if (matchingHabit != null && matchingHabit.type == HabitType.TIMED) {
                val today = DateUtils.todayIso()
                recordTimedHabitSession(matchingHabit.id, today, session.durationSeconds)
            }
        }

        saveData()
    }

    // --- Habit Operations ---

    suspend fun insertHabit(habit: Habit): Habit {
        var boundSubjectId = habit.subjectId
        if (habit.type == HabitType.TIMED) {
            val existingSub = appData.subjects.find { 
                (boundSubjectId != null && it.id == boundSubjectId) ||
                it.name.equals(habit.name, ignoreCase = true) 
            }
            if (existingSub == null) {
                val newSub = Subject(id = appData.nextSubjectId, name = habit.name, color = habit.color)
                appData = appData.copy(
                    subjects = appData.subjects + newSub,
                    nextSubjectId = appData.nextSubjectId + 1
                )
                _allSubjects.value = appData.subjects
                boundSubjectId = newSub.id
            } else {
                boundSubjectId = existingSub.id
            }
        }

        val newHabit = habit.copy(id = appData.nextHabitId, subjectId = boundSubjectId)
        appData = appData.copy(
            habits = appData.habits + newHabit,
            nextHabitId = appData.nextHabitId + 1
        )
        _allHabits.value = appData.habits
        saveData()
        return newHabit
    }

    suspend fun updateHabit(habit: Habit) {
        appData = appData.copy(
            habits = appData.habits.map { if (it.id == habit.id) habit else it }
        )
        _allHabits.value = appData.habits
        saveData()
    }

    suspend fun deleteHabit(habit: Habit) {
        appData = appData.copy(
            habits = appData.habits.filter { it.id != habit.id },
            habitEntries = appData.habitEntries.filter { it.habitId != habit.id }
        )
        _allHabits.value = appData.habits
        _allHabitEntries.value = appData.habitEntries
        saveData()
    }

    // --- Habit Entry & Interaction Operations ---

    suspend fun toggleHabitCompletion(habitId: Int, dateIso: String) {
        val existingIndex = appData.habitEntries.indexOfFirst { 
            it.habitId == habitId && it.dateIso == dateIso 
        }

        val updatedEntries = appData.habitEntries.toMutableList()
        if (existingIndex >= 0) {
            val current = updatedEntries[existingIndex]
            val newCompleted = !current.isCompleted
            val habit = appData.habits.find { it.id == habitId }
            val count = if (habit?.type == HabitType.COUNTER) {
                if (newCompleted) habit.targetCount else 0
            } else current.currentCount

            updatedEntries[existingIndex] = current.copy(
                isCompleted = newCompleted,
                currentCount = count,
                isRestDay = false,
                updatedAt = System.currentTimeMillis()
            )
        } else {
            val habit = appData.habits.find { it.id == habitId }
            val count = if (habit?.type == HabitType.COUNTER) habit.targetCount else 0
            val newEntry = HabitEntry(
                id = appData.nextEntryId,
                habitId = habitId,
                dateIso = dateIso,
                isCompleted = true,
                currentCount = count,
                updatedAt = System.currentTimeMillis()
            )
            updatedEntries.add(newEntry)
            appData = appData.copy(nextEntryId = appData.nextEntryId + 1)
        }

        appData = appData.copy(habitEntries = updatedEntries)
        _allHabitEntries.value = appData.habitEntries
        saveData()
    }

    suspend fun toggleRestDay(habitId: Int, dateIso: String) {
        val existingIndex = appData.habitEntries.indexOfFirst { 
            it.habitId == habitId && it.dateIso == dateIso 
        }

        val updatedEntries = appData.habitEntries.toMutableList()
        if (existingIndex >= 0) {
            val current = updatedEntries[existingIndex]
            updatedEntries[existingIndex] = current.copy(
                isRestDay = !current.isRestDay,
                isCompleted = false,
                updatedAt = System.currentTimeMillis()
            )
        } else {
            val newEntry = HabitEntry(
                id = appData.nextEntryId,
                habitId = habitId,
                dateIso = dateIso,
                isCompleted = false,
                isRestDay = true,
                updatedAt = System.currentTimeMillis()
            )
            updatedEntries.add(newEntry)
            appData = appData.copy(nextEntryId = appData.nextEntryId + 1)
        }

        appData = appData.copy(habitEntries = updatedEntries)
        _allHabitEntries.value = appData.habitEntries
        saveData()
    }

    suspend fun updateCounter(habitId: Int, dateIso: String, delta: Int) {
        val habit = appData.habits.find { it.id == habitId } ?: return
        val existingIndex = appData.habitEntries.indexOfFirst { 
            it.habitId == habitId && it.dateIso == dateIso 
        }

        val updatedEntries = appData.habitEntries.toMutableList()
        if (existingIndex >= 0) {
            val current = updatedEntries[existingIndex]
            val newCount = (current.currentCount + delta).coerceAtLeast(0)
            val completed = newCount >= habit.targetCount
            updatedEntries[existingIndex] = current.copy(
                currentCount = newCount,
                isCompleted = completed,
                isRestDay = false,
                updatedAt = System.currentTimeMillis()
            )
        } else {
            val newCount = delta.coerceAtLeast(0)
            val completed = newCount >= habit.targetCount
            val newEntry = HabitEntry(
                id = appData.nextEntryId,
                habitId = habitId,
                dateIso = dateIso,
                currentCount = newCount,
                isCompleted = completed,
                updatedAt = System.currentTimeMillis()
            )
            updatedEntries.add(newEntry)
            appData = appData.copy(nextEntryId = appData.nextEntryId + 1)
        }

        appData = appData.copy(habitEntries = updatedEntries)
        _allHabitEntries.value = appData.habitEntries
        saveData()
    }

    private suspend fun recordTimedHabitSession(habitId: Int, dateIso: String, durationSecs: Long) {
        val habit = appData.habits.find { it.id == habitId } ?: return
        val existingIndex = appData.habitEntries.indexOfFirst { 
            it.habitId == habitId && it.dateIso == dateIso 
        }

        val updatedEntries = appData.habitEntries.toMutableList()
        if (existingIndex >= 0) {
            val current = updatedEntries[existingIndex]
            val totalSecs = current.loggedDurationSeconds + durationSecs
            val targetSecs = habit.targetDurationMinutes * 60L
            val isDone = totalSecs >= targetSecs
            updatedEntries[existingIndex] = current.copy(
                loggedDurationSeconds = totalSecs,
                isCompleted = current.isCompleted || isDone,
                updatedAt = System.currentTimeMillis()
            )
        } else {
            val targetSecs = habit.targetDurationMinutes * 60L
            val isDone = durationSecs >= targetSecs
            val newEntry = HabitEntry(
                id = appData.nextEntryId,
                habitId = habitId,
                dateIso = dateIso,
                loggedDurationSeconds = durationSecs,
                isCompleted = isDone,
                updatedAt = System.currentTimeMillis()
            )
            updatedEntries.add(newEntry)
            appData = appData.copy(nextEntryId = appData.nextEntryId + 1)
        }

        appData = appData.copy(habitEntries = updatedEntries)
        _allHabitEntries.value = appData.habitEntries
        saveData()
    }

    // --- Active Timers Persistence (Protects against lockscreen process death) ---

    suspend fun saveActiveTimers(timers: Map<Int, PersistedTimer>) {
        appData = appData.copy(activeTimers = timers)
        _persistedTimers.value = timers
        saveData()
    }
}
