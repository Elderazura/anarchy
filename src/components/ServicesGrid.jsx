import { Film, Zap, Box, Cpu } from "lucide-react";
import { motion } from "framer-motion";

const SERVICES = [
  { icon: Film, label: "Animation Direction", desc: "Character, motion, and visual storytelling across 2D and 3D." },
  { icon: Zap, label: "VFX + Simulation", desc: "Fluid, particle, destruction, and photorealistic compositing." },
  { icon: Box, label: "3D Character Work", desc: "Design, rigging, and animation of stylized and realistic characters." },
  { icon: Cpu, label: "AI-Powered Production", desc: "AI-assisted workflows for speed without sacrificing artistic quality." },
];

export default function ServicesGrid() {
  return (
    <>
      <style>{`
        .services-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; width: 100%; }
        @media (min-width: 768px) { .services-grid { grid-template-columns: repeat(4, 1fr); } }
        .services-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 24px 20px; }
        .services-card-icon { color: #7ec8e8; margin-bottom: 14px; display: block; }
        .services-card-label { font-size: 0.9rem; font-weight: 600; color: #e0f0fa; margin: 0 0 6px; }
        .services-card-desc { font-size: 0.75rem; color: #89a8b8; line-height: 1.6; margin: 0; }
      `}</style>
      <div className="services-grid">
        {SERVICES.map(({ icon: Icon, label, desc }, index) => (
          <motion.div
            key={label}
            className="services-card"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08, duration: 0.5 }}
            whileHover={{ y: -4, borderColor: "rgba(126,200,232,0.5)" }}
          >
            <Icon size={28} className="services-card-icon" />
            <p className="services-card-label">{label}</p>
            <p className="services-card-desc">{desc}</p>
          </motion.div>
        ))}
      </div>
    </>
  );
}
