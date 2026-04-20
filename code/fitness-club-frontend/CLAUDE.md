# CLAUDE.md — Premium Fitness Website Design System

## CRITICAL DESIGN RULES — READ BEFORE WRITING ANY CSS/JSX

### ❌ ABSOLUTELY FORBIDDEN
- NO purple gradients. NO neon colors. NO dark-mode-with-glowing-borders.
- NO generic AI aesthetics (purple/blue gradients, dark cards with neon accents).
- NO Inter, Roboto, Arial, or system font stacks as primary fonts.
- NO cookie-cutter component patterns. NO generic hero sections with centered text on a gradient.
- NO placeholder images — always use real Unsplash URLs with relevant fitness/lifestyle photography.
- NO border-radius above 12px on cards (no pill-shaped containers).
- NO excessive drop shadows. Shadows should be subtle and atmospheric.
- NO rainbow or multi-color gradients anywhere.

### ✅ DESIGN PHILOSOPHY — "Luxury Fitness Editorial"
This website should feel like walking into an Equinox club or browsing Nike Training: 
**premium, clean, confident, aspirational.** Think high-end magazine editorial meets 
modern glassmorphism. Every pixel should communicate exclusivity and quality.

---

## 1. COLOR SYSTEM

### Primary Palette
```
--color-bg-primary: #FAFAF9          /* Warm off-white, not pure white */
--color-bg-secondary: #F5F5F0        /* Slightly warmer sections */
--color-bg-dark: #0A0A0A             /* Near-black for contrast sections */
--color-bg-dark-alt: #141414         /* Slightly lighter dark */
--color-text-primary: #1A1A1A        /* Rich black, not pure black */
--color-text-secondary: #6B6B6B      /* Muted gray for body text */
--color-text-light: #FAFAF9          /* Light text on dark backgrounds */
--color-text-muted: #9A9A9A          /* Very muted, captions/labels */
```

### Accent Colors (USE SPARINGLY — one accent per section max)
```
--color-accent-gold: #C9A96E         /* Luxury gold — CTAs, highlights */
--color-accent-gold-hover: #B8943F   /* Darker gold on hover */
--color-accent-warm: #E8DDD3         /* Warm cream for subtle backgrounds */
--color-accent-sage: #8B9D83         /* Muted sage green for wellness sections */
```

### Glass Effects
```
--glass-bg: rgba(255, 255, 255, 0.12)
--glass-bg-strong: rgba(255, 255, 255, 0.18)
--glass-border: rgba(255, 255, 255, 0.2)
--glass-border-subtle: rgba(255, 255, 255, 0.08)
--glass-blur: blur(20px)
--glass-blur-heavy: blur(40px)

/* Glass on light backgrounds */
--glass-light-bg: rgba(255, 255, 255, 0.6)
--glass-light-border: rgba(255, 255, 255, 0.8)
--glass-light-blur: blur(16px)
```

---

## 2. TYPOGRAPHY

### Font Stack
```css
/* Import these in every file */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');

--font-heading: 'Playfair Display', Georgia, serif;    /* Headlines — elegant, editorial */
--font-body: 'Plus Jakarta Sans', system-ui, sans-serif; /* Body — modern, clean */
```

### Type Scale
```
Hero headline:        4rem–6rem, font-weight: 700, letter-spacing: -0.03em, line-height: 1.05
Section headline:     2.5rem–3.5rem, font-weight: 700, letter-spacing: -0.02em
Subheadline:          1.25rem–1.5rem, font-weight: 300, letter-spacing: 0.02em (Plus Jakarta Sans)
Body text:            1rem–1.125rem, font-weight: 400, line-height: 1.7, color: var(--color-text-secondary)
Caption/Label:        0.75rem, font-weight: 600, letter-spacing: 0.12em, text-transform: uppercase
Nav links:            0.875rem, font-weight: 500, letter-spacing: 0.08em, text-transform: uppercase
```

### Typography Rules
- Headlines use Playfair Display (serif) — creates editorial luxury feel
- Body and UI text use Plus Jakarta Sans (sans-serif) — clean and modern
- ALL labels, nav links, and captions: uppercase + wide letter-spacing (0.08em–0.15em)
- Hero text should be LARGE (4-6rem) and confident, not timid
- Use font-weight: 300 (light) for elegant subheadlines to contrast with bold headlines

---

## 3. LAYOUT PATTERNS (Extracted from Nike + Equinox)

### Hero Section Pattern
```
- Full-viewport height (100vh) or min-height: 90vh
- Background: High-quality Unsplash image (fitness, architecture, lifestyle)
- Image treatment: slight brightness reduction (filter: brightness(0.7))
- Content overlay: glassmorphism panel OR clean text directly on dimmed image
- Text: Large serif headline (Playfair Display) + light sans-serif subtitle
- CTA: Minimal button — no border-radius, letter-spacing, uppercase, border-only or solid
- Navigation: Transparent, positioned absolute over hero, turns solid on scroll
```

