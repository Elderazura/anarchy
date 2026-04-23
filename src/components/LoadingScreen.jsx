import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen({ isReady }) {
  return (
    <AnimatePresence>
      {!isReady && (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
          style={{
            position: "fixed", inset: 0, zIndex: 999,
            background: "linear-gradient(135deg, #02060d 0%, #050d1a 60%, #03060c 100%)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "28px",
          }}
        >
          {/* Logo */}
          <motion.img
            src="/branding/anarchy-logo.png"
            alt="Anarchy Studios"
            style={{ width: "clamp(100px, 14vw, 160px)", opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          {/* Progress bar */}
          <div style={{ width: "clamp(140px, 20vw, 220px)", height: "2px", borderRadius: "999px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <motion.div
              style={{ height: "100%", background: "linear-gradient(90deg, #7ec8e8, #7ee8c0)", borderRadius: "999px" }}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.2, ease: "easeInOut" }}
            />
          </div>
          {/* Label */}
          <motion.p
            style={{ color: "#5a8898", fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase", margin: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Loading world…
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
