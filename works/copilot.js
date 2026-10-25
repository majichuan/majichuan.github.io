(() => {
  const bar = document.querySelector('.chapter-bar');
  const header = document.querySelector('.site-header');
  if (!bar || !header) return;

  const links = [...bar.querySelectorAll('a[href^="#"]')];
  const chapters = links.map(link => document.getElementById(link.hash.slice(1)));
  const root = document.documentElement;
  let queued = false;
  let measuredHeight = 0;

  // Reading progress changes only the highlight, never the scroll position.
  const updateCurrent = () => {
    const readingLine = header.getBoundingClientRect().height + bar.getBoundingClientRect().height + 24;
    let active = chapters[0];
    chapters.forEach(chapter => {
      if (chapter && chapter.getBoundingClientRect().top <= readingLine) active = chapter;
    });
    links.forEach(link => {
      if (link.hash === '#' + active?.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  const scheduleUpdate = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; updateCurrent(); });
  };
  const measureBar = () => {
    const height = bar.getBoundingClientRect().height;
    if (height > 0 && height !== measuredHeight) {
      measuredHeight = height;
      root.style.setProperty('--chapter-nav-height', height + 'px');
    }
    scheduleUpdate();
  };

  measureBar();
  if ('ResizeObserver' in window) new ResizeObserver(measureBar).observe(bar);
  window.addEventListener('resize', measureBar);
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('hashchange', scheduleUpdate);
  window.addEventListener('pageshow', scheduleUpdate);
})();
