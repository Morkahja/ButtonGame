package com.babunigaming.buttongame

/** Buttongame host UI — developer: Babuni.dev */

import android.Manifest
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Color
import android.net.wifi.WifiManager
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.babunigaming.buttongame.databinding.ActivityMainBinding
import com.google.zxing.BarcodeFormat
import com.google.zxing.EncodeHintType
import com.google.zxing.qrcode.QRCodeWriter
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.Inet4Address
import java.net.NetworkInterface
import java.net.URL
import java.util.Collections
import java.util.EnumMap
import java.util.concurrent.Executors
import kotlin.math.abs

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private var hosting = false

    private val uiHandler = Handler(Looper.getMainLooper())
    private val netExecutor = Executors.newSingleThreadExecutor()
    private val displayedScores = HashMap<String, Float>()
    private val chipViews = HashMap<String, View>()

    private val presenceTick = object : Runnable {
        override fun run() {
            if (hosting) fetchPresence()
            tickScoreAnimations()
            uiHandler.postDelayed(this, 200L)
        }
    }

    private val stateReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            val running = intent?.getBooleanExtra(HostService.EXTRA_RUNNING, false) == true
            hosting = running
            refreshHostUi()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupWebView()
        binding.serveButton.setOnClickListener { toggleHosting() }
        binding.playButton.setOnClickListener { openPlay() }
        binding.backButton.setOnClickListener { showHost() }

        maybeRequestNotifPermission()
        refreshHostUi()
        renderPlayers(emptyList())
    }

    override fun onStart() {
        super.onStart()
        val filter = IntentFilter(HostService.ACTION_STATE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(stateReceiver, filter, RECEIVER_NOT_EXPORTED)
        } else {
            @Suppress("UnspecifiedRegisterReceiverFlag")
            registerReceiver(stateReceiver, filter)
        }
        uiHandler.post(presenceTick)
    }

    override fun onStop() {
        uiHandler.removeCallbacks(presenceTick)
        try {
            unregisterReceiver(stateReceiver)
        } catch (_: Exception) {
        }
        super.onStop()
    }

    override fun onDestroy() {
        netExecutor.shutdownNow()
        super.onDestroy()
    }

    private fun maybeRequestNotifPermission() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
            == PackageManager.PERMISSION_GRANTED
        ) return
        ActivityCompat.requestPermissions(
            this,
            arrayOf(Manifest.permission.POST_NOTIFICATIONS),
            1001
        )
    }

    private fun toggleHosting() {
        if (hosting) {
            HostService.stop(this)
            hosting = false
            window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            refreshHostUi()
            renderPlayers(emptyList())
        } else {
            HostService.start(this)
            hosting = true
            window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            refreshHostUi()
            Toast.makeText(this, R.string.notif_hosting, Toast.LENGTH_SHORT).show()
        }
    }

    private fun refreshHostUi() {
        binding.serveButton.setText(if (hosting) R.string.stop_serve else R.string.serve_wifi)
        val ip = lanIpv4()
        if (hosting && ip != null) {
            val url = "http://$ip:${GameServer.PORT}/"
            binding.urlText.text = url
            binding.statusText.text = getString(R.string.notif_hosting)
            binding.qrImage.setImageBitmap(makeQr(url, 720))
        } else if (hosting) {
            binding.urlText.text = "http://127.0.0.1:${GameServer.PORT}/"
            binding.statusText.text = "Hosting, but no Wi‑Fi IPv4 found. Use hotspot?"
            binding.qrImage.setImageBitmap(makeQr("http://127.0.0.1:${GameServer.PORT}/", 720))
        } else {
            binding.urlText.text = ""
            binding.statusText.text = getString(R.string.waiting)
            binding.qrImage.setImageDrawable(null)
        }
    }

    private fun openPlay() {
        if (!hosting) {
            HostService.start(this)
            hosting = true
            window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            refreshHostUi()
        }
        binding.hostPanel.visibility = View.GONE
        binding.playPanel.visibility = View.VISIBLE
        binding.gameWebView.loadUrl("http://127.0.0.1:${GameServer.PORT}/")
    }

    private fun showHost() {
        binding.playPanel.visibility = View.GONE
        binding.hostPanel.visibility = View.VISIBLE
    }

    private fun setupWebView() {
        val web = binding.gameWebView
        web.webViewClient = WebViewClient()
        web.settings.javaScriptEnabled = true
        web.settings.domStorageEnabled = true
        web.settings.cacheMode = WebSettings.LOAD_NO_CACHE
        web.settings.mediaPlaybackRequiresUserGesture = false
        WebView.setWebContentsDebuggingEnabled(true)
    }

    private fun fetchPresence() {
        netExecutor.execute {
            try {
                val conn = (URL("http://127.0.0.1:${GameServer.PORT}/api/presence").openConnection() as HttpURLConnection)
                conn.connectTimeout = 800
                conn.readTimeout = 800
                conn.requestMethod = "GET"
                val text = conn.inputStream.bufferedReader().use { it.readText() }
                conn.disconnect()
                val arr = JSONObject(text).optJSONArray("players") ?: return@execute
                val list = ArrayList<LivePlayerUi>()
                for (i in 0 until arr.length()) {
                    val o = arr.getJSONObject(i)
                    list.add(
                        LivePlayerUi(
                            id = o.optString("id"),
                            label = o.optString("label", o.optString("name", "Player")),
                            score = o.optInt("score", 0),
                            timeLeft = o.optInt("timeLeft", 0),
                            reactionMs = o.optInt("reactionMs", 0),
                            apm = o.optInt("apm", 0),
                            playing = o.optBoolean("playing", false)
                        )
                    )
                }
                uiHandler.post { renderPlayers(list) }
            } catch (_: Exception) {
                // Server may still be starting.
            }
        }
    }

    private data class LivePlayerUi(
        val id: String,
        val label: String,
        val score: Int,
        val timeLeft: Int,
        val reactionMs: Int,
        val apm: Int,
        val playing: Boolean
    )

    private fun renderPlayers(players: List<LivePlayerUi>) {
        renderPlayersInto(binding.hostPlayersRow, players)
        renderPlayersInto(binding.playPlayersRow, players)
    }

    private fun renderPlayersInto(row: LinearLayout, players: List<LivePlayerUi>) {
        val keep = players.map { it.id }.toSet()
        val prefix = row.id.toString() + ":"
        val toRemove = chipViews.keys.filter { it.startsWith(prefix) && it.removePrefix(prefix) !in keep }
        toRemove.forEach { key ->
            chipViews.remove(key)?.let { row.removeView(it) }
            displayedScores.remove(key)
        }

        if (players.isEmpty()) {
            if (row.childCount == 0) {
                val empty = TextView(this)
                empty.text = getString(R.string.no_players_yet)
                empty.setTextColor(ContextCompat.getColor(this, R.color.text_muted))
                empty.textSize = 12f
                empty.setPadding(8, 8, 8, 8)
                empty.tag = "empty"
                row.addView(empty)
            }
            return
        }

        val empty = row.findViewWithTag<View>("empty")
        if (empty != null) row.removeView(empty)

        val inflater = LayoutInflater.from(this)
        players.forEach { p ->
            val key = prefix + p.id
            var chip = chipViews[key]
            if (chip == null) {
                chip = inflater.inflate(R.layout.item_live_player, row, false)
                row.addView(chip)
                chipViews[key] = chip
                displayedScores[key] = p.score.toFloat()
            }
            chip!!.findViewById<TextView>(R.id.playerName).text = p.label
            val scoreView = chip.findViewById<TextView>(R.id.playerScore)
            scoreView.tag = p.score
            val shown = displayedScores[key] ?: p.score.toFloat()
            scoreView.text = shown.toInt().toString()
            val timeView = chip.findViewById<TextView>(R.id.playerTime)
            timeView.text = if (p.playing) {
                getString(R.string.player_time_fmt, p.timeLeft)
            } else {
                getString(R.string.player_waiting)
            }
            chip.findViewById<TextView>(R.id.playerReact).text = if (p.reactionMs > 0) {
                getString(R.string.player_react_fmt, p.reactionMs)
            } else {
                getString(R.string.player_react_none)
            }
            chip.findViewById<TextView>(R.id.playerApm).text = if (p.playing && p.apm > 0) {
                getString(R.string.player_apm_fmt, p.apm)
            } else {
                getString(R.string.player_apm_none)
            }
        }
    }

    private fun tickScoreAnimations() {
        chipViews.forEach { (key, chip) ->
            val scoreView = chip.findViewById<TextView>(R.id.playerScore) ?: return@forEach
            val target = (scoreView.tag as? Int) ?: return@forEach
            val current = displayedScores[key] ?: target.toFloat()
            if (abs(current - target) < 0.5f) {
                displayedScores[key] = target.toFloat()
                scoreView.text = target.toString()
                return@forEach
            }
            val next = current + (target - current) * 0.28f
            displayedScores[key] = next
            scoreView.text = next.toInt().toString()
        }
    }

    private fun lanIpv4(): String? {
        try {
            val interfaces = Collections.list(NetworkInterface.getNetworkInterfaces())
            for (intf in interfaces) {
                if (!intf.isUp || intf.isLoopback) continue
                val name = intf.name.lowercase()
                if (name.contains("rmnet") || name.contains("dummy")) continue
                for (addr in Collections.list(intf.inetAddresses)) {
                    if (addr.isLoopbackAddress || addr !is Inet4Address) continue
                    val host = addr.hostAddress ?: continue
                    if (host.startsWith("169.254.")) continue
                    if (name.startsWith("wlan") || name.startsWith("ap") || name.startsWith("swlan")) {
                        return host
                    }
                }
            }
            for (intf in interfaces) {
                if (!intf.isUp || intf.isLoopback) continue
                for (addr in Collections.list(intf.inetAddresses)) {
                    if (addr.isLoopbackAddress || addr !is Inet4Address) continue
                    val host = addr.hostAddress ?: continue
                    if (!host.startsWith("169.254.")) return host
                }
            }
        } catch (_: Exception) {
        }

        return try {
            val wm = applicationContext.getSystemService(WIFI_SERVICE) as WifiManager
            @Suppress("DEPRECATION")
            val ip = wm.connectionInfo.ipAddress
            if (ip == 0) null
            else String.format(
                "%d.%d.%d.%d",
                ip and 0xff,
                ip shr 8 and 0xff,
                ip shr 16 and 0xff,
                ip shr 24 and 0xff
            )
        } catch (_: Exception) {
            null
        }
    }

    private fun makeQr(text: String, size: Int): Bitmap {
        val hints = EnumMap<EncodeHintType, Any>(EncodeHintType::class.java)
        hints[EncodeHintType.MARGIN] = 1
        val matrix = QRCodeWriter().encode(text, BarcodeFormat.QR_CODE, size, size, hints)
        val bmp = Bitmap.createBitmap(size, size, Bitmap.Config.RGB_565)
        for (x in 0 until size) {
            for (y in 0 until size) {
                bmp.setPixel(x, y, if (matrix[x, y]) Color.BLACK else Color.WHITE)
            }
        }
        return bmp
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (binding.playPanel.visibility == View.VISIBLE) {
            showHost()
        } else {
            @Suppress("DEPRECATION")
            super.onBackPressed()
        }
    }
}
