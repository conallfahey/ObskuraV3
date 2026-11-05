(() => {
  const dialogs=[...document.querySelectorAll('dialog')];
  const openDialog=dialog=>{dialog.showModal();document.body.style.overflow='hidden';};
  dialogs.forEach(dialog=>{
    dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close();});
    dialog.addEventListener('close',()=>{document.body.style.overflow='';if(dialog.id==='film-dialog')dialog.querySelector('.film-frame').replaceChildren();});
  });
  const menu=document.querySelector('#mobile-menu');document.querySelector('.menu-toggle').addEventListener('click',()=>openDialog(menu));menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.close()));
  document.addEventListener('obskura:afterhours',()=>{const game=document.querySelector('#after-hours');if(!game.open){openDialog(game);game.dispatchEvent(new Event('afterhours:open'));}});
  const filmDialog=document.querySelector('#film-dialog');
  document.querySelectorAll('[data-film]').forEach(button=>button.addEventListener('click',()=>{
    const film=window.obskuraWorkFilms[button.dataset.film];
    document.querySelector('#film-title').textContent=film.title;document.querySelector('#film-external').href=film.link;
    const frame=filmDialog.querySelector('.film-frame');frame.classList.toggle('vertical',!!film.vertical);
    const iframe=document.createElement('iframe');iframe.title=film.title;iframe.src=film.src;iframe.allow='autoplay; fullscreen; picture-in-picture';iframe.allowFullscreen=true;frame.replaceChildren(iframe);openDialog(filmDialog);
  }));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const projects=[...document.querySelectorAll('.project')];
  // Reveal each pair once, as it enters the viewport. Keyboard focus opens it immediately.
  const revealProject=el=>el.classList.add('is-visible');
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){revealProject(entry.target);observer.unobserve(entry.target);}
  }),{threshold:0,rootMargin:'0px 0px -9% 0px'});
  projects.forEach((el,index)=>{
    el.style.setProperty('--card-delay',index%2?'320ms':'0ms');
    el.addEventListener('focusin',()=>{el.classList.add('focus-revealed');revealProject(el);});
    el.classList.add('reveal');
  });
  const syncReveal=()=>{
    observer.disconnect();
    if(reduced.matches){projects.forEach(revealProject);}
    else {projects.filter(el=>!el.hidden&&!el.classList.contains('is-visible')).forEach(el=>observer.observe(el));}
  };
  document.documentElement.classList.add('motion-ready');syncReveal();
  reduced.addEventListener('change',syncReveal);
  const filterButtons=[...document.querySelectorAll('[data-work-filter]')];
  const audienceButtons=[...document.querySelectorAll('[data-audience-filter]')];
  const count=document.querySelector('.works-filter-count');
  let category='all',audience='all';
  const empty=document.createElement('div');empty.className='works-empty';empty.hidden=true;
  const emptyCopy=document.createElement('p');emptyCopy.textContent='No projects in this mix yet.';
  const resetButton=document.createElement('button');resetButton.type='button';resetButton.className='text-link';resetButton.textContent='Show all work ↗';
  empty.append(emptyCopy,resetButton);document.querySelector('.work-grid').after(empty);
  const applyFilters=()=>{
    filterButtons.forEach(item=>item.setAttribute('aria-pressed',String(item.dataset.workFilter===category)));
    audienceButtons.forEach(item=>item.setAttribute('aria-pressed',String(item.dataset.audienceFilter===audience)));
    let visible=0;
    projects.forEach(project=>{
      project.hidden=(category!=='all'&&project.dataset.category!==category)||(audience!=='all'&&project.dataset.audience!==audience);
      if(!project.hidden){
        project.style.setProperty('--card-delay',visible%2?'320ms':'0ms');
        project.style.setProperty('--card-tilt',visible%2?'5deg':'-5deg');
        visible++;
      }
    });
    count.textContent=visible+' '+(visible===1?'project':'projects');
    empty.hidden=visible!==0;syncReveal();
  };
  filterButtons.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.workFilter;applyFilters();}));
  audienceButtons.forEach(button=>button.addEventListener('click',()=>{audience=button.dataset.audienceFilter;applyFilters();}));
  resetButton.addEventListener('click',()=>{category='all';audience='all';applyFilters();filterButtons[0].focus({preventScroll:true});});
  const footer=document.querySelector('.poster-footer');footer.querySelectorAll('.poster-faces>img').forEach((img,index)=>img.style.setProperty('--face-index',index));
  const footerObserver=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){footer.classList.add('footer-entered');footerObserver.disconnect();}},{threshold:.1});footerObserver.observe(footer);
  document.querySelector('#year').textContent=new Date().getFullYear();
})();
