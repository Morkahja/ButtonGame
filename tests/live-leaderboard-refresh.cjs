"use strict";
// Regression: a Wi-Fi guest's newly submitted score must appear on an Android
// host's Game Over screen even if the host never submits another score.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const game = fs.readFileSync(path.join(__dirname, "..", "game.js"), "utf8");
const bundled = fs.readFileSync(path.join(__dirname, "..", "android", "app", "src", "main", "assets", "www", "game.js"), "utf8");
assert.equal(bundled, game, "Android host and root game source must match");
const begin = game.indexOf("    // Keep the lightweight preview current as guests finish rounds.");
assert(begin >= 0, "Expected leaderboard refresh initialization");
const end = game.indexOf("  })();", begin);
assert(end > begin, "Expected end of game initialization");
const setupCode = game.slice(begin, end);

const intervals = new Map();
const events = new Map();
let fetches = 0;
const state = {
  started: false,
  gameOver: false,
  loadLeaderboard: () => { fetches++; },
  setInterval: (fn, ms) => { assert(!intervals.has(ms)); intervals.set(ms, fn); },
  document: { hidden: false, addEventListener: (name, cb) => events.set(name, cb) },
};
vm.createContext(state);
vm.runInContext(setupCode, state);
assert.equal(fetches, 1, "Initial host leaderboard fetch");
assert(intervals.has(3000), "Game Over must poll the host every three seconds");
assert(intervals.has(12000), "Playing preview polls the host every twelve seconds");
const tick = ms => intervals.get(ms)();

tick(3000); tick(12000);
assert.equal(fetches, 1, "Welcome screen must not repeatedly fetch");
state.started = true;
tick(3000); assert.equal(fetches, 1);
tick(12000); assert.equal(fetches, 2, "Active game preview refresh");
state.gameOver = true;
tick(3000); assert.equal(fetches, 3, "Host Game Over must refresh after guest submits");
tick(12000); assert.equal(fetches, 3, "In-game preview stays disabled at Game Over");
state.document.hidden = true;
events.get("visibilitychange")(); assert.equal(fetches, 3);
state.document.hidden = false;
events.get("visibilitychange")(); assert.equal(fetches, 4, "Refresh on foregrounding");
state.gameOver = false;
tick(3000); assert.equal(fetches, 4);
tick(12000); assert.equal(fetches, 5, "Replay restores play polling");
console.log("PASS: Game Over host leaderboard refresh, idle/active polling, and app foregrounding");
