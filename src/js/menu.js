import { gsap, ScrollTrigger, EASE, EASE_HOVER, DURATION, em, mq, pageWrap, contentWrap, reducedMotion } from './motion.js';
import { navbarEl, navState, navColors, setNavHidden } from './navbar.js';
import { stopScroll, startScroll, scrollToTarget } from './smooth-scroll.js';

/*
  "Page push" menu, rebuilt from the reference:
  - the menu lives BEHIND the page card (.nav-inner, z-index 0, on the dark body)
  - opening drops the whole page card down, scales it to an inset card and rounds it
  - each link starts pushed down by a different margin and rises to 0 in the same
    1.2s, so the different travel distances read as a diagonal stagger
  - the icon's "+" rotates 45° into an "×" while turning orange
*/

// Per-link start offsets, in DOM order (column 1, column 2, column 3)
const LINK_OFFSETS = ['8em', '11em', '14em', '10em', '13em', '16em', '12em', '15em', '18em'];

const html = document.documentElement;
const btn = document.querySelector('.menu-btn');
const btnLabel = btn.querySelector('.sr-only');
const icon = btn.querySelector('.menu-icon');
const bar1 = icon.querySelector('.is-1');
const bar2 = icon.querySelector('.is-2');
const labelInner = btn.querySelector('.menu-btn_label-inner');
const navInner = document.querySelector('.nav-inner');
const items = navInner.querySelectorAll('.link-item > *');

let open = false; // target state
let tl = null; // running open/close timeline
let hoverTl = null;

/** Where the page card goes when the menu is open. */
function pageTarget() {
  const vw = window.innerWidth;
  const inset = vw < 768 ? 32 : 64;
  const menuBottom = navInner.getBoundingClientRect().bottom;
  return {
    y: menuBottom + (mq.desktop() ? em(9) : em(2.5)),
    scale: (vw - inset) / vw,
  };
}

function setA11y(isOpen) {
  html.dataset.menuOpen = String(isOpen);
  btn.setAttribute('aria-expanded', String(isOpen));
  btnLabel.textContent = isOpen ? 'Close menu' : 'Open menu';
  navInner.inert = !isOpen;
  contentWrap.inert = isOpen;
}

function onOpened() {
  window.addEventListener('resize', onResizeOpen);
}

function onClosed() {
  window.removeEventListener('resize', onResizeOpen);
  gsap.set(pageWrap, { clearProps: 'transform,borderRadius' });
  startScroll();
  if (resizedWhileOpen) {
    resizedWhileOpen = false;
    ScrollTrigger.refresh();
  }
}

let resizedWhileOpen = false;
function onResizeOpen() {
  resizedWhileOpen = true;
  if (open && !(tl && tl.isActive())) gsap.set(pageWrap, pageTarget());
}

function killHover() {
  if (hoverTl) hoverTl.kill();
  hoverTl = null;
  gsap.set(labelInner, { yPercent: 0 });
}

function buildOpen() {
  const target = pageTarget();
  return gsap
    .timeline({
      defaults: { duration: DURATION, ease: EASE },
      onComplete: onOpened,
      onReverseComplete: () => {
        setA11y(false);
        onClosed();
      },
    })
    .to(items, { marginTop: 0 }, 0)
    .set(bar1, { top: '49%' }, 0)
    .set(bar2, { bottom: '49%', rotation: 90 }, 0)
    .to(icon, { rotation: 45 }, 0)
    .to(navbarEl, navColors({ menu: true }), 0)
    .to(pageWrap, { y: target.y, scale: target.scale, borderRadius: '1rem' }, 0);
}

function buildClose() {
  return gsap
    .timeline({
      defaults: { duration: DURATION, ease: EASE },
      onComplete: onClosed,
      onReverseComplete: () => {
        setA11y(true);
        onOpened();
      },
    })
    .to(items, { marginTop: (i) => LINK_OFFSETS[i] }, 0)
    .to(icon, { rotation: 0 }, 0)
    .to(bar1, { top: '42%' }, 0)
    .to(bar2, { bottom: '42%', rotation: 0 }, 0)
    .to(navbarEl, navColors({ menu: false, hover: false }), 0)
    .to(pageWrap, { y: 0, scale: 1, borderRadius: '0rem' }, 0);
}

