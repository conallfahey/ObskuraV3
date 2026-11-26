(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const title = document.querySelector('.wordmark') || document.querySelector('.works-heading h1');
  const bar = document.querySelector('.wordmark-colorblocks, .works-strip');
  if (!title || reduced.matches) return;
  title.classList.add('load-title');
  const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT, {
    acceptNode: node => node.textContent.trim() && !node.parentElement.closest('sup, .wordmark-colorblocks') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
  });
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  const lines = nodes.map(node => {
    const line = document.createElement('b'); line.className = 'load-type-line';
    node.replaceWith(line); line.append(node); line.style.clipPath = 'inset(-0.2em 100% -0.2em 0)'; return line;
  });
  const animations = [];
  let announced=false;
  const announceFinished=()=>{
    if(!title.closest('.hero-fullbleed')||announced)return;
    announced=true;window.obskuraHeroTitleFinished=true;
    document.dispatchEvent(new Event('obskura:hero-title-finished'));
  };
  const finish = () => {
    animations.forEach(animation => animation.cancel());
    lines.forEach(line => line.style.clipPath = 'none');
    bar?.classList.remove('load-bar');
    if(title.closest('.hero-fullbleed'))document.documentElement.classList.add('hero-title-started');
    announceFinished();
  };
  reduced.addEventListener('change', e => { if (e.matches) finish(); });
  const hero=title.closest('.hero-fullbleed');
  const waitForHero=()=>new Promise(resolve=>{
    if(!hero)return resolve();
    let timer;
    const fallback=()=>{clearTimeout(timer);finish();resolve(false);};
    const playing=()=>{
      const start=window.obskuraHeroLoading?.playingAt??performance.now();
      timer=setTimeout(()=>resolve(true),Math.max(0,3200-(performance.now()-start)));
    };
    document.addEventListener('obskura:hero-unavailable',fallback,{once:true});
    if(window.obskuraHeroLoading?.fallback)return fallback();
    if(window.obskuraHeroLoading?.playingAt!=null)playing();
    else document.addEventListener('obskura:hero-playing',playing,{once:true});
  });
  Promise.all([document.fonts.ready,waitForHero()]).then(([,animate]) => {
    document.documentElement.classList.remove('hero-title-waiting');
    if(animate===false)return;
    if (reduced.matches || document.documentElement.classList.contains('motion-paused')) { finish(); return; }
    let delay = hero ? 0 : 140;
    lines.forEach(line => {
      // The italic work title enters as one word; the first line still types on.
      if (line.closest('.works-heading .serif')) {
        line.style.clipPath = 'none';
        const animation = line.animate([
          { opacity: 0, transform: 'translateY(.18em)', clipPath: 'inset(0 0 100% 0)' },
          { opacity: 1, transform: 'translateY(0)', clipPath: 'inset(-0.2em 0 -0.2em 0)' }
        ], { duration: 750, delay, easing: 'cubic-bezier(.19,1,.22,1)', fill: 'both' });
        animations.push(animation); animation.onfinish = () => animation.cancel();
        delay += 820;
        return;
      }
      const text = line.firstChild, count = text.length, width = line.getBoundingClientRect().width;
      const range = document.createRange();
      const frames = [{ clipPath: 'inset(-0.2em 100% -0.2em 0)', offset: 0, easing: 'steps(1, end)' }];
      for (let i = 1; i <= count; i++) {
        range.setStart(text, 0); range.setEnd(text, i);
        const right = i === count ? 0 : Math.max(0, 100 - (range.getBoundingClientRect().width + 2) / width * 100);
        frames.push({ clipPath: `inset(-0.2em ${right}% -0.2em 0)`, offset: i / count, easing: 'steps(1, end)' });
      }
      const duration = count * 85;
      const animation = line.animate(frames, { duration, delay, easing: 'linear', fill: 'both' });
      animations.push(animation); animation.onfinish = () => { line.style.clipPath = 'none'; animation.cancel(); };
      delay += duration + 70;
    });
    bar?.classList.add('load-bar');
    if(hero)document.documentElement.classList.add('hero-title-started');
    const group=[...animations,...(bar?.getAnimations({subtree:true})||[])];
    Promise.all(group.map(animation=>animation.finished.catch(()=>{}))).then(announceFinished);
  });
  document.querySelector('.motion-toggle')?.addEventListener('click', () => {
    if (document.documentElement.classList.contains('motion-paused')) finish();
  });
})();
