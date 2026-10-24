package com.babunigaming.buttongame

/** High-score persistence — developer: Babuni.dev */

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.io.File

data class ScoreEntry(val name: String, val score: Int)

class ScoreStore(context: Context) {
    private val file = File(context.filesDir, "scores.json")
    private val lock = Any()

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
                            score = o.optInt("score", 0).coerceAtLeast(0)
                        )
                    )
                }
            }.sortedByDescending { it.score }.take(MAX_SCORES)
        } catch (_: Exception) {
            emptyList()
        }
    }

    fun add(name: String, score: Int): List<ScoreEntry> = synchronized(lock) {
        val cleaned = name.trim().take(MAX_NAME).ifEmpty { "Player" }
        val next = (list() + ScoreEntry(cleaned, score.coerceAtLeast(0)))
            .sortedByDescending { it.score }
            .take(MAX_SCORES)
        val arr = JSONArray()
        next.forEach { e ->
            arr.put(JSONObject().put("name", e.name).put("score", e.score))
        }
        file.writeText(arr.toString())
        next
    }

    fun toJsonObject(scores: List<ScoreEntry> = list()): JSONObject {
        val arr = JSONArray()
        scores.forEach { e ->
            arr.put(JSONObject().put("name", e.name).put("score", e.score))
        }
        return JSONObject().put("scores", arr)
    }

    companion object {
        const val MAX_NAME = 16
        const val MAX_SCORES = 50
    }
}
