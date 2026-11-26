/* The current site's TweenMax menu choreography, with native-dialog accessibility. */
(() => {
  const dialog = document.querySelector('#mobile-menu');
  const toggle = document.querySelector('.menu-toggle');
  if (!dialog || !toggle) return;
  const menu = dialog.querySelector('.menuUzi');
  const closeButton = menu.querySelector('.action--close');
  const panels = [...menu.querySelectorAll('.menuUzi__item')];
  const links = menu.querySelectorAll('.mainmenuUzi > a.mainmenuUzi__item');
  const sideLinks = menu.querySelectorAll('.sidemenuUzi span.sidemenuUzi__item-inner');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let closing = false, previousOverflow = '';
  const animate = opening => {
    const duration = reduced.matches ? 0 : opening ? .9 : .6;
    menu.classList.toggle('menuUzi--open', opening);
    panels.forEach(panel => {
      const inner = panel.querySelector('.menuUzi__item-inner');
      const direction = panel.dataset.direction;
      const outerStart = {}, innerStart = {};
      if (direction === 'bt') { outerStart.y = '101%'; innerStart.y = '-101%'; innerStart.x = '0%'; }
      else if (direction === 'tb') { outerStart.y = '-101%'; innerStart.y = '101%'; innerStart.x = '0%'; }
      else if (direction === 'lr') { outerStart.x = '-101%'; innerStart.x = '101%'; }
      else if (direction === 'rl') { outerStart.x = '101%'; innerStart.x = '-101%'; }
      if (opening) {
        TweenMax.set(panel, outerStart);
        TweenMax.set(inner, innerStart);
        TweenMax.to([panel, inner], duration, { ease: Quint.easeOut, x: '0%', y: '0%' });
      } else {
        TweenMax.to(panel, duration, { ease: Quart.easeInOut, x: outerStart.x || 0, y: outerStart.y || 0 });
        TweenMax.to(inner, duration, { ease: Quart.easeInOut, x: innerStart.x || 0, y: innerStart.y || 0 });
      }
    });
    TweenMax.to(closeButton, reduced.matches ? 0 : .6, {
      delay: reduced.matches ? 0 : opening ? .7 : .1,
      ease: opening ? Quint.easeOut : Quart.easeInOut,
      startAt: opening ? { rotation: 0 } : null,
      opacity: opening ? 1 : 0, rotation: opening ? 180 : 270
    });
    TweenMax.staggerTo(links, reduced.matches ? 0 : opening ? .9 : .2, {
      ease: opening ? Quint.easeOut : Quart.easeInOut,
      startAt: opening ? { y: '50%', opacity: 0 } : null,
      y: opening ? '0%' : '50%', opacity: opening ? 1 : 0
    }, reduced.matches ? 0 : opening ? .1 : -.1);
    TweenMax.staggerTo(sideLinks, reduced.matches ? 0 : opening ? .5 : .2, {
      ease: opening ? Quint.easeInOut : Quart.easeInOut,
      startAt: opening ? { y: '100%' } : null,
      y: opening ? '0%' : '100%'
    }, reduced.matches ? 0 : opening ? .05 : -.05);
  };
  const close = () => {
    if (!dialog.open || closing) return;
    closing = true;
    animate(false);
    TweenMax.delayedCall(reduced.matches ? 0 : .72, () => dialog.close());
  };
  toggle.addEventListener('click', event => {
    event.preventDefault();
    if (dialog.open) return close();
    closing = false;
    previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    toggle.setAttribute('aria-expanded', 'true');
    animate(true);
  });
  dialog.addEventListener('click', event => {
    if (event.target.closest('[data-close]')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      close();
    } else if (event.target.closest('a')) {
      event.stopPropagation();
      close();
    }
  }, true);
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  dialog.addEventListener('close', () => {
    closing = false;
    menu.classList.remove('menuUzi--open');
    toggle.setAttribute('aria-expanded', 'false');
    queueMicrotask(() => {
      document.body.style.overflow = previousOverflow;
    });
  });
})();
