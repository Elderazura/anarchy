import { Film, Zap, Box, Cpu } from "lucide-react";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import GlitchText from "./ui/GlitchText";
import "./services.css";

const ICON_MAP = { Film, Zap, Box, Cpu };

const SERVICES = [
  {
    num: "01",
    name: "Animation Direction",
    tagline: "From storyboard to screen.",
    description:
      "Character animation, motion design, and visual storytelling that moves audiences — not just pixels. We direct the full arc: concept, style frames, production, delivery.",
    accent: "#7ec8e8",
    icon: "Film",
    video: "hanumankind.mp4",
  },
  {
    num: "02",
    name: "VFX + Simulation",
    tagline: "Physics that feel real.",
    description:
      "Fluid dynamics, particle systems, destruction, compositing. We build simulations that serve the story — not just showpieces. Integrated into live action or full CG pipelines.",
    accent: "#ff6b35",
    icon: "Zap",
    video: "ray.mp4",
  },
  {
    num: "03",
    name: "3D Character Work",
    tagline: "Characters with a soul.",
    description:
      "Design, rigging, skinning, animation. We build characters that feel alive from every angle — from concept sculpt through final render. Stylized or photoreal.",
    accent: "#7ee8c0",
    icon: "Box",
    video: "pubg.mp4",
  },
  {
    num: "04",
    name: "AI-Powered Production",
    tagline: "Speed without compromise.",
    description:
      "AI-assisted concepting, generation, and pipeline automation that amplifies craft rather than replacing it. Faster iteration. Wider creative exploration. Same obsessive quality.",
    accent: "#b388ff",
    icon: "Cpu",
    video: "solana.mp4",
  },
];

const NAME_VARIANTS = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const DESC_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      delay: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const VIEWPORT_OPTS = { once: true, margin: "-120px" };

// ── Tech stack data ────────────────────────────────────────
const TECH = [
  { name: "Unreal Engine", short: "UE",  color: "#ffffff", bg: "rgba(255,255,255,0.06)", logo: "/logos/ue.svg" },
  { name: "Blender",       short: "Bl",  color: "#ea7600", bg: "rgba(234,118,0,0.08)",   logo: "/logos/blender.svg" },
  { name: "Cinema 4D",     short: "C4D", color: "#5588dd", bg: "rgba(85,136,221,0.08)",  logo: "/logos/cinema4d.svg" },
  { name: "Houdini",       short: "Hou", color: "#ff6a00", bg: "rgba(255,106,0,0.08)",   logo: "/logos/houdini.svg" },
  { name: "Maya",          short: "Ma",  color: "#00b4d8", bg: "rgba(0,180,216,0.08)",   logo: "/logos/maya.svg" },
  { name: "After Effects", short: "Ae",  color: "#9999ff", bg: "rgba(153,153,255,0.08)", logo: "/logos/aftereffects.svg" },
  { name: "Nuke",          short: "Nu",  color: "#f5a623", bg: "rgba(245,166,35,0.08)",  logo: "/logos/nuke.svg" },
  { name: "DaVinci Resolve",short:"DR",  color: "#f9a825", bg: "rgba(249,168,37,0.08)",  logo: "/logos/davinci.svg" },
  { name: "OpenAI",        short: "OAI", color: "#ffffff", bg: "rgba(255,255,255,0.06)", logo: "/logos/openai.svg" },
  { name: "Claude",        short: "Cl",  color: "#cc785c", bg: "rgba(204,120,92,0.08)",  logo: "/logos/anthropic.svg" },
  { name: "Gemini",        short: "Gem", color: "#4285f4", bg: "rgba(66,133,244,0.08)",  logo: "/logos/gemini.svg" },
  { name: "Stable Diffusion",short:"SD", color: "#7ee8c0", bg: "rgba(126,232,192,0.08)", logo: "/logos/sd.svg" },
  { name: "Rive",          short: "Rv",  color: "#ff3c6e", bg: "rgba(255,60,110,0.08)",  logo: "/logos/rive.svg" },
  { name: "Runway ML",     short: "Rw",  color: "#00ffe0", bg: "rgba(0,255,224,0.08)",   logo: "/logos/runway.svg" },
];

