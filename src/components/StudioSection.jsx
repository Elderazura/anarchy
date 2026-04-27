import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import ScrollRevealText from "./ui/ScrollRevealText";
import GlitchText from "./ui/GlitchText";
import FloatingOrb from "./FloatingOrb";
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

/* ─── Working methods ────────────────────────────────────────────────────── */

const METHODS = [
  {
    num: "01",
    title: "Story-First",
    body: "Every project begins with a brief that answers: what should the audience feel 90 seconds in? The technical path is chosen after.",
  },
  {
    num: "02",
    title: "AI-Augmented",
    body: "We use AI tools (generative, language, motion) to explore faster and wider — then apply human judgment to decide what's worth finishing.",
  },
  {
    num: "03",
    title: "Vertically Integrated",
    body: "From concept through final delivery. No handoffs. One creative vision from the first frame to the last render.",
  },
];

/* ─── StudioSection ──────────────────────────────────────────────────────── */

export default function StudioSection() {
  return (
    <section className="mind-section">

      {/* ── Part 1: Opening ── */}
      <motion.div
        className="mind-manifesto"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOpts}
      >
        <p className="mind-manifesto__label">02 / STUDIO</p>

        {/* Right aside — desktop only */}
        <aside className="mind-manifesto-aside">
          <p className="mind-manifesto-aside__label">Est.</p>
          <p className="mind-manifesto-aside__year">2019</p>
          <p className="mind-manifesto-aside__bio">
            Independent. Boutique.<br />Obsessive about craft.
          </p>
        </aside>

        {/* Giant headline */}
        <h2 className="mind-manifesto-headline">
          <ScrollRevealText
            text="A small team. An unreasonable standard."
            stagger={0.05}
          />
        </h2>
      </motion.div>

      {/* ── Part 2: Philosophy block ── */}
      <motion.div
        className="mind-philosophy"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mind-philosophy__grid">
          <div>
            <p className="mind-philosophy__quote">
              "Technical skill tells you what's possible. Creative direction tells you what's worth making."
            </p>
            <p className="mind-philosophy__attr">— Our founding principle</p>
          </div>
          <div>
            <p className="mind-philosophy__body">
              We don't separate art from engineering. Every technical decision is a creative one. The way we rig a character shapes how it feels. The render pipeline we choose defines the aesthetic. AI tools amplify craft — they don't replace it.
            </p>
            <p className="mind-philosophy__body">
              Our process starts with story. What are we saying? Who needs to feel it? Then we reverse-engineer the most effective technical path to make that happen — whether that's a hand-crafted simulation or a generative AI workflow.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Part 3: Stats Bar ── */}
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

      {/* ── Part 4: How we work ── */}
      <motion.div
        className="mind-methods"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOpts}
      >
        <div className="mind-methods__grid">
          {METHODS.map((method) => (
            <motion.div key={method.num} variants={fadeUp}>
              <span className="mind-methods__num">{method.num}</span>
              <h3 className="mind-methods__title">{method.title}</h3>
              <p className="mind-methods__body">{method.body}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Part 5: Ethos + Capabilities ── */}
      <motion.div
        className="mind-ethos"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOpts}
      >
        <div className="mind-orb-wrap" aria-hidden="true">
          <FloatingOrb size={240} />
        </div>
        <GlitchText as="h3" className="mind-ethos__headline">
          Small team. Heavy intent.
        </GlitchText>

        <p className="mind-ethos__body">
          Animation, VFX, and AI production working as one system. Unreal, Blender, Houdini — real-time and offline, whichever the work demands. No safe choices. No bloated pipelines. Just obsessive craft and an appetite for visual rebellion.
        </p>
      </motion.div>

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
