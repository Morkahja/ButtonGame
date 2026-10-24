/**
 * Buttongame — HTML5 remake.
 * Developer: Babuni.dev
 *
 * - Timer starts on first target click.
 * - First click: +1 point + time bonus ≈ fade duration.
 * - Extra clicks while fading: points only.
 * - Floating combat-text points that tumble, merge, and fade.
 */
(function () {
  "use strict";

  const FPS = 15;
  const FRAME_MS = 1000 / FPS;
  const BASE_DURATION_MS = 60000;
  const FADE_START_ALPHA = 100;
  const FADE_END_ALPHA = 5;
  const QUICK_HIT_MS = 320;
  const POP_DURATION_MS = 580;
  const CRACK_PHASE_MS = 140;
  const BREAK_PHASE_MS = 230;
  const SCATTER_FADE_MS = 460;
  const TAP_FLASH_MS = 125;
  const TAP_PULSE_MS = 145;
  const TAP_PULSE_SCALE = 1.10;
  const QUICK_SPIN_MS = 290;
  const STAGE = 450;
  const TARGET_HALF = 40;
  const MERGE_DIST = 34;
  const FLOAT_LIFE = 3400;
  const FLOAT_GRAVITY = 480;
  const FLOAT_EDGE = 18;
  const FLOAT_REST = 0.42;
  // Exact totals that hang around longer for more combos.
  const LINGER_AT = { 7: true, 14: true };
  // Exact jackpots: burst into ones + double that total added to the score.
  const JACKPOT_AT = { 21: true, 42: true, 37: true, 73: true };
  // Exact totals that grant +3s (golden fly into Time).
  const TIME_BONUS_AT = { 7: true, 14: true, 21: true, 42: true, 37: true, 73: true };
  const TIME_BONUS_MS = 3000;
  const SEEK_ONE_TO_TWENTY = 118;
  const SEEK_ACCEL = 980;

  // Spawn-safe + collision AABBs for Points / Time / Reaction / APM panels (stage space).
  const HUD_BOXES = [
    { l: 8, t: 8, r: 148, b: 78 },
    { l: 302, t: 8, r: 442, b: 78 },
    { l: 8, t: 372, r: 148, b: 442 },
    { l: 302, t: 372, r: 442, b: 442 },
  ];
  // Time panel center in stage space (top-right HUD).
  const TIME_PANEL_CX = (HUD_BOXES[1].l + HUD_BOXES[1].r) / 2;
  const TIME_PANEL_CY = (HUD_BOXES[1].t + HUD_BOXES[1].b) / 2;

  // Each floater picks one side as "down" so combos tumble every which way.
  const GRAVITY_DIRS = [
    { gx: 0, gy: 1 },
    { gx: 0, gy: -1 },
    { gx: 1, gy: 0 },
    { gx: -1, gy: 0 },
  ];

  const feind = document.getElementById("feind");
  const punkteEl = document.getElementById("punkte");
  const timeEl = document.getElementById("time");
  const apmEl = document.getElementById("apm");
  const reactEl = document.getElementById("react");
  const anleitungEl = document.getElementById("anleitung");
  const endEl = document.getElementById("end");
  const playAgainBtn = document.getElementById("play-again");
  const floatLayer = document.getElementById("float-layer");
  const endWrap = document.getElementById("end-wrap");
  const scoreForm = document.getElementById("score-form");
  const playerNameInput = document.getElementById("player-name");
  const submitScoreBtn = document.getElementById("submit-score");
  const scoreStatus = document.getElementById("score-status");
  const leaderboardBody = document.getElementById("leaderboard-body");
  const livePlayersEl = document.getElementById("live-players");

  const LOCAL_SCORES_KEY = "buttongame_scores_v1";
  const LOCAL_NAME_KEY = "buttongame_name_v1";
  const LOCAL_SESSION_KEY = "buttongame_session_v1";
  const LOCAL_MUTE_KEY = "buttongame_muted_v1";
  const MAX_NAME = 16;
  const MAX_SCORES = 50;
  const COMBO_BELL_AT = 7;
  const MASTER_VOL = 0.72;

  const soundToggleBtn = document.getElementById("sound-toggle");
  let soundMuted = false;
  try {
    soundMuted = localStorage.getItem(LOCAL_MUTE_KEY) === "1";
  } catch (e) {
    soundMuted = false;
  }

  const IMPACT_FILES = [
    "assets/sfx/impact1.ogg",
    "assets/sfx/impact2.ogg",
    "assets/sfx/impact3.ogg",
    "assets/sfx/impact4.ogg",
  ];
  const BELL_FILES = [
    "assets/sfx/Bell1.ogg",
    "assets/sfx/Bell2.ogg",
    "assets/sfx/Bell3.ogg",
  ];

  let audioCtx = null;
  let masterGain = null;
  const buffers = Object.create(null);

  function applyMasterMute() {
    if (masterGain) {
      masterGain.gain.value = soundMuted ? 0 : MASTER_VOL;
    }
    if (soundToggleBtn) {
      soundToggleBtn.classList.toggle("is-muted", soundMuted);
      soundToggleBtn.setAttribute("aria-pressed", soundMuted ? "true" : "false");
      soundToggleBtn.setAttribute(
        "aria-label",
        soundMuted ? "Unmute sound" : "Mute sound"
      );
      soundToggleBtn.title = soundMuted ? "Sound off" : "Sound on";
    }
  }

  function setSoundMuted(muted) {
    soundMuted = !!muted;
    try {
      localStorage.setItem(LOCAL_MUTE_KEY, soundMuted ? "1" : "0");
    } catch (e) {
      /* ignore quota / private mode */
    }
    applyMasterMute();
  }

  function ensureAudio() {
    if (audioCtx) {
      if (audioCtx.state === "suspended") audioCtx.resume();
      return audioCtx;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = soundMuted ? 0 : MASTER_VOL;
    masterGain.connect(audioCtx.destination);
    return audioCtx;
  }

  function loadBuffer(url) {
    return fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error("sfx " + url);
        return r.arrayBuffer();
      })
      .then(function (ab) {
        return new Promise(function (resolve, reject) {
          ensureAudio();
          if (!audioCtx) {
            reject(new Error("no audio"));
            return;
          }
          audioCtx.decodeAudioData(
            ab.slice(0),
            function (buf) {
              buffers[url] = buf;
              resolve(buf);
            },
            reject
          );
        });
      })
      .catch(function () {
        /* missing / decode fail — skip quietly */
      });
  }

  function preloadSfx() {
    Promise.all(IMPACT_FILES.concat(BELL_FILES).map(loadBuffer));
  }

  function playBuffer(url, opts) {
    if (soundMuted) return;
    opts = opts || {};
    const ctx = ensureAudio();
    const buf = buffers[url];
    if (!ctx || !buf || !masterGain) return;

    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = opts.rate != null ? opts.rate : 1;

    const g = ctx.createGain();
    const vol = opts.gain != null ? opts.gain : 0.8;
    // Tiny attack so spam-clicks don't click/pop as hard.
    const t0 = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, vol), t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + Math.max(0.05, buf.duration * 0.92));

    src.connect(g);
    g.connect(masterGain);
    src.start(t0);
    src.stop(t0 + buf.duration + 0.05);
  }

  function playRandomImpact() {
    const url = IMPACT_FILES[(Math.random() * IMPACT_FILES.length) | 0];
    playBuffer(url, {
      gain: 0.55 + Math.random() * 0.2,
      rate: 0.94 + Math.random() * 0.12,
    });
  }

  function playRandomBell() {
    const url = BELL_FILES[(Math.random() * BELL_FILES.length) | 0];
    playBuffer(url, {
      gain: 0.78 + Math.random() * 0.12,
      rate: 0.98 + Math.random() * 0.04,
    });
  }

  function maybeComboBell(f) {
    if (!f || f.bellPlayed) return;
    if (f.value < COMBO_BELL_AT) return;
    f.bellPlayed = true;
    playRandomBell();
  }

  applyMasterMute();
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      ensureAudio();
      setSoundMuted(!soundMuted);
    });
  }
  preloadSfx();

  function getSessionId() {
    try {
      let id = localStorage.getItem(LOCAL_SESSION_KEY);
      if (!id) {
        id =
          "p_" +
          Math.random().toString(36).slice(2, 10) +
          Date.now().toString(36);
        localStorage.setItem(LOCAL_SESSION_KEY, id);
      }
      return id;
    } catch (e) {
      return "p_" + String(Date.now());
    }
  }

  function getLiveName() {
    const fromInput = (playerNameInput && playerNameInput.value) || "";
    if (fromInput.trim()) return fromInput.trim().slice(0, MAX_NAME);
    try {
      return (localStorage.getItem(LOCAL_NAME_KEY) || "").trim().slice(0, MAX_NAME);
    } catch (e) {
      return "";
    }
  }

  function rememberName(name) {
    const cleaned = String(name || "").trim().slice(0, MAX_NAME);
    if (!cleaned) return;
    try {
      localStorage.setItem(LOCAL_NAME_KEY, cleaned);
    } catch (e) {}
    if (playerNameInput) playerNameInput.value = cleaned;
  }

  const sessionId = getSessionId();

  function currentApmValue() {
    if (!started || !startTime) return 0;
    const minutes = Math.max((performance.now() - startTime) / 60000, 1 / 60);
    return Math.round(hitCount / minutes);
  }

  function currentReactionValue() {
    if (!reactHasValue) return 0;
    return Math.max(0, Math.round(reactDisplay || reactTarget || 0));
  }

  function renderLivePlayers(players) {
    if (!livePlayersEl) return;
    const list = Array.isArray(players) ? players : [];
    livePlayersEl.textContent = "";
    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      if (!p) continue;
      const chip = document.createElement("div");
      chip.className = "live-chip" + (p.id === sessionId ? " is-self" : "");

      const name = document.createElement("div");
      name.className = "live-name";
      name.textContent = p.label || p.name || "Player";
      chip.appendChild(name);

      const scoreLine = document.createElement("div");
      scoreLine.className = "live-score";
      scoreLine.textContent = String(Math.max(0, p.score | 0));
      chip.appendChild(scoreLine);

      const timeLine = document.createElement("div");
      timeLine.className = "live-meta";
      timeLine.textContent = p.playing
        ? "Time " + Math.max(0, p.timeLeft | 0) + "s"
        : "ready";
      chip.appendChild(timeLine);

      const reactLine = document.createElement("div");
      reactLine.className = "live-meta";
      reactLine.textContent =
        p.reactionMs > 0 ? "React " + (p.reactionMs | 0) + " ms" : "React —";
      chip.appendChild(reactLine);

      const apmLine = document.createElement("div");
      apmLine.className = "live-meta";
      apmLine.textContent =
        p.playing && p.apm > 0 ? "APM " + (p.apm | 0) : "APM —";
      chip.appendChild(apmLine);

      livePlayersEl.appendChild(chip);
    }
  }

  function pushPresence() {
    const payload = {
      id: sessionId,
      name: getLiveName(),
      score: score,
      timeLeft: Math.max(0, remainingSeconds()),
      reactionMs: currentReactionValue(),
      apm: currentApmValue(),
      playing: started && !gameOver,
    };
    fetch("/api/presence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    })
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (data) {
        if (data && data.players) renderLivePlayers(data.players);
      })
      .catch(function () {});
  }

  function randomint(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function fadeDurationMs(fluppRate) {
    const frames = Math.ceil((FADE_START_ALPHA - FADE_END_ALPHA) / fluppRate);
    return frames * FRAME_MS;
  }

  function overlapsHud(cx, cy) {
    const left = cx - TARGET_HALF;
    const right = cx + TARGET_HALF;
    const top = cy - TARGET_HALF;
    const bottom = cy + TARGET_HALF;
    for (let i = 0; i < HUD_BOXES.length; i++) {
      const b = HUD_BOXES[i];
      if (left < b.r && right > b.l && top < b.b && bottom > b.t) return true;
    }
    return false;
  }

  function randomSpawn() {
    for (let i = 0; i < 50; i++) {
      const nx = randomint(55, 395);
      const ny = randomint(90, 360);
      if (!overlapsHud(nx, ny)) return { x: nx, y: ny };
    }
    return { x: STAGE / 2, y: STAGE / 2 };
  }

  let score = 0;
  let started = false;
  let deadline = 0;
  let startTime = 0;
  let gameOver = false;
  let x = STAGE / 2;
  let y = STAGE / 2;
  let rotation = 0;
  let alpha = FADE_START_ALPHA;
  let flupp = 0;
  let fading = false;
  let frameAcc = 0;
  let lastTs = performance.now();

  let hitCount = 0;
  let spawnTime = null;
  let reactionSumMs = 0;
  let reactionSamples = 0;
  let reactDisplay = 0;
  let reactTarget = 0;
  let reactHasValue = false;

  let punchScale = 1;
  let spawnScale = 1;
  let spawnAnimUntil = 0;
  let shakeX = 0;
  let shakeY = 0;
  let shakeUntil = 0;
  let popping = false;
  let popStartedAt = 0;
  let popUntil = 0;
  let tapFlashStartedAt = -Infinity;
  let quickSpinStartedAt = -Infinity;

  /** @type {Array<{
   *  el: HTMLElement, value: number, x: number, y: number,
   *  vx: number, vy: number, rot: number, spin: number,
   *  scale: number, age: number, life: number, alive: boolean
   * }>} */
  const floaters = [];
  const timeFlies = [];
  let timeFlashUntil = 0;
  const popShards = [];
  const SHATTER_CELLS = [[[0,0],[20.53,0],[21.33,14.5],[15.14,19.14],[0,15.78]],[[20.53,0],[41,0],[38.5,15.83],[34.32,19.08],[21.33,14.5]],[[41,0],[62,0],[62,17.4],[53.45,20.82],[38.5,15.83]],[[0,40.03],[0,15.78],[15.14,19.14],[16.83,32.67]],[[16.83,32.67],[15.14,19.14],[21.33,14.5],[34.32,19.08],[33.75,30.47],[21.57,35.04]],[[33.75,30.47],[34.32,19.08],[38.5,15.83],[53.45,20.82],[47.75,35.65],[40.79,37.04]],[[62,17.4],[62,42.67],[59.76,42.85],[47.75,35.65],[53.45,20.82]],[[0,44.86],[0,40.03],[16.83,32.67],[21.57,35.04],[23.3,48.03],[18,52.57]],[[23.3,48.03],[21.57,35.04],[33.75,30.47],[40.79,37.04],[37.76,47.98],[35,50.22]],[[50.73,53.88],[37.76,47.98],[40.79,37.04],[47.75,35.65],[59.76,42.85]],[[18,62],[0,62],[0,44.86],[18,52.57]],[[35,62],[18,62],[18,52.57],[23.3,48.03],[35,50.22]],[[51.75,62],[35,62],[35,50.22],[37.76,47.98],[50.73,53.88]],[[62,42.67],[62,62],[51.75,62],[50.73,53.88],[59.76,42.85]]];
  const SVG_NS = "http://www.w3.org/2000/svg";
  let crackOverlay = null;

  function polygonCss(poly) {
    return "polygon(" + poly.map(function (p) {
      return (p[0] / 62 * 100).toFixed(3) + "% " + (p[1] / 62 * 100).toFixed(3) + "%";
    }).join(", ") + ")";
  }

  function clearPopShards() {
    if (crackOverlay) {
      crackOverlay.remove();
      crackOverlay = null;
    }
    for (let i = 0; i < popShards.length; i++) popShards[i].el.remove();
    popShards.length = 0;
    feind.classList.remove("is-shattering");
  }

  function createShatterParts() {
    clearPopShards();
    crackOverlay = document.createElementNS(SVG_NS, "svg");
    crackOverlay.setAttribute("viewBox", "0 0 62 62");
    crackOverlay.setAttribute("aria-hidden", "true");
    crackOverlay.classList.add("button-cracks");
    for (let i = 0; i < SHATTER_CELLS.length; i++) {
      const polygon = document.createElementNS(SVG_NS, "polygon");
      polygon.setAttribute("points", SHATTER_CELLS[i].map(function (p) { return p.join(","); }).join(" "));
      polygon.setAttribute("fill", "none");
      polygon.setAttribute("stroke", "#002126");
      polygon.setAttribute("stroke-width", "1.65");
      polygon.setAttribute("stroke-linejoin", "round");
      crackOverlay.appendChild(polygon);
    }
    feind.appendChild(crackOverlay);

    SHATTER_CELLS.forEach(function (poly, i) {
      const image = document.createElement("img");
      image.className = "button-piece";
      image.src = "assets/button.svg";
      image.alt = "";
      image.draggable = false;
      image.style.clipPath = polygonCss(poly);
      image.style.webkitClipPath = polygonCss(poly);
      image.style.opacity = "0";
      feind.appendChild(image);
      const centroid = poly.reduce(function (acc, pt) {
        acc.x += pt[0]; acc.y += pt[1]; return acc;
      }, {x:0,y:0});
      centroid.x /= poly.length; centroid.y /= poly.length;
      const dx = centroid.x - 31;
      const dy = centroid.y - 31;
      const angle = Math.atan2(dy,dx) + (i % 3 - 1) * 0.13;
      popShards.push({
        el:image,
        tx:Math.cos(angle) * (50 + (i * 17) % 42),
        ty:Math.sin(angle) * (50 + (i * 17) % 42),
        spin:((i % 2) ? -1 : 1) * (24 + (i * 19) % 83)
      });
    });
  }

  function updatePopShards(now) {
    if (!popping) return;
    const age = Math.max(0, now - popStartedAt);
    const crack = age < CRACK_PHASE_MS;
    feind.classList.toggle("is-shattering", !crack);
    if (crackOverlay) crackOverlay.style.display = crack ? "block" : "none";
    for (let i = 0; i < popShards.length; i++) {
      const shard = popShards[i];
      if (crack) {
        shard.el.style.opacity = "0";
        continue;
      }
      let dist, turn;
      if (age < BREAK_PHASE_MS) {
        const t = (age - CRACK_PHASE_MS) / (BREAK_PHASE_MS - CRACK_PHASE_MS);
        dist = 0.07 * t;
        turn = 0.035 * t;
      } else {
        const t = Math.min(1, (age - BREAK_PHASE_MS) / (POP_DURATION_MS - BREAK_PHASE_MS));
        const eased = 1 - Math.pow(1 - t, 2);
        dist = 0.07 + 0.93 * eased;
        turn = 0.035 + 0.965 * eased;
      }
      const opacity = age > SCATTER_FADE_MS
        ? Math.max(0, 1 - (age - SCATTER_FADE_MS) / (POP_DURATION_MS - SCATTER_FADE_MS))
        : 1;
      shard.el.style.opacity = String(opacity);
      shard.el.style.transform = "translate(" + (shard.tx * dist).toFixed(2) + "px, " +
        (shard.ty * dist).toFixed(2) + "px) rotate(" + (shard.spin * turn).toFixed(2) + "deg)";
    }
  }

  function setFeindVisual(hit) {
    feind.classList.toggle("show-idle", !hit);
    feind.classList.toggle("show-hit", hit);
  }

  function applyFeindTransform() {
    const now = performance.now();
    // Press feedback: grow slightly and ease back without automatic shatter scaling.
    const pulseAge = now - tapFlashStartedAt;
    let pulseScale = 1;
    if (pulseAge >= 0 && pulseAge < TAP_PULSE_MS) {
      const fade = 1 - pulseAge / TAP_PULSE_MS;
      pulseScale += (TAP_PULSE_SCALE - 1) * fade * fade;
    }
    const scale = (popping ? 1 : Math.min(1, spawnScale)) * pulseScale;
    let extraRotation = 0;
    const spinTime = now - quickSpinStartedAt;
    if (!popping && spinTime >= 0 && spinTime < QUICK_SPIN_MS) {
      const t = spinTime / QUICK_SPIN_MS;
      extraRotation = 360 * (1 - Math.pow(1 - t, 3));
    }
    const flashTime = now - tapFlashStartedAt;
    if (flashTime >= 0 && flashTime < TAP_FLASH_MS) {
      const strength = 1 - flashTime / TAP_FLASH_MS;
      feind.style.filter = "brightness(" + (1 + 1.55 * strength) +
        ") saturate(" + (1 - 0.98 * strength) + ")";
    } else {
      feind.style.filter = "none";
    }
    feind.style.opacity = "1";
    feind.style.transform = "translate(" + (x + shakeX) + "px, " + (y + shakeY) +
      "px) rotate(" + (rotation + extraRotation) + "deg) scale(" + scale + ")";
  }

  function playSpawnIn() {
    spawnScale = 0.15;
    spawnAnimUntil = performance.now() + 320;
    applyFeindTransform();
  }

  function respawnTarget() {
    popping = false;
    popStartedAt = 0;
    popUntil = 0;
    clearPopShards();
    feind.style.filter = "none";
    tapFlashStartedAt = -Infinity;
    const spawn = randomSpawn();
    x = spawn.x;
    y = spawn.y;
    rotation += randomint(1, 369);
    alpha = FADE_START_ALPHA;
    punchScale = 1;
    shakeX = 0;
    shakeY = 0;
    setFeindVisual(false);
    playSpawnIn();
    spawnTime = performance.now();
  }

  function beginPopPhase() {
    popping = true;
    popStartedAt = performance.now();
    popUntil = popStartedAt + POP_DURATION_MS;
    alpha = FADE_START_ALPHA;
    punchScale = 1;
    spawnScale = 1;
    spawnAnimUntil = 0;
    shakeX = 0;
    shakeY = 0;
    shakeUntil = 0;
    setFeindVisual(false);
    createShatterParts();
    updatePopShards(popStartedAt);
    applyFeindTransform();
  }

  function setScore(value) {
    score = value;
    punkteEl.textContent = String(score);
    pushPresence();
  }

  function updateApm() {
    if (!started) {
      apmEl.textContent = "—";
      return;
    }
    const minutes = Math.max((performance.now() - startTime) / 60000, 1 / 60);
    apmEl.textContent = String(Math.round(hitCount / minutes));
  }

  function syncReactTarget() {
    if (reactionSamples === 0) {
      reactHasValue = false;
      reactEl.textContent = "—";
      return;
    }
    reactHasValue = true;
    reactTarget = Math.round(reactionSumMs / reactionSamples);
  }

  function tweenReactDisplay(dt) {
    if (!reactHasValue) return;
    const diff = reactTarget - reactDisplay;
    if (Math.abs(diff) < 0.5) {
      reactDisplay = reactTarget;
    } else {
      reactDisplay += diff * Math.min(1, dt / 200);
    }
    reactEl.textContent = Math.round(reactDisplay) + " ms";
  }

  function remainingSeconds() {
    if (!started) return Math.ceil(BASE_DURATION_MS / 1000);
    return Math.ceil((deadline - performance.now()) / 1000);
  }

  function updateTimeHud() {
    timeEl.textContent = String(Math.max(0, remainingSeconds()));
  }

  function registerHit() {
    hitCount += 1;
    updateApm();
  }

  function startGame(now) {
    started = true;
    startTime = now;
    deadline = now + BASE_DURATION_MS;
    anleitungEl.textContent = "";
  }

  function triggerQuickFx() {
    punchScale = 1.45;
    shakeUntil = performance.now() + 220;
  }

  function updateFx(now) {
    if (now < shakeUntil) {
      const t = (shakeUntil - now) / 220;
      shakeX = (Math.random() * 2 - 1) * 7 * t;
      shakeY = (Math.random() * 2 - 1) * 7 * t;
      punchScale = 1 + 0.45 * t;
    } else {
      shakeX = 0;
      shakeY = 0;
      if (punchScale > 1) {
        punchScale += (1 - punchScale) * 0.35;
        if (punchScale < 1.01) punchScale = 1;
      }
    }

    if (now < spawnAnimUntil) {
      const t = Math.min(1, 1 - (spawnAnimUntil - now) / 320);
      // Ease-out back: pop in small → slight overshoot → settle at 1.
      const c1 = 1.70158;
      const c3 = c1 + 1;
      const eased = 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
      spawnScale = 0.12 + 0.88 * Math.max(0, eased);
    } else if (spawnScale !== 1) {
      spawnScale = 1;
    }
  }

  function floaterLabel(value) {
    return "+" + value;
  }

  function floaterFontSize(value) {
    return 18 + Math.min(28, Math.log2(value + 1) * 8);
  }

  function floaterRadius(f) {
    return Math.max(11, floaterFontSize(f.value) * f.scale * 0.38);
  }

  function pickGravity() {
    return GRAVITY_DIRS[(Math.random() * GRAVITY_DIRS.length) | 0];
  }

  function spawnFloater(value, opts) {
    opts = opts || {};
    const el = document.createElement("div");
    el.className = "floater";
    el.textContent = floaterLabel(value);
    floatLayer.appendChild(el);

    // Default: burst from stage center so fingers / cursor never cover the +points.
    const cx = opts.x != null ? opts.x : STAGE / 2 + rand(-14, 14);
    const cy = opts.y != null ? opts.y : STAGE / 2 + rand(-18, 10);
    const angle = opts.angle != null ? opts.angle : rand(0, Math.PI * 2);
    const speed = opts.speed != null ? opts.speed : rand(120, 300);
    const g = opts.g || pickGravity();
    const f = {
      el: el,
      value: value,
      bellPlayed: false,
      gx: g.gx,
      gy: g.gy,
      x: cx,
      y: cy,
      vx: opts.vx != null ? opts.vx : Math.cos(angle) * speed,
      vy: opts.vy != null ? opts.vy : Math.sin(angle) * speed,
      rot: rand(-40, 40),
      spin: rand(-520, 520),
      scale: opts.scale != null ? opts.scale : rand(0.95, 1.35),
      age: 0,
      life: opts.life != null ? opts.life : FLOAT_LIFE + rand(-400, 500),
      alive: true,
      inert: !!opts.inert,
    };
    el.style.fontSize = floaterFontSize(value) + "px";
    if (value >= 5) el.classList.add("big");
    if (f.inert) el.classList.add("jackpot-flash");
    floaters.push(f);
    paintFloater(f, 1);
    return f;
  }

  function applyLinger(f) {
    if (!LINGER_AT[f.value]) return;
    f.age = Math.min(f.age, 200);
    f.life = Math.max(f.life, FLOAT_LIFE + 1800) + 900;
    f.scale = Math.min(2.2, f.scale * 1.08);
    f.el.classList.add("linger");
  }

  function explodeJackpot(f) {
    const total = f.value;
    const bonus = total * 2;
    const cx = f.x;
    const cy = f.y;
    f.alive = false;
    f.el.remove();

    setScore(score + bonus);
    triggerQuickFx();
    playRandomBell();

    // Brief double-score flash (does not merge / re-jackpot).
    spawnFloater(bonus, {
      x: cx,
      y: cy,
      vx: rand(-30, 30),
      vy: rand(-30, 30),
      scale: 1.75,
      life: 950 + rand(0, 200),
      g: pickGravity(),
      inert: true,
    });

    // Scatter ones that can keep combining (no extra score — bonus already applied).
    const shards = Math.min(total, 28);
    for (let i = 0; i < shards; i++) {
      const ang = (Math.PI * 2 * i) / shards + rand(-0.2, 0.2);
      const spd = rand(180, 420);
      spawnFloater(1, {
        x: cx + Math.cos(ang) * rand(4, 18),
        y: cy + Math.sin(ang) * rand(4, 18),
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        scale: rand(0.85, 1.15),
        life: FLOAT_LIFE + rand(-200, 600),
        g: pickGravity(),
      });
    }
  }

  function grantTimeBonusFly(fromX, fromY) {
    if (!started || gameOver) return;
    const el = document.createElement("div");
    el.className = "time-fly";
    el.textContent = "+3s";
    floatLayer.appendChild(el);
    timeFlies.push({
      el: el,
      x0: fromX,
      y0: fromY,
      x: fromX,
      y: fromY,
      age: 0,
      life: 720,
      applied: false,
    });
    paintTimeFly(timeFlies[timeFlies.length - 1], 1);
  }

  function paintTimeFly(fly, opacity) {
    fly.el.style.opacity = String(opacity);
    fly.el.style.transform =
      "translate(" +
      fly.x +
      "px, " +
      fly.y +
      "px) translate(-50%, -50%) scale(" +
      (0.95 + opacity * 0.15) +
      ")";
  }

  function applyDeadlineBonus() {
    if (gameOver || !started) return;
    deadline += TIME_BONUS_MS;
    updateTimeHud();
    timeFlashUntil = performance.now() + 480;
    timeEl.classList.add("time-bonus");
  }

  function updateTimeFlies(dt) {
    const now = performance.now();
    if (timeFlashUntil && now >= timeFlashUntil) {
      timeEl.classList.remove("time-bonus");
      timeFlashUntil = 0;
    }

    for (let i = timeFlies.length - 1; i >= 0; i--) {
      const fly = timeFlies[i];
      fly.age += dt;
      const t = Math.min(1, fly.age / fly.life);
      // Ease-in toward the Time panel.
      const e = t * t;
      fly.x = fly.x0 + (TIME_PANEL_CX - fly.x0) * e;
      fly.y = fly.y0 + (TIME_PANEL_CY - fly.y0) * e;
      const opacity = t < 0.85 ? 1 : 1 - (t - 0.85) / 0.15;
      paintTimeFly(fly, opacity);

      if (t >= 1) {
        if (!fly.applied) {
          fly.applied = true;
          applyDeadlineBonus();
        }
        fly.el.remove();
        timeFlies.splice(i, 1);
      }
    }
  }

  function clearTimeFlies() {
    for (let i = 0; i < timeFlies.length; i++) {
      timeFlies[i].el.remove();
    }
    timeFlies.length = 0;
    timeEl.classList.remove("time-bonus");
    timeFlashUntil = 0;
  }

  function afterFloaterValue(f) {
    if (!f || !f.alive) return;
    const v = f.value;
    const fx = f.x;
    const fy = f.y;
    applyLinger(f);
    if (TIME_BONUS_AT[v]) {
      grantTimeBonusFly(fx, fy);
    }
    if (JACKPOT_AT[v]) {
      explodeJackpot(f);
      return;
    }
    maybeComboBell(f);
  }

  function seekOnesToTwenties(sec) {
    for (let i = 0; i < floaters.length; i++) {
      const one = floaters[i];
      if (!one.alive || one.inert || one.value !== 1) continue;

      let best = null;
      let bestD2 = SEEK_ONE_TO_TWENTY * SEEK_ONE_TO_TWENTY;
      for (let j = 0; j < floaters.length; j++) {
        const twenty = floaters[j];
        if (!twenty.alive || twenty.inert || twenty.value !== 20) continue;
        const dx = twenty.x - one.x;
        const dy = twenty.y - one.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestD2) {
          bestD2 = d2;
          best = twenty;
        }
      }
      if (!best) continue;

      const dist = Math.sqrt(bestD2) || 1;
      // Stronger pull the closer they are (still before merge contact).
      const strength = SEEK_ACCEL * (0.45 + 0.55 * (1 - dist / SEEK_ONE_TO_TWENTY));
      one.vx += ((best.x - one.x) / dist) * strength * sec;
      one.vy += ((best.y - one.y) / dist) * strength * sec;
      // Tiny assist on the twenty so they meet in the middle.
      best.vx += ((one.x - best.x) / dist) * strength * 0.18 * sec;
      best.vy += ((one.y - best.y) / dist) * strength * 0.18 * sec;
    }
  }

  function bounceAxis(vel, intoPositive) {
    // Soft land: reverse if moving into the surface, then damp.
    if (intoPositive) {
      if (vel > 0) vel = -vel * FLOAT_REST;
      else vel *= 0.85;
    } else {
      if (vel < 0) vel = -vel * FLOAT_REST;
      else vel *= 0.85;
    }
    return vel;
  }

  function resolveAabb(f, r, box) {
    const fl = f.x - r;
    const fr = f.x + r;
    const ft = f.y - r;
    const fb = f.y + r;
    if (fr <= box.l || fl >= box.r || fb <= box.t || ft >= box.b) return;

    const penL = fr - box.l;
    const penR = box.r - fl;
    const penT = fb - box.t;
    const penB = box.b - ft;
    const minPen = Math.min(penL, penR, penT, penB);

    if (minPen === penL) {
      f.x = box.l - r;
      f.vx = bounceAxis(f.vx, true);
      f.spin *= -0.55;
    } else if (minPen === penR) {
      f.x = box.r + r;
      f.vx = bounceAxis(f.vx, false);
      f.spin *= -0.55;
    } else if (minPen === penT) {
      f.y = box.t - r;
      f.vy = bounceAxis(f.vy, true);
      f.spin *= -0.55;
    } else {
      f.y = box.b + r;
      f.vy = bounceAxis(f.vy, false);
      f.spin *= -0.55;
    }
  }

  function collideFloatersWorld(f) {
    const r = floaterRadius(f);
    const min = FLOAT_EDGE + r * 0.15;
    const max = STAGE - FLOAT_EDGE - r * 0.15;

    if (f.x < min) {
      f.x = min;
      f.vx = bounceAxis(f.vx, false);
      f.spin *= -0.5;
    } else if (f.x > max) {
      f.x = max;
      f.vx = bounceAxis(f.vx, true);
      f.spin *= -0.5;
    }
    if (f.y < min) {
      f.y = min;
      f.vy = bounceAxis(f.vy, false);
      f.spin *= -0.5;
    } else if (f.y > max) {
      f.y = max;
      f.vy = bounceAxis(f.vy, true);
      f.spin *= -0.5;
    }

    for (let i = 0; i < HUD_BOXES.length; i++) {
      resolveAabb(f, r, HUD_BOXES[i]);
    }
  }

  function paintFloater(f, opacity) {
    f.el.style.opacity = String(opacity);
    f.el.style.transform =
      "translate(" +
      f.x +
      "px, " +
      f.y +
      "px) translate(-50%, -50%) rotate(" +
      f.rot +
      "deg) scale(" +
      f.scale +
      ")";
  }

  function clearFloaters() {
    for (let i = 0; i < floaters.length; i++) {
      floaters[i].el.remove();
    }
    floaters.length = 0;
    clearTimeFlies();
    clearPopShards();
  }

  function mergeFloaters(a, b) {
    // Keep a, absorb b. Gravity stays with the survivor so clusters keep a direction.
    a.value += b.value;
    a.bellPlayed = !!(a.bellPlayed || b.bellPlayed);
    a.x = (a.x + b.x) / 2;
    a.y = (a.y + b.y) / 2;
    a.vx = (a.vx + b.vx) / 2 - a.gx * 55;
    a.vy = (a.vy + b.vy) / 2 - a.gy * 55;
    a.spin = (a.spin + b.spin) / 2;
    a.scale = Math.min(2.4, 0.95 + Math.log2(a.value + 1) * 0.28);
    a.age = Math.min(a.age, b.age) * 0.45;
    a.life = Math.max(a.life, b.life) + 280;
    a.el.textContent = floaterLabel(a.value);
    a.el.style.fontSize = floaterFontSize(a.value) + "px";
    a.el.classList.toggle("big", a.value >= 5);
    b.alive = false;
    b.el.remove();
    afterFloaterValue(a);
  }

  function updateFloaters(dt) {
    const sec = dt / 1000;

    seekOnesToTwenties(sec);

    for (let i = 0; i < floaters.length; i++) {
      const f = floaters[i];
      if (!f.alive) continue;
      f.age += dt;
      f.vx += f.gx * FLOAT_GRAVITY * sec;
      f.vy += f.gy * FLOAT_GRAVITY * sec;
      // Light air drag on both axes so they settle onto floors / HUD faces.
      f.vx *= 1 - 0.28 * sec;
      f.vy *= 1 - 0.28 * sec;
      f.x += f.vx * sec;
      f.y += f.vy * sec;
      f.rot += f.spin * sec;
      f.spin *= 1 - 0.3 * sec;

      collideFloatersWorld(f);

      const t = f.age / f.life;
      if (t >= 1) {
        f.alive = false;
        f.el.remove();
        continue;
      }
      const opacity = t < 0.72 ? 1 : 1 - (t - 0.72) / 0.28;
      paintFloater(f, opacity);
    }

    updateTimeFlies(dt);

    // Combine nearby floaters into bigger numbers.
    for (let i = 0; i < floaters.length; i++) {
      const a = floaters[i];
      if (!a.alive || a.inert) continue;
      for (let j = i + 1; j < floaters.length; j++) {
        const b = floaters[j];
        if (!b.alive || b.inert) continue;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        if (dx * dx + dy * dy < MERGE_DIST * MERGE_DIST) {
          mergeFloaters(a, b);
        }
      }
    }

    // Compact dead slots occasionally.
    for (let i = floaters.length - 1; i >= 0; i--) {
      if (!floaters[i].alive) floaters.splice(i, 1);
    }
  }

  function addPoints(amount) {
    setScore(score + amount);
    spawnFloater(amount);
  }

  function readLocalScores() {
    try {
      const raw = localStorage.getItem(LOCAL_SCORES_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function writeLocalScores(list) {
    localStorage.setItem(LOCAL_SCORES_KEY, JSON.stringify(list.slice(0, MAX_SCORES)));
  }

  function normalizeScores(list) {
    return (list || [])
      .filter(function (e) {
        return e && typeof e.name === "string" && typeof e.score === "number";
      })
      .map(function (e) {
        return {
          name: String(e.name).trim().slice(0, MAX_NAME) || "Player",
          score: Math.max(0, Math.floor(e.score)),
        };
      })
      .sort(function (a, b) {
        return b.score - a.score;
      })
      .slice(0, MAX_SCORES);
  }

  function renderLeaderboard(list) {
    const scores = normalizeScores(list);
    if (!scores.length) {
      leaderboardBody.className = "empty";
      leaderboardBody.textContent = "No scores yet";
      return;
    }
    leaderboardBody.className = "";
    const ol = document.createElement("ol");
    for (let i = 0; i < scores.length; i++) {
      const li = document.createElement("li");
      li.textContent = scores[i].name + " — " + scores[i].score;
      ol.appendChild(li);
    }
    leaderboardBody.replaceChildren(ol);
  }

  function loadLeaderboard() {
    fetch("/api/scores")
      .then(function (res) {
        if (!res.ok) throw new Error("api");
        return res.json();
      })
      .then(function (data) {
        renderLeaderboard(data.scores || data);
      })
      .catch(function () {
        renderLeaderboard(readLocalScores());
      });
  }

  function submitScore(name) {
    rememberName(name);
    const entry = {
      name: getLiveName() || "Player",
      score: score,
    };
    scoreStatus.textContent = "Saving…";
    submitScoreBtn.disabled = true;
    pushPresence();

    return fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    })
      .then(function (res) {
        if (!res.ok) throw new Error("api");
        return res.json();
      })
      .then(function (data) {
        renderLeaderboard(data.scores || data);
        scoreStatus.textContent = "Saved to host!";
        scoreForm.hidden = true;
      })
      .catch(function () {
        const list = normalizeScores(readLocalScores().concat([entry]));
        writeLocalScores(list);
        renderLeaderboard(list);
        scoreStatus.textContent = "Saved on this device";
        scoreForm.hidden = true;
      })
      .finally(function () {
        submitScoreBtn.disabled = false;
      });
  }

  function endGame() {
    endEl.textContent = "Game Over";
    clearPopShards();
    feind.classList.add("is-gone");
    gameOver = true;
    fading = false;
    timeEl.textContent = "0";
    endWrap.classList.add("visible");
    scoreForm.hidden = false;
    scoreStatus.textContent = "";
    playAgainBtn.hidden = false;
    playerNameInput.value = playerNameInput.value || getLiveName();
    loadLeaderboard();
    pushPresence();
  }

  function resetGame() {
    score = 0;
    started = false;
    deadline = 0;
    startTime = 0;
    gameOver = false;
    fading = false;
    flupp = 0;
    alpha = FADE_START_ALPHA;
    rotation = 0;
    punchScale = 1;
    spawnScale = 1;
    spawnAnimUntil = 0;
    shakeX = 0;
    shakeY = 0;
    shakeUntil = 0;
    popping = false;
    popStartedAt = 0;
    popUntil = 0;
    tapFlashStartedAt = -Infinity;
    quickSpinStartedAt = -Infinity;
    feind.style.filter = "none";
    feind.style.opacity = "1";
    hitCount = 0;
    reactionSumMs = 0;
    reactionSamples = 0;
    reactDisplay = 0;
    reactTarget = 0;
    reactHasValue = false;
    clearFloaters();

    const spawn = randomSpawn();
    x = spawn.x;
    y = spawn.y;
    spawnTime = performance.now();

    feind.classList.remove("is-gone");
    setFeindVisual(false);
    playSpawnIn();
    setScore(0);
    anleitungEl.textContent = "Klick druff da!!!";
    endEl.textContent = "";
    endWrap.classList.remove("visible");
    scoreForm.hidden = true;
    scoreStatus.textContent = "";
    playAgainBtn.hidden = true;
    updateTimeHud();
    updateApm();
    reactEl.textContent = "—";
  }

  (function init() {
    try {
      const saved = localStorage.getItem(LOCAL_NAME_KEY);
      if (saved && playerNameInput) playerNameInput.value = saved;
    } catch (e) {}
    const spawn = randomSpawn();
    x = spawn.x;
    y = spawn.y;
    setFeindVisual(false);
    playSpawnIn();
    setScore(0);
    updateTimeHud();
    updateApm();
    reactEl.textContent = "—";
    playAgainBtn.hidden = true;
    scoreForm.hidden = true;
    endWrap.classList.remove("visible");
    spawnTime = performance.now();
    pushPresence();
    setInterval(pushPresence, 900);
  })();

  function onClick() {
    if (gameOver) return;

    ensureAudio();
    const now = performance.now();
    registerHit();
    playRandomImpact();
    tapFlashStartedAt = now;
    applyFeindTransform();

    if (popping) {
      addPoints(1);
      return;
    }

    if (fading) {
      addPoints(1);
      return;
    }

    if (!started) startGame(now);

    let reactionMs = null;
    if (spawnTime != null) {
      reactionMs = Math.max(0, now - spawnTime);
      reactionSumMs += reactionMs;
      reactionSamples += 1;
      spawnTime = null;
      syncReactTarget();
      if (!reactDisplay) reactDisplay = reactTarget;
    }

    if (reactionMs != null && reactionMs <= QUICK_HIT_MS) {
      quickSpinStartedAt = now;
      triggerQuickFx();
    }

    flupp = randomint(1, 22);
    deadline += fadeDurationMs(flupp);

    setFeindVisual(true);
    addPoints(1);
    fading = true;
    updateTimeHud();
    applyFeindTransform();
  }

  feind.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    onClick();
  });

  feind.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  });

  playAgainBtn.addEventListener("click", function () {
    resetGame();
  });

  scoreForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!gameOver) return;
    submitScore(playerNameInput.value);
  });

  function fitToPhone() {
    const scaler = document.getElementById("scaler");
    const frame = document.getElementById("frame");
    if (!scaler || !frame) return;
    const frameW = frame.offsetWidth || 470;
    const avail = scaler.clientWidth;
    const scale = Math.min(1, avail / frameW);
    frame.style.transform = "scale(" + scale + ")";
    scaler.style.height = frame.offsetHeight * scale + "px";
  }

  window.addEventListener("resize", fitToPhone);
  window.addEventListener("orientationchange", fitToPhone);
  fitToPhone();

  function feindEnterFrame() {
    if (popping) {
      if (performance.now() >= popUntil) {
        respawnTarget();
        return;
      }
      applyFeindTransform();
      return;
    }
    if (!fading) return;
    alpha -= flupp;
    if (alpha <= FADE_END_ALPHA) {
      fading = false;
      beginPopPhase();
      return;
    }
    applyFeindTransform();
  }

  function rootEnterFrame() {
    if (gameOver) return;

    updateApm();

    if (!started) {
      updateTimeHud();
      return;
    }

    updateTimeHud();
    // Wait for golden +3s flies to land before ending on zero.
    if (remainingSeconds() <= 0 && timeFlies.length === 0) endGame();
  }

  function tick(ts) {
    const dt = ts - lastTs;
    lastTs = ts;
    frameAcc += dt;

    updateFx(ts);
    tweenReactDisplay(dt);
    updateFloaters(dt);
    updatePopShards(ts);
    if (
      shakeX ||
      shakeY ||
      punchScale !== 1 ||
      spawnScale !== 1 ||
      ts < spawnAnimUntil ||
      popping ||
      ts - tapFlashStartedAt < TAP_PULSE_MS ||
      ts - quickSpinStartedAt < QUICK_SPIN_MS
    ) {
      applyFeindTransform();
    }

    while (frameAcc >= FRAME_MS) {
      frameAcc -= FRAME_MS;
      feindEnterFrame();
      rootEnterFrame();
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
