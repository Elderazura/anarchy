import { motion } from "framer-motion";
import "./reel-strip.css";

const PANELS = [
  {
    label: "Music Video · Netflix India",
    title: "Hanumankind × Squid Game 2",
    tagline: "Full character animation pipeline for a viral music video.",
    video: "/video/hanumankind.mp4",
    accent: "#7ec8e8",
    cta: "Animation Direction",
  },
  {
    label: "VFX · Film",
    title: "Ray",
    tagline: "Fluid simulation, destruction, and compositing at scale.",
    video: "/video/ray.mp4",
    accent: "#ff6b35",
    cta: "VFX + Simulation",
  },
  {
    label: "Game Cinematic · PUBG",
    title: "PUBG Cinematic",
    tagline: "Photoreal character work for a global gaming franchise.",
    video: "/video/pubg.mp4",
    accent: "#7ee8c0",
    cta: "3D Character Work",
  },
  {
    label: "Crypto · Brand",
    title: "Solana",
    tagline: "AI-augmented motion design for a Web3 ecosystem.",
    video: "/video/solana.mp4",
    accent: "#b388ff",
    cta: "AI-Powered Production",
  },
];

export default function ReelStrip() {
  return (
    <div className="reel-strip">
      {PANELS.map((panel, index) => (
        <motion.div
          key={panel.title}
          className="reel-panel"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
        >
          <video
            className="reel-panel__video"
            src={panel.video}
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="reel-panel__overlay" />
          <div className="reel-panel__content">
            <div className="reel-panel__text">
              <span
                className="reel-panel__label"
                style={{ color: panel.accent }}
              >
                {panel.label}
              </span>
              <h3 className="reel-panel__title">{panel.title}</h3>
              <p className="reel-panel__tagline">{panel.tagline}</p>
              <button
                type="button"
                className="reel-panel__cta"
                style={{
                  color: panel.accent,
                  border: `1px solid ${panel.accent}80`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${panel.accent}26`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {panel.cta} →
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
