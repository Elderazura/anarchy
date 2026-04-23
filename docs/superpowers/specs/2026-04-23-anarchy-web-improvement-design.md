# Anarchy Studios Web — Full Improvement Spec
**Date:** 2026-04-23  
**Approach:** Option B — Full Sprint across all 3 pillars  
**Stack additions:** framer-motion, Magic UI visual components (manually adapted, no Tailwind dep)

---

## 1. Architecture Overview

The existing app has two top-level states: `enteredSite = false` (hero/3D) and `enteredSite = true` (content site). Both will be improved in-place. No routing library added — state-driven navigation stays.

### New file structure
```
src/
  components/
    LoadingScreen.jsx       # NEW — GLB loading overlay with progress
    ShowreelPlayer.jsx      # NEW — video player for hero showreel
    WorksGrid.jsx           # NEW — masonry grid of 8 client videos
    ServicesGrid.jsx        # NEW — icon cards replacing text spans
    ContactSection.jsx      # NEW — email CTA + socials footer
    ui/
      MagicParticles.jsx    # NEW — Magic UI-style particle field (canvas)
      ShimmerButton.jsx     # NEW — shimmer CTA button component
      BorderBeam.jsx        # NEW — animated border beam for cards
      AnimatedGradientText.jsx  # NEW — gradient text with animation
```

---

## 2. Dependencies

```
framer-motion   — page transitions, section entrances, hero crossfade
lucide-react    — already installed, use for services icons
```

No Tailwind added. Magic UI effects are hand-ported as standalone components using framer-motion + CSS custom properties.

---

## 3. Pillar 1 — Hero & 3D Experience

### 3.1 Loading Screen
- Renders while `<Suspense>` is loading GLBs
- Displays Anarchy logo, animated progress bar, and "Loading world…" label
- Framer Motion `AnimatePresence` fades it out once 3D scene is ready
- Component: `LoadingScreen.jsx` — receives `isReady: boolean` prop

### 3.2 Hero → Site Transition
- `enteredSite` toggle wrapped in Framer Motion `AnimatePresence`
- Hero exits: `opacity 0, scale 0.97` over 400ms ease-in
- Site enters: `opacity 0 → 1, y 20 → 0` over 380ms ease-out
- Stagger: hero exits first (200ms), then site enters

### 3.3 Bot Dialogue Text Fix
- `Character.jsx`: `.bot-dialogue p` font-size `0.22rem` → `0.82rem`
- `.bot-dialogue-tag` `0.16rem` → `0.65rem`
- `.bot-dialogue` width `58px` → `160px`, padding `8px 10px`
- In-world HTML bubble scales with `distanceFactor` already — just fix source size

### 3.4 Particle Atmosphere (Magic UI-style)
- Replace or augment `ParticleField.jsx` with richer ambient particles
- Add floating ember dots that drift upward with sine-wave oscillation
- Subtle depth fog already exists — keep it

---

## 4. Pillar 2 — Content & Real Assets

### 4.1 Video assets available
```
/public/video/
  Hanumankind – The Game Don't Stop _ Squid Game 2 _ Kalmi, Parimal Shais _ Netflix India.mp4
  Once upon a toast…we thought we had it all..mp4
  cult AD 1.mp4
  cult AD 2.mp4
  pubg.mp4
  ray.mp4
  solana.mp4
  urban animal.mp4
```

### 4.2 ShowreelPlayer
- Replaces `<aside className="showreel-media">` placeholder
- `<video>` element with `autoPlay muted loop playsInline controls`
- Default src: `pubg.mp4` (most cinematic) — easily changed
- Framer Motion border shimmer on hover (BorderBeam component)
- Aspect ratio 16:9, border-radius 14px

### 4.3 WorksGrid
- Rendered on `sitePage === "works"` inside page
- 8 cards from the video files — each card:
  - `<video>` thumbnail (muted, paused, shows first frame via `preload="metadata"`)
  - On hover: video plays, overlays client name + category tag
  - Client names derived from filenames
  - Framer Motion `whileHover` scale 1.02, border glow
