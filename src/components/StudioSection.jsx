import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import ScrollRevealText from "./ui/ScrollRevealText";
import GlitchText from "./ui/GlitchText";
import "./studio.css";

/* ─── Animated Counter ───────────────────────────────────────────────────── */

function Counter({ target, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const duration = 2000;
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(target);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

/* ─── Shared entrance variants ───────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const viewportOpts = { once: true, margin: "-80px" };

/* ─── Stats data ─────────────────────────────────────────────────────────── */

const STATS = [
  { target: 100, suffix: "+", label: "Projects Delivered" },
  { target: 2.4, suffix: "M+", label: "Frames Rendered", isDecimal: true },
  { target: 5, suffix: "", label: "Countries" },
  { target: 5, suffix: "+", label: "Years Active" },
];

/* ─── Capabilities ───────────────────────────────────────────────────────── */

const CAPABILITIES = [
  "Character Animation",
  "Motion Design",
  "3D World Building",
  "VFX Supervision",
  "AI Pipeline",
  "Sound Design",
  "Generative Art",
  "Crypto/Web3",
];

/* ─── DecimalCounter — handles 2.4 correctly ─────────────────────────────── */

function DecimalCounter({ target, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const duration = 2000;
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const value = ease * target;
      setCount(Math.round(value * 10) / 10);
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(target);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count.toFixed(1)}
      {suffix}
    </span>
  );
}

/* ─── StudioSection ──────────────────────────────────────────────────────── */

export default function StudioSection() {
  return (
    <section className="mind-section">
      {/* ── Part 1: Opening Manifesto ── */}
      <motion.div
        className="mind-manifesto"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOpts}
      >
        <p className="mind-manifesto__label">02 / STUDIO</p>

        {/* Right aside — editorial metadata */}
        <aside className="mind-manifesto-aside">
          <p className="mind-manifesto-aside__label">Founded</p>
          <p className="mind-manifesto-aside__year">2019</p>
          <p className="mind-manifesto-aside__bio">
            A boutique studio of obsessive craftspeople building at the
            intersection of animation, VFX, and AI.
          </p>
        </aside>

        {/* Giant manifesto headline */}
        <h2 className="mind-manifesto-headline">
          <ScrollRevealText
            text="We don't make content. We build worlds."
            stagger={0.05}
          />
        </h2>
      </motion.div>

      {/* ── Part 2: Stats Bar ── */}
      <motion.div
        className="mind-stats"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOpts}
      >
        {STATS.map((stat) => (
          <motion.div key={stat.label} className="mind-stat" variants={fadeUp}>
            <span className="mind-stat-number">
              {stat.isDecimal ? (
                <DecimalCounter target={stat.target} suffix={stat.suffix} />
              ) : (
                <Counter target={stat.target} suffix={stat.suffix} />
              )}
            </span>
            <span className="mind-stat-label">{stat.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Part 3: Ethos Statement ── */}
      <motion.div
        className="mind-ethos"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOpts}
      >
        <GlitchText as="h3" className="mind-ethos__headline">
          Small team. Heavy intent.
        </GlitchText>

        <p className="mind-ethos__body">
          We combine animation, VFX, and AI production to create work that feels
          alive, risky, and unmistakably original. No bloated teams. No safe
          choices. Just obsessive craft and an appetite for visual rebellion.
        </p>
      </motion.div>

      {/* ── Part 4: Capabilities Row ── */}
      <motion.div
        className="mind-capabilities"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOpts}
      >
        <p className="mind-capabilities__label">Capabilities</p>
        <p className="mind-capabilities__list">
          {CAPABILITIES.join(" · ")}
        </p>
      </motion.div>
    </section>
  );
}
