import { gsap, ScrollTrigger, EASE_LOGO, em, reducedMotion, mq } from './motion.js';
import { getLenis } from './smooth-scroll.js';

/*
  Navbar colours follow the section underneath it (data-theme on each section),
  exactly like the reference's theme map. Concrete colour values are needed so
  GSAP can interpolate the CSS custom properties.
*/
const T = 'rgba(255, 255, 255, 0)';
export const THEMES = {
  hero: { fg: '#ffffff', logoBg: T, logoFg: '#ffffff', logoInk: '#151515', iconBg: T, iconBorder: '#ffffff', iconBars: '#ffffff' },
  white: { fg: '#151515', logoBg: '#ffffff', logoFg: '#151515', logoInk: '#ffffff', iconBg: '#ffffff', iconBorder: '#151515', iconBars: '#151515' },
  lightgreen: { fg: '#151515', logoBg: '#ebf0ed', logoFg: '#151515', logoInk: '#ebf0ed', iconBg: '#ebf0ed', iconBorder: '#151515', iconBars: '#151515' },
  black: { fg: '#ffffff', logoBg: '#151515', logoFg: '#ffffff', logoInk: '#151515', iconBg: '#151515', iconBorder: '#ffffff', iconBars: '#ffffff' },
  menu: { fg: '#ffffff', logoBg: '#f47920', logoFg: '#ffffff', logoInk: '#f47920', iconBg: '#f47920', iconBorder: '#151515', iconBars: '#151515' },
};
// Menu icon while hovered (closed state only)
const HOVER_ICON = { iconBg: '#151515', iconBorder: '#151515', iconBars: '#ffffff' };

const toVars = (c) => ({
  '--nav-fg': c.fg,
  '--logo-bg': c.logoBg,
  '--logo-fg': c.logoFg,
  '--logo-ink': c.logoInk,
  '--icon-bg': c.iconBg,
  '--icon-border': c.iconBorder,
  '--icon-bars': c.iconBars,
});

export const navbarEl = document.querySelector('.navbar');
const logo = navbarEl.querySelector('.logo');
const menuBtn = navbarEl.querySelector('.menu-btn');

export const navState = {
  theme: 'hero',
  hover: false,
  menu: false, // true while the menu is open or opening
  ready: false, // false until the intro has brought the bar in
};

/** CSS-variable values for the current state (or for an explicit override). */
export function navColors({ menu = navState.menu, hover = navState.hover, theme = navState.theme } = {}) {
  if (menu) return toVars(THEMES.menu);
  const base = THEMES[theme] || THEMES.white;
  return toVars(hover ? { ...base, ...HOVER_ICON } : base);
}

/** Tween the navbar colours to whatever the current state calls for. */
export function applyNavColors(duration = 1.2, ease = 'power1.out') {
  return gsap.to(navbarEl, { ...navColors(), duration, ease, overwrite: 'auto' });
}

function setTheme(key) {
  if (navState.theme === key) return;
  navState.theme = key;
  if (!navState.menu) applyNavColors(1.2);
}

/* ---- Show / hide on scroll direction (reference: left/right -9em, 0.5s) ---- */
const HIDE = () => em(11);
let barHidden = true;

export function setNavHidden(hidden, duration = 0.5, ease = 'power1.out') {
  barHidden = hidden;
  gsap.to(logo, { x: hidden ? -HIDE() : 0, duration, ease, overwrite: 'auto' });
  gsap.to(menuBtn, { x: hidden ? HIDE() : 0, duration, ease, overwrite: 'auto' });
}

/** Intro: put the bar off-screen and return tweens that bring it in. */
export function navIntroFrom() {
  gsap.set(logo, { x: -HIDE() });
  gsap.set(menuBtn, { x: HIDE() });
}
export function navIntroTo(tl, position, { duration, ease }) {
  tl.to([logo, menuBtn], { x: 0, duration, ease, overwrite: 'auto' }, position);
  tl.call(() => (barHidden = false), null, position);
}

function initHideOnScroll() {
  const lenis = getLenis();
  let last = 0;
  const onScroll = (y) => {
    const delta = y - last;
    last = y;
    if (!navState.ready || navState.menu || reducedMotion) return;
    if (delta > 2 && !barHidden) setNavHidden(true);
    else if (delta < -2 && barHidden) setNavHidden(false);
  };
  if (lenis) lenis.on('scroll', (l) => onScroll(l.scroll));
  else document.querySelector('.page-wrap').addEventListener('scroll', (e) => onScroll(e.target.scrollTop), { passive: true });
}

/* ---- Section themes ---- */
function initThemes() {
  const sections = document.querySelectorAll('[data-theme]');
  const line = () => navbarEl.getBoundingClientRect().top + navbarEl.offsetHeight / 2;
  sections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: () => `top top+=${line()}`,
      end: () => `bottom top+=${line()}`,
      onToggle: (self) => self.isActive && setTheme(section.dataset.theme),
    });
  });
}

/* ---- Logo hover: letters roll up (reference: 0.5s, stagger 0.03) ---- */
function initLogoHover() {
  if (reducedMotion) return;
  const rows = logo.querySelectorAll('.logo_row');
  const letters1 = rows[0].children;
  const letters2 = rows[1].children;
  let busy = false;
  logo.addEventListener('mouseenter', () => {
    if (busy || !mq.canHover()) return;
    busy = true;
    gsap
      .timeline({
        defaults: { duration: 0.5, ease: EASE_LOGO },
        onComplete: () => {
          gsap.set([letters1, letters2], { yPercent: 0 });
          busy = false;
        },
      })
      .to(letters1, { yPercent: -100, stagger: 0.03 }, 0)
      .to(letters2, { yPercent: -100, stagger: 0.03 }, 0);
  });
}

export function initNavbar() {
  gsap.set(navbarEl, navColors());
  initThemes();
  initHideOnScroll();
  initLogoHover();
  if (reducedMotion) {
    barHidden = false;
    navState.ready = true;
  }
}
