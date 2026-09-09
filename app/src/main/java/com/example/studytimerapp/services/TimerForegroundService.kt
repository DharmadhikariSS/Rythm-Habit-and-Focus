package com.example.studytimerapp.services

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.example.studytimerapp.MainActivity
import com.example.studytimerapp.R

class TimerForegroundService : Service() {

    private val currentlyNotifiedChildIds = mutableSetOf<Int>()

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onDestroy() {
        super.onDestroy()
        stopForeground(STOP_FOREGROUND_REMOVE)
        val nm = getSystemService(NotificationManager::class.java)
        nm?.cancelAll()
        currentlyNotifiedChildIds.clear()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action ?: return START_NOT_STICKY

        when (action) {
            ACTION_START_OR_UPDATE -> {
                val timerBundles = intent.getParcelableArrayListExtra<Bundle>(EXTRA_TIMER_LIST) ?: arrayListOf()
                handleUpdate(timerBundles)
            }
            ACTION_TOGGLE_CLICKED -> {
                val subjectId = intent.getIntExtra(EXTRA_SUBJECT_ID, 0)
                onActionToggle?.invoke(subjectId)
            }
            ACTION_STOP_CLICKED -> {
                val subjectId = intent.getIntExtra(EXTRA_SUBJECT_ID, 0)
                if (onActionStop != null) {
                    onActionStop?.invoke(subjectId)
                } else {
                    stopForeground(STOP_FOREGROUND_REMOVE)
                    val nm = getSystemService(NotificationManager::class.java)
                    nm?.cancelAll()
                    stopSelf()
                }
            }
            ACTION_PAUSE_ALL -> {
                onActionPauseAll?.invoke()
            }
            ACTION_STOP_ALL -> {
                stopForeground(STOP_FOREGROUND_REMOVE)
                val nm = getSystemService(NotificationManager::class.java)
                nm?.cancelAll()
                stopSelf()
            }
        }

        return START_NOT_STICKY
    }

    private fun handleUpdate(timerBundles: List<Bundle>) {
        val nm = getSystemService(NotificationManager::class.java) ?: return

        if (timerBundles.isEmpty()) {
            stopForeground(STOP_FOREGROUND_REMOVE)
            nm.cancelAll()
            currentlyNotifiedChildIds.clear()
            stopSelf()
            return
        }

        if (timerBundles.size == 1) {
            // Single timer mode
            val bundle = timerBundles.first()
            val notification = buildChildOrSingleNotification(bundle, isGrouped = false)
            startForeground(NOTIFICATION_ID, notification)

            // Cancel any orphaned child notifications
            currentlyNotifiedChildIds.forEach { nm.cancel(it) }
            currentlyNotifiedChildIds.clear()
        } else {
            // Multi-timer grouped mode
            val summaryNotification = buildSummaryNotification(timerBundles.size)
            startForeground(NOTIFICATION_ID, summaryNotification)

            val newChildIds = mutableSetOf<Int>()
            for (bundle in timerBundles) {
                val subjectId = bundle.getInt(KEY_SUBJECT_ID, 0)
                val childId = NOTIFICATION_CHILD_OFFSET + subjectId
                newChildIds.add(childId)
                val childNotification = buildChildOrSingleNotification(bundle, isGrouped = true)
                nm.notify(childId, childNotification)
            }

            // Remove notifications for timers that were paused/stopped
            val removedIds = currentlyNotifiedChildIds - newChildIds
            removedIds.forEach { nm.cancel(it) }
            currentlyNotifiedChildIds.clear()
            currentlyNotifiedChildIds.addAll(newChildIds)
        }
    }

    private fun buildSummaryNotification(activeCount: Int): Notification {
        val contentIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val pauseAllIntent = Intent(this, TimerForegroundService::class.java).apply {
            action = ACTION_PAUSE_ALL
        }
        val pauseAllPendingIntent = PendingIntent.getService(
            this,
            99,
            pauseAllIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification_timer)
            .setContentTitle("Rhythm Focus")
            .setContentText("$activeCount Active Focus Timers")
            .setSubText("$activeCount Timers")
            .setContentIntent(contentIntent)
            .setGroup(GROUP_KEY)
            .setGroupSummary(true)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setColor(0xFF437A55.toInt())
            .setColorized(false)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setCategory(NotificationCompat.CATEGORY_STOPWATCH)
            .addAction(
                android.R.drawable.ic_media_pause,
                "Pause All",
                pauseAllPendingIntent
            )
            .build()
    }

