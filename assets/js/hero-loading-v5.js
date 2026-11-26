(() => {
  const root=document.documentElement;
  root.classList.add('hero-loading','hero-title-waiting','hero-enhanced');
  let timeout,progress=0,target=0,progressFrame=0;
  const paint=()=>{const el=document.querySelector('#reel-loader-percent');if(el)el.textContent=String(Math.floor(progress)).padStart(3,'0');};
  const step=()=>{progressFrame=0;progress=Math.min(target,progress+Math.max(.4,(target-progress)*.14));paint();if(progress<target)progressFrame=requestAnimationFrame(step);};
  // Percentage reflects player readiness milestones, rather than full-reel download bytes.
  const setProgress=value=>{target=Math.max(target,Math.min(100,value));if(!progressFrame)progressFrame=requestAnimationFrame(step);};
  const parsed=new MutationObserver(()=>{if(document.querySelector('#reel-loader-percent')){setProgress(20);paint();parsed.disconnect();}});
  parsed.observe(root,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',()=>{setProgress(35);document.fonts.ready.then(()=>setProgress(45));},{once:true});
  const release=()=>{
    root.classList.remove('hero-loading');
    const loader=document.querySelector('#reel-loader');
    if(loader){loader.setAttribute('aria-hidden','true');loader.inert=true;}
    clearTimeout(timeout);
    setTimeout(()=>root.classList.add('hero-nav-visible'),450);
  };
  window.obskuraHeroLoading={playingAt:null,fallback:false,progress:setProgress,
    playing(){
      if(this.playingAt!==null)return;
      this.playingAt=performance.now();cancelAnimationFrame(progressFrame);progressFrame=0;progress=target=100;paint();release();
      document.dispatchEvent(new CustomEvent('obskura:hero-playing',{detail:{startedAt:this.playingAt}}));
    },
    skip(){
      this.fallback=true;cancelAnimationFrame(progressFrame);progressFrame=0;release();root.classList.remove('hero-title-waiting');root.classList.add('hero-title-started');
      document.dispatchEvent(new Event('obskura:hero-unavailable'));
    }
  };
  // Keep the page usable if the video service is slow, blocked, or unavailable.
  timeout=setTimeout(()=>window.obskuraHeroLoading.skip(),15000);
  document.addEventListener('click',e=>{if(e.target.closest('[data-skip-reel]'))window.obskuraHeroLoading.skip();});
})();
