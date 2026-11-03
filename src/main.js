import 'lenis/dist/lenis.css';
import './styles/base.css';
import './styles/chrome.css';
import './styles/sections.css';

// Stylesheets are in: lift the critical-CSS curtain (see <head>)
document.documentElement.classList.add('is-styled');

import { ScrollTrigger, reducedMotion } from './js/motion.js';
import { initSmoothScroll, initAnchorLinks } from './js/smooth-scroll.js';
import { initNavbar } from './js/navbar.js';
import { initMenu } from './js/menu.js';
import { runIntro } from './js/intro.js';
import { initTextReveal, initParallax, initCardsReveal, initDisplayReveal } from './js/scroll-effects.js';
import { initCards, initMachines } from './js/cards.js';
import { initMinerals } from './js/minerals.js';
import { initTestimonials } from './js/testimonials.js';
import { initCylinder } from './js/cylinder.js';

initSmoothScroll();
initAnchorLinks();
initNavbar();
initMenu();

// Interactions work with or without motion
initCards();
initMachines();
initMinerals();
initTestimonials();

if (!reducedMotion) {
  initTextReveal();
  initParallax();
  initCardsReveal();
  initDisplayReveal();
  initCylinder();
}

runIntro();

// Late-loading fonts/images can shift layout: re-measure every trigger once settled
window.addEventListener('load', () => ScrollTrigger.refresh());
