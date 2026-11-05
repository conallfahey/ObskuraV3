(() => {
  const dialogs=[...document.querySelectorAll('dialog')];
  const open=dialog=>{dialog.showModal();document.body.style.overflow='hidden';};
  dialogs.forEach(dialog=>{
    dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('close',()=>document.body.style.overflow='');
    dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close();});
  });
  const menu=document.querySelector('#mobile-menu');document.querySelector('.menu-toggle').addEventListener('click',()=>open(menu));menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.close()));
  document.addEventListener('obskura:afterhours',()=>{const game=document.querySelector('#after-hours');if(!game.open){open(game);game.dispatchEvent(new Event('afterhours:open'));}});
  const members=[...document.querySelectorAll('.member')];
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.08});
  members.forEach((member,index)=>{member.style.setProperty('--member-delay',(index%4)*70+'ms');observer.observe(member);});
  const footer=document.querySelector('.poster-footer');footer.querySelectorAll('.poster-faces>img').forEach((img,index)=>img.style.setProperty('--face-index',index));
  const footerObserver=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){footer.classList.add('footer-entered');footerObserver.disconnect();}},{threshold:.1});footerObserver.observe(footer);
  document.documentElement.classList.add('motion-ready');document.querySelector('#year').textContent=new Date().getFullYear();
})();
