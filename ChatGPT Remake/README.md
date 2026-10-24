# Buttongame — ChatGPT Remake

Open `index.html` in a modern browser. No installation, server, internet connection, or Flash plugin is needed. Reload the page to start again.

Click the cyan target. Each successful release adds one point and one second. The target changes shape, fades at a random rate, then reappears at a random position and rotation. The countdown starts immediately and ends with “Game Over”.

Created from `../Game.swf` only. No other remake, HTML wrapper, or AI-created game files were read or reused. The vector artwork and embedded font outlines in `assets.js` were freshly extracted from that SWF. `game.js` is a new browser implementation of its ActionScript.

Preserved: 450 × 450 black stage, original graphics and German text, initial target position, blank initial score, 60-second timer, one second per click, 15 FPS animation, rounded random numbers, 1–22 alpha decrement per frame, relocation at alpha ≤ 5, coordinates from 55–395, cumulative 1–369° rotations, and repeated clicks during fading. The original has no sound or restart button.

Browser antialiasing can differ from Flash. The original Game Over field requests a system font; this version uses the SWF’s embedded AR ESSENCE outlines for a consistent appearance. The countdown also ends if a suspended browser skips past zero.
