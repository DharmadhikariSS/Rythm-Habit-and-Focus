package com.example.studytimerapp.data

import org.junit.Assert.*
import org.junit.Test
import java.util.Calendar

class HabitTrackingTest {

    @Test
    fun testHabitCreationAndTypes() {
        val checkHabit = Habit(
            id = 1,
            name = "No Sugar",
            icon = "🚫",
            color = 0xFFB55D46.toInt(),
            type = HabitType.CHECK
        )
        assertEquals(HabitType.CHECK, checkHabit.type)
        assertEquals("No Sugar", checkHabit.name)

        val timedHabit = Habit(
            id = 2,
            name = "1 Hour Gym",
            icon = "🏋️‍♂️",
            color = 0xFF437A55.toInt(),
            type = HabitType.TIMED,
            targetDurationMinutes = 60
        )
        assertEquals(HabitType.TIMED, timedHabit.type)
        assertEquals(60, timedHabit.targetDurationMinutes)

        val counterHabit = Habit(
            id = 3,
            name = "Drink Water",
            icon = "💧",
            color = 0xFF386B80.toInt(),
            type = HabitType.COUNTER,
            targetCount = 8,
            targetUnit = "Glasses"
        )
        assertEquals(HabitType.COUNTER, counterHabit.type)
        assertEquals(8, counterHabit.targetCount)
    }

    @Test
    fun testDateUtilsDaysInMonth() {
        // January has 31 days
        val janDays = DateUtils.getDaysInMonth(2026, Calendar.JANUARY)
        assertEquals(31, janDays.size)

        // February 2026 has 28 days (non-leap year)
        val febDays = DateUtils.getDaysInMonth(2026, Calendar.FEBRUARY)
        assertEquals(28, febDays.size)
    }

    @Test
    fun testDateUtilsIsoFormatting() {
        val cal = Calendar.getInstance()
        cal.set(2026, Calendar.JANUARY, 14, 0, 0, 0)
        val iso = DateUtils.formatIso(cal)
        assertEquals("2026-01-14", iso)
    }
}
