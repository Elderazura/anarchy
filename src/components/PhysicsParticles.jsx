import { useEffect, useRef } from "react";

const MAX_PARTICLES = 280;
const GRAVITY = 0.028;
const DAMPING = 0.992;
const BOUNCE = 0.5;
const FLOOR_FRICTION = 0.88;

const ATTRACT_RADIUS = 150;
const ATTRACT_FORCE = 0.15;
const REPEL_RADIUS = 120;
const REPEL_FORCE = 0.45;
const BURST_SPEED_THRESHOLD = 8;
const MODE_SWITCH_SPEED = 2;

function getSpawnColor() {
  const scrollFraction = window.scrollY / window.innerHeight;
  if (scrollFraction < 1) return { h: 185 + Math.random() * 10, s: 70, l: 70 };
  if (scrollFraction < 2) return { h: 35 + Math.random() * 10, s: 80, l: 65 };
  if (scrollFraction < 3) return { h: 155 + Math.random() * 10, s: 70, l: 68 };
  return { h: 200, s: 20, l: 80 };
}

function createEdgeParticle(vpW, vpH) {
  const { h, s, l } = getSpawnColor();
  const typeRoll = Math.random();
  const type = typeRoll < 0.08 ? "spark" : typeRoll < 0.20 ? "diamond" : "circle";
  const size = type === "spark" ? Math.random() * 5 + 3 : Math.random() * 4 + 0.8;
  const isFast = Math.random() < 0.12;
  const speed = isFast ? Math.random() * 1.4 + 0.8 : Math.random() * 0.35 + 0.05;

  const edge = Math.floor(Math.random() * 4);
  let x, y, vx, vy;
  const spread = (Math.random() - 0.5) * 0.9;

  if (edge === 0) {
    x = Math.random() * vpW;
    y = 0;
    vx = Math.cos(spread) * speed * (Math.random() < 0.5 ? -1 : 1);
    vy = Math.abs(Math.sin(spread)) * speed + 0.1;
  } else if (edge === 1) {
    x = vpW;
    y = Math.random() * vpH;
    vx = -speed;
    vy = (Math.random() - 0.5) * speed;
  } else if (edge === 2) {
    x = Math.random() * vpW;
    y = vpH;
    vx = (Math.random() - 0.5) * speed;
    vy = -speed;
  } else {
    x = 0;
    y = Math.random() * vpH;
    vx = speed;
    vy = (Math.random() - 0.5) * speed;
  }

  return {
    x, y, vx, vy,
    h, s, l,
    size,
    type,
    opacity: Math.random() * 0.52 + 0.1,
    life: 0,
    maxLife: Math.floor(Math.random() * 280 + 120),
    trail: [],
  };
}

function createBurstParticle(x, y, dirX, dirY, speed, vpW, vpH) {
  const { h, s, l } = getSpawnColor();
  const typeRoll = Math.random();
  const type = typeRoll < 0.08 ? "spark" : typeRoll < 0.20 ? "diamond" : "circle";
  const size = type === "spark" ? Math.random() * 5 + 3 : Math.random() * 3 + 1;

  // Velocity roughly along cursor direction with spread
  const baseSpeed = speed * (0.12 + Math.random() * 0.18);
  const angle = Math.atan2(dirY, dirX) + (Math.random() - 0.5) * 1.2;
  const vx = Math.cos(angle) * baseSpeed;
  const vy = Math.sin(angle) * baseSpeed;

  return {
    x, y, vx, vy,
    h, s, l,
    size,
    type,
    opacity: Math.random() * 0.6 + 0.2,
    life: 0,
    maxLife: Math.floor(Math.random() * 160 + 80),
    trail: [],
  };
}

