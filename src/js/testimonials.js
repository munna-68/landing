import { gsap, SplitText, EASE, reducedMotion } from './motion.js';

/**
 * Testimonials (reference "testimonials"): 01/02 toggle with a sliding indicator
 * (0.6s), cross-fade, quote lines rise from their masks (0.6s, 0.05 apart),
 * auto-advance every 5s while the block is on screen.
 */
export function initTestimonials() {
  const root = document.querySelector('.testimonials');
  if (!root) return;

  const options = [...root.querySelectorAll('.toggle-option')];
  const indicator = root.querySelector('.toggle-indicator');
  const items = [...root.querySelectorAll('.testimonial')];
  let index = 0;
  let timer = null;

  const splits = items.map((item) =>
    SplitText.create(item.querySelectorAll('p'), { type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true })
  );

  const moveIndicator = (i) =>
    gsap.to(indicator, { xPercent: i * 110, duration: reducedMotion ? 0 : 0.6, ease: EASE, overwrite: 'auto' });

  const show = (next) => {
    if (next === index) return;
    const prev = items[index];
    const item = items[next];
    options.forEach((o, i) => {
      o.classList.toggle('is-active', i === next);
      o.setAttribute('aria-selected', String(i === next));
    });
    moveIndicator(next);
    gsap.to(prev, { autoAlpha: 0, duration: 0.6, ease: EASE, overwrite: 'auto' });
    gsap.to(item, { autoAlpha: 1, duration: 0.6, ease: EASE, overwrite: 'auto' });
    if (!reducedMotion) {
      gsap.fromTo(splits[next].lines, { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: EASE, stagger: 0.05, overwrite: 'auto' });
    }
    prev.classList.remove('is-active');
    item.classList.add('is-active');
    index = next;
  };

  const start = () => {
    if (timer || reducedMotion) return;
    timer = setInterval(() => show((index + 1) % items.length), 5000);
  };
  const stop = () => {
    clearInterval(timer);
    timer = null;
  };

  gsap.set(items, { autoAlpha: (i) => (i === 0 ? 1 : 0) });

  options.forEach((option, i) => {
    option.addEventListener('mouseenter', () => moveIndicator(i));
    option.addEventListener('click', () => {
      stop();
      show(i);
      start();
    });
  });
  root.querySelector('.toggle').addEventListener('mouseleave', () => moveIndicator(index));

  new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { threshold: 0.25 }).observe(root);
}
