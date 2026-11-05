(() => {
  'use strict';
  const dialog = document.querySelector('#after-hours');
  const canvas = dialog.querySelector('canvas'), ctx = canvas.getContext('2d');
  const overlay = dialog.querySelector('.game-overlay'), title = dialog.querySelector('.game-message');
  const note = dialog.querySelector('.game-message-copy'), start = dialog.querySelector('.game-start');
  const pause = dialog.querySelector('.game-pause'), scoreEl = dialog.querySelector('.game-score');
  const remainingEl = dialog.querySelector('.game-remaining'), announcement = dialog.querySelector('.game-announcement');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const W = 800, H = 520, colors = ['#3189b5', '#ed5035', '#f4ce48'], ink = '#151613', paper = '#ece9e1';
  let state = 'ready', cleared = 0, lives = 1, bricks = [], particles = [], trail = [];
  let paddle = { x: 348, width: 104 }, ball = { x: 400, y: 464, vx: 0, vy: 0, r: 8 };
  let keys = new Set(), frame = 0, last = 0, bank = 0, squish = 0, winTime = 0;
  let runStarted = null, runFinished = null;
  const elapsedMs = () => runStarted === null ? 0 : Math.max(0, Math.round((runFinished ?? performance.now()) - runStarted));
  const formatTime = ms => (ms / 1000).toFixed(2) + 's';
  const logo = new Image(); logo.src = 'assets/svg/obskura-logo-standard.svg';
  logo.addEventListener('load', () => { if (state !== 'playing') render(); });
  function hud() {
    dialog.dataset.gameState = state;
    scoreEl.textContent = formatTime(elapsedMs());
    remainingEl.textContent = String(bricks.length - cleared).padStart(2, '0');
    pause.disabled = !['playing', 'paused'].includes(state);
    pause.textContent = state === 'paused' ? 'Resume ▷' : 'Pause Ⅱ';
  }
  function message(heading, copy, label) {
    title.textContent = heading; note.textContent = copy; start.textContent = label;
    overlay.hidden = false; announcement.textContent = heading + ' ' + copy; hud();
  }
  function reset() {
    cleared = 0; lives = 1; runStarted = null; runFinished = null;
    particles = []; trail = []; paddle.x = (W - paddle.width) / 2; bricks = [];
    for (let row = 0; row < 6; row++) for (let col = 0; col < 10; col++) {
      if ((row === 0 || row === 5) && (col === 0 || col === 9)) continue;
      bricks.push({ x: 43 + col * 72, y: 72 + row * 34, w: 66, h: 25, color: colors[col < 3 ? 0 : col < 7 ? 1 : 2], alive: true });
    }
    ball = { x: 400, y: H - 56, vx: 0, vy: 0, r: 8 };
    squish = 0; bank = 0; winTime = 0; state = 'ready';
    message('You thought we had a myspace??', 'Nope. One life. Clear all 56 bricks as fast as you can. Lower time wins.', 'Let’s play ↗'); render();
  }
  function launch() {
    runStarted = performance.now(); runFinished = null;
    state = 'playing'; overlay.hidden = true; trail = []; bank = 0;
    ball.x = paddle.x + paddle.width / 2; ball.y = H - 56;
    ball.vx = 115; ball.vy = -325;
    hud(); canvas.focus({ preventScroll: true }); schedule();
  }
  function action() {
    if (state === 'paused') { state = 'playing'; overlay.hidden = true; hud(); last = 0; schedule(); }
    else { if (['won', 'lost'].includes(state)) reset(); launch(); }
  }
  function stop() { cancelAnimationFrame(frame); frame = 0; last = 0; bank = 0; keys.clear(); }
  function pauseGame() {
    if (state !== 'playing') return;
    stop(); state = 'paused'; message('Take five.', 'Your ball stays here. The clock keeps running.', 'Keep going ▷'); render(); schedule();
  }
  function burst(brick) {
    if (reduced.matches) return;
    for (let i = 0; i < 12; i++) particles.push({ x: brick.x + Math.random() * brick.w, y: brick.y + brick.h / 2, vx: (Math.random() - .5) * 190, vy: -50 - Math.random() * 100, life: .7, color: brick.color, r: 1.5 + Math.random() * 2 });
  }
  function step(dt) {
    if (keys.has('ArrowLeft') || keys.has('a')) paddle.x -= 540 * dt;
    if (keys.has('ArrowRight') || keys.has('d')) paddle.x += 540 * dt;
    paddle.x = Math.max(0, Math.min(W - paddle.width, paddle.x));
    const ox = ball.x, oy = ball.y;
    ball.x += ball.vx * dt; ball.y += ball.vy * dt;
    if (ball.x < ball.r) { ball.x = ball.r; ball.vx = Math.abs(ball.vx); }
    if (ball.x > W - ball.r) { ball.x = W - ball.r; ball.vx = -Math.abs(ball.vx); }
    if (ball.y < ball.r) { ball.y = ball.r; ball.vy = Math.abs(ball.vy); }
    const py = H - 40;
    if (ball.vy > 0 && oy + ball.r <= py && ball.y + ball.r >= py && ball.x >= paddle.x - ball.r && ball.x <= paddle.x + paddle.width + ball.r) {
      const offset = Math.max(-1, Math.min(1, (ball.x - paddle.x - paddle.width / 2) / (paddle.width / 2)));
      const angle = offset * Math.PI / 3, speed = Math.min(455, Math.hypot(ball.vx, ball.vy) + 3);
      ball.vx = Math.sin(angle) * speed; ball.vy = -Math.cos(angle) * speed; ball.y = py - ball.r;
      squish = reduced.matches ? 0 : 1;
    }
    for (const b of bricks) {
      if (!b.alive) continue;
      const nx = Math.max(b.x, Math.min(b.x + b.w, ball.x)), ny = Math.max(b.y, Math.min(b.y + b.h, ball.y));
      if ((ball.x - nx) ** 2 + (ball.y - ny) ** 2 > ball.r ** 2) continue;
      b.alive = false; cleared++; burst(b); hud();
      if (oy + ball.r <= b.y) { ball.y = b.y - ball.r; ball.vy = -Math.abs(ball.vy); }
      else if (oy - ball.r >= b.y + b.h) { ball.y = b.y + b.h + ball.r; ball.vy = Math.abs(ball.vy); }
      else if (ox < b.x) { ball.x = b.x - ball.r; ball.vx = -Math.abs(ball.vx); }
      else { ball.x = b.x + b.w + ball.r; ball.vx = Math.abs(ball.vx); }
      if (!bricks.some(b => b.alive)) {
        runFinished = performance.now(); state = 'won'; winTime = 0; overlay.hidden = true; hud();
        announcement.textContent = 'That’s a wrap. All 56 bricks in ' + formatTime(elapsedMs()) + '.';
        // Integration hook for Firebase: only completed boards produce a result.
        dialog.dispatchEvent(new CustomEvent('afterhours:complete', { bubbles: true, detail: { elapsedMs: elapsedMs(), bricks: bricks.length, mode: 'one-life-time', version: 2 } }));
      }
      break;
    }
    if (state === 'playing' && ball.y - ball.r > H) {
      lives = 0; runFinished = performance.now(); trail = []; state = 'lost';
      message('One more take?', 'One life. All 56 bricks to qualify. Give it another go.', 'Try again ↗');
    }
    squish = Math.max(0, squish - dt * 7);
  }
  function render() {
    ctx.clearRect(0, 0, W, H); ctx.fillStyle = paper; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#15161310';
    for (let x = 8; x < W; x += 12) for (let y = 8; y < H; y += 12) { ctx.beginPath(); ctx.arc(x, y, .65, 0, Math.PI * 2); ctx.fill(); }
    for (const b of bricks) if (b.alive) {
      ctx.fillStyle = b.color; ctx.fillRect(b.x, b.y, b.w, b.h); ctx.fillStyle = '#15161332';
      for (let x = b.x + 5; x < b.x + b.w; x += 8) for (let y = b.y + 5; y < b.y + b.h; y += 8) { ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill(); }
    }
    for (const p of particles) { ctx.globalAlpha = Math.max(0, p.life / .7); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); } ctx.globalAlpha = 1;
    if (state === 'won') {
      const ease = 1 - Math.pow(1 - Math.min(1, winTime / 1.15), 3), cx = 400, cy = 320;
      if (!reduced.matches) for (let i = 0; i < 45; i++) {
        const a = i * 2.39996, from = 300 + (i % 4) * 50, to = 72 + (i % 3) * 9, radius = from + (to - from) * ease;
        ctx.globalAlpha = (1 - ease) * .8; ctx.fillStyle = colors[i % 3]; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius, 3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = ease;
      if (logo.complete && logo.naturalWidth) ctx.drawImage(logo, cx - 86, cy - 86, 172, 172);
      ctx.globalAlpha = 1; return;
    }
    if (!reduced.matches) trail.forEach((p, i) => { ctx.globalAlpha = i / trail.length * .13; ctx.fillStyle = colors[1]; ctx.beginPath(); ctx.arc(p.x, p.y, ball.r * i / trail.length, 0, Math.PI * 2); ctx.fill(); });
    ctx.globalAlpha = 1; ctx.fillStyle = ink;
    ctx.fillRect(paddle.x - squish * 3, H - 40 + squish * 2, paddle.width + squish * 6, 9 - squish * 2);
    if (state !== 'lost') { ctx.fillStyle = colors[1]; ctx.beginPath(); ctx.ellipse(ball.x, ball.y, ball.r * (1 + squish * .2), ball.r * (1 - squish * .2), 0, 0, Math.PI * 2); ctx.fill(); }
  }
  function tick(now) {
    frame = 0; if (!dialog.open || document.hidden) return;
    const dt = last ? Math.min(.05, (now - last) / 1000) : 0; last = now;
    if (state === 'playing') {
      bank += dt;
      while (bank >= 1 / 120 && state === 'playing') { step(1 / 120); bank -= 1 / 120; }
      if (!reduced.matches) { trail.push({ x: ball.x, y: ball.y }); if (trail.length > 8) trail.shift(); }
    }
    particles.forEach(p => { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 260 * dt; }); particles = particles.filter(p => p.life > 0);
    if (state === 'won') { winTime += dt; if (winTime > 1.35 && overlay.hidden) message('That’s a wrap.', 'All 56 bricks in ' + formatTime(elapsedMs()) + '. Lower time wins.', 'Another round ↗'); }
    hud(); render();
    if (['playing', 'paused'].includes(state) || particles.length || (state === 'won' && winTime < 1.5)) schedule();
  }
  function schedule() { if (!frame && dialog.open) frame = requestAnimationFrame(tick); }
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); render();
  }
  function movePointer(e) {
    const rect = canvas.getBoundingClientRect();
    paddle.x = Math.max(0, Math.min(W - paddle.width, (e.clientX - rect.left) / rect.width * W - paddle.width / 2));
    if (state === 'ready') { ball.x = paddle.x + paddle.width / 2; render(); }
  }
  canvas.addEventListener('pointermove', movePointer);
  canvas.addEventListener('pointerdown', e => { canvas.setPointerCapture(e.pointerId); movePointer(e); });
  dialog.addEventListener('keydown', e => {
    if (['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(e.key)) { e.preventDefault(); keys.add(e.key); }
    if ((e.code === 'Space' || e.key === 'Enter') && e.target === canvas) { e.preventDefault(); if (state !== 'playing') action(); }
    if (e.key.toLowerCase() === 'p' && !e.repeat) { e.preventDefault(); state === 'playing' ? pauseGame() : state === 'paused' ? action() : null; }
  });
  dialog.addEventListener('keyup', e => keys.delete(e.key));
  window.addEventListener('blur', () => { keys.clear(); pauseGame(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseGame(); else if (state === 'paused') { last = 0; schedule(); } });
  start.addEventListener('click', action); pause.addEventListener('click', () => state === 'playing' ? pauseGame() : action());
  dialog.addEventListener('close', stop);
  dialog.addEventListener('afterhours:open', () => { stop(); resize(); reset(); start.focus(); });
  new ResizeObserver(resize).observe(canvas);
  document.querySelector('.myspace-easter-egg').addEventListener('click', e => { e.preventDefault(); document.dispatchEvent(new Event('obskura:afterhours')); });
  reset();
})();
