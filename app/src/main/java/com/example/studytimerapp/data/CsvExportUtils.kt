package com.example.studytimerapp.data

import android.content.Context
import android.content.Intent
import androidx.core.content.FileProvider
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object CsvExportUtils {

    fun exportAndShareData(
        context: Context,
        habits: List<Habit>,
        entries: List<HabitEntry>,
        subjects: List<Subject>,
        sessions: List<StudySession>
    ) {
        try {
            val exportDir = File(context.cacheDir, "exports").apply { mkdirs() }
            val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
            val csvFile = File(exportDir, "rhythm_data_export_$timeStamp.csv")

            val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.US)

            val builder = StringBuilder()

            // 1. Habits Section
            builder.append("=== HABITS LOG ===\n")
            builder.append("Habit ID,Habit Name,Type,Date,Completed,Rest Day,Logged Minutes,Count,Target\n")
            entries.forEach { entry ->
                val habit = habits.find { it.id == entry.habitId }
                val habitName = habit?.name ?: "Unknown"
                val type = habit?.type?.name ?: "CHECK"
                val loggedMins = entry.loggedDurationSeconds / 60
                val target = when (habit?.type) {
                    HabitType.TIMED -> "${habit.targetDurationMinutes} mins"
                    HabitType.COUNTER -> "${habit.targetCount} ${habit.targetUnit}"
                    else -> "1"
                }
                builder.append("${entry.habitId},\"$habitName\",$type,${entry.dateIso},${entry.isCompleted},${entry.isRestDay},$loggedMins,${entry.currentCount},\"$target\"\n")
            }

            builder.append("\n=== FOCUS SESSIONS LOG ===\n")
            builder.append("Session ID,Subject ID,Subject Name,Start Time,Duration (Mins),Duration (Secs)\n")
            sessions.forEach { session ->
                val subject = subjects.find { it.id == session.subjectId }
                val subjectName = subject?.name ?: "Unknown"
                val startDate = dateFormat.format(Date(session.startTime))
                val durationMins = session.durationSeconds / 60
                builder.append("${session.id},${session.subjectId},\"$subjectName\",\"$startDate\",$durationMins,${session.durationSeconds}\n")
            }

            csvFile.writeText(builder.toString())

            // Share via Intent
            val fileUri = try {
                FileProvider.getUriForFile(
                    context,
                    "${context.packageName}.fileprovider",
                    csvFile
                )
            } catch (_: Exception) {
                // Fallback for direct Uri
                android.net.Uri.fromFile(csvFile)
            }

            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "text/csv"
                putExtra(Intent.EXTRA_STREAM, fileUri)
                putExtra(Intent.EXTRA_SUBJECT, "Rhythm Productivity Data Export")
                putExtra(Intent.EXTRA_TEXT, "Here is your Rhythm habits and focus timer data export.")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            context.startActivity(Intent.createChooser(shareIntent, "Export Rhythm Data").apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            })

        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
