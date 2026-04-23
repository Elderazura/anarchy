import { motion } from "framer-motion";

export default function BorderBeam({ size = 80, duration = 3, colorFrom = "#7ec8e8", colorTo = "#7ee8c0" }) {
  return (
    <div style={{ position: "absolute", inset: 0, borderRadius: "inherit", overflow: "hidden", pointerEvents: "none", zIndex: 1 }}>
      <motion.div
        style={{
          position: "absolute",
          width: size, height: size,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colorFrom}44 0%, ${colorTo}22 50%, transparent 70%)`,
          filter: "blur(8px)",
        }}
        animate={{
          x: ["0%", "100%", "100%", "0%", "0%"],
          y: ["0%", "0%", "100%", "100%", "0%"],
        }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
