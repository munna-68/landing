import Lenis from 'lenis';
import { gsap, ScrollTrigger, pageWrap, contentWrap, reducedMotion, EASE } from './motion.js';

let lenis = null;

/**
 * Lenis on the page card, driven by GSAP's ticker so scroll position, ScrollTrigger
 * and every tween update in the same frame. Settings match the reference.
 */
export function initSmoothScroll() {
  if (reducedMotion) return null;

  const coarse = window.matchMedia('(pointer: coarse), (hover: none)').matches;

  lenis = new Lenis({
    wrapper: pageWrap,
    content: contentWrap,
    lerp: 0.125,
    smoothWheel: true,
    syncTouch: true,
    syncTouchLerp: coarse ? 0.15 : 0.075,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  if (import.meta.env.DEV) window.__lenis = lenis;
  return lenis;
}

export const getLenis = () => lenis;

export function scrollY() {
  return lenis ? lenis.scroll : pageWrap.scrollTop;
}

export function stopScroll() {
  lenis ? lenis.stop() : (pageWrap.style.overflow = 'hidden');
}

export function startScroll() {
  lenis ? lenis.start() : (pageWrap.style.overflow = '');
}

/** Scroll the page card to an element or offset. */
export function scrollToTarget(target, { immediate = false } = {}) {
  if (lenis) {
    lenis.scrollTo(target, {
      immediate,
      force: true,
      duration: 1.6,
      easing: (t) => EASE(t),
    });
    return;
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  const top =
    typeof target === 'number'
      ? target
      : el.getBoundingClientRect().top - pageWrap.getBoundingClientRect().top + pageWrap.scrollTop;
  pageWrap.scrollTo({ top, behavior: immediate || reducedMotion ? 'auto' : 'smooth' });
}

/** Smooth in-page anchor links (outside the menu, which handles its own). */
export function initAnchorLinks() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.closest('.nav-inner')) return;
    const hash = a.getAttribute('href');
    if (hash === '#') {
      e.preventDefault();
      return;
    }
    const target = hash === '#top' ? 0 : document.querySelector(hash);
    if (target === null) return;
    e.preventDefault();
    scrollToTarget(target);
  });
}
