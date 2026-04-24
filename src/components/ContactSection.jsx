import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import "./contact.css";

function AnimatedHeadline({ text, color = "#ffffff", delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} style={{ display: "block" }}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          style={{
            display: "inline-block",
            color,
            whiteSpace: char === " " ? "pre" : "normal",
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{
            delay: delay + i * 0.04,
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {char === " " ? "\u00a0" : char}
        </motion.span>
      ))}
    </div>
  );
}

export default function ContactSection() {
  const emailRef = useRef(null);
  const emailInView = useInView(emailRef, { once: true, margin: "-100px" });

  return (
    <section className="signal-section">
      {/* Background layers */}
      <div className="signal-bg-scanlines" aria-hidden="true" />
      <div className="signal-bg-glow" aria-hidden="true" />

      {/* Main content */}
      <div className="signal-content">
        <p className="signal-label">04 / Contact</p>

        <h2 className="signal-headline">
          <AnimatedHeadline text="LET'S BUILD" color="#ffffff" delay={0} />
          <AnimatedHeadline text="A WORLD" color="#7ec8e8" delay={0.15} />
        </h2>

        <motion.a
          ref={emailRef}
          href="mailto:hello@anarchystudios.io"
          className="signal-email"
          initial={{ opacity: 0, y: 20 }}
          animate={emailInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          hello@anarchystudios.io
        </motion.a>

        <hr className="signal-divider" />

        <nav className="signal-socials" aria-label="Social links">
          <a href="#" className="signal-social-link">Instagram</a>
          <a href="#" className="signal-social-link">Behance</a>
          <a href="#" className="signal-social-link">LinkedIn</a>
        </nav>
      </div>

      {/* Footer credit */}
      <p className="signal-footer">© 2024 Anarchy Studios</p>
    </section>
  );
}
