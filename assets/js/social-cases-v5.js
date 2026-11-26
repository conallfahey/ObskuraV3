(() => {
  const player=document.querySelector('#case-video-dialog'),video=player.querySelector('video');
  const dialogs=[...document.querySelectorAll('dialog')];
  const open=dialog=>{dialog.showModal();document.body.style.overflow='hidden';};
  dialogs.forEach(dialog=>{
    dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('close',()=>{document.body.style.overflow='';if(dialog===player){video.pause();video.removeAttribute('src');video.load();}});
    dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close();});
  });
  document.querySelectorAll('[data-post]').forEach(button=>button.addEventListener('click',()=>{
    const post=window.obskuraCasePosts[button.dataset.post];document.querySelector('#case-video-title').textContent=post.title;
    video.src=post.src;video.poster=post.poster;video.setAttribute('aria-label',post.title);open(player);video.play().catch(()=>{});
  }));
  document.addEventListener('obskura:afterhours',()=>{const game=document.querySelector('#after-hours');if(!game.open){open(game);game.dispatchEvent(new Event('afterhours:open'));}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();});
  const footer=document.querySelector('.poster-footer');footer.querySelectorAll('.poster-faces>img').forEach((img,i)=>img.style.setProperty('--face-index',i));
  const footerObserver=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){footer.classList.add('footer-entered');footerObserver.disconnect();}},{threshold:.1});footerObserver.observe(footer);
  document.documentElement.classList.add('motion-ready');document.querySelector('#year').textContent=new Date().getFullYear();
})();
