import { gsap, EASE, DURATION, pageWrap, reducedMotion, mq } from './motion.js';
import { navIntroFrom, navIntroTo, navState } from './navbar.js';
import { stopScroll, startScroll } from './smooth-scroll.js';

const REVEAL = 1.8; // page-reveal duration (reference "Dr")
const HERO_CARDS_DELAY = 0.5;
const LINE_STAGGER = 0.03;

/**
 * Hero entrance (reference "ci"): each line rises out of its clipping wrapper,
 * 0.03s apart; the two link cards follow at +0.5s; the navbar slides in with them.
 */
function heroIn(tl, at) {
  const lines = [...document.querySelectorAll('.section_hero .h1-span, .section_hero .eyebrow-l')];
  const cards = [...document.querySelectorAll('.section_hero .card')];

  lines.forEach((el, i) => {
    const from = el.classList.contains('eyebrow-l') ? 130 : 110;
    tl.set(el, { autoAlpha: 1 }, at + i * LINE_STAGGER);
    tl.fromTo(el, { yPercent: from }, { yPercent: 0, duration: DURATION, ease: EASE }, at + i * LINE_STAGGER);
  });
  cards.forEach((card, i) => {
    tl.set(card, { autoAlpha: 1 }, at + HERO_CARDS_DELAY);
    tl.fromTo(card, { y: () => card.offsetHeight * ([1.1, 1.2][i] ?? 1) }, { y: 0, duration: DURATION, ease: EASE }, at + HERO_CARDS_DELAY);
  });
  navIntroTo(tl, at, { duration: DURATION, ease: EASE });
}

/** Resolve when the hero image (and fonts) are ready, or after 1.5s at most. */
function heroReady() {
  const img = document.querySelector('.hero-media');
  const imgReady =
    img && 'decode' in img ? img.decode().catch(() => {}) : Promise.resolve();
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  return Promise.race([Promise.all([imgReady, fonts]), new Promise((r) => setTimeout(r, 1500))]);
}

/**
 * Animate the page card's clip-path from a rect to the full viewport.
 * Desktop reference uses an SVG luminance mask with a rounded-rect hole; clip-path
 * on the page card gives the same rounded hole growing to a -24px bleed.
 */
function clipReveal(box) {
  const rect = box.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const radius = parseFloat(getComputedStyle(box).borderRadius) || 8;
  const s = { t: rect.top, r: vw - rect.right, b: vh - rect.bottom, l: rect.left };
  const apply = () => {
    pageWrap.style.clipPath = `inset(${s.t}px ${s.r}px ${s.b}px ${s.l}px round ${radius}px)`;
  };
  // Clip synchronously, BEFORE the loader turns transparent, so no frame shows the full page
  apply();
  gsap.to(s, {
    t: -24,
    r: -24,
    b: -24,
    l: -24,
    duration: REVEAL,
    ease: EASE,
    onUpdate: apply,
    onComplete: () => (pageWrap.style.clipPath = ''),
  });
}

export function runIntro() {
  const loader = document.querySelector('.loader');

  if (reducedMotion) {
    loader?.remove();
    return Promise.resolve();
  }

  navIntroFrom();
  stopScroll();
  pageWrap.scrollTop = 0;

  const box = loader.querySelector('.loader_box');
  const square = loader.querySelector('.loader_square');
  const mark = loader.querySelector('.loader_icon .logo-mark');
  const iconTile = loader.querySelector('.loader_icon');
  const text = loader.querySelector('.loader_text');
  const letters = text.children;

  gsap.set(text, { opacity: 0 });
  gsap.set(mark, { autoAlpha: 0, yPercent: 100, rotation: 70, transformOrigin: '50% 50%' });

  const fullWidth = () => iconTile.offsetWidth + text.offsetWidth;

  return new Promise((resolve) => {
    const tl = gsap.timeline({ paused: true, defaults: { ease: EASE } });

    // 1. square grows, logo mark rotates up into place
    tl.to(square, { width: '100%', height: '100%', duration: 0.8 }, 0);
    tl.to(mark, { autoAlpha: 1, yPercent: 0, rotation: 0, duration: 0.8 }, 0);

    // 2. box opens to fit the wordmark, letters rise in (100% + i*40%, 0.02 apart)
    tl.set(box, { '--outline': 1 }, '>');
    tl.to(text, { opacity: 1, duration: 0.3 }, '<');
    tl.to(box, { width: fullWidth, duration: 0.8 }, '<');
    tl.from(letters, { yPercent: (i) => 100 + i * 40, stagger: 0.02, duration: 0.8 }, '<');

    // 3. box narrows onto the wordmark: the mark slides out of the left edge while the
    //    box shrinks by the same amount, so the wordmark itself never moves
    tl.to(iconTile, { marginLeft: () => -iconTile.offsetWidth, duration: 0.5 });
    tl.to(box, { width: () => text.offsetWidth, duration: 0.5 }, '<');

    // 4. reveal the page + hero entrance
    tl.addLabel('reveal');
    if (mq.desktop()) {
      tl.add(() => {
        clipReveal(box);
        loader.style.backgroundColor = 'transparent';
      }, 'reveal');
      tl.to(box, { '--outline': 0, duration: REVEAL * 0.5 }, 'reveal');
      tl.to(text, { opacity: 0, duration: REVEAL }, 'reveal');
    } else {
      tl.to(loader, { opacity: 0, duration: REVEAL }, 'reveal');
    }
    heroIn(tl, tl.labels.reveal);

    tl.add(() => {
      loader.remove();
      navState.ready = true;
      startScroll();
      resolve();
    }, `reveal+=${REVEAL}`);

    heroReady().then(() => tl.play(0));
  });
}
