const menuToggle = document.querySelector('[data-menu-toggle]');
const navigation = document.querySelector('[data-nav]');
const header = document.querySelector('[data-header]');
const revealItems = document.querySelectorAll('[data-reveal]');
const navLinks = [...document.querySelectorAll('[data-nav] a[href^="#"]')];
const contactTriggers = [...document.querySelectorAll('[data-contact-trigger]')];
const motionRegions = [...document.querySelectorAll('[data-motion-region]')];
const typewriter = document.querySelector('[data-typewriter]');
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

document.documentElement.classList.add('js-ready');

function setContactBubble(name = null) {
  contactTriggers.forEach((trigger) => {
    const active = trigger.dataset.contactTrigger === name;
    trigger.setAttribute('aria-expanded', String(active));
    document.getElementById(trigger.getAttribute('aria-controls'))?.classList.toggle('is-visible', active);
  });
}

function setMenu(open) {
  if (!menuToggle || !navigation) return;

  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.querySelector('.sr-only').textContent = open ? '关闭导航' : '打开导航';
  navigation.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
  navigation.inert = !open && window.innerWidth <= 720;
}

setMenu(false);

menuToggle?.addEventListener('click', () => {
  setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
});

navigation?.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    setMenu(false);
    setContactBubble();
  }
});

contactTriggers.forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.stopPropagation();
    const name = trigger.dataset.contactTrigger;
    const open = trigger.getAttribute('aria-expanded') === 'true';
    setContactBubble(open ? null : name);
  });
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.contact-option')) setContactBubble();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    setMenu(false);
    setContactBubble();
  }
});

window.addEventListener('resize', () => {
  const menuOpen = menuToggle?.getAttribute('aria-expanded') === 'true';
  setMenu(window.innerWidth <= 720 && menuOpen);
  setContactBubble();
});

function updateHeader() {
  header?.classList.toggle('is-scrolled', window.scrollY > 12);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const typewriterText = typewriter?.textContent.trim() ?? '';
const typewriterSpeed = Number(typewriter?.dataset.typeSpeed ?? 60);
const typewriterHold = Number(typewriter?.dataset.typeHold ?? 3000);
const typewriterGap = Number(typewriter?.dataset.typeGap ?? 250);
const motionVisibility = new Map();
let typewriterIndex = 0;
let typewriterTimer = null;
let typewriterVisible = false;

function stopTypewriter() {
  if (typewriterTimer !== null) {
    window.clearTimeout(typewriterTimer);
    typewriterTimer = null;
  }
}

function scheduleTypewriter(delay = typewriterSpeed) {
  stopTypewriter();
  if (!typewriter || prefersReducedMotion || !typewriterVisible || document.visibilityState !== 'visible') return;

  typewriterTimer = window.setTimeout(() => {
    typewriterTimer = null;
    if (!typewriterVisible || document.visibilityState !== 'visible') return;

    if (typewriterIndex < typewriterText.length) {
      typewriterIndex += 1;
      typewriter.textContent = typewriterText.slice(0, typewriterIndex);
      scheduleTypewriter(typewriterSpeed);
      return;
    }

    typewriterTimer = window.setTimeout(() => {
      typewriterTimer = null;
      if (!typewriterVisible || document.visibilityState !== 'visible') return;
      typewriter.textContent = '';
      typewriterIndex = 0;
      scheduleTypewriter(typewriterGap);
    }, typewriterHold);
  }, delay);
}

function setMotionState(region, inView) {
  motionVisibility.set(region, inView);
  const active = inView && document.visibilityState === 'visible' && !prefersReducedMotion;
  region.classList.toggle('is-motion-active', active);

  if (!region.querySelector('[data-typewriter]')) return;
  typewriterVisible = active;
  if (active) {
    if (typewriterIndex === 0) typewriter.textContent = '';
    scheduleTypewriter();
  } else {
    stopTypewriter();
  }
}

if (prefersReducedMotion) {
  if (typewriter) typewriter.textContent = typewriterText;
} else if ('IntersectionObserver' in window) {
  const motionObserver = new IntersectionObserver(
    (entries) => entries.forEach((entry) => setMotionState(entry.target, entry.isIntersecting)),
    { threshold: 0.15 },
  );
  motionRegions.forEach((region) => motionObserver.observe(region));
} else {
  motionRegions.forEach((region) => setMotionState(region, true));
}

document.addEventListener('visibilitychange', () => {
  motionRegions.forEach((region) => setMotionState(region, motionVisibility.get(region) ?? false));
});

if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

if ('IntersectionObserver' in window && sections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      navLinks.forEach((link) => {
        const isCurrent = link.getAttribute('href') === `#${visible.target.id}`;
        link.classList.toggle('is-active', isCurrent);
        if (isCurrent) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    },
    { rootMargin: '-18% 0px -68% 0px', threshold: [0.01, 0.2, 0.5] },
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

document.querySelectorAll('[data-year]').forEach((item) => {
  item.textContent = String(new Date().getFullYear());
});
