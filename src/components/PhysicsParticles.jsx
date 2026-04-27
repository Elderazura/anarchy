import { useEffect, useRef } from "react";

// ── Constants ──────────────────────────────────────────────────────────────
const FOCAL = 420;          // perspective focal length
const FIELD_W = 1800;       // world X half-width
const FIELD_H = 1800;       // world Y half-height
const FIELD_DEPTH = 1600;   // world Z range (0 = camera, FIELD_DEPTH = far)

// Reduce particle budget on mobile to stay within thermal limits
const IS_MOBILE = typeof window !== "undefined" && window.innerWidth < 768;
const NUM_STARS = IS_MOBILE ? 160 : 580;
const NUM_NEBULA = IS_MOBILE ? 3 : 7;
const SHOOTING_INTERVAL = IS_MOBILE ? 6000 : 3800; // ms between shooting stars

// Scroll-zone accent colors for nebula tinting
const NEBULA_COLORS = [
  [126, 200, 232],  // works — cyan
  [126, 232, 192],  // studio — mint
  [255, 107, 53],   // services — orange
  [179, 136, 255],  // contact — violet
];

// ── Helpers ────────────────────────────────────────────────────────────────
function project(wx, wy, wz, cx, cy) {
  const scale = FOCAL / (FOCAL + wz);
  return {
    sx: cx + wx * scale,
    sy: cy + wy * scale,
    scale,
  };
}

function randRange(a, b) {
  return a + Math.random() * (b - a);
}

function lerpColor(a, b, t) {
  return a.map((v, i) => v + (b[i] - v) * t);
}

// ── Star factory ───────────────────────────────────────────────────────────
function makeStar() {
  const z = randRange(0, FIELD_DEPTH);
  // Brightness inversely proportional to depth (far = dimmer)
  const depthFrac = z / FIELD_DEPTH;
  const baseSize = depthFrac < 0.35
    ? randRange(1.2, 3.0)    // near — larger
    : randRange(0.3, 1.2);   // far — tiny

  // Color: mostly white/ice-blue, rare warm accent
  const warm = Math.random() < 0.07;
  const h = warm ? randRange(20, 50) : randRange(190, 230);
  const s = warm ? 80 : randRange(10, 45);
  const l = randRange(75, 98);

  return {
    x: randRange(-FIELD_W, FIELD_W),
    y: randRange(-FIELD_H, FIELD_H),
    z,
    vx: randRange(-0.12, 0.12),
    vy: randRange(-0.06, 0.06),
    vz: 0,
    size: baseSize,
    h, s, l,
    opacity: depthFrac < 0.35 ? randRange(0.5, 0.95) : randRange(0.12, 0.55),
    twinklePeriod: randRange(80, 260),
    twinkleOffset: Math.random() * 300,
    isShooting: false,
  };
}

// ── Nebula factory ─────────────────────────────────────────────────────────
function makeNebula(index) {
  return {
    x: randRange(-FIELD_W * 0.7, FIELD_W * 0.7),
    y: randRange(-FIELD_H * 0.7, FIELD_H * 0.7),
    z: randRange(FIELD_DEPTH * 0.5, FIELD_DEPTH * 0.95),
    vx: randRange(-0.04, 0.04),
    vy: randRange(-0.03, 0.03),
    radius: randRange(260, 560),
    colorIdx: index % NEBULA_COLORS.length,
    opacity: randRange(0.018, 0.055),
  };
}

// ── Shooting star factory ──────────────────────────────────────────────────
function makeShootingStar(vpW, vpH) {
  const angle = randRange(-0.4, 0.4) - Math.PI * 0.25; // mostly left-to-right diagonal
  const speed = randRange(14, 24);
  return {
    x: randRange(-FIELD_W * 0.5, FIELD_W * 0.5),
    y: randRange(-FIELD_H * 0.4, 0),
    z: randRange(FIELD_DEPTH * 0.1, FIELD_DEPTH * 0.4),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    vz: 0,
    size: randRange(1.5, 2.5),
    trail: [],
    maxTrail: Math.floor(randRange(18, 36)),
    life: 0,
    maxLife: Math.floor(randRange(50, 90)),
    isShooting: true,
  };
}

