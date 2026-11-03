import { gsap, SplitText, EASE } from './motion.js';

/**
 * Paragraph reveal (reference "text-reveal", [tr="1"]):
 * chars start at 20% opacity; each LINE scrubs its chars to 100% between
 * "top 85%" and "top 50%", 0.02 stagger, linear.
 */
export function initTextReveal() {
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    let ctx;
    SplitText.create(el, {
      type: 'lines,words,chars',
      linesClass: 'split-line',
      wordsClass: 'split-word',
      charsClass: 'split-char',
      autoSplit: true,
      onSplit(self) {
        ctx?.revert();
        ctx = gsap.context(() => {
          // will-change keeps the per-frame opacity scrub on the compositor (reference does the same)
          gsap.set(self.chars, { opacity: 0.2, willChange: 'opacity' });
          self.lines.forEach((line) => {
            gsap.to(line.querySelectorAll('.split-char'), {
              opacity: 1,
              stagger: 0.02,
              ease: 'none',
              scrollTrigger: { trigger: line, start: 'top 85%', end: 'top 50%', scrub: true },
            });
          });
        });
      },
    });
  });
}

/**
 * Image parallax (reference ".image-p"): image is 120% of its frame and travels
 * ±10% of the frame from the moment the frame enters until it leaves.
 */
export function initParallax() {
  document.querySelectorAll('.image-wrapper > .image-p, .next_bg > .image-p').forEach((img) => {
    gsap.fromTo(
      img,
      { yPercent: -8.33 },
      {
        yPercent: 8.33,
        ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      }
    );
  });

  // Hero background drifts 40px while the hero scrolls out
  const heroBg = document.querySelector('.hero-background .background-inner');
  if (heroBg) {
    gsap.fromTo(
      heroBg,
      { y: 0 },
      { y: 40, ease: 'none', scrollTrigger: { trigger: heroBg.closest('.section_hero'), start: 'top top', end: 'bottom top', scrub: true } }
    );
  }
}

/** Cards reveal (reference "cards-reveal"): fade up 2em, 0.8s power2.out, once at top 85%. */
export function initCardsReveal() {
  document.querySelectorAll('.service-card, .team-card').forEach((card) => {
    gsap.fromTo(
      card,
      { autoAlpha: 0, y: '2em' },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        immediateRender: true,
        scrollTrigger: { trigger: card, start: 'top 85%', once: true },
      }
    );
  });
}

/**
 * Display title (reference "text-display-reveal"): letters are filled by a rounded
 * gradient sweeping left → right (2s, 0.025 stagger per line) while the eyebrow's
 * words rotate up from below (yPercent 100, rotation 70 → 0, 1.2s, 0.02 stagger).
 */
export function initDisplayReveal() {
  document.querySelectorAll('.display-text').forEach((block) => {
    const lines = block.querySelectorAll('.title-line');
    const eyebrow = block.querySelector('.display-eyebrow');
    let words = [];
    if (eyebrow) {
      words = eyebrow.textContent.trim().split(/\s+/).map((w) => {
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = w;
        return span;
      });
      eyebrow.replaceChildren(...words.flatMap((w, i) => (i ? [document.createTextNode(' '), w] : [w])));
      gsap.set(words, { yPercent: 100, rotation: 70, transformOrigin: 'left bottom' });
    }
    gsap
      .timeline({
        defaults: { duration: 2, ease: EASE },
        scrollTrigger: { trigger: block.querySelector('.title-big'), start: 'top 80%', toggleActions: 'play none none none' },
      })
      // gradient is solid for its first 70%, so 145% fully fills the line
      .to(lines, { backgroundSize: '145% 100%', stagger: 0.025 }, 0)
      .to(words, { yPercent: 0, rotation: 0, duration: 1.2, stagger: 0.02 }, 0);
  });
}
