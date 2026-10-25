(() => {
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const closeMenu = () => { if (!menu || !nav) return; nav.classList.remove('is-open'); menu.setAttribute('aria-expanded','false'); menu.textContent='菜单'; };
  menu?.addEventListener('click', () => { const open=menu.getAttribute('aria-expanded')!=='true'; menu.setAttribute('aria-expanded',String(open)); menu.textContent=open?'关闭':'菜单'; nav.classList.toggle('is-open',open); });
  nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  const contactButtons=[...document.querySelectorAll('[data-contact]')];
  const closeContacts=()=>contactButtons.forEach(button=>{button.setAttribute('aria-expanded','false');document.getElementById(button.getAttribute('aria-controls')).hidden=true;});
  contactButtons.forEach(button=>button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')!=='true';closeContacts();button.setAttribute('aria-expanded',String(open));document.getElementById(button.getAttribute('aria-controls')).hidden=!open;}));
  document.addEventListener('click',event=>{if(!event.target.closest('.contact-actions'))closeContacts();if(menu&&!event.target.closest('.site-header'))closeMenu();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){const expanded=document.querySelector('[data-contact][aria-expanded=true]');closeContacts();if(expanded)expanded.focus();if(menu?.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}}});
  const sections=[...document.querySelectorAll('main>section[id]')];
  if(nav&&sections.length){const update=()=>{let active=sections[0].id;for(const section of sections){if(section.getBoundingClientRect().top<180)active=section.id;}nav.querySelectorAll('a').forEach(a=>{if(a.hash==='#'+active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});};let queued=false;window.addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(()=>{update();queued=false;});}},{passive:true});update();}
  const typing=document.querySelector('.typing-visual');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let timer;let index=0;let visible=false;let full='';
  const stop=()=>clearTimeout(timer);
  const tick=()=>{if(!typing||!visible||document.hidden||reduce.matches)return;index++;typing.textContent=full.slice(0,index);if(index>=full.length){timer=setTimeout(()=>{typing.textContent='';index=0;timer=setTimeout(tick,250);},3000);}else timer=setTimeout(tick,60);};
  const sync=()=>{stop();if(!typing)return;if(reduce.matches){typing.textContent=full;return;}if(visible&&!document.hidden){index=0;typing.textContent='';tick();}};
  if(typing){full=typing.textContent;const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.2});observer.observe(typing);reduce.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);}
  const signal=document.querySelector('.signal');
  if(signal){let inView=false;const syncSignal=()=>signal.classList.toggle('is-playing',inView&&!document.hidden&&!reduce.matches);new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;syncSignal();}).observe(signal);document.addEventListener('visibilitychange',syncSignal);reduce.addEventListener('change',syncSignal);}
})();