    private fun buildChildOrSingleNotification(bundle: Bundle, isGrouped: Boolean): Notification {
        val subjectId = bundle.getInt(KEY_SUBJECT_ID, 0)
        val subjectName = bundle.getString(KEY_SUBJECT_NAME) ?: "Focus Timer"
        val elapsedMs = bundle.getLong(KEY_ELAPSED_MS, 0L)
        val subjectColor = bundle.getInt(KEY_SUBJECT_COLOR, 0)
        val targetMinutes = bundle.getInt(KEY_TARGET_MINUTES, 0)
        val todayTotalMinutes = bundle.getInt(KEY_TODAY_TOTAL_MINUTES, 0)
        val streakDays = bundle.getInt(KEY_STREAK_DAYS, 0)
        val todayTotalFormatted = bundle.getString(KEY_TODAY_TOTAL_FORMATTED) ?: ""
        val weeklyProgressFormatted = bundle.getString(KEY_WEEKLY_PROGRESS_FORMATTED) ?: ""
        val rhythmScore = bundle.getInt(KEY_RHYTHM_SCORE, 0)

        val contentIntent = PendingIntent.getActivity(
            this,
            subjectId,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        // Toggle PendingIntent (Pause)
        val toggleIntent = Intent(this, TimerForegroundService::class.java).apply {
            action = ACTION_TOGGLE_CLICKED
            putExtra(EXTRA_SUBJECT_ID, subjectId)
        }
        val togglePendingIntent = PendingIntent.getService(
            this,
            100 + subjectId,
            toggleIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        // Stop & Save PendingIntent
        val stopIntent = Intent(this, TimerForegroundService::class.java).apply {
            action = ACTION_STOP_CLICKED
            putExtra(EXTRA_SUBJECT_ID, subjectId)
        }
        val stopPendingIntent = PendingIntent.getService(
            this,
            200 + subjectId,
            stopIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val chronometerBase = System.currentTimeMillis() - elapsedMs

        // Content Text: Contextual Target and Streak Info
        val streakText = if (streakDays > 0) " • 🔥 ${streakDays}d Streak" else ""
        val contentText = if (targetMinutes > 0) {
            val progressPct = ((todayTotalMinutes.toFloat() / targetMinutes) * 100).toInt()
            "🎯 ${todayTotalMinutes}m / ${targetMinutes}m (${progressPct}%)$streakText"
        } else if (weeklyProgressFormatted.isNotBlank() && !weeklyProgressFormatted.startsWith("0.0h / 0h") && !weeklyProgressFormatted.startsWith("0.0h / 0.0h")) {
            "🎯 Weekly: $weeklyProgressFormatted$streakText"
        } else {
            "Focus session in progress"
        }

        // Expanded BigText
        val bigTextBuilder = StringBuilder()
        bigTextBuilder.append("⏱ Session Status: Live & Tracking\n")
        if (todayTotalFormatted.isNotBlank()) {
            bigTextBuilder.append("📊 Today's Cumulative: ").append(todayTotalFormatted).append("\n")
        }
        if (targetMinutes > 0) {
            val progressPct = ((todayTotalMinutes.toFloat() / targetMinutes) * 100).toInt()
            bigTextBuilder.append("🎯 Goal: ").append(todayTotalMinutes).append("m of ").append(targetMinutes).append("m (").append(progressPct).append("% achieved)\n")
        }
        if (weeklyProgressFormatted.isNotBlank() && !weeklyProgressFormatted.startsWith("0.0h / 0h") && !weeklyProgressFormatted.startsWith("0.0h / 0.0h")) {
            bigTextBuilder.append("📅 Weekly Target: ").append(weeklyProgressFormatted).append("\n")
        }
        if (streakDays > 0) {
            bigTextBuilder.append("🔥 Habit Streak: ").append(streakDays).append(" consecutive days\n")
        }
        if (rhythmScore > 0) {
            val tier = when {
                rhythmScore >= 90 -> "Transcendent"
                rhythmScore >= 75 -> "Harmonious"
                rhythmScore >= 50 -> "Steady"
                else -> "Building Rhythm"
            }
            bigTextBuilder.append("⭐ Daily Rhythm Score: ").append(rhythmScore).append(" • ").append(tier)
        }

        val bigTextStyle = NotificationCompat.BigTextStyle()
            .setBigContentTitle("⏱ $subjectName")
            .bigText(bigTextBuilder.toString().trimEnd())
            .setSummaryText(if (isGrouped) "Active Timer" else "Focus Intelligence")

        val builder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification_timer)
            .setContentTitle("⏱ $subjectName")
            .setContentText(contentText)
            .setSubText("Rhythm")
            .setStyle(bigTextStyle)
            .setContentIntent(contentIntent)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setUsesChronometer(true)
            .setWhen(chronometerBase)
            .setColor(if (subjectColor != 0) subjectColor else 0xFF437A55.toInt())
            .setColorized(false)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setCategory(NotificationCompat.CATEGORY_STOPWATCH)
            .addAction(
                android.R.drawable.ic_media_pause,
                "Pause",
                togglePendingIntent
            )
            .addAction(
                android.R.drawable.ic_menu_save,
                "Save & Finish",
                stopPendingIntent
            )

        if (isGrouped) {
            builder.setGroup(GROUP_KEY)
        }

        if (targetMinutes > 0) {
            builder.setProgress(targetMinutes, todayTotalMinutes.coerceAtMost(targetMinutes), false)
        }

        return builder.build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Active Focus Timers",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Shows live ticking timers on lock screen and notification bar"
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    companion object {
        const val CHANNEL_ID = "rhythm_timer_channel_v2"
        const val NOTIFICATION_ID = 1001
        const val NOTIFICATION_CHILD_OFFSET = 2000
        const val GROUP_KEY = "rhythm_active_timers"

        const val ACTION_START_OR_UPDATE = "com.example.studytimerapp.ACTION_START_OR_UPDATE"
        const val ACTION_TOGGLE_CLICKED = "com.example.studytimerapp.ACTION_TOGGLE_CLICKED"
        const val ACTION_STOP_CLICKED = "com.example.studytimerapp.ACTION_STOP_CLICKED"
        const val ACTION_PAUSE_ALL = "com.example.studytimerapp.ACTION_PAUSE_ALL"
        const val ACTION_STOP_ALL = "com.example.studytimerapp.ACTION_STOP_ALL"

        const val EXTRA_SUBJECT_ID = "extra_subject_id"
        const val EXTRA_TIMER_LIST = "extra_timer_list"

        const val KEY_SUBJECT_ID = "key_subject_id"
        const val KEY_SUBJECT_NAME = "key_subject_name"
        const val KEY_ELAPSED_MS = "key_elapsed_ms"
        const val KEY_SUBJECT_COLOR = "key_subject_color"
        const val KEY_TARGET_MINUTES = "key_target_minutes"
        const val KEY_TODAY_TOTAL_MINUTES = "key_today_total_minutes"
        const val KEY_STREAK_DAYS = "key_streak_days"
        const val KEY_TODAY_TOTAL_FORMATTED = "key_today_total_formatted"
        const val KEY_WEEKLY_PROGRESS_FORMATTED = "key_weekly_progress_formatted"
        const val KEY_RHYTHM_SCORE = "key_rhythm_score"

        var onActionToggle: ((Int) -> Unit)? = null
        var onActionStop: ((Int) -> Unit)? = null
        var onActionPauseAll: (() -> Unit)? = null

        fun updateService(context: Context, timerBundles: ArrayList<Bundle>) {
            val intent = Intent(context, TimerForegroundService::class.java).apply {
                action = ACTION_START_OR_UPDATE
                putParcelableArrayListExtra(EXTRA_TIMER_LIST, timerBundles)
            }
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && timerBundles.isNotEmpty()) {
                    context.startForegroundService(intent)
                } else {
                    context.startService(intent)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        fun stopService(context: Context) {
            try {
                val nm = context.getSystemService(NotificationManager::class.java)
                nm?.cancelAll()
                val intent = Intent(context, TimerForegroundService::class.java)
                context.stopService(intent)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
