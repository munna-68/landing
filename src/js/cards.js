import { gsap, SplitText, EASE, em } from './motion.js';

const DESKTOP = '(hover: hover) and (min-width: 992px)';
const TOUCH = '(max-width: 991px)';
const VIEWER_EASE = 'cubic-bezier(0.5, 0, 0, 1)';

/**
 * Service + team cards.
 * Desktop: card turns orange, its photo fades into the viewer tile (0.8s),
 * description lines slide up (0.4s, 0.03s apart).
 * Tablet/mobile: accordion, height + "+" rotation (1.2s).
 */
export function initCards() {
  const mm = gsap.matchMedia();

  document.querySelectorAll('.cards-grid').forEach((grid) => {
    const cards = [...grid.querySelectorAll('.service-card, .team-card')];
    const images = [...grid.querySelectorAll('.viewer-image')];
    const defaultImage = grid.querySelector('.viewer-image.is-default');

    // Accordion parts (CSS only shows them below 992px)
    cards.forEach((card) => {
      const desc = card.querySelector('.card_desc');
      const wrap = document.createElement('span');
      wrap.className = 'card_desc_wrap';
      wrap.style.display = 'block';
      desc.replaceWith(wrap);
      wrap.append(desc);
      const plus = document.createElement('span');
      plus.className = 'card-plus';
      plus.setAttribute('aria-hidden', 'true');
      card.append(plus);
    });

    const showImage = (index) => {
      images.forEach((img, i) => {
        img.classList.toggle('is-visible', i === index);
        if (img !== defaultImage) return;
        img.classList.toggle('is-default', index === -1);
      });
    };

    mm.add(DESKTOP, () => {
      const splits = cards.map((card) =>
        SplitText.create(card.querySelector('.card_desc'), { type: 'lines', mask: 'lines', linesClass: 'split-line' })
      );
      splits.forEach((s) => gsap.set(s.lines, { yPercent: 100 }));

      const handlers = cards.map((card, i) => {
        const enter = () => {
          card.classList.add('is-hover');
          showImage(Number(card.dataset.image));
          gsap.to(splits[i].lines, { yPercent: 0, duration: 0.4, stagger: 0.03, ease: 'power1.out', overwrite: 'auto' });
        };
        const leave = () => {
          card.classList.remove('is-hover');
          showImage(-1);
          gsap.to(splits[i].lines.slice().reverse(), { yPercent: 100, duration: 0.4, stagger: 0.03, ease: 'power1.out', overwrite: 'auto' });
        };
        card.addEventListener('pointerenter', enter);
        card.addEventListener('pointerleave', leave);
        card.addEventListener('focusin', enter);
        card.addEventListener('focusout', leave);
        return { card, enter, leave };
      });

      return () => {
        handlers.forEach(({ card, enter, leave }) => {
          card.removeEventListener('pointerenter', enter);
          card.removeEventListener('pointerleave', leave);
          card.removeEventListener('focusin', enter);
          card.removeEventListener('focusout', leave);
          card.classList.remove('is-hover');
        });
        splits.forEach((s) => s.revert());
        showImage(-1);
      };
    });

    mm.add(TOUCH, () => {
      const state = new Map();
      const handlers = cards.map((card) => {
        const wrap = card.querySelector('.card_desc_wrap');
        const plus = card.querySelector('.card-plus');
        card.setAttribute('aria-expanded', 'false');
        const toggle = () => {
          const open = !state.get(card);
          state.set(card, open);
          card.setAttribute('aria-expanded', String(open));
          gsap.to(wrap, { height: open ? 'auto' : 0, duration: 1.2, ease: EASE, overwrite: 'auto' });
          gsap.to(plus, { rotation: open ? 135 : 0, duration: 1.2, ease: EASE, overwrite: 'auto' });
        };
        card.addEventListener('click', toggle);
        return { card, toggle };
      });
      return () =>
        handlers.forEach(({ card, toggle }) => {
          card.removeEventListener('click', toggle);
          card.removeAttribute('aria-expanded');
        });
    });
  });

  // Viewer images use the reference's opacity curve
  document.querySelectorAll('.viewer-image').forEach((img) => (img.style.transitionTimingFunction = VIEWER_EASE));
}

/**
 * Machine cards (desktop): hovered card lifts its name to reveal the description,
 * siblings dim to 40% (0.3s).
 */
export function initMachines() {
  const grid = document.querySelector('.machines-grid');
  if (!grid) return;
  const mm = gsap.matchMedia();

  mm.add(DESKTOP, () => {
    const cards = [...grid.querySelectorAll('.machine-card')];
    const lift = () => -(grid.querySelector('.machine-card_name .body-m').offsetHeight + em(0.6));
    const off = cards.map((card) => {
      const parts = card.querySelectorAll('.machine-card_name > *');
      const desc = card.querySelector('.machine-card_desc');
      const enter = () => {
        grid.classList.add('has-hover');
        card.classList.add('is-hover');
        gsap.to(parts, { y: lift(), duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
        gsap.to(desc, { opacity: 0.6, duration: 0.3, overwrite: 'auto' });
      };
      const leave = () => {
        grid.classList.remove('has-hover');
        card.classList.remove('is-hover');
        gsap.to(parts, { y: 0, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
        gsap.to(desc, { opacity: 0, duration: 0.3, overwrite: 'auto' });
      };
      card.addEventListener('pointerenter', enter);
      card.addEventListener('pointerleave', leave);
      return () => {
        card.removeEventListener('pointerenter', enter);
        card.removeEventListener('pointerleave', leave);
      };
    });
    return () => off.forEach((fn) => fn());
  });
}
