# Landing

Single-page landing that rebuilds the motion system of the reference site (page-push menu, masked intro, scroll-driven reveals) with placeholder copy and stock imagery.

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # → dist/
```

Stack: Vite, vanilla JS, GSAP 3.13 (ScrollTrigger, CustomEase, SplitText), Lenis. See [docs/ANIMATION-BREAKDOWN.md](docs/ANIMATION-BREAKDOWN.md) for what each effect recreates and its timings.

## Replacing placeholder images

All images live in **`public/assets/images/`**, one file per slot. Replace a file with your own image **using the same filename** and nothing else needs to change. Keep roughly the same aspect ratio. Frames are fixed-ratio boxes, so a different ratio is cropped (`object-fit: cover`) rather than shifting layout.

| File | Slot | Ratio |
|---|---|---|
| `hero.jpg` | Hero full-bleed background (video slot, see below) | 16:10 |
| `hero-card-1.jpg` | Hero link card 1 ("Our services") | 3:2 |
| `hero-card-2.jpg` | Hero link card 2 ("Technology") | 3:2 |
| `about.jpg` | About section portrait | 544:664 |
| `service-1.jpg` … `service-5.jpg` | Services viewer tile (shown on card hover, desktop) | 4:3 |
| `mineral-1.jpg` … `mineral-5.jpg` | Materials circular slider | 1:1 |
| `safety.jpg` | Safety section image | 1:1 |
| `tech-1.jpg` … `tech-6.jpg` | Technology machine cards | 256:367 |
| `team-1.jpg` … `team-5.jpg` | Team viewer tile (shown on card hover, desktop) | 4:3 |
| `next.jpg` | "Next" CTA full-bleed background | 4:3 |

Photo credits for the placeholders are in `public/assets/images/CREDITS.md` (Unsplash / Pexels).

**Video:** the hero is marked with a `VIDEO SLOT` comment in `index.html`. Swap the `<img class="hero-media">` for the `<video>` snippet in that comment. The materials slider has a similar note: the reference uses a rotating 3D image sequence there.

## Replacing placeholder copy

Every block of placeholder text in `index.html` is preceded by a `<!-- PLACEHOLDER COPY -->` comment (brand name: `Northline`). Headline and paragraph lengths were matched to the reference so the line-based animations keep their rhythm. Long rewrites are fine because text is re-split on resize.

## Fonts

The reference uses commercial fonts; the closest Google Fonts are used instead:

| Reference | Used |
|---|---|
| Helvetica Now Display (500/700) | **Inter Tight** |
| PP Supply Mono Light | **DM Mono** (300) |

If you license the originals, change `--font-display` / `--font-mono` in `src/styles/base.css`.

## Structure

```
index.html                 markup + placeholder copy
src/main.js                boot order
src/js/motion.js           GSAP setup, shared eases (cubic-bezier(.6,0,0,1)), scroller
src/js/smooth-scroll.js    Lenis on the page card (lerp .125, syncTouch)
src/js/navbar.js           section-based navbar colours, hide on scroll, logo hover
src/js/menu.js             page-push menu open/close + icon hover
src/js/intro.js            loader + clip-path page reveal + hero entrance
src/js/scroll-effects.js   char reveal, parallax, card reveal, display title
src/js/cards.js            service/team card hover + mobile accordion, machine hover
src/js/minerals.js         pinned materials stage
src/js/testimonials.js     01/02 testimonial toggle
src/js/cylinder.js         3D partner cylinder
src/styles/                base (tokens, fluid type), chrome (nav/menu/loader), sections
```

`prefers-reduced-motion` turns off smooth scroll, the intro, scroll reveals, parallax and the 3D cylinder. The menu becomes a short cross-fade.
