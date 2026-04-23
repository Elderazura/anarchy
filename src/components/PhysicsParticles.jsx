import { useEffect, useRef } from "react";

const COLORS = ["#7ec8e8", "#7ee8c0", "#a0c8ff", "#c8e8ff", "#5ab8d0"];
const MAX_PARTICLES = 120;
const GRAVITY = 0.032;
const DAMPING = 0.994;
const BOUNCE = 0.42;        // restitution on floor bounce
const MOUSE_RADIUS = 100;
const MOUSE_FORCE = 0.38;

function createParticle(vpW, vpH, scrollY) {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const typeRoll = Math.random();
  const type = typeRoll < 0.05 ? "spark" : typeRoll < 0.15 ? "square" : "circle";
  const radius = type === "spark" ? 1 : Math.random() * 4.2 + 0.4;
  const isFast = Math.random() < 0.12;
  const speed = isFast ? Math.random() * 1.4 + 0.8 : Math.random() * 0.35 + 0.05;

  // Pick spawn edge: 0=top, 1=right, 2=bottom, 3=left
  const edge = Math.floor(Math.random() * 4);
  let x, pageY, vx, vy;
  const angle = (Math.random() - 0.5) * 0.9; // spread inward
  if (edge === 0) {
    x = Math.random() * vpW;
    pageY = scrollY + 0;
    vx = Math.cos(angle) * speed * (Math.random() < 0.5 ? -1 : 1);
    vy = Math.abs(Math.sin(angle)) * speed + 0.1;
  } else if (edge === 1) {
    x = vpW;
    pageY = scrollY + Math.random() * vpH;
    vx = -speed;
    vy = (Math.random() - 0.5) * speed;
  } else if (edge === 2) {
    x = Math.random() * vpW;
    pageY = scrollY + vpH;
    vx = (Math.random() - 0.5) * speed;
    vy = -speed;
  } else {
    x = 0;
    pageY = scrollY + Math.random() * vpH;
    vx = speed;
    vy = (Math.random() - 0.5) * speed;
  }

  return {
    x, pageY, vx, vy,
    radius,
    type,
    color,
    opacity: Math.random() * 0.52 + 0.08,
    life: 0,
    maxLife: Math.floor(Math.random() * 280 + 120),
    sparkLen: type === "spark" ? Math.random() * 10 + 6 : 0,
  };
}

export default function PhysicsParticles() {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    particles: [],
    mouse: { x: -9999, y: -9999 },
    scrollY: 0,
    lastSpawn: 0,
    frameCount: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const s = stateRef.current;
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

    // Seed initial particles
    for (let i = 0; i < 40; i++) {
      s.particles.push(createParticle(vpW, vpH, s.scrollY));
    }

    const onScroll = () => { s.scrollY = window.scrollY; };
    const onMouseMove = (e) => { s.mouse.x = e.clientX; s.mouse.y = e.clientY; };
    const onMouseLeave = () => { s.mouse.x = -9999; s.mouse.y = -9999; };
    const onResize = () => resize();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("resize", onResize);

    // Detect section bottom edges for bouncing (sampled every 60 frames)
    let sectionFloors = [];
    const sampleFloors = () => {
      sectionFloors = [];
      const sections = document.querySelectorAll("section, .works-section, .content-section");
      sections.forEach((el) => {
        const rect = el.getBoundingClientRect();
        sectionFloors.push(s.scrollY + rect.bottom); // absolute page Y of section bottom
      });
    };
    sampleFloors();

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      s.frameCount++;
      ctx.clearRect(0, 0, vpW, vpH);

      // Resample section floors every 60 frames
      if (s.frameCount % 60 === 0) sampleFloors();

      // Spawn new particle every 3 frames if under max
      if (s.frameCount - s.lastSpawn > 3 && s.particles.length < MAX_PARTICLES) {
        s.particles.push(createParticle(vpW, vpH, s.scrollY));
        s.lastSpawn = s.frameCount;
      }

      const alive = [];
      for (const p of s.particles) {
        p.life++;
        if (p.life > p.maxLife) continue; // dead — don't keep

        // Gravity
        p.vy += GRAVITY;
        // Air damping
        p.vx *= DAMPING;
        p.vy *= DAMPING;

        // Mouse repulsion
        const drawY = p.pageY - s.scrollY;
        const dx = p.x - s.mouse.x;
        const dy = drawY - s.mouse.y;
        const distMouse = Math.sqrt(dx * dx + dy * dy);
        if (distMouse < MOUSE_RADIUS && distMouse > 0.1) {
          const force = (MOUSE_RADIUS - distMouse) / MOUSE_RADIUS * MOUSE_FORCE;
          p.vx += (dx / distMouse) * force;
          p.vy += (dy / distMouse) * force;
        }

        // Move
        p.x += p.vx;
        p.pageY += p.vy;

        // Viewport floor bounce
        const vpFloor = s.scrollY + vpH - 10;
        if (p.pageY > vpFloor) {
          p.pageY = vpFloor;
          p.vy = -Math.abs(p.vy) * BOUNCE;
          p.vx *= 0.88;
        }

        // Section floor bouncing
        for (const floor of sectionFloors) {
          if (p.pageY > floor - 4 && p.pageY < floor + 8 && p.vy > 0) {
            p.pageY = floor - 4;
            p.vy = -Math.abs(p.vy) * BOUNCE;
            p.vx *= 0.9;
            break;
          }
        }

        // Horizontal wrap
        if (p.x < -p.radius) p.x = vpW + p.radius;
        if (p.x > vpW + p.radius) p.x = -p.radius;

        // Draw — only if in viewport
        const screenY = p.pageY - s.scrollY;
        if (screenY > -p.radius * 2 && screenY < vpH + p.radius * 2) {
          const alpha = p.opacity * Math.min(1, p.life / 20) * Math.min(1, (p.maxLife - p.life) / 30);
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color;

          if (p.type === "spark") {
            ctx.save();
            ctx.translate(p.x, screenY);
            const ang = Math.atan2(p.vy, p.vx) + Math.PI / 2;
            ctx.rotate(ang);
            ctx.fillRect(-1, -p.sparkLen / 2, 2, p.sparkLen);
            ctx.restore();
          } else if (p.type === "square") {
            const sz = p.radius * 1.6;
            ctx.fillRect(p.x - sz / 2, screenY - sz / 2, sz, sz);
          } else {
            ctx.beginPath();
            ctx.arc(p.x, screenY, p.radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        alive.push(p);
      }

      ctx.globalAlpha = 1;
      s.particles = alive;
    };

    tick();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 3,
        pointerEvents: "none",
        display: "block",
      }}
    />
  );
}
