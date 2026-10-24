package com.babunigaming.buttongame

/** Live player presence — developer: Babuni.dev */

import org.json.JSONArray
import org.json.JSONObject

data class LivePlayer(
    val id: String,
    val name: String,
    val seat: Int,
    val score: Int,
    val timeLeft: Int,
    val reactionMs: Int,
    val apm: Int,
    val playing: Boolean,
    val lastSeen: Long
) {
    fun label(): String {
        val cleaned = name.trim()
        return if (cleaned.isNotEmpty()) cleaned else "Player $seat"
    }
}

object PresenceStore {
    private const val TTL_MS = 5000L
    private val lock = Any()
    private val players = LinkedHashMap<String, LivePlayer>()
    private var nextSeat = 1

    fun upsert(
        id: String,
        name: String,
        score: Int,
        timeLeft: Int,
        reactionMs: Int,
        apm: Int,
        playing: Boolean
    ): List<LivePlayer> = synchronized(lock) {
        val now = System.currentTimeMillis()
        pruneLocked(now)
        val existing = players[id]
        val seat = existing?.seat ?: nextSeat++
        players[id] = LivePlayer(
            id = id,
            name = name.trim().take(ScoreStore.MAX_NAME),
            seat = seat,
            score = score.coerceAtLeast(0),
            timeLeft = timeLeft.coerceAtLeast(0),
            reactionMs = reactionMs.coerceAtLeast(0),
            apm = apm.coerceAtLeast(0),
            playing = playing,
            lastSeen = now
        )
        snapshotLocked()
    }

    fun list(): List<LivePlayer> = synchronized(lock) {
        pruneLocked(System.currentTimeMillis())
        snapshotLocked()
    }

    fun toJson(): JSONObject {
        val arr = JSONArray()
        list().forEach { p ->
            arr.put(
                JSONObject()
                    .put("id", p.id)
                    .put("name", p.name)
                    .put("seat", p.seat)
                    .put("label", p.label())
                    .put("score", p.score)
                    .put("timeLeft", p.timeLeft)
                    .put("reactionMs", p.reactionMs)
                    .put("apm", p.apm)
                    .put("playing", p.playing)
            )
        }
        return JSONObject().put("players", arr)
    }

    private fun pruneLocked(now: Long) {
        val stale = players.filterValues { now - it.lastSeen > TTL_MS }.keys
        stale.forEach { players.remove(it) }
    }

    private fun snapshotLocked(): List<LivePlayer> =
        players.values.sortedWith(compareBy<LivePlayer> { it.seat }.thenByDescending { it.score })
}