// ── TechStack component ────────────────────────────────────
function TechStack() {
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left - rect.width / 2) / rect.width);
    mouseY.set((e.clientY - rect.top - rect.height / 2) / rect.height);
  };

  return (
    <div className="arsenal-tech">
      <span className="arsenal-tech__label">Built With</span>
      <div
        className="arsenal-tech__grid"
        ref={containerRef}
        onMouseMove={handleMouseMove}
      >
        {TECH.map((tech, index) => (
          <TechPill
            key={tech.name}
            tech={tech}
            index={index}
            mouseX={mouseX}
            mouseY={mouseY}
          />
        ))}
      </div>
    </div>
  );
}

// ── TechPill component ─────────────────────────────────────
function TechPill({ tech, index, mouseX, mouseY }) {
  const depth = (index % 4) * 3 + 2;

  const rawX = useTransform(mouseX, (v) => v * depth);
  const rawY = useTransform(mouseY, (v) => v * depth);
  const springX = useSpring(rawX, { stiffness: 150, damping: 20 });
  const springY = useSpring(rawY, { stiffness: 150, damping: 20 });

  // Badge background at 15% opacity derived from the tech color
  const badgeBg = tech.color.startsWith("#")
    ? hexToRgba(tech.color, 0.15)
    : tech.bg;

  return (
    <motion.div
      className="arsenal-tech__pill"
      style={{
        background: tech.bg,
        x: springX,
        y: springY,
      }}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{
        scale: 1.08,
        borderColor: tech.color + "44",
        backgroundColor: tech.bg.replace(/[\d.]+\)$/, (m) => {
          const num = parseFloat(m);
          return (Math.min(num * 2, 1).toFixed(2)) + ")";
        }),
        transition: { duration: 0.2, ease: "easeOut" },
      }}
    >
      {tech.logo ? (
        <img
          src={tech.logo}
          alt={tech.name}
          className="arsenal-tech__logo-img"
        />
      ) : (
        <span
          className="arsenal-tech__badge"
          style={{ background: badgeBg, color: tech.color }}
        >
          {tech.short}
        </span>
      )}
      <span className="arsenal-tech__name">{tech.name}</span>
    </motion.div>
  );
}

// Helper: convert hex color to rgba string
function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── ServiceZone component ──────────────────────────────────
function ServiceZone({ service, index }) {
  const videoRef = useRef(null);
  const zoneRef = useRef(null);
  const Icon = ICON_MAP[service.icon];

  const handleMouseEnter = () => { videoRef.current?.play(); };
  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      ref={zoneRef}
      className={`arsenal-zone arsenal-zone-bg-${service.num}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Service number */}
      <p
        className="arsenal-zone-num"
        style={{ color: `${service.accent}66` /* 40% opacity hex */ }}
      >
        {service.num}
      </p>

      {/* Service name — hero element */}
      <motion.h3
        className="arsenal-zone-name"
        variants={NAME_VARIANTS}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_OPTS}
        whileHover={{ x: 12, transition: { type: "spring", stiffness: 400, damping: 30 } }}
      >
        {service.name}
      </motion.h3>

      {/* Tagline */}
      <p
        className="arsenal-zone-tagline"
        style={{ color: service.accent }}
      >
        {service.tagline}
      </p>

      {/* Description — absolute right on desktop, static on mobile */}
      <motion.p
        className="arsenal-zone-desc"
        variants={DESC_VARIANTS}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_OPTS}
      >
        {service.description}
      </motion.p>

      {/* Icon — bottom-left */}
      <div className="arsenal-zone-icon">
        <Icon
          size={32}
          color={service.accent}
          style={{ opacity: 0.6 }}
        />
      </div>

      {/* Video thumbnail — bottom-right, desktop only */}
      <div className="arsenal-zone__video-thumb">
        <video
          ref={videoRef}
          src={`/video/${service.video}`}
          muted
          loop
          playsInline
          preload="metadata"
          className="arsenal-zone__video"
        />
        <div className="arsenal-zone__video-label">
          <span className="arsenal-zone__video-tag">↗ PREVIEW</span>
        </div>
      </div>
    </div>
  );
}

export default function ServicesGrid() {
  return (
    <section className="arsenal-section">
      {/* ── Section header ────────────────────────────────── */}
      <header className="arsenal-header">
        <p className="arsenal-header__label">03 / Services</p>
        <GlitchText as="h2" className="arsenal-header__title">The Arsenal</GlitchText>
        <p className="arsenal-header__tagline">What we&rsquo;re built for.</p>
      </header>

      {/* ── Service zones ─────────────────────────────────── */}
      {SERVICES.map((service, index) => (
        <ServiceZone key={service.num} service={service} index={index} />
      ))}

      {/* ── Tech stack logo wall ───────────────────────────── */}
      <TechStack />
    </section>
  );
}
