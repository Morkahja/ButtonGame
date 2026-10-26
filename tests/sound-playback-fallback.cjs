"use strict";
// Playback regression: all shipped Ogg names remain referenced; a sound can
// still play when Web Audio buffers aren't ready or context is suspended.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const js = fs.readFileSync(path.join(root, "game.js"), "utf8");
assert.equal(js, fs.readFileSync(path.join(root, "android/app/src/main/assets/www/game.js"), "utf8"));
function functionText(name) {
  const start = js.indexOf("  function " + name + "(");
  assert(start >= 0, name + " exists");
  const brace = js.indexOf("{", start);
  let depth = 0;
  for (let i = brace; i < js.length; i++) {
    if (js[i] === "{") depth++;
    else if (js[i] === "}" && --depth === 0) return js.slice(start, i + 1);
  }
  throw new Error(name + " has no closing brace");
}
const state = {
  soundMuted: false, canPlayOgg: false, MASTER_VOL: 0.72, played: [],
  reportSoundIssue() {},
  Audio: class {
    constructor(src) { this.src = src; state.played.push(this); }
    play() { return Promise.resolve(); }
  },
  ensureAudio() { return {state: "suspended"}; },
  buffers: {}, masterGain: {}
};
vm.createContext(state);
vm.runInContext(functionText("playMediaFallback") + "\nthis.fallback = playMediaFallback", state);
state.fallback("assets/sfx/impact1.ogg", {gain: 0.8});
assert.equal(state.played[0].src, "assets/sfx/impact1.mp3");
assert.equal(state.played[0].volume, 0.8 * 0.72);
state.canPlayOgg = true;
state.fallback("assets/sfx/Bell2.ogg", {gain: 1});
assert.equal(state.played[1].src, "assets/sfx/Bell2.ogg");
state.soundMuted = true;
state.fallback("assets/sfx/impact1.ogg", {});
assert.equal(state.played.length, 2, "Respect user mute");
state.soundMuted = false;
state.playMediaFallback = state.fallback;
vm.runInContext(functionText("playBuffer") + "\nthis.playTest = playBuffer", state);
state.playTest("assets/sfx/impact4.ogg", {gain: 0.5});
assert.equal(state.played.length, 3, "Suspended Web Audio falls back to media playback");
assert.match(js, /reportSoundIssue\("Couldn't preload " \+ url, error\)/);
for (const file of ["4273", "Bell1", "Bell2", "Bell3", "QuickStrikepoints",
                   "QuickStrikepoints1", "impact1", "impact2", "impact3", "impact4"]) {
  assert(fs.existsSync(path.join(root, "assets", "sfx", file + ".ogg")), file + " is packaged");
}
console.log("PASS: all original sounds, browser media fallback, mute, suspended audio and diagnostic logging");
