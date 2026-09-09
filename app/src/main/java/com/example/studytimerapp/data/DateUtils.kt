package com.example.studytimerapp.data

import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

object DateUtils {
    private val isoFormat = SimpleDateFormat("yyyy-MM-dd", Locale.US)
    private val monthYearFormat = SimpleDateFormat("MMMM yyyy", Locale.US)
    private val shortDayFormat = SimpleDateFormat("EEE", Locale.US)

    fun todayIso(): String = isoFormat.format(Date())

    fun formatIso(calendar: Calendar): String = isoFormat.format(calendar.time)

    fun formatMonthYear(calendar: Calendar): String = monthYearFormat.format(calendar.time)

    fun parseIso(iso: String): Calendar {
        val cal = Calendar.getInstance()
        try {
            val date = isoFormat.parse(iso)
            if (date != null) cal.time = date
        } catch (_: Exception) {}
        return cal
    }

    fun getDaysInMonth(year: Int, monthZeroIndexed: Int): List<Calendar> {
        val cal = Calendar.getInstance()
        cal.set(Calendar.YEAR, year)
        cal.set(Calendar.MONTH, monthZeroIndexed)
        cal.set(Calendar.DAY_OF_MONTH, 1)

        val daysCount = cal.getActualMaximum(Calendar.DAY_OF_MONTH)
        val list = mutableListOf<Calendar>()
        for (day in 1..daysCount) {
            val dayCal = Calendar.getInstance()
            dayCal.set(Calendar.YEAR, year)
            dayCal.set(Calendar.MONTH, monthZeroIndexed)
            dayCal.set(Calendar.DAY_OF_MONTH, day)
            list.add(dayCal)
        }
        return list
    }

    fun getDayOfWeekShort(calendar: Calendar): String = shortDayFormat.format(calendar.time)
}
