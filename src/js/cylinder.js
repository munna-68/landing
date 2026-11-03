import { gsap, ScrollTrigger, reducedMotion } from './motion.js';

const SPREAD = 252; // degrees the list covers (reference: 360 / 10 zones · 7 text zones)
const TICK_GAP = 10; // px between ruler ticks
const TICKS_PER_ITEM = 3;

/**
 * Partners cylinder (reference "cylinder"): names sit on a 3D drum
 * (radius 40% of the smaller viewport side). Scrolling through the pinned block
 * rotates the drum on X; the name facing the viewer is full opacity, the rest 20%.
 * Side rulers slide with the rotation and their ticks grow near the centre.
 */
export function initCylinder() {
  const root = document.querySelector('.cylinder');
  if (!root || reducedMotion) return;

  const wrapper = root.querySelector('.cylinder_wrapper');
  const items = [...wrapper.children];
  const rulers = [...root.querySelectorAll('.scroll-indicator')];
  const STEP = SPREAD / Math.max(1, items.length - 1);
  const total = SPREAD;
  let radius = 0;
  let active = -1;
  let ticks = [];

  const layout = () => {
    radius = Math.min(window.innerWidth, window.innerHeight) * 0.4;
    items.forEach((item, i) => {
      const a = i * STEP;
      const rad = (a * Math.PI) / 180;
      item.style.transform = `translate(-50%, -50%) translate3d(0, ${Math.sin(rad) * radius}px, ${Math.cos(rad) * radius}px) rotateX(${-a}deg)`;
    });
    ticks = rulers.map((ruler) => {
      const count = Math.ceil(ruler.offsetHeight / TICK_GAP) + 2;
      ruler.replaceChildren(...Array.from({ length: count }, () => Object.assign(document.createElement('div'), { className: 'scroll-tick' })));
      return { ruler, els: [...ruler.children], h: ruler.offsetHeight };
    });
  };

  const render = (progress) => {
    const angle = progress * total;
    gsap.set(wrapper, { transformOrigin: '50% 50%', z: -radius, rotationX: angle, force3D: true });

    const next = Math.round(angle / STEP);
    if (next !== active) {
      items[active]?.classList.remove('is-active');
      items[next]?.classList.add('is-active');
      active = next;
    }

    const shift = ((angle / STEP) * TICKS_PER_ITEM * TICK_GAP) % TICK_GAP;
    ticks.forEach(({ els, h }) => {
      els.forEach((tick, i) => {
        const y = i * TICK_GAP - shift;
        const dist = Math.abs(y - h / 2) / TICK_GAP;
        tick.style.transform = `translateY(${y}px) scaleX(${1 + 3 * Math.max(0, 1 - dist / 4)})`;
      });
    });
  };

  layout();

  const st = ScrollTrigger.create({
    trigger: root,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => render(self.progress),
    onRefresh: (self) => {
      layout();
      render(self.progress);
    },
  });
  render(st.progress);
}