export default function PhysicsParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let rafId;
    let vpW = window.innerWidth;
    let vpH = window.innerHeight;

    const resize = () => {
      vpW = window.innerWidth;
      vpH = window.innerHeight;
      canvas.width = vpW;
      canvas.height = vpH;
    };
    resize();

    // Mouse state
    let mouseX = 0, mouseY = 0;
    let prevMouseX = 0, prevMouseY = 0;
    let mouseVX = 0, mouseVY = 0;
    let mouseSpeed = 0;
    let mouseOnScreen = false;

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseOnScreen = true;
    };
    const onLeave = () => { mouseOnScreen = false; };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", resize);

    // Particle pool
    const particles = [];
    let frameCount = 0;
    let lastEdgeSpawn = 0;

    // Seed some initial particles
    for (let i = 0; i < 50; i++) {
      particles.push(createEdgeParticle(vpW, vpH));
    }

    const drawCircle = (p, screenY, alpha) => {
      const grad = ctx.createRadialGradient(p.x, screenY, 0, p.x, screenY, p.size);
      grad.addColorStop(0, `hsla(${p.h},${p.s}%,${p.l}%,${alpha * 0.9})`);
      grad.addColorStop(1, `hsla(${p.h},${p.s}%,${p.l}%,0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, screenY, p.size, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawDiamond = (p, screenY, alpha) => {
      const sz = p.size * 1.5;
      ctx.save();
      ctx.translate(p.x, screenY);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = `hsla(${p.h},${p.s}%,${p.l}%,${alpha})`;
      ctx.fillRect(-sz / 2, -sz / 2, sz, sz);
      ctx.restore();
    };

    const drawSpark = (p, screenY, alpha) => {
      const ang = Math.atan2(p.vy, p.vx);
      ctx.save();
      ctx.translate(p.x, screenY);
      ctx.rotate(ang);
      ctx.lineCap = "round";
      ctx.strokeStyle = `hsla(${p.h},${p.s}%,${p.l}%,${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(p.size, 0);
      ctx.stroke();
      ctx.restore();
    };

    const drawTrail = (p, scrollY) => {
      if (p.trail.length < 2) return;
      if (p.type !== "circle" && p.type !== "diamond") return;

      ctx.globalCompositeOperation = "source-over";
      for (let t = 0; t < p.trail.length - 1; t++) {
        const alpha = (t / p.trail.length) * 0.12;
        const screenTY0 = p.trail[t].y - scrollY;
        const screenTY1 = p.trail[t + 1].y - scrollY;
        ctx.strokeStyle = `hsla(${p.h},${p.s}%,${p.l}%,${alpha})`;
        ctx.lineWidth = p.size * 0.5;
        ctx.beginPath();
        ctx.moveTo(p.trail[t].x, screenTY0);
        ctx.lineTo(p.trail[t + 1].x, screenTY1);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = "lighter";
    };

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      frameCount++;

      const scrollY = window.scrollY;

      // Update mouse velocity
      mouseVX = mouseX - prevMouseX;
      mouseVY = mouseY - prevMouseY;
      mouseSpeed = Math.sqrt(mouseVX * mouseVX + mouseVY * mouseVY);
      prevMouseX = mouseX;
      prevMouseY = mouseY;

      // Spawn edge particles every 4 frames
      if (frameCount - lastEdgeSpawn >= 4 && particles.length < MAX_PARTICLES) {
        particles.push(createEdgeParticle(vpW, vpH));
        lastEdgeSpawn = frameCount;
      }

      // Cursor burst spawn when speed > threshold
      if (mouseOnScreen && mouseSpeed > BURST_SPEED_THRESHOLD && particles.length < MAX_PARTICLES) {
        const count = Math.floor(Math.random() * 3) + 3; // 3–5
        for (let b = 0; b < count && particles.length < MAX_PARTICLES; b++) {
          particles.push(createBurstParticle(mouseX, mouseY + scrollY, mouseVX, mouseVY, mouseSpeed, vpW, vpH));
        }
      }

      ctx.clearRect(0, 0, vpW, vpH);
      ctx.globalCompositeOperation = "lighter";

      const isAttract = mouseOnScreen && mouseSpeed < MODE_SWITCH_SPEED;

      let i = particles.length;
      while (i--) {
        const p = particles[i];
        p.life++;

        if (p.life > p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        // Record trail (absolute page coords)
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 4) p.trail.shift();

        // Gravity
        p.vy += GRAVITY;

        // Air damping
        p.vx *= DAMPING;
        p.vy *= DAMPING;

        // Mouse interaction
        if (mouseOnScreen) {
          const screenY = p.y - scrollY;
          const dx = p.x - mouseX;
          const dy = screenY - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (isAttract) {
            if (dist < ATTRACT_RADIUS && dist > 0.1) {
              const force = (ATTRACT_RADIUS - dist) / ATTRACT_RADIUS * ATTRACT_FORCE;
              // Attract: push toward cursor (negative direction)
              p.vx -= (dx / dist) * force;
              p.vy -= (dy / dist) * force;
            }
          } else {
            if (dist < REPEL_RADIUS && dist > 0.1) {
              const force = (REPEL_RADIUS - dist) / REPEL_RADIUS * REPEL_FORCE;
              p.vx += (dx / dist) * force;
              p.vy += (dy / dist) * force;
            }
          }
        }

        // Move (y in page coords)
        p.x += p.vx;
        p.y += p.vy;

        // Floor bounce (viewport bottom in page coords)
        const vpFloor = scrollY + vpH - 10;
        if (p.y > vpFloor) {
          p.y = vpFloor;
          p.vy = -Math.abs(p.vy) * BOUNCE;
          p.vx *= FLOOR_FRICTION;
        }

        // Horizontal wrap
        if (p.x < -p.size) p.x = vpW + p.size;
        if (p.x > vpW + p.size) p.x = -p.size;

        // Only draw if in viewport
        const screenY = p.y - scrollY;
        if (screenY < -p.size * 2 || screenY > vpH + p.size * 2) continue;

        const lifeFade = Math.min(1, p.life / 20) * Math.min(1, (p.maxLife - p.life) / 30);
        const alpha = p.opacity * lifeFade;

        // Draw trail (switches composite op internally)
        drawTrail(p, scrollY);

        // Draw particle with additive blending
        ctx.globalCompositeOperation = "lighter";

        if (p.type === "circle") {
          drawCircle(p, screenY, alpha);
        } else if (p.type === "diamond") {
          drawDiamond(p, screenY, alpha);
        } else {
          drawSpark(p, screenY, alpha);
        }
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    };

    tick();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", resize);
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
