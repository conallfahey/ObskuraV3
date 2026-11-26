(() => {
  const arrow=document.querySelector('.hero-scroll');
  if(!arrow)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const reel=document.querySelector('.hero-watch-reel');
  let timer,reelTimer;
  const reveal=()=>arrow.classList.add('is-visible');
  const schedule=()=>{if(timer||arrow.classList.contains('is-visible'))return;timer=setTimeout(reveal,reduced.matches?0:2000);reelTimer=setTimeout(()=>reel?.classList.add('is-visible'),reduced.matches?0:3000);};
  document.addEventListener('obskura:hero-title-finished',schedule,{once:true});
  document.addEventListener('obskura:hero-unavailable',schedule,{once:true});
  if(window.obskuraHeroTitleFinished||window.obskuraHeroLoading?.fallback)schedule();
  reduced.addEventListener('change',e=>{if(e.matches){clearTimeout(timer);clearTimeout(reelTimer);reveal();reel?.classList.add('is-visible');}});
})();
