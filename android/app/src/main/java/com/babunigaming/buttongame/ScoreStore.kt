package com.babunigaming.buttongame

/** High-score persistence — developer: Babuni.dev */

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.io.File

// New v2 scores deliberately do not carry over beta high-score records.
data class ScoreEntry(
    val name: String,
    val score: Int,
    val reactionMs: Int,
    val apm: Int,
    val durationMs: Long,
    val trapsEnabled: Boolean
)

class ScoreStore(context: Context) {
    private val file = File(context.filesDir, "scores-v2.json")
    private val lock = Any()

    init {
        // The leaderboard format has changed and beta users requested a clean slate.
        File(context.filesDir, "scores.json").delete()
    }

    fun list(): List<ScoreEntry> = synchronized(lock) {
        if (!file.exists()) return emptyList()
        return try {
            val arr = JSONArray(file.readText())
            buildList {
                for (i in 0 until arr.length()) {
                    val o = arr.getJSONObject(i)
                    add(
                        ScoreEntry(
                            name = o.optString("name", "Player").trim().take(MAX_NAME).ifEmpty { "Player" },
                            score = o.optInt("score", 0).coerceAtLeast(0),
                            reactionMs = o.optInt("reactionMs", 0).coerceAtLeast(0),
                            apm = o.optInt("apm", 0).coerceAtLeast(0),
                            durationMs = o.optLong("durationMs", 0L).coerceAtLeast(0L),
                            trapsEnabled = o.optBoolean("trapsEnabled", false)
                        )
                    )
                }
            }.sortedByDescending { it.score }.take(MAX_SCORES)
        } catch (_: Exception) {
            emptyList()
        }
    }

    fun add(name: String, score: Int, reactionMs: Int, apm: Int, durationMs: Long, trapsEnabled: Boolean): List<ScoreEntry> = synchronized(lock) {
        val cleaned = name.trim().take(MAX_NAME).ifEmpty { "Player" }
        val entry = ScoreEntry(cleaned, score.coerceAtLeast(0),
            reactionMs.coerceAtLeast(0), apm.coerceAtLeast(0), durationMs.coerceAtLeast(0L), trapsEnabled)
        val next = (list() + entry).sortedByDescending { it.score }.take(MAX_SCORES)
        val arr = JSONArray()
        next.forEach { e -> arr.put(asJson(e)) }
        file.writeText(arr.toString())
        next
    }

    fun toJsonObject(scores: List<ScoreEntry> = list()): JSONObject {
        val arr = JSONArray()
        scores.forEach { e -> arr.put(asJson(e)) }
        return JSONObject().put("scores", arr)
    }

    private fun asJson(entry: ScoreEntry): JSONObject = JSONObject()
        .put("name", entry.name)
        .put("score", entry.score)
        .put("reactionMs", entry.reactionMs)
        .put("apm", entry.apm)
        .put("durationMs", entry.durationMs)
        .put("trapsEnabled", entry.trapsEnabled)

    companion object {
        const val MAX_NAME = 16
        const val MAX_SCORES = 50
    }
}
