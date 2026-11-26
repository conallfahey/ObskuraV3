(() => {
  const dialogs=[...document.querySelectorAll('dialog')];
  const open=dialog=>{dialog.showModal();document.body.style.overflow='hidden';};
  dialogs.forEach(dialog=>{
    dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('close',()=>{document.body.style.overflow='';});
    dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close();});
  });
  document.addEventListener('obskura:afterhours',()=>{const game=document.querySelector('#after-hours');if(!game.open){open(game);game.dispatchEvent(new Event('afterhours:open'));}});
  const reveals=[...document.querySelectorAll('.social-service-grid article,.social-case-grid article,.social-audiences>div,.social-team-grid figure')];
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.06});
  reveals.forEach(el=>{el.classList.add('social-reveal');observer.observe(el);});document.body.classList.add('motion-ready');
  const footer=document.querySelector('.poster-footer');footer.querySelectorAll('.poster-faces>img').forEach((img,i)=>img.style.setProperty('--face-index',i));
  const footerObserver=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){footer.classList.add('footer-entered');footerObserver.disconnect();}},{threshold:.1});footerObserver.observe(footer);
  document.querySelector('#year').textContent=new Date().getFullYear();
})();
