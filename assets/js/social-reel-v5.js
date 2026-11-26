(() => {
  const reel = document.querySelector('[data-social-reel]');
  const clips = window.obskuraSocialClips;
  if (!reel || !clips?.length) return;
  const find = selector => reel.querySelector(selector);
  const video = find('video');
  const stage = find('.social-reel-stage');
  const phone = find('.social-reel-phone');
  const select = find('#social-clip-select');
  const toggle = find('#social-reel-toggle');
  const sound = find('#social-reel-sound');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0, running = !reduced.matches, visible = false, loadedIndex = -1;
  let start = null, wheelDistance = 0, lastWheel = 0, wheelReset;

  stage.tabIndex = 0;
  stage.setAttribute('role', 'group');
  stage.setAttribute('aria-label', 'Featured social videos. Swipe or use the left and right arrow keys.');
  find('.social-reel-caption').setAttribute('aria-live', 'polite');
  video.muted = true;
  const updateToggle = () => { toggle.textContent = running ? 'Pause reel' : 'Play reel'; };
  const sync = () => {
    if (visible && loadedIndex !== index) {
      video.src = `assets/socials/videos/${clips[index].id}.mp4`;
      loadedIndex = index;
    }
    const paused = !running || !visible || document.hidden
      || document.documentElement.classList.contains('motion-paused')
      || document.querySelector('dialog[open]:not(#mobile-menu)');
    if (paused) video.pause();
    else video.play().catch(() => {});
  };
  const show = (next, direction = 0) => {
    index = (next + clips.length) % clips.length;
    const clip = clips[index];
    video.pause();
    video.poster = `assets/socials/videos/posters/${clip.id}.jpg`;
    video.setAttribute('aria-label', `${clip.festival} — ${clip.title}`);
    find('#social-reel-festival').textContent = clip.festival;
    find('#social-reel-title').textContent = clip.title;
    find('#social-reel-views').textContent = clip.views;
    find('.social-frame-index').textContent = `${String(index + 1).padStart(2, '0')} / ${clips.length}`;
    find('.social-ghost-left').src = `assets/socials/videos/posters/${clips[(index + clips.length - 1) % clips.length].id}.jpg`;
    find('.social-ghost-right').src = `assets/socials/videos/posters/${clips[(index + 1) % clips.length].id}.jpg`;
    if (select) select.value = index;
    if (direction && !reduced.matches) {
      phone.getAnimations().forEach(animation => animation.cancel());
      phone.animate([{ opacity: .45, transform: `translateX(${direction * 22}px) rotate(${direction * 1.5}deg)` }, { opacity: 1, transform: 'none' }], { duration: 350, easing: 'cubic-bezier(.2,.65,.3,1)' });
    }
    sync();
  };
  const step = direction => show(index + direction, direction);
  find('#social-reel-back').addEventListener('click', () => step(-1));
  find('#social-reel-next').addEventListener('click', () => step(1));
  select?.addEventListener('change', () => show(Number(select.value), 1));
  toggle.addEventListener('click', () => { running = !running; updateToggle(); sync(); });
  sound.addEventListener('click', () => {
    video.muted = !video.muted;
    sound.textContent = video.muted ? 'Sound off' : 'Sound on';
    sound.setAttribute('aria-pressed', String(!video.muted));
  });
  video.addEventListener('ended', () => { if (running && visible) step(1); });

  stage.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    start = { x: event.clientX, y: event.clientY, id: event.pointerId };
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointerup', event => {
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x, dy = event.clientY - start.y;
    start = null;
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) step(dx < 0 ? 1 : -1);
  });
  stage.addEventListener('pointercancel', () => { start = null; });
  stage.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      step(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  stage.addEventListener('wheel', event => {
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    event.preventDefault();
    clearTimeout(wheelReset);
    wheelReset = setTimeout(() => { wheelDistance = 0; }, 150);
    if (performance.now() - lastWheel < 500) return;
    wheelDistance += event.deltaX;
    if (Math.abs(wheelDistance) > 60) {
      step(wheelDistance > 0 ? 1 : -1);
      wheelDistance = 0;
      lastWheel = performance.now();
    }
  }, { passive: false });

  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: .2 }).observe(video);
  document.querySelectorAll('dialog:not(#mobile-menu)').forEach(dialog => new MutationObserver(sync).observe(dialog, { attributes: true, attributeFilter: ['open'] }));
  new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', event => { if (event.matches) { running = false; updateToggle(); sync(); } });
  updateToggle();
  show(0);
})();
