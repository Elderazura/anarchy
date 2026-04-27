import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import "./cursor.css";

export default function CustomCursor() {
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  // Ring trails slightly behind the dot
  const ringX = useSpring(mouseX, { stiffness: 160, damping: 18 });
  const ringY = useSpring(mouseY, { stiffness: 160, damping: 18 });

  // Scale up on hoverable elements
  const ringScale = useMotionValue(1);
  const springScale = useSpring(ringScale, { stiffness: 320, damping: 26 });

  useEffect(() => {
    // Skip on touch-only devices
    if (window.matchMedia("(hover: none)").matches) return;

    const move = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const onOver = (e) => {
      if (e.target.closest("a, button, input, textarea, select, video, [data-cursor-hover]")) {
        ringScale.set(2.0);
      }
    };

    const onOut = (e) => {
      if (e.target.closest("a, button, input, textarea, select, video, [data-cursor-hover]")) {
        ringScale.set(1);
      }
    };

    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, [mouseX, mouseY, ringScale]);

  return (
    <>
      {/* Hard dot — exact position */}
      <motion.div
        className="c-dot"
        style={{ x: mouseX, y: mouseY, translateX: "-50%", translateY: "-50%" }}
      />
      {/* Soft ring — springs behind */}
      <motion.div
        className="c-ring"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          scale: springScale,
        }}
      />
    </>
  );
}
