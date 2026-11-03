# Reference animation breakdown

Studied from the reference site's production JS bundle (`main.js` + lazy section chunks) and Webflow CSS.

## Stack found
- Webflow export + a custom Vite bundle.
- **GSAP 3** (core, ScrollTrigger, CustomEase), **Lenis** for smooth scroll, **Barba.js** for page transitions (not needed here: single page).
- Lenis wraps a fixed full-viewport scroller: `.page-wrap` (wrapper) → `.content-wrap` (content). Every ScrollTrigger uses `scroller: .page-wrap`.

## Signature easing
Almost everything uses one curve: `CustomEase "M0,0 C0.6,0 0,1 1,1"` = `cubic-bezier(0.6, 0, 0, 1)` (slow start, very fast middle, long soft landing). Standard duration **1.2s**. Hover micro-interactions use **0.5–0.6s** with the same curve (menu icon hover uses `0.68,0,0,1`).

## Fonts / colours
| Token | Reference | Used here |
|---|---|---|
| Display / body | Helvetica Now Display 500/700 (commercial) | **Inter Tight** 500/700 (Google Fonts) |
| Mono labels | PP Supply Mono Light 300 (commercial) | **DM Mono** 300 (Google Fonts) |
| `--primary` | `#151515` | same |
| `--accent` | `#f47920` | same |
| `--light-green` | `#ebf0ed` | same |
| `--gray` | `#e0e0e0` | same |

Fluid type: `font-size = clamp(min, 100vw, max) / (ideal / 16)`, with ideal widths 1440 / 834 / 550 / 390 across four breakpoints. All spacing is in `em` against that, so the whole layout scales with the viewport.

## 1. Menu (top priority)
It is not an overlay. It's a **"page push" menu**: the menu sits *behind* the page.

- `.nav-inner` (3 columns of big white links) is `position: fixed; z-index: 0` on a `#151515` body.
- Open = animate the **whole page card** (`.page-wrap`), 1.2s, `cubic-bezier(.6,0,0,1)`, all at t=0:
  - `top: 0 → (menu bottom + 9em)` desktop / `15em` tablet / `32em` mobile
  - `scale: 1 → (vw − 64)/vw` desktop, `(vw − 32)/vw` mobile, `transform-origin: 50% 0`
  - `border-radius: 0 → 1rem`
- Links: each link starts pushed down by a **different margin-top** (`8em, 11em, 14em` / `10em, 13em, 16em` / `12em, 15em, 18em`, per column) inside an `overflow:hidden` row and animates to `0`. Same duration for all, so the larger distances *read* as a diagonal stagger without any delay. Close reverses it.
- Lenis is stopped while open. Clicking the shrunken page closes the menu. A click mid-animation reverses the running timeline.
- **Trigger button**: "Menu" label + a 3rem circle with 2 hairline bars (at 42% / 42%, 5px gap).
  - Hover (0.6s, `.68,0,0,1`): bars meet at centre, bar 2 rotates 90° → a "+", circle fills `--primary`, bars go white, label rolls up (two stacked copies, `yPercent: -50`).
  - Open (1.2s): the whole icon rotates **45°** (the "+" becomes "×"), circle → `--accent` orange, bars → `--primary`.
  - Close: rotation 0, bars back to 42%, colours back to the section theme.
- **Link hover** (desktop): each link is translated left by (icon width + gap) so the arrow icon is hidden; hover slides it to `x: 0` (0.5s), revealing the icon.
- **Navbar** hides on scroll down (logo slides out left, button slides out right: `left/right: -9em`, 0.5s) and returns on scroll up. Its colours (logo + icon) follow the section under it (`hero`, `white`, `lightgreen`, `black`, `menu` themes).

## 2. Intro / loader
- Centered logo box: the square grows `0 → 100%` while the icon rotates in (`yPercent 100, rotation 70 → 0`), 0.8s.
- The box widens to fit the wordmark; letters rise in (`yPercent 100 + i·40`, stagger 0.02), 0.8s.
- **Page reveal (desktop)**: an SVG luminance mask with a rounded-rect hole starts at the logo box and grows to the full viewport (`−24px` bleed), 1.8s. The hero entrance plays at the same time. On mobile the loader just fades out (1.8s).

## 3. Hero
- Full-bleed background (video + scroll-scrubbed image sequence on the reference: **placeholder image here**).
- H1 = two lines, each in an `overflow:hidden` wrapper, `yPercent 110 → 0`, 1.2s, stagger **0.03s**. Small mono eyebrow uses `yPercent 130`.
- Two small link cards bottom-right rise at **+0.5s** (`yPercent 110` / `120`).
- Navbar slides in from off-screen to its `2em` inset, same timeline.
- Background parallax: `y: 0 → 40px` scrubbed while the hero scrolls out.

## 4. Scroll effects
- **Paragraph reveal** (`[tr]`, big intro paragraphs): split into lines/words/chars, chars start at `opacity .2`; each line scrubs to `1` with stagger 0.02 between `top 85%` and `top 50%`.
- **Image parallax** (`.image-p`): image is 120% tall inside an `overflow:hidden` wrapper, `yPercent −10 → 10`, scrubbed from `top bottom` over (wrapper height + viewport).
- **Cards reveal** (services/teams cards): `autoAlpha 0, y 2em → 1, 0`, 0.8s `power2.out`, once at `top 85%`.
- **Service cards hover**: card turns orange; matching photo fades into the spare grid tile (0.8s `cubic-bezier(.5,0,0,1)`); description lines slide up (0.4s, 0.03s per line).
- **Minerals**: pinned stage. Scroll progress steps through 5 items: names list `opacity 1 / .15` (0.25s), circular-masked slider `xPercent −20·i` (1.2s) with each image rotating ±30° as it slides, mono labels roll (0.25s), and a ring fills via a conic-gradient mask.
- **Safety**: text column pinned/sticky on desktop.
- **Technology**: "Over 360 machines"-style display title revealed by gradient overlays sweeping `width 0 → 100%` (2s, stagger 0.025) while eyebrow words rotate up (`yPercent 100, rotation 70 → 0`), at `top 80%`. Machine cards: hover lifts the name and dims siblings to 0.4 (0.3s).
- **Testimonials**: two quotes with a 1/2 toggle; indicator slides (0.6s); quote lines rise (`yPercent 100 → 0`, 0.6s, stagger 0.05); auto-advance every 5s while in view.
- **Partners**: pinned 3D **cylinder** of names (`rotateX` scrubbed); the name nearest centre is full opacity, others 20%; side tick rulers scale ticks near the centre.
- **Next section**: dark full-bleed image with a single centred CTA.
- **Buttons**: label block slides `x 0 → 2.25em` on hover (0.5s), revealing an arrow.