/* Reduced motion: short cross-fade instead of the push */
function buildReduced(toOpen) {
  const target = pageTarget();
  return gsap
    .timeline({ defaults: { duration: 0.25, ease: 'none' }, onComplete: toOpen ? onOpened : onClosed })
    .set(items, { marginTop: 0 })
    .set(icon, { rotation: toOpen ? 45 : 0 })
    .set(bar1, { top: toOpen ? '49%' : '42%' })
    .set(bar2, { bottom: toOpen ? '49%' : '42%', rotation: toOpen ? 90 : 0 })
    .set(navbarEl, navColors({ menu: toOpen, hover: false }))
    .to(pageWrap, { opacity: 0 })
    .set(pageWrap, toOpen ? { y: target.y, scale: target.scale, borderRadius: '1rem' } : { y: 0, scale: 1, borderRadius: 0 })
    .to(pageWrap, { opacity: 1 });
}

export function toggleMenu(force) {
  const next = typeof force === 'boolean' ? force : !open;
  if (next === open || !navState.ready) return;

  // A click mid-animation reverses the running timeline instead of starting over
  if (tl && tl.isActive()) {
    open = next;
    navState.menu = next;
    setA11y(next);
    if (next) stopScroll();
    tl.reversed(!tl.reversed());
    return;
  }

  open = next;
  navState.menu = next;
  navState.hover = false;
  killHover();
  setA11y(next);

  if (next) {
    stopScroll();
    setNavHidden(false, 0.3); // make sure the bar is visible while the menu is open
  }

  tl = reducedMotion ? buildReduced(next) : next ? buildOpen() : buildClose();
}

/* ---- Icon hover: bars meet into a "+", label rolls, circle fills (0.6s) ---- */
function initHover() {
  if (reducedMotion) return;
  icon.addEventListener('mouseenter', () => {
    if (open || (tl && tl.isActive()) || !mq.canHover()) return;
    navState.hover = true;
    if (hoverTl) hoverTl.kill();
    hoverTl = gsap
      .timeline({ defaults: { duration: 0.6, ease: EASE_HOVER, overwrite: 'auto' } })
      .to(bar1, { top: '49%', rotation: 0 }, 0)
      .to(bar2, { bottom: '49%', rotation: 90 }, 0)
      .to(labelInner, { yPercent: -50 }, 0)
      .to(navbarEl, navColors(), 0);
  });
  icon.addEventListener('mouseleave', () => {
    if (open || (tl && tl.isActive())) return;
    navState.hover = false;
    if (hoverTl) hoverTl.kill();
    hoverTl = gsap
      .timeline({ defaults: { duration: 0.6, ease: EASE_HOVER, overwrite: 'auto' } })
      .to(bar1, { top: '42%', rotation: 0 }, 0)
      .to(bar2, { bottom: '42%', rotation: 0 }, 0)
      .to(labelInner, { yPercent: 0 }, 0)
      .to(navbarEl, navColors(), 0);
  });
}

export function initMenu() {
  setA11y(false);
  gsap.set(items, { marginTop: (i) => LINK_OFFSETS[i] });

  btn.addEventListener('click', () => toggleMenu());

  // Clicking the shrunken page card closes the menu
  pageWrap.addEventListener('click', () => {
    if (open) toggleMenu(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) {
      toggleMenu(false);
      btn.focus();
    }
  });

  // Menu links: jump the (pushed-down) page to the target, then close to reveal it
  navInner.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    const hash = a.getAttribute('href');
    const target = hash.length > 1 ? document.querySelector(hash) : null;
    if (target) {
      // The card is scaled right now, so measure in unscaled space. Scrolling must be
      // re-enabled first: a stopped Lenis wrapper is overflow:clip and ignores scrollTop.
      const scale = gsap.getProperty(pageWrap, 'scaleY') || 1;
      const y = (target.getBoundingClientRect().top - pageWrap.getBoundingClientRect().top) / scale + pageWrap.scrollTop;
      startScroll();
      scrollToTarget(y, { immediate: true });
    }
    toggleMenu(false);
  });

  initHover();
}

