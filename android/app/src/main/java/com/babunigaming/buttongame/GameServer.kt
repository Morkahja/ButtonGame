package com.babunigaming.buttongame

/** Local Wi‑Fi game server — developer: Babuni.dev */

import android.content.Context
import android.content.res.AssetManager
import fi.iki.elonen.NanoHTTPD
import org.json.JSONObject
import java.io.InputStream
import java.util.Locale

class GameServer(
    private val context: Context,
    private val scores: ScoreStore,
    port: Int = PORT
) : NanoHTTPD(port) {

    override fun serve(session: IHTTPSession): Response {
        val uri = session.uri.substringBefore('?').removeTrailingSlash()
        return when {
            uri == "/api/scores" && session.method == Method.GET -> {
                json(scores.toJsonObject().toString())
            }
            uri == "/api/scores" && session.method == Method.POST -> {
                handlePostScore(session)
            }
            uri == "/api/presence" && session.method == Method.GET -> {
                json(PresenceStore.toJson().toString())
            }
            uri == "/api/presence" && session.method == Method.POST -> {
                handlePresence(session)
            }
            session.method == Method.OPTIONS -> {
                newFixedLengthResponse(Response.Status.OK, MIME_PLAINTEXT, "").also { addCors(it) }
            }
            else -> serveAsset(uri)
        }
    }

    private fun handlePresence(session: IHTTPSession): Response {
        return try {
            val body = HashMap<String, String>()
            session.parseBody(body)
            val raw = body["postData"] ?: ""
            val obj = JSONObject(raw.ifBlank { "{}" })
            val id = obj.optString("id", "").ifBlank { return jsonError(400, "missing id") }
            PresenceStore.upsert(
                id = id,
                name = obj.optString("name", ""),
                score = obj.optInt("score", 0),
                timeLeft = obj.optInt("timeLeft", 0),
                reactionMs = obj.optInt("reactionMs", 0),
                apm = obj.optInt("apm", 0),
                playing = obj.optBoolean("playing", false)
            )
            json(PresenceStore.toJson().toString())
        } catch (e: Exception) {
            jsonError(400, e.message ?: "bad request")
        }
    }

    private fun handlePostScore(session: IHTTPSession): Response {
        return try {
            val body = HashMap<String, String>()
            session.parseBody(body)
            val raw = body["postData"] ?: ""
            val obj = JSONObject(raw.ifBlank { "{}" })
            val name = obj.optString("name", "Player")
            val score = obj.optInt("score", 0)
            val reactionMs = obj.optInt("reactionMs", 0)
            val apm = obj.optInt("apm", 0)
            val durationMs = obj.optLong("durationMs", 0L)
            val trapsEnabled = obj.optBoolean("trapsEnabled", false)
            val list = scores.add(name, score, reactionMs, apm, durationMs, trapsEnabled)
            json(scores.toJsonObject(list).toString())
        } catch (e: Exception) {
            jsonError(400, e.message ?: "bad request")
        }
    }

    private fun serveAsset(uri: String): Response {
        val path = when {
            uri.isEmpty() || uri == "/" -> "www/index.html"
            uri.startsWith("/") -> "www$uri"
            else -> "www/$uri"
        }
        val assets: AssetManager = context.assets
        return try {
            val stream: InputStream = assets.open(path)
            val mime = mimeFor(path)
            newChunkedResponse(Response.Status.OK, mime, stream).also { addCors(it) }
        } catch (_: Exception) {
            // SPA-ish fallback for missing paths
            try {
                val stream = assets.open("www/index.html")
                newChunkedResponse(Response.Status.OK, "text/html", stream).also { addCors(it) }
            } catch (e: Exception) {
                jsonError(404, "not found")
            }
        }
    }

    private fun json(payload: String): Response =
        newFixedLengthResponse(Response.Status.OK, "application/json", payload).also { addCors(it) }

    private fun jsonError(code: Int, message: String): Response {
        val status = Response.Status.lookup(code) ?: Response.Status.INTERNAL_ERROR
        val body = JSONObject().put("error", message).toString()
        return newFixedLengthResponse(status, "application/json", body).also { addCors(it) }
    }

    private fun addCors(response: Response) {
        response.addHeader("Access-Control-Allow-Origin", "*")
        response.addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        response.addHeader("Access-Control-Allow-Headers", "Content-Type")
        response.addHeader("Cache-Control", "no-store")
    }

    private fun mimeFor(path: String): String {
        val lower = path.lowercase(Locale.US)
        return when {
            lower.endsWith(".html") -> "text/html"
            lower.endsWith(".js") -> "application/javascript"
            lower.endsWith(".css") -> "text/css"
            lower.endsWith(".png") -> "image/png"
            lower.endsWith(".svg") -> "image/svg+xml"
            lower.endsWith(".ttf") -> "font/ttf"
            lower.endsWith(".ogg") -> "audio/ogg"
            lower.endsWith(".json") -> "application/json"
            lower.endsWith(".ico") -> "image/x-icon"
            else -> "application/octet-stream"
        }
    }

    private fun String.removeTrailingSlash(): String {
        if (this.length > 1 && endsWith("/")) return dropLast(1)
        return this
    }

    companion object {
        const val PORT = 8766
    }
}
