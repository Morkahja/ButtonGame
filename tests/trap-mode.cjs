"use strict";
// Red Trap Button deterministic regression checks (run by GitHub Actions).
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const js = fs.readFileSync(path.join(root, "game.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const scoreKotlin = fs.readFileSync(path.join(root, "android/app/src/main/java/com/babunigaming/buttongame/ScoreStore.kt"), "utf8");
const serverKotlin = fs.readFileSync(path.join(root, "android/app/src/main/java/com/babunigaming/buttongame/GameServer.kt"), "utf8");
assert.equal(js, fs.readFileSync(path.join(root, "android/app/src/main/assets/www/game.js"), "utf8"));
assert.equal(html, fs.readFileSync(path.join(root, "android/app/src/main/assets/www/index.html"), "utf8"));
assert.match(html, /id="traps-toggle" type="checkbox"/);
assert.match(scoreKotlin, /val trapsEnabled: Boolean/);
assert.match(scoreKotlin, /optBoolean\("trapsEnabled", false\)/);
assert.match(scoreKotlin, /\.put\("trapsEnabled", entry\.trapsEnabled\)/);
assert.match(serverKotlin, /scores\.add\(name, score, reactionMs, apm, durationMs, trapsEnabled\)/);
const red = fs.readFileSync(path.join(root, "assets/button-red.svg"), "utf8");
assert.equal(red, fs.readFileSync(path.join(root, "android/app/src/main/assets/www/assets/button-red.svg"), "utf8"));
assert.match(red, /#E53A45/);
assert.match(red, /#FFFFFF/);
assert.match(red, /#000000/);
function functionText(name) {
  const begin = js.indexOf("  function " + name + "(");
  assert(begin >= 0, name + " exists");
  const bracket = js.indexOf("{", begin);
  let depth = 0;
  for (let i = bracket; i < js.length; i++) {
    if (js[i] === "{") depth++;
    else if (js[i] === "}" && --depth === 0) return js.slice(begin, i + 1);
  }
  throw new Error("Unclosed function " + name);
}
const state = {
  TRAP_CHANCE: .10,
  TRAP_POINT_INTERVAL_MS: 1000 / 3,
  started: true, gameOver: false, roundExpired: false, trapEnding: false,
  trapActive: false, nextTrapEmissionAt: 0,
  spawned: [],
  spawnFloater(n) { state.spawned.push(n); }
};
vm.createContext(state);
vm.runInContext(functionText("shouldSpawnTrap") + "\nthis.choose = shouldSpawnTrap;", state);
assert.equal(state.choose(false, 0), false);
assert.equal(state.choose(true, 0), true);
assert.equal(state.choose(true, .099999), true);
assert.equal(state.choose(true, .1), false);
assert.equal(state.choose(true, .9), false);
assert.match(functionText("respawnTarget"), /shouldSpawnTrap\(started && trapsEnabled, Math\.random\(\)\)/);
vm.runInContext(functionText("emitTrapPoints") + "\nthis.emit = emitTrapPoints;", state);
state.trapActive = true;
state.nextTrapEmissionAt = 1000 / 3;
state.emit(333); assert.deepEqual(state.spawned, []);
state.emit(334); assert.deepEqual(state.spawned, [3]);
state.emit(1001); assert.deepEqual(state.spawned, [3,3,3]);
state.trapEnding = true;
state.emit(2000);
assert.deepEqual(state.spawned, [3,3,3], "No newly generated points after losing");
state.trapEnding = false;
state.trapActive = false;
state.emit(3000);
assert.deepEqual(state.spawned, [3,3,3], "Normal buttons do not emit passively");
assert.match(functionText("onClick"), /if \(trapActive\) \{\s*triggerTrapLoss\(performance\.now\(\)\);\s*return;/);
assert.match(functionText("triggerTrapLoss"), /endEl\.textContent = "Game Over"/);
assert.match(functionText("triggerTrapLoss"), /scoreForm\.hidden = true/);
assert.match(functionText("rootEnterFrame"), /if \(trapEnding\) \{[\s\S]*if \(!hasPendingScore\(\)\) endGame\(\)/);
assert.match(functionText("endGame"), /trapLossAt \|\| performance\.now\(\)/);
assert.match(functionText("submitScore"), /trapsEnabled: trapsEnabled/);
console.log("PASS: trap chance, red art, 3-point emitter, immediate Game Over, settlement and host high-score flag");
