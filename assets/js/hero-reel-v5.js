(() => {
  const hero=document.querySelector('.hero-fullbleed'),frame=hero.querySelector('.hero-reel iframe');
  // Cover the hero with the 16:9 reel, including narrow mobile viewports.
  const size=()=>{const width=hero.clientWidth,height=hero.clientHeight,scale=Math.max(width/16,height/9);frame.style.width=(16*scale)+'px';frame.style.height=(9*scale)+'px';};
  new ResizeObserver(size).observe(hero);size();
  const connect=()=>{
    const player=new Vimeo.Player(frame);
    window.obskuraHeroLoading?.progress(50);
    player.on('loaded',()=>window.obskuraHeroLoading?.progress(80));
    player.on('bufferend',()=>window.obskuraHeroLoading?.progress(90));
    player.on('playing',()=>window.obskuraHeroLoading?.playing());
    // Autoplay can start before the SDK arrives, so don't rely on catching one event.
    const confirmPlayback=()=>Promise.all([player.getPaused(),player.getCurrentTime()]).then(([paused,seconds])=>{
      if(!paused&&seconds>0)window.obskuraHeroLoading?.playing(seconds);
    }).catch(()=>{});
    player.on('timeupdate',()=>{
      if(window.obskuraHeroLoading?.playingAt===null&&!window.obskuraHeroLoading?.fallback)confirmPlayback();
    });
    player.on('error',()=>window.obskuraHeroLoading?.skip());
    let visible=true;
    const sync=()=>{
      const paused=document.documentElement.classList.contains('motion-paused')||document.hidden||!visible||document.querySelector('dialog[open]:not(#mobile-menu)');
      (paused?player.pause():player.play()).catch(()=>{});
    };
    player.ready().then(()=>{
      window.obskuraHeroLoading?.progress(65);
      player.setVolume(0).catch(()=>{});
      if(matchMedia('(prefers-reduced-motion: reduce)').matches)window.obskuraHeroLoading?.skip();
      confirmPlayback();sync();
    }).catch(()=>window.obskuraHeroLoading?.skip());
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.12}).observe(hero);
    new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
    document.querySelectorAll('dialog:not(#mobile-menu)').forEach(dialog=>new MutationObserver(sync).observe(dialog,{attributes:true,attributeFilter:['open']}));
    document.addEventListener('visibilitychange',sync);
  };
  const sdk=document.querySelector('#hero-vimeo-sdk');
  if(window.Vimeo)connect();
  else if(!sdk||sdk.dataset.failed==='true')window.obskuraHeroLoading?.skip();
  else{
    sdk.addEventListener('load',connect,{once:true});
    sdk.addEventListener('error',()=>window.obskuraHeroLoading?.skip(),{once:true});
  }
})();
