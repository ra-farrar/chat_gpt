/* =========================
   Debug toggle (press "D")
   ========================= */
document.addEventListener('keydown', (e) => {
  if (e.key && e.key.toLowerCase() === 'd') {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue('--debug').trim();
    document.documentElement.style.setProperty('--debug', v === '1' ? '0' : '1');
  }
});

/* =========================
   Theme handling
   ========================= */
const root = document.documentElement;
const toggle = document.getElementById('themeToggle');

const getStoredTheme = () => localStorage.getItem('theme-mode') || 'auto';

function applyTheme(mode) {
  if (mode === 'light' || mode === 'dark') {
    root.setAttribute('data-theme', mode);
  } else {
    root.setAttribute('data-theme', 'auto');
  }
  if (toggle) toggle.textContent = mode[0].toUpperCase() + mode.slice(1);
}

function cycleTheme() {
  const current = getStoredTheme();
  const next = current === 'auto' ? 'light' : current === 'light' ? 'dark' : 'auto';
  localStorage.setItem('theme-mode', next);
  applyTheme(next);
}

if (toggle) {
  toggle.addEventListener('click', cycleTheme);
  applyTheme(getStoredTheme());
}

/* =========================
   Demo mounts
   ========================= */
function mountAnimationDemo() {
  const el = document.getElementById('animationMount');
  if (!el) return;
  el.innerHTML = '';
  const dot = document.createElement('div');
  Object.assign(dot.style, {
    width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent)',
    position: 'relative', left: '0', transition: 'left 400ms linear'
  });
  el.appendChild(dot);

  let dir = 1;
  setInterval(() => {
    const max = el.clientWidth - 16;
    const current = parseFloat(dot.style.left) || 0;
    let next = current + dir * 24;
    if (next <= 0 || next >= max) dir *= -1;
    dot.style.left = Math.max(0, Math.min(max, next)) + 'px';
  }, 450);
}

function mountExperienceDemo() {
  const el = document.getElementById('experienceMount');
  if (!el) return;
  el.innerHTML = `
    <ul style="margin:0; padding-left: 18px;">
      <li>Place your experience module here</li>
      <li>Swap this list for a timeline, cards, etc.</li>
    </ul>
  `;
}

/* =========================
   Header text fitting
   ========================= */
(function fitHeader(){
  const measure = document.querySelector('#header .header-measure');
  const text = document.getElementById('headerText');
  if(!measure || !text) return;

  Object.assign(text.style, {
    whiteSpace:'nowrap',
    display:'inline-block',
    width:'auto'
  });

  const fit = ()=>{
    const maxW = measure.clientWidth;
    if(maxW <= 0) return;
    text.style.fontSize='50px';
    let lo = 6, hi = 2400;
    for(let i=0;i<22;i++){
      const mid = (lo+hi)/2;
      text.style.fontSize = mid + 'px';
      (text.scrollWidth > maxW) ? hi = mid : lo = mid;
    }
    text.style.fontSize = (lo - 0.5) + 'px';
  };

  // Debounce via rAF to avoid thrashing
  let scheduled = false;
  const scheduleFit = ()=>{
    if(scheduled) return;
    scheduled = true;
    requestAnimationFrame(()=>{
      scheduled = false;
      fit();
    });
  };

  if('ResizeObserver' in window){
    const ro = new ResizeObserver(scheduleFit);
    ro.observe(measure);
  } else {
    window.addEventListener('resize', scheduleFit, {passive:true});
  }

  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(scheduleFit);
  } else {
    setTimeout(scheduleFit, 0);
  }

  document.addEventListener('visibilitychange', ()=>{
    if(!document.hidden) scheduleFit();
  });

  // Initial fit
  fit();
})();

/* =========================
   Seamless Marquee
   ========================= */
function initMarquee(){
  const root = document.querySelector('#marquee .marquee');
  if(!root) return;

  const viewport = root.querySelector('.marquee__viewport');
  const track = root.querySelector('.marquee__track');
  const firstItem = root.querySelector('.marquee__item');
  if(!viewport || !track || !firstItem) return;

  // Options
  const speedSec = Number(root.dataset.speed) || 18;            // 1× speed baseline
  const gap = Number(root.dataset.gap) || 32;
  const dir = (root.dataset.direction || 'left').toLowerCase(); // left|right
  const pauseOnHover = root.dataset.pauseOnHover === 'true';

  root.style.setProperty('--marquee-duration', `${speedSec}s`);
  root.style.setProperty('--marquee-gap', `${gap}px`);
  root.classList.toggle('marquee--hover-pause', pauseOnHover);
  root.classList.toggle('marquee--dir-right', dir === 'right');

  // Clean old clones and rebuild to ensure >= 2× width
  const rebuild = ()=>{
    Array.from(track.querySelectorAll('.marquee__item.__clone')).forEach(n => n.remove());
    let clones = 0;
    while(track.scrollWidth < viewport.clientWidth * 2 && clones < 40){
      const clone = firstItem.cloneNode(true);
      clone.classList.add('__clone');
      clone.setAttribute('aria-hidden','true');
      track.appendChild(clone);
      clones++;
    }
  };

  const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  ready.then(()=>{
    rebuild();
    if('ResizeObserver' in window){
      const ro = new ResizeObserver(rebuild);
      ro.observe(viewport);
    }
    window.addEventListener('resize', rebuild, {passive:true});
  });
}

/* =========================
   Boot
   ========================= */
document.addEventListener('DOMContentLoaded', () => {
  mountAnimationDemo();
  mountExperienceDemo();
  initMarquee();
});