### Section Rhythm (Nike Training Club pattern)
```
- Alternate between: 
  1. Full-bleed image sections (100vw, edge-to-edge)
  2. Content sections with generous padding (100px–140px vertical)
  3. Split sections (image left + text right, or vice versa — 50/50 or 60/40)
- Section padding: 100px 0 minimum (generous whitespace is premium)
- Max content width: 1200px–1400px, centered
- Between sections: no visible borders — use background color changes to separate
```

### Card Pattern (Glassmorphism)
```css
.glass-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px; /* subtle, not pill-shaped */
  padding: 2rem;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-4px);
}

/* Glass card on LIGHT backgrounds */
.glass-card-light {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
}
```

### Navigation Pattern (Equinox-style)
```
- Position: fixed, transparent over hero
- Layout: Logo (left) — Nav links (center) — CTA button (right)
- Nav links: uppercase, letter-spacing 0.1em, font-size 0.8rem, font-weight 500
- On scroll: background transitions to solid white/black with subtle shadow
- Transition: background 0.3s ease, box-shadow 0.3s ease
- Height: 70-80px
- Glass effect on scroll: backdrop-filter: blur(20px), semi-transparent bg
```

---

## 4. IMAGE STRATEGY

### Unsplash URLs — Use these categories
For hero backgrounds:
```
https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80  (gym interior)
https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1920&q=80  (person training)
https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1920&q=80  (modern gym)
https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1920&q=80  (fitness lifestyle)
https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=1920&q=80  (yoga/wellness)
```

For section backgrounds and cards:
```
https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&q=80   (training)
https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80  (group fitness)
https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80  (strength)
https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&q=80  (equipment)
```

### Image Treatment Rules
- NEVER use images without treatment — always apply one of:
  - `filter: brightness(0.6)` for text overlay backgrounds
  - `object-fit: cover` — ALWAYS, never stretch
  - Subtle warm color overlay: `linear-gradient(rgba(26,26,26,0.4), rgba(26,26,26,0.6))`
  - For light sections: `filter: brightness(1.05) saturate(0.9)` for soft, editorial feel

---

## 5. EFFECTS & ANIMATION

### Scroll-triggered Reveal (Use for all content sections)
```css
.reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
/* Stagger children with animation-delay: 0.1s increments */
```

### Hover Effects
```css
/* Links: underline grows from left */
.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: currentColor;
  transition: width 0.3s ease;
}
.nav-link:hover::after { width: 100%; }

/* Images: subtle scale */
.image-container:hover img {
  transform: scale(1.03);
  transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Buttons: background fill from left */
.btn-outline {
  border: 1px solid var(--color-text-primary);
  background: transparent;
  position: relative;
  overflow: hidden;
  transition: color 0.4s ease;
}
.btn-outline::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 0; height: 100%;
  background: var(--color-text-primary);
  transition: width 0.4s ease;
  z-index: -1;
}
.btn-outline:hover { color: white; }
.btn-outline:hover::before { width: 100%; }
```

### CTA Button Style
```css
.cta-button {
  padding: 14px 40px;
  border: none;
  border-radius: 0;          /* Square, not rounded — premium feel */
  background: var(--color-text-primary);
  color: white;
  font-family: var(--font-body);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
}
.cta-button:hover {
  background: var(--color-accent-gold);
  transform: translateY(-2px);
}
```

---

## 6. COMPONENT REFERENCE

### Pricing / Membership Cards
- Use glassmorphism on a dark background with fitness image behind
- Card: glass-bg, no heavy borders, generous padding (2.5rem)
- Price: Large serif number (Playfair Display, 3rem+), light weight
- Features: Small uppercase labels, not bullet points
- CTA: Full-width button at bottom, square corners

### Testimonial Section
- Large serif quote marks (Playfair Display, 6rem, opacity 0.15)
- Quote text: 1.5rem, italic Playfair Display, line-height 1.8
- Attribution: uppercase sans-serif, letter-spacing 0.1em, small

### Stats / Numbers Section
- Large numbers: Playfair Display, 4-5rem, gold accent color
- Labels beneath: uppercase Plus Jakarta Sans, 0.7rem, letter-spacing 0.15em
- Layout: 3-4 columns, generous gap (4rem+)
- Background: dark section with subtle texture or gradient

### Footer
- Dark background (#0A0A0A)
- Minimal content, generous padding
- Links: uppercase, small, letter-spacing
- Newsletter input: minimal, bottom-border only, no rounded corners
- Social icons: small, muted, brighten on hover

---

## 7. RESPONSIVE RULES
- Hero headline: 6rem → 3rem on mobile
- Section padding: 100px → 60px on mobile
- Grid columns: collapse to single column below 768px
- Nav: hamburger menu on mobile, full links on desktop
- Glass effects: reduce blur on mobile for performance (blur(10px))
- Images: maintain aspect ratio, use object-fit: cover

---

## 8. OVERALL VIBE CHECK
Before committing any component, ask:
1. Would this look at home on equinox.com or nike.com/training? If no, redesign.
2. Does it use real photography, not illustrations or icons-as-hero? If no, fix.
3. Is the typography confident (large headlines, generous spacing)? If timid, enlarge.
4. Are there at least 2 full-bleed image moments? If no, add them.
5. Does it feel like a magazine spread? If it feels like a SaaS landing page, start over.
6. Is there generous whitespace? If everything is cramped, add more padding.
