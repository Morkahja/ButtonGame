'use strict';
(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const shapes = Object.fromEntries(Object.entries(ORIGINAL_ASSETS.shapes).map(([name, paths]) =>
    [name, paths.map(p => ({ ...p, geometry: new Path2D(p.d) }))]));
  const fonts = ORIGINAL_ASSETS.fonts;
  for (const font of Object.values(fonts)) {
    for (const glyph of Object.values(font.glyphs)) glyph.geometry = new Path2D(glyph.path);
  }
  const started = performance.now();
  const state = { points: 60, time: '', instruction: true, over: false,
    x: 212, y: 207.1, rotation: 0, alpha: 100, fading: false, fadeStep: 0 };
  const randomInt = (min, max) => Math.round(Math.random() * (max - min)) + min;
  const twips = value => Math.floor(value * 20) / 20;

  function text(value, x, y, size, color, fontId) {
    const font = fonts[fontId];
    // Flash text field origin, embedded glyph metrics, and twip rounding.
    let offset = 0;
    const baseline = y + twips(font.ascent * size / 1024);
    ctx.fillStyle = color;
    for (const character of String(value)) {
      const glyph = font.glyphs[character];
      if (!glyph) continue;
      ctx.save();
      ctx.translate(x - 2 + offset, baseline);
      ctx.scale(size / 1024, size / 1024);
      ctx.fill(glyph.geometry, 'evenodd');
      ctx.restore();
      offset += twips(glyph.advance * size / 1024);
    }
  }

  function draw() {
    const ratio = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(450 * ratio)) {
      canvas.width = canvas.height = Math.round(450 * ratio);
    }
    ctx.setTransform(canvas.width / 450, 0, 0, canvas.height / 450, 0, 0);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 450, 450);
    if (!state.over) {
      ctx.save();
      ctx.translate(state.x, state.y);
      ctx.rotate(state.rotation * Math.PI / 180);
      ctx.globalAlpha = state.alpha / 100;
      for (const path of shapes[state.fading ? 'hit' : 'normal']) {
        if (path.fill !== 'none') {
          ctx.fillStyle = path.fill;
          ctx.fill(path.geometry, 'evenodd');
        }
        if (path.stroke && path.stroke !== 'none') {
          ctx.strokeStyle = path.stroke;
          ctx.lineWidth = Number(path['stroke-width']);
          ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.stroke(path.geometry);
        }
      }
      ctx.restore();
    }
    if (state.points > 60) text(`Punkte:  ${state.points - 60}`, 24.05, 26, 17, '#ff0000', 6);
    text(state.time, 295, 26, 17, '#ccff00', 6);
    if (state.over) text('Game Over', 144.95, 314.1, 29, '#ff0000', 9);
    if (state.instruction) text('Klick druff da!!!', 153.95, 58.85, 29, '#ff0000', 9);
  }

  function tick() {
    if (!state.over) {
      state.time = Math.ceil((state.points * 1000 - (performance.now() - started)) / 1000);
      if (state.time <= 0) { state.over = true; state.time = ''; }
    }
    if (state.fading) {
      state.alpha -= state.fadeStep;
      if (state.alpha <= 5) {
        state.x = randomInt(55, 395);
        state.y = randomInt(55, 395);
        state.rotation += randomInt(1, 369);
        state.alpha = 100;
        state.fading = false;
      }
    }
    draw();
  }

  function hit(event) {
    if (state.over) return false;
    const bounds = canvas.getBoundingClientRect();
    const dx = (event.clientX - bounds.left) * 450 / bounds.width - state.x;
    const dy = (event.clientY - bounds.top) * 450 / bounds.height - state.y;
    const angle = -state.rotation * Math.PI / 180;
    const x = dx * Math.cos(angle) - dy * Math.sin(angle);
    const y = dx * Math.sin(angle) + dy * Math.cos(angle);
    ctx.save(); ctx.resetTransform();
    const result = shapes[state.fading ? 'hit' : 'normal'].some(p =>
      p.fill !== 'none' && ctx.isPointInPath(p.geometry, x, y, 'evenodd'));
    ctx.restore();
    return result;
  }
  let pressed = null;
  canvas.addEventListener('pointerdown', event => {
    if (event.button === 0 && hit(event)) {
      pressed = event.pointerId;
      canvas.setPointerCapture(event.pointerId);
    }
  });
  canvas.addEventListener('pointerup', event => {
    if (pressed === event.pointerId && hit(event)) {
      state.instruction = false;
      state.points += 1;
      state.fadeStep = randomInt(1, 22);
      state.fading = true;
      draw();
    }
    pressed = null;
  });
  canvas.addEventListener('pointercancel', () => { pressed = null; });
  canvas.addEventListener('pointermove', event => { canvas.style.cursor = hit(event) ? 'pointer' : 'default'; });
  draw();
  setInterval(tick, 1000 / 15);
})();
