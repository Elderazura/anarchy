import { Film, Zap, Box, Cpu } from "lucide-react";
import { motion } from "framer-motion";
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
  },
  {
    num: "02",
    name: "VFX + Simulation",
    tagline: "Physics that feel real.",
    description:
      "Fluid dynamics, particle systems, destruction, compositing. We build simulations that serve the story — not just showpieces. Integrated into live action or full CG pipelines.",
    accent: "#ff6b35",
    icon: "Zap",
  },
  {
    num: "03",
    name: "3D Character Work",
    tagline: "Characters with a soul.",
    description:
      "Design, rigging, skinning, animation. We build characters that feel alive from every angle — from concept sculpt through final render. Stylized or photoreal.",
    accent: "#7ee8c0",
    icon: "Box",
  },
  {
    num: "04",
    name: "AI-Powered Production",
    tagline: "Speed without compromise.",
    description:
      "AI-assisted concepting, generation, and pipeline automation that amplifies craft rather than replacing it. Faster iteration. Wider creative exploration. Same obsessive quality.",
    accent: "#b388ff",
    icon: "Cpu",
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
      {SERVICES.map((service) => {
        const Icon = ICON_MAP[service.icon];

        return (
          <div
            key={service.num}
            className={`arsenal-zone arsenal-zone-bg-${service.num}`}
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
          </div>
        );
      })}
    </section>
  );
}