// ── Main component ─────────────────────────────────────────────────────────
export default function PhysicsParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let rafId;
    let vpW = window.innerWidth;
    let vpH = window.innerHeight;
    let frame = 0;

    const resize = () => {
      vpW = window.innerWidth;
      vpH = window.innerHeight;
      canvas.width = vpW;
      canvas.height = vpH;
    };
    resize();
    window.addEventListener("resize", resize);

    // Mouse
    let mx = vpW / 2, my = vpH / 2;
    let pmx = mx, pmy = my;
    let mvx = 0, mvy = 0;
    let mspeed = 0;
    let mouseActive = false;
    const onMove = (e) => { mx = e.clientX; my = e.clientY; mouseActive = true; };
    const onLeave = () => { mouseActive = false; };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);

    // Stars
    const stars = Array.from({ length: NUM_STARS }, makeStar);

    // Nebulae
    const nebulae = Array.from({ length: NUM_NEBULA }, (_, i) => makeNebula(i));

    // Shooting stars (dynamic list)
    const shooters = [];
    let lastShoot = 0;

    // ── Scroll-driven Z-flight ─────────────────────────────────────────────
    // As user scrolls, we shift the viewport Y center downward (flying effect)
    let scrollYOffset = 0;
    let targetScrollYOffset = 0;
    const onScroll = () => {
      targetScrollYOffset = window.scrollY * 0.18;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // ── Render ─────────────────────────────────────────────────────────────
    const tick = (now) => {
      rafId = requestAnimationFrame(tick);
      frame++;

      mvx = mx - pmx;
      mvy = my - pmy;
      mspeed = Math.sqrt(mvx * mvx + mvy * mvy);
      pmx = mx; pmy = my;

      // Ease scroll offset
      scrollYOffset += (targetScrollYOffset - scrollYOffset) * 0.04;

      const scrollFrac = Math.min(window.scrollY / window.innerHeight / 3, 1);
      const cx = vpW / 2;
      const cy = vpH / 2 - scrollYOffset * 0.5;

      ctx.clearRect(0, 0, vpW, vpH);

      // ── Nebulae (drawn first, very large blurred radial gradients) ────
      ctx.globalCompositeOperation = "source-over";
      for (const n of nebulae) {
        n.x += n.vx;
        n.y += n.vy;

        const proj = project(n.x, n.y, n.z, cx, cy);
        const r = n.radius * proj.scale;
        if (r < 10) continue;

        // Pick color blend based on scroll zone
        const colorA = NEBULA_COLORS[n.colorIdx];
        const colorB = NEBULA_COLORS[(n.colorIdx + 1) % NEBULA_COLORS.length];
        const [nr, ng, nb] = lerpColor(colorA, colorB, scrollFrac);

        const grad = ctx.createRadialGradient(proj.sx, proj.sy, 0, proj.sx, proj.sy, r);
        grad.addColorStop(0, `rgba(${nr|0},${ng|0},${nb|0},${n.opacity})`);
        grad.addColorStop(1, `rgba(${nr|0},${ng|0},${nb|0},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(proj.sx, proj.sy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Stars ──────────────────────────────────────────────────────────
      ctx.globalCompositeOperation = "lighter";

      for (const s of stars) {
        // Gentle drift
        s.x += s.vx;
        s.y += s.vy;

        // Cursor gravity well (near stars only)
        if (mouseActive && s.z < FIELD_DEPTH * 0.45) {
          const proj = project(s.x, s.y, s.z, cx, cy);
          const dx = proj.sx - mx;
          const dy = proj.sy - my;
          const dist2 = dx * dx + dy * dy;
          const GRAV_R2 = 28000;
          if (dist2 < GRAV_R2 && dist2 > 1) {
            const dist = Math.sqrt(dist2);
            const force = (1 - dist2 / GRAV_R2) * 0.18 * proj.scale;
            s.vx -= (dx / dist) * force;
            s.vy -= (dy / dist) * force;
          }
        }

        // Velocity damping
        s.vx *= 0.988;
        s.vy *= 0.988;

        // Wrap world bounds
        if (s.x > FIELD_W) s.x -= FIELD_W * 2;
        if (s.x < -FIELD_W) s.x += FIELD_W * 2;
        if (s.y > FIELD_H) s.y -= FIELD_H * 2;
        if (s.y < -FIELD_H) s.y += FIELD_H * 2;

        const proj = project(s.x, s.y, s.z, cx, cy);
        if (proj.sx < -20 || proj.sx > vpW + 20) continue;
        if (proj.sy < -20 || proj.sy > vpH + 20) continue;

        // Twinkle
        const twinkle = 0.75 + 0.25 * Math.sin((frame + s.twinkleOffset) / s.twinklePeriod * Math.PI * 2);
        const sz = s.size * proj.scale * twinkle;
        const alpha = s.opacity * twinkle;

        if (sz < 0.3 || alpha < 0.02) continue;

        const grad = ctx.createRadialGradient(proj.sx, proj.sy, 0, proj.sx, proj.sy, sz * 2.2);
        grad.addColorStop(0, `hsla(${s.h},${s.s}%,${s.l}%,${alpha})`);
        grad.addColorStop(0.4, `hsla(${s.h},${s.s}%,${s.l}%,${alpha * 0.5})`);
        grad.addColorStop(1, `hsla(${s.h},${s.s}%,${s.l}%,0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(proj.sx, proj.sy, sz * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Bright core for near stars
        if (sz > 1.2) {
          ctx.fillStyle = `hsla(${s.h},${s.s}%,98%,${alpha * 0.8})`;
          ctx.beginPath();
          ctx.arc(proj.sx, proj.sy, sz * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── Shooting stars ─────────────────────────────────────────────────
      if (now - lastShoot > SHOOTING_INTERVAL) {
        shooters.push(makeShootingStar(vpW, vpH));
        lastShoot = now;
      }

      ctx.globalCompositeOperation = "lighter";

      let si = shooters.length;
      while (si--) {
        const s = shooters[si];
        s.life++;

        if (s.life > s.maxLife) {
          shooters.splice(si, 1);
          continue;
        }

        const proj = project(s.x, s.y, s.z, cx, cy);
        s.trail.unshift({ sx: proj.sx, sy: proj.sy });
        if (s.trail.length > s.maxTrail) s.trail.pop();

        s.x += s.vx;
        s.y += s.vy;

        // Draw trail
        for (let t = 0; t < s.trail.length - 1; t++) {
          const a = (1 - t / s.trail.length) * (1 - s.life / s.maxLife) * 0.9;
          ctx.strokeStyle = `rgba(200,230,255,${a})`;
          ctx.lineWidth = s.size * (1 - t / s.trail.length) * proj.scale;
          ctx.beginPath();
          ctx.moveTo(s.trail[t].sx, s.trail[t].sy);
          ctx.lineTo(s.trail[t + 1].sx, s.trail[t + 1].sy);
          ctx.stroke();
        }

        // Head glow
        const headAlpha = (1 - s.life / s.maxLife) * 0.95;
        const headGrad = ctx.createRadialGradient(proj.sx, proj.sy, 0, proj.sx, proj.sy, s.size * 4 * proj.scale);
        headGrad.addColorStop(0, `rgba(240,248,255,${headAlpha})`);
        headGrad.addColorStop(1, `rgba(180,220,255,0)`);
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(proj.sx, proj.sy, s.size * 4 * proj.scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Cursor burst particles (fast swipe) ────────────────────────────
      if (mouseActive && mspeed > 9 && frame % 2 === 0) {
        const worldX = (mx - cx) * (FOCAL + FIELD_DEPTH * 0.3) / FOCAL;
        const worldY = (my - cy) * (FOCAL + FIELD_DEPTH * 0.3) / FOCAL;
        const burst = makeStar();
        burst.x = worldX + randRange(-30, 30);
        burst.y = worldY + randRange(-30, 30);
        burst.z = FIELD_DEPTH * 0.3;
        burst.vx = mvx * 0.4 + randRange(-1, 1);
        burst.vy = mvy * 0.4 + randRange(-1, 1);
        burst.size = randRange(1.5, 3);
        burst.opacity = 0.8;
        stars.push(burst);
        if (stars.length > NUM_STARS + 40) stars.shift();
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    };

    requestAnimationFrame((t) => { lastShoot = t; tick(t); });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 5,
      }}
    />
  );
}