- Grid: 2-col on mobile, 3-col on desktop, gap 16px
- Entrance: staggered fade-up (30ms per card) using `motion.div` + `viewport`

### 4.4 Studio / About
- Replace placeholder `<section>` with real content layout
- Two-column: text left, decorative right (animated gradient block)
- Copy: "Small team. Heavy intent." philosophy, tech stack (Three.js, AI, Blender, UE5)

### 4.5 ContactSection
- Added to bottom of home page and inside pages
- Centered layout: heading, email address as `<a href="mailto:...">`, social links (Twitter/X, Instagram)
- AnimatedGradientText on heading
- Framer Motion entrance from below

---

## 5. Pillar 3 — Design Quality & UX

### 5.1 CSS Design Tokens
Added to `:root` in `styles.css`:
```css
--color-bg: #04070d;
--color-surface: rgba(255,255,255,0.04);
--color-border: rgba(255,255,255,0.08);
--color-accent: #7ec8e8;
--color-accent-2: #7ee8c0;
--color-text: #d8efff;
--color-text-muted: #89a8b8;
--radius-card: 14px;
--duration-fast: 160ms;
--duration-mid: 300ms;
--duration-slow: 500ms;
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
```

### 5.2 Section Entrance Animations
- Each `<section>` in home wraps its content in `motion.div`
- `initial={{ opacity: 0, y: 32 }}` → `whileInView={{ opacity: 1, y: 0 }}`
- `viewport={{ once: true, margin: "-80px" }}`, transition 400ms ease-out

### 5.3 ServicesGrid
- Replace `<span>` tags with `motion.div` cards
- Each card: Lucide icon + label + subtle description
- Icons: Film (Animation), Zap (VFX), Box (3D), Cpu (AI)
- BorderBeam on hover, 2-col mobile / 4-col desktop

### 5.4 ShimmerButton
- Replaces `.hero-action-main` and `.section-cta` with shimmer variant
- Shimmer: moving highlight across button surface, 2s loop
- Implemented via CSS `@keyframes` + Framer Motion `animate`

### 5.5 Responsive Polish
- Works grid: `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`
- Contact section: stacks vertically on mobile
- Nav: already has mobile styles, add `gap` fix for very small screens

---

## 6. What Is NOT in Scope
- Routing library (React Router) — state-driven nav stays
- CMS or backend — static content only
- Authentication, forms with submission — contact is mailto link only
- Performance profiling of Three.js — existing 3D stays as-is
- The quip API endpoint (`VITE_QUIP_ENDPOINT`) — no changes to botQuips.js

---

## 7. Implementation Order for Parallel Agents

**Track A (Agent 1) — Foundation**
- Install framer-motion
- Add CSS design tokens to `styles.css`
- Fix `Character.jsx` bot dialogue sizes
- Create `LoadingScreen.jsx`
- Create `ui/ShimmerButton.jsx`, `ui/BorderBeam.jsx`, `ui/AnimatedGradientText.jsx`

**Track B (Agent 2) — Content Components**
- Create `ShowreelPlayer.jsx`
- Create `WorksGrid.jsx` with all 8 video files
- Create `ContactSection.jsx`
- Create `ServicesGrid.jsx`

**Track C (Agent 3, sequential after A+B) — App Integration**
- Update `App.jsx`: import all new components, add AnimatePresence transition, wire WorksGrid into works page, add ContactSection, replace showreel placeholder
- Wrap sections in `motion.div` entrance animations

---

## 8. Success Criteria
- No black void on load — loading screen visible within 100ms
- Hero → site transition is smooth (crossfade, not instant swap)
- Bot dialogue text is readable at normal viewing distance
- All 8 videos visible in Works grid with hover-play
- Contact section present and functional (mailto link)
- Services section has icon cards
- Site passes visual check at 375px, 768px, 1440px
