import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);

// The reference's signature curve: slow start, very fast middle, long soft landing.
// "M0,0 C0.6,0 0,1 1,1" === cubic-bezier(0.6, 0, 0, 1)
export const EASE = CustomEase.create('main', 'M0,0 C0.6,0 0,1 1,1');
// Slightly snappier variant used for the menu-icon hover
export const EASE_HOVER = CustomEase.create('hover', 'M0,0 C0.68,0 0,1 1,1');
// Logo letter roll
export const EASE_LOGO = CustomEase.create('logo', 'M0,0 C0.51,0 0,1 1,1');

export const DURATION = 1.2;

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const mq = {
  desktop: () => window.matchMedia('(min-width: 992px)').matches,
  mobile: () => window.matchMedia('(max-width: 767px)').matches,
  canHover: () => window.matchMedia('(hover: hover) and (pointer: fine)').matches,
};

/** Current body font-size in px (1em of the fluid scale). */
export const em = (value = 1) => parseFloat(getComputedStyle(document.body).fontSize) * value;

export const pageWrap = document.querySelector('.page-wrap');
export const contentWrap = document.querySelector('.content-wrap');

// Every ScrollTrigger lives inside the page card, not the window.
ScrollTrigger.defaults({ scroller: pageWrap });

export { gsap, ScrollTrigger, SplitText };
