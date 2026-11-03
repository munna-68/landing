import { gsap, ScrollTrigger, EASE, reducedMotion } from './motion.js';

const TICKS = 120;

function drawTicks(svg) {
  const ns = 'http://www.w3.org/2000/svg';
  for (let i = 0; i < TICKS; i++) {
    const a = (i / TICKS) * Math.PI * 2 - Math.PI / 2;
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', 100 + Math.cos(a) * 92);
    line.setAttribute('y1', 100 + Math.sin(a) * 92);
    line.setAttribute('x2', 100 + Math.cos(a) * 98);
    line.setAttribute('y2', 100 + Math.sin(a) * 98);
    svg.append(line);
  }
}

/**
 * Materials stage (reference "minerals"): the stage stays pinned while scroll
 * progress steps through the items. Each step:
 *  - names list → active 100%, others 15% (0.25s)
 *  - circular slider → xPercent -20·i (1.2s), images tilt ±30° as they slide
 *  - mono labels roll to the new index (0.25s)
 * A tick ring fills with overall progress (conic mask).
 */
export function initMinerals() {
  const section = document.querySelector('.section_minerals');
  if (!section) return;

  const stage = section.querySelector('.minerals-stage');
  const names = [...section.querySelectorAll('.minerals-names li')];
  const inner = section.querySelector('.minerals-slider_inner');
  const imgs = [...section.querySelectorAll('.minerals-slider_img')];
  const rollers = [...section.querySelectorAll('.eyebrow-slider')];
  const ring = section.querySelector('.minerals_ring');
  const progress = section.querySelector('.minerals_progress');

  drawTicks(ring);
  const progressSvg = ring.cloneNode(true);
  progressSvg.classList.remove('minerals_ring');
  progress.append(progressSvg);

  const n = imgs.length;
  let current = -1;

  const tilt = () => {
    const pos = -(gsap.getProperty(inner, 'xPercent') || 0) / 20;
    imgs.forEach((img, k) => {
      const d = k - pos;
      gsap.set(img, { rotation: 30 * Math.sign(d) * Math.min(1, Math.abs(d)) });
    });
  };

  const go = (i, instant = false) => {
    if (i === current) return;
    current = i;
    const quick = instant || reducedMotion;
    names.forEach((el, k) => {
      el.classList.toggle('is-active', k === i);
      gsap.to(el, { opacity: k === i ? 1 : 0.15, duration: quick ? 0 : 0.25, ease: EASE, overwrite: 'auto' });
    });
    gsap.to(inner, { xPercent: -20 * i, duration: quick ? 0 : 1.2, ease: EASE, overwrite: 'auto', onUpdate: tilt, onComplete: tilt });
    rollers.forEach((roller) => {
      const target = roller.children[i];
      gsap.to(roller, { y: -target.offsetTop, duration: quick ? 0 : 0.25, ease: EASE, overwrite: 'auto' });
    });
  };

  go(0, true);

  ScrollTrigger.create({
    trigger: stage,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate(self) {
      progress.style.setProperty('--angle', `${self.progress * 360}deg`);
      go(Math.min(n - 1, Math.floor(self.progress * n)));
    },
  });
}
