// Debug outlines: press "D" to toggle
(function () {
  const KEY = 'debug-outlines';
  const root = document.documentElement;
  const saved = localStorage.getItem(KEY);
  root.style.setProperty('--debug', saved === '1' ? '1' : '0');

  document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() !== 'd') return;
    const curr = getComputedStyle(root).getPropertyValue('--debug').trim();
    const next = curr === '1' ? '0' : '1';
    root.style.setProperty('--debug', next);
    localStorage.setItem(KEY, next);
  });
})();

/* ========== Theme Handling ========== */
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

/* ========== Placeholder Mounts ========== */
function mountAnimationDemo() {
  const el = document.getElementById('animationMount');
  if (!el) return;
  el.innerHTML = '';
  const dot = document.createElement('div');
  dot.style.width = '16px';
  dot.style.height = '16px';
  dot.style.borderRadius = '50%';
  dot.style.background = 'var(--accent)';
  dot.style.position = 'relative';
  dot.style.left = '0';
  dot.style.transition = 'left 400ms linear';
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

/* ========== Header text fitting (fills target width) ========== */
(function fitHeader() {
  const measureEl = document.querySelector('#header .header-measure');
  const textEl = document.getElementById('headerText');
  if (!measureEl || !textEl) return;

  textEl.style.whiteSpace = 'nowrap';
  textEl.style.display = 'inline-block';
  textEl.style.width = 'auto';

  function targetWidth() {
    // We fit to .header-measure; CSS expands it to include the 3% side gutters
    return measureEl.clientWidth;
  }

  function fit() {
    const maxW = targetWidth();
    if (maxW <= 0) return;

    textEl.style.fontSize = '50px';
    let low = 6, high = 2400;
    for (let i = 0; i < 22; i++) {
      const mid = (low + high) / 2;
      textEl.style.fontSize = mid + 'px';
      const w = textEl.scrollWidth;
      if (w > maxW) high = mid; else low = mid;
    }
    textEl.style.fontSize = (low - 0.5) + 'px';
  }

  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(fit);
    ro.observe(measureEl);
  } else {
    window.addEventListener('resize', fit, { passive: true });
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fit);
  } else {
    setTimeout(fit, 0);
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) fit();
  });

  fit();
})();

/* ========== Mount demos on DOM ready ========== */
document.addEventListener('DOMContentLoaded', () => {
  mountAnimationDemo();
  mountExperienceDemo();
});
