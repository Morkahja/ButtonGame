package com.babunigaming.buttongame

/** Foreground host service — developer: Babuni.dev */

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat

class HostService : Service() {
    private var server: GameServer? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_STOP -> {
                stopServer()
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
                return START_NOT_STICKY
            }
            else -> {
                startForeground(NOTIF_ID, buildNotification())
                startServer()
            }
        }
        return START_STICKY
    }

    override fun onDestroy() {
        stopServer()
        super.onDestroy()
    }

    private fun startServer() {
        if (server != null) return
        val store = ScoreStore(applicationContext)
        server = GameServer(applicationContext, store, GameServer.PORT).also {
            it.start(NanoTimeout, false)
        }
        sendBroadcast(Intent(ACTION_STATE).putExtra(EXTRA_RUNNING, true))
    }

    private fun stopServer() {
        try {
            server?.stop()
        } catch (_: Exception) {
        }
        server = null
        sendBroadcast(Intent(ACTION_STATE).putExtra(EXTRA_RUNNING, false))
    }

    private fun buildNotification(): Notification {
        ensureChannel()
        val open = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(getString(R.string.app_name))
            .setContentText(getString(R.string.notif_hosting))
            .setSmallIcon(R.drawable.ic_launcher)
            .setContentIntent(open)
            .setOngoing(true)
            .build()
    }

    private fun ensureChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val mgr = getSystemService(NotificationManager::class.java)
        val channel = NotificationChannel(
            CHANNEL_ID,
            getString(R.string.channel_host),
            NotificationManager.IMPORTANCE_LOW
        )
        mgr.createNotificationChannel(channel)
    }

    companion object {
        const val ACTION_STOP = "com.babunigaming.buttongame.STOP_HOST"
        const val ACTION_STATE = "com.babunigaming.buttongame.HOST_STATE"
        const val EXTRA_RUNNING = "running"
        private const val CHANNEL_ID = "buttongame_host"
        private const val NOTIF_ID = 42
        private const val NanoTimeout = 10_000

        fun start(context: Context) {
            val intent = Intent(context, HostService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun stop(context: Context) {
            val intent = Intent(context, HostService::class.java).setAction(ACTION_STOP)
            context.startService(intent)
        }
    }
}
